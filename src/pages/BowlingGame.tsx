
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
  const [powerPercentage, setPowerPercentage] = useState(0);
  
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
    
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    const clientY = 'touches' in e 
      ? e.touches[0].clientY 
      : e.clientY;
    
    setDragStartPos({ x: clientX, y: clientY });
    setCurrentDragPos({ x: clientX, y: clientY });
    setPowerPercentage(0);
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
    const deltaX = dragStartPos.x - clientX;
    const deltaY = dragStartPos.y - clientY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Update power percentage (capped at 100%)
    const newPowerPercentage = Math.min(100, (distance / 200) * 100);
    setPowerPercentage(newPowerPercentage);
    
    // Generate trajectory points
    const points = [];
    const steps = 10;
    
    for (let i = 0; i < steps; i++) {
      points.push({
        x: dragStartPos.x - (deltaX * (i+1) / steps),
        y: dragStartPos.y - (deltaY * (i+1) / steps)
      });
    }
    
    setTrajectoryPoints(points);
  };
  
  // Release the ball
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || ballReleased) return;
    
    setIsDragging(false);
    setShowTrajectory(false);
    
    // Only bowl if we've dragged back a minimum distance
    if (powerPercentage < 5) {
      setPowerPercentage(0);
      return;
    }
    
    setBallReleased(true);
    setIsPlaying(true);
    
    const clientX = 'changedTouches' in e 
      ? e.changedTouches[0].clientX 
      : e.clientX;
    const clientY = 'changedTouches' in e 
      ? e.changedTouches[0].clientY 
      : e.clientY;
    
    // Calculate drag vector
    const deltaX = dragStartPos.x - clientX;
    const deltaY = dragStartPos.y - clientY;
    
    // Calculate distance and normalize direction
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const dirX = deltaX / distance;
    const dirY = deltaY / distance;
    
    // Calculate speed based on drag distance and difficulty
    const power = Math.min(100, (distance / 200) * 100);
    
    // Map power to realistic bowling speed (km/h)
    let speedKmh = (power / 100) * MAX_REAL_BOWLING_SPEED_KMH;
    
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
      // Scale time for better gameplay (min 1.5s for visibility)
      scaledTravelTime = Math.max(1.5, realWorldTravelTime / 2);
    }
    
    console.log(`Bowling speed: ${speedKmh.toFixed(1)} km/h, Scaled speed: ${scaledSpeedKmh.toFixed(1)} km/h, Travel time: ${scaledTravelTime.toFixed(2)}s`);
    
    // Calculate accuracy based on horizontal deviation from center
    let accuracy = 100;
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    
    if (fieldRect) {
      const fieldCenterX = fieldRect.left + fieldRect.width / 2;
      const horizontalDeviation = Math.abs(dragStartPos.x - fieldCenterX);
      accuracy = Math.max(0, 100 - (horizontalDeviation / (fieldRect.width / 2) * 100));
    }
    
    // Animate the ball along the calculated trajectory
    controls.start({
      x: [0, -dirX * 200],
      y: [0, -dirY * 200],
      rotate: [0, 720],
      transition: { 
        duration: scaledTravelTime, 
        ease: "linear",
        times: [0, 1]
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
          
          {/* Trajectory prediction line */}
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
                    className="absolute w-3 h-3 bg-white/50 rounded-full"
                    style={{ 
                      left: `${relX}%`, 
                      top: `${relY}%`,
                      opacity: 1 - (i / trajectoryPoints.length),
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              })}
            </>
          )}
          
          {/* Ball in starting position */}
          {gameStarted && !isPlaying && !ballReleased && (
            <div
              ref={ballRef}
              className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 z-10"
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
                size={isDragging ? "large" : "medium"}
                className={`
                  ${isDragging ? 'scale-110' : ''} 
                  transition-transform 
                  shadow-[0_0_30px_rgba(255,0,0,0.7)]
                `}
              />
              
              {/* Power meter */}
              {isDragging && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-3 bg-white/30 rounded-full overflow-hidden">
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
                  />
                </div>
              )}
              
              {/* Instruction text */}
              {!isDragging && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-center text-sm bg-black/40 px-2.5 py-1.5 rounded-lg">
                  Pull back to bowl
                </div>
              )}
            </div>
          )}
          
          {/* Animated ball after release */}
          {ballReleased && (
            <motion.div 
              className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 z-10"
              animate={controls}
            >
              <CricketBall 
                animated={true} 
                size="medium"
                className="shadow-[0_0_30px_rgba(255,0,0,0.7)]" 
              />
            </motion.div>
          )}
        </CricketField>
      </div>
      
      <div className="w-full p-4 glass-card mt-4 rounded-lg">
        <h3 className="text-white text-center font-bold mb-2">
          {!ballReleased && currentBall < 6 
            ? "Pull back and release to bowl!" 
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
