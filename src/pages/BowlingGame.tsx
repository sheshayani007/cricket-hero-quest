import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Difficulty } from '@/components/DifficultySelector';
import CricketField from '@/components/CricketField';
import CricketBall from '@/components/CricketBall';
import BallCounter from '@/components/BallCounter';
import CountdownTimer from '@/components/CountdownTimer';
import { getRandomPlayers, Player } from '@/data/playerData';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REAL_PITCH_LENGTH_METERS = 20.12; // Standard cricket pitch length in meters
const MAX_REAL_BOWLING_SPEED_KMH = 160; // Maximum realistic bowling speed in km/h

const BowlingGame = () => {
  const { difficulty = 'medium' } = useParams<{ difficulty: Difficulty }>();
  const navigate = useNavigate();
  const [currentBall, setCurrentBall] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [performances, setPerformances] = useState<{speed: number, accuracy: number}[]>([]);
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
  
  const controls = useAnimation();
  const ballRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const updateFieldSize = () => {
      if (fieldRef.current) {
        const fieldRect = fieldRef.current.getBoundingClientRect();
        const fieldDiameter = Math.min(fieldRect.width, fieldRect.height);
        setFieldSize(fieldDiameter);
        
        const pitchLengthPx = fieldDiameter * 0.7;
        setPitchLength(pitchLengthPx);
        
        const pitchLengthCm = pitchLengthPx / 10;
        const calculatedRatio = REAL_PITCH_LENGTH_METERS * 100 / pitchLengthCm;
        setSpeedRatio(calculatedRatio);
        
        console.log(`Field size: ${fieldDiameter}px, Pitch length: ${pitchLengthPx}px, Speed ratio: ${calculatedRatio}`);
      }
    };
    
    updateFieldSize();
    window.addEventListener('resize', updateFieldSize);
    
    return () => {
      window.removeEventListener('resize', updateFieldSize);
    };
  }, []);
  
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
  };
  
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || ballReleased) return;
    
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    const clientY = 'touches' in e 
      ? e.touches[0].clientY 
      : e.clientY;
    
    setCurrentDragPos({ x: clientX, y: clientY });
    
    const deltaX = dragStartPos.x - clientX;
    const deltaY = dragStartPos.y - clientY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const points = [];
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      points.push({
        x: clientX + (deltaX * (i+1) / steps),
        y: clientY + (deltaY * (i+1) / steps)
      });
    }
    
    setTrajectoryPoints(points);
  };
  
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || ballReleased) return;
    
    setIsDragging(false);
    setShowTrajectory(false);
    setBallReleased(true);
    setIsPlaying(true);
    
    const clientX = 'changedTouches' in e 
      ? e.changedTouches[0].clientX 
      : e.clientX;
    const clientY = 'changedTouches' in e 
      ? e.changedTouches[0].clientY 
      : e.clientY;
    
    const deltaX = dragStartPos.x - clientX;
    const deltaY = dragStartPos.y - clientY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const powerPercentage = Math.min(100, distance / 3);
    
    let speedKmh = (powerPercentage / 100) * MAX_REAL_BOWLING_SPEED_KMH;
    
    if (difficulty === 'easy') {
      speedKmh *= 0.7;
    } else if (difficulty === 'hard') {
      speedKmh *= 1.2;
    }
    
    const speedMs = speedKmh / 3.6;
    
    const realWorldTravelTime = REAL_PITCH_LENGTH_METERS / speedMs;
    const scaledTravelTime = Math.max(1.2, realWorldTravelTime / 5);
    
    console.log(`Bowling speed: ${speedKmh.toFixed(1)} km/h, Travel time: ${scaledTravelTime.toFixed(2)}s`);
    
    const dirX = deltaX / distance;
    const dirY = deltaY / distance;
    
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    let accuracy = 100;
    
    if (fieldRect) {
      const fieldCenterX = fieldRect.left + fieldRect.width / 2;
      const horizontalDeviation = Math.abs(clientX - fieldCenterX);
      accuracy = Math.max(0, 100 - (horizontalDeviation / (fieldRect.width / 2) * 100));
    }
    
    controls.start({
      y: [0, dirY * -200],
      x: [0, dirX * -200],
      rotate: 720,
      transition: { duration: scaledTravelTime, ease: "easeOut" }
    }).then(() => {
      setPerformances(prev => [...prev, { speed: speedKmh, accuracy }]);
      setIsPlaying(false);
      setBallReleased(false);
      setCurrentBall(prev => prev + 1);
    });
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  useEffect(() => {
    if (gameStarted && !isPlaying && currentBall < 6 && !ballReleased) {
      const timer = setTimeout(() => {
        // Ready for next ball
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    if (currentBall >= 6) {
      navigate('/results/bowling', { 
        state: { 
          performances, 
          difficulty,
          opponent 
        } 
      });
    }
  }, [gameStarted, isPlaying, currentBall, ballReleased, performances, difficulty, opponent, navigate]);
  
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
                    className="absolute w-2 h-2 bg-white/50 rounded-full"
                    style={{ 
                      left: `${relX}%`, 
                      top: `${relY}%`,
                      opacity: 1 - (i / trajectoryPoints.length)
                    }}
                  />
                );
              })}
            </>
          )}
          
          {gameStarted && !isPlaying && !ballReleased && (
            <div
              ref={ballRef}
              className="absolute bottom-[10%] left-[calc(50%-24px)]"
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
                className={`${isDragging ? 'scale-110' : ''} transition-transform shadow-[0_0_30px_rgba(255,0,0,0.7)]`}
              />
              
              {isDragging && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-ipl-orange" 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: dragStartPos && currentDragPos ? 
                        `${Math.min(100, Math.sqrt(
                          Math.pow(dragStartPos.x - currentDragPos.x, 2) + 
                          Math.pow(dragStartPos.y - currentDragPos.y, 2)
                        ) / 3)}%` : '0%'
                    }}
                  />
                </div>
              )}
              
              {!isDragging && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-center text-sm bg-black/40 px-2 py-1 rounded">
                  Pull back to bowl
                </div>
              )}
            </div>
          )}
          
          {ballReleased && (
            <motion.div 
              className="absolute bottom-[10%] left-[calc(50%-24px)]"
              animate={controls}
            >
              <CricketBall animated={true} className="shadow-[0_0_30px_rgba(255,0,0,0.7)]" />
            </motion.div>
          )}
        </CricketField>
      </div>
      
      <div className="w-full p-4 glass-card mt-4 rounded-lg text-center">
        <h3 className="text-white font-bold mb-2">
          {!ballReleased && currentBall < 6 
            ? "Pull back and release to bowl!" 
            : "Ball " + (currentBall) + " of 6"
          }
        </h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {performances.map((perf, i) => (
            <div 
              key={i} 
              className="glass-card px-2 py-1 rounded-md text-white text-xs"
            >
              {Math.round(perf.speed)}km/h
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BowlingGame;
