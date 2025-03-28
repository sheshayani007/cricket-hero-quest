
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Difficulty } from '@/components/DifficultySelector';
import CricketField from '@/components/CricketField';
import CricketBall from '@/components/CricketBall';
import BallCounter from '@/components/BallCounter';
import { getRandomPlayers, Player } from '@/data/playerData';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Standard cricket pitch length in meters
const REAL_PITCH_LENGTH_METERS = 20.12; 
// Maximum realistic bowling speed in km/h
const MAX_REAL_BOWLING_SPEED_KMH = 160; 

const BowlingGame = () => {
  const { difficulty = 'medium' } = useParams<{ difficulty: Difficulty }>();
  const navigate = useNavigate();
  const [currentBall, setCurrentBall] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [performances, setPerformances] = useState<{speed: number, accuracy: number, scaledSpeed: number}[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [ballReleased, setBallReleased] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [showTrajectory, setShowTrajectory] = useState(false);
  const [trajectoryPoints, setTrajectoryPoints] = useState<{x: number, y: number}[]>([]);
  const [fieldSize, setFieldSize] = useState(0);
  const [pitchLength, setPitchLength] = useState(0);
  const [speedRatio, setSpeedRatio] = useState(1);
  const [currentDragPos, setCurrentDragPos] = useState({ x: 0, y: 0 });
  const [dragPhase, setDragPhase] = useState<'pullBack' | 'forwardSwing' | 'none'>('none');
  const [powerPercentage, setPowerPercentage] = useState(0);
  const [swingSpeed, setSwingSpeed] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMovePos, setLastMovePos] = useState({ x: 0, y: 0 });
  
  const controls = useAnimation();
  const ballRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  
  // Measure field dimensions and calculate ratio
  useEffect(() => {
    const updateFieldSize = () => {
      if (fieldRef.current) {
        const fieldRect = fieldRef.current.getBoundingClientRect();
        const fieldDiameter = Math.min(fieldRect.width, fieldRect.height);
        setFieldSize(fieldDiameter);
        
        // Get the pitch length in pixels (approx 70% of field)
        const pitchLengthPx = fieldDiameter * 0.7;
        setPitchLength(pitchLengthPx);
        
        // Calculate the ratio between real-world pitch and on-screen pitch
        // Convert pixels to cm (assuming 1px is roughly 0.026458333 cm)
        const pitchLengthCm = pitchLengthPx * 0.026458333;
        const calculatedRatio = (REAL_PITCH_LENGTH_METERS * 100) / pitchLengthCm;
        setSpeedRatio(calculatedRatio);
        
        console.log(`Field size: ${fieldDiameter}px, Pitch length: ${pitchLengthPx}px, Real world pitch: ${REAL_PITCH_LENGTH_METERS}m, Speed ratio: ${calculatedRatio}`);
      }
    };
    
    updateFieldSize();
    window.addEventListener('resize', updateFieldSize);
    
    return () => {
      window.removeEventListener('resize', updateFieldSize);
    };
  }, []);
  
  // Setup opponent and countdown
  useEffect(() => {
    const [batsman] = getRandomPlayers('batsman', difficulty as Difficulty);
    setOpponent(batsman);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [difficulty]);
  
  // Start dragging the ball
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPlaying || ballReleased) return;
    
    setIsDragging(true);
    setShowTrajectory(true);
    setDragPhase('pullBack');
    
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    const clientY = 'touches' in e 
      ? e.touches[0].clientY 
      : e.clientY;
    
    setDragStartPos({ x: clientX, y: clientY });
    setCurrentDragPos({ x: clientX, y: clientY });
    setLastMovePos({ x: clientX, y: clientY });
    setLastMoveTime(Date.now());
    setPowerPercentage(0);
    setSwingSpeed(0);
    
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };
  
  // Update trajectory while dragging
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || ballReleased) return;
    
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    const clientY = 'touches' in e 
      ? e.touches[0].clientY 
      : e.clientY;
    
    setCurrentDragPos({ x: clientX, y: clientY });
    
    // Calculate drag distance and direction
    const deltaX = clientX - dragStartPos.x;
    const deltaY = clientY - dragStartPos.y;
    
    // Calculate drag distance from start position
    const distanceFromStart = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Calculate velocity
    const now = Date.now();
    const timeDelta = now - lastMoveTime;
    
    if (timeDelta > 0) {
      const moveDeltaX = clientX - lastMovePos.x;
      const moveDeltaY = clientY - lastMovePos.y;
      const moveDist = Math.sqrt(moveDeltaX * moveDeltaX + moveDeltaY * moveDeltaY);
      const velocity = moveDist / timeDelta; // pixels per ms
      
      setLastMovePos({ x: clientX, y: clientY });
      setLastMoveTime(now);
      
      // Detect phase change more intuitively
      if (dragPhase === 'pullBack') {
        // The further back we pull, the more power
        const newPowerPercentage = Math.min(100, (distanceFromStart / 100) * 100);
        setPowerPercentage(newPowerPercentage);
        
        // Switch to forward swing when movement direction changes from backward to forward
        // Only switch when we have some minimal power and velocity
        if (distanceFromStart > 20 && deltaY < 0 && velocity > 0.05) {
          setDragPhase('forwardSwing');
          // Add haptic feedback for phase change
          if ('vibrate' in navigator) {
            navigator.vibrate(30);
          }
        }
      } 
      // In forward swing phase, we track the swing speed
      else if (dragPhase === 'forwardSwing') {
        // The faster we swing, the more power is added
        // Smoother swing speed calculation with momentum
        const speedFactor = Math.min(150, velocity * 150);
        setSwingSpeed(prev => (prev * 0.7) + (speedFactor * 0.3)); // Smooth transition
      }
    }
    
    // Generate trajectory points - smoother curve with more points
    const points = [];
    const steps = 15; // More points for smoother curve
    
    for (let i = 0; i < steps; i++) {
      if (dragPhase === 'pullBack') {
        // During pullback, show a slight arc for better visualization
        const t = i / steps;
        const arcX = dragStartPos.x + (deltaX * t);
        const arcY = dragStartPos.y + (deltaY * t);
        
        points.push({ x: arcX, y: arcY });
      } 
      // If in forward swing phase, trajectory is a natural bowling curve
      else {
        // Create a natural bowling curve
        const t = i / steps;
        const forwardDeltaX = dragStartPos.x - clientX;
        const forwardDeltaY = dragStartPos.y - clientY;
        
        // Apply a slight arc to the trajectory
        const arcHeight = Math.min(30, distanceFromStart * 0.3);
        const arcOffset = Math.sin(t * Math.PI) * arcHeight;
        
        const x = clientX + (forwardDeltaX * t * 2);
        const y = clientY + (forwardDeltaY * t * 2) - arcOffset;
        
        points.push({ x, y });
      }
    }
    
    setTrajectoryPoints(points);
  };
  
  // Release the ball
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || ballReleased) return;
    
    setIsDragging(false);
    setShowTrajectory(false);
    
    // Only bowl if we've both pulled back and swung forward
    if (dragPhase !== 'forwardSwing' || powerPercentage < 5) {
      setPowerPercentage(0);
      setSwingSpeed(0);
      setDragPhase('none');
      return;
    }
    
    setBallReleased(true);
    setIsPlaying(true);
    
    // Add release haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
    
    const clientX = 'changedTouches' in e 
      ? e.changedTouches[0].clientX 
      : e.clientX;
    const clientY = 'changedTouches' in e 
      ? e.changedTouches[0].clientY 
      : e.clientY;
    
    // Calculate release vector
    const releaseX = clientX - dragStartPos.x;
    const releaseY = clientY - dragStartPos.y;
    
    // Calculate release strength based on swing
    const releaseDistance = Math.sqrt(releaseX * releaseX + releaseY * releaseY);
    const dirX = releaseX / releaseDistance;
    const dirY = releaseY / releaseDistance;
    
    // Combine pull-back power and swing speed with better weighting
    const basePower = powerPercentage * 0.6; // 60% influence
    const swingPower = swingSpeed * 0.4; // 40% influence
    const totalPower = Math.min(100, basePower + swingPower);
    
    console.log(`Base power: ${basePower.toFixed(1)}%, Swing power: ${swingPower.toFixed(1)}%, Total: ${totalPower.toFixed(1)}%`);
    
    // Map power to realistic bowling speed (km/h)
    let speedKmh = (totalPower / 100) * MAX_REAL_BOWLING_SPEED_KMH;
    
    // Adjust for difficulty
    if (difficulty === 'easy') {
      speedKmh *= 0.7;
    } else if (difficulty === 'hard') {
      speedKmh *= 1.2;
    }
    
    // Scale speed for screen size
    const scaledSpeedKmh = speedKmh / speedRatio;
    
    // Convert to m/s for timing calculation
    const speedMs = scaledSpeedKmh / 3.6;
    
    // Calculate animation duration based on scaled speed
    let scaledTravelTime = 1.5;
    
    if (speedMs > 0) {
      // Time = distance / speed
      const realWorldTravelTime = REAL_PITCH_LENGTH_METERS / (speedKmh / 3.6);
      // Scale time for better gameplay (min 0.8s for visibility, max 2s)
      scaledTravelTime = Math.max(0.8, Math.min(2, realWorldTravelTime / 2));
    }
    
    console.log(`Bowling speed: ${speedKmh.toFixed(1)} km/h, Scaled speed: ${scaledSpeedKmh.toFixed(1)} km/h, Travel time: ${scaledTravelTime.toFixed(2)}s`);
    
    // Calculate accuracy based on horizontal deviation from center
    let accuracy = 100;
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    
    if (fieldRect) {
      const fieldCenterX = fieldRect.left + fieldRect.width / 2;
      const horizontalDeviation = Math.abs(clientX - fieldCenterX);
      accuracy = Math.max(0, 100 - (horizontalDeviation / (fieldRect.width / 4) * 100));
    }
    
    // Animate the ball with a natural arc
    controls.start({
      x: [0, dirX * 200],
      y: [0, dirY * 200 - 50, dirY * 200], // Add a subtle arc
      scale: [1, 0.8, 1],
      rotate: [0, 720],
      transition: { 
        duration: scaledTravelTime, 
        ease: "easeOut",
        times: [0, 0.7, 1] // Control timing of the arc
      }
    }).then(() => {
      // Save performance metrics after ball is bowled
      setPerformances(prev => [...prev, { 
        speed: speedKmh, 
        scaledSpeed: scaledSpeedKmh,
        accuracy 
      }]);
      setIsPlaying(false);
      setBallReleased(false);
      setCurrentBall(prev => prev + 1);
      setPowerPercentage(0);
      setSwingSpeed(0);
      setDragPhase('none');
    });
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  // Navigate to results after 6 balls
  useEffect(() => {
    if (currentBall >= 6) {
      navigate('/results/bowling', { 
        state: { 
          performances, 
          difficulty,
          opponent 
        } 
      });
    }
  }, [currentBall, performances, difficulty, opponent, navigate]);
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center relative bg-gradient-to-b from-ipl-blue via-ipl-purple to-black">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 text-white z-10 bg-black/30 hover:bg-black/50"
        onClick={handleBackToHome}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <div className="w-full p-4 flex justify-between items-center">
        <div className="glass-card px-4 py-2 rounded-lg">
          <h2 className="text-white font-bold">Bowling to: {opponent?.name || 'Batsman'}</h2>
          <p className="text-white/70 text-sm">{opponent?.team || 'Team'}</p>
        </div>
        
        <BallCounter 
          currentBall={currentBall} 
          className="glass-card px-3 py-2 rounded-lg"
        />
      </div>
      
      <div className="flex-1 w-full max-w-md relative" ref={fieldRef}>
        <CricketField className="w-full aspect-square mx-auto">
          {!gameStarted ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div 
                className="text-6xl font-bold text-white"
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                key={countdown}
              >
                {countdown > 0 ? countdown : "Bowl!"}
              </motion.div>
            </div>
          ) : null}
          
          {/* Trajectory prediction line - improved visuals */}
          {showTrajectory && trajectoryPoints.length > 0 && (
            <>
              {trajectoryPoints.map((point, i) => {
                if (!fieldRef.current) return null;
                const fieldRect = fieldRef.current.getBoundingClientRect();
                const relX = ((point.x - fieldRect.left) / fieldRect.width) * 100;
                const relY = ((point.y - fieldRect.top) / fieldRect.height) * 100;
                
                return (
                  <div 
                    key={i}
                    className="absolute bg-white/50 rounded-full"
                    style={{ 
                      left: `${relX}%`, 
                      top: `${relY}%`,
                      width: `${4 - (i * 0.2)}px`,
                      height: `${4 - (i * 0.2)}px`,
                      opacity: 1 - (i / trajectoryPoints.length),
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              })}
            </>
          )}
          
          {/* Ball in starting position - smoother drag handling */}
          {gameStarted && !isPlaying && !ballReleased && (
            <div
              ref={ballRef}
              className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 z-10 touch-none"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              onMouseMove={(e) => handleDrag(e)}
              onTouchMove={(e) => handleDrag(e)}
              onMouseUp={handleDragEnd}
              onTouchEnd={handleDragEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <CricketBall 
                animated={isDragging}
                trailEffect={dragPhase === 'forwardSwing'}
                size={isDragging ? "medium" : "small"}
                glowColor={
                  dragPhase === 'pullBack' 
                    ? "rgba(255,165,0,0.7)" // Orange for pull back
                    : dragPhase === 'forwardSwing' 
                      ? "rgba(0,255,0,0.7)" // Green for forward swing
                      : "rgba(255,0,0,0.5)" // Default red
                }
                className={`
                  ${isDragging ? 'scale-110' : ''} 
                  transition-all duration-200
                `}
              />
              
              {/* Enhanced Power and Swing meters */}
              {isDragging && (
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-40 flex flex-col items-center gap-1.5">
                  {/* Pull back power meter */}
                  <div className="flex items-center w-full">
                    <span className="text-white text-xs mr-1.5 opacity-80 font-medium whitespace-nowrap">Pull:</span>
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full" 
                        style={{
                          width: `${powerPercentage}%`,
                          background: powerPercentage < 33 
                            ? 'rgb(74, 222, 128)' 
                            : powerPercentage < 66 
                              ? 'rgb(250, 204, 21)' 
                              : 'rgb(239, 68, 68)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${powerPercentage}%` }}
                        transition={{ type: 'spring', damping: 15 }}
                      />
                    </div>
                  </div>
                  
                  {/* Swing speed meter */}
                  <div className="flex items-center w-full">
                    <span className="text-white text-xs mr-1.5 opacity-80 font-medium whitespace-nowrap">Swing:</span>
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full" 
                        style={{
                          width: `${swingSpeed}%`,
                          background: swingSpeed < 33 
                            ? 'rgb(74, 222, 128)' 
                            : swingSpeed < 66 
                              ? 'rgb(250, 204, 21)' 
                              : 'rgb(239, 68, 68)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${swingSpeed}%` }}
                        transition={{ type: 'spring', damping: 10 }}
                      />
                    </div>
                  </div>
                  
                  {/* Phase indicator */}
                  <div className="text-xs text-white bg-black/40 px-2 py-1 rounded-full mt-1">
                    {dragPhase === 'pullBack' ? 'Pull Back ⬅️' : 'Swing Forward ➡️'}
                  </div>
                </div>
              )}
              
              {/* Clearer instruction text */}
              {!isDragging && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-center text-sm bg-black/60 px-2.5 py-1.5 rounded-lg">
                  Pull back ⬅️ then swing forward ➡️
                </div>
              )}
            </div>
          )}
          
          {/* Animated ball after release - smaller size, better trail */}
          {ballReleased && (
            <motion.div 
              className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 z-10"
              animate={controls}
            >
              <CricketBall 
                animated={true} 
                trailEffect={true}
                size="small"
              />
            </motion.div>
          )}
        </CricketField>
      </div>
      
      <div className="w-full p-4 glass-card mt-4 rounded-lg">
        <h3 className="text-white text-center font-bold mb-2">
          {!ballReleased && currentBall < 6 
            ? "Pull back and swing forward to bowl!" 
            : `Ball ${currentBall} of 6`
          }
        </h3>
        
        <div className="flex justify-center gap-2 flex-wrap">
          {performances.map((perf, i) => (
            <div 
              key={i} 
              className="glass-card px-3 py-1 rounded-md text-white"
            >
              <div className="text-sm font-medium">Ball {i+1}: {Math.round(perf.speed)} km/h</div>
              <div className="text-xs opacity-70">(Accuracy: {Math.round(perf.accuracy)}%)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BowlingGame;
