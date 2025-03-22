
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Difficulty } from '@/components/DifficultySelector';
import CricketField from '@/components/CricketField';
import CricketBall from '@/components/CricketBall';
import BallCounter from '@/components/BallCounter';
import CountdownTimer from '@/components/CountdownTimer';
import { getRandomPlayers, Player } from '@/data/playerData';

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
  
  const controls = useAnimation();
  const ballRef = useRef<HTMLDivElement>(null);
  
  // Initialize game
  useEffect(() => {
    // Get random batsman based on difficulty
    const [batsman] = getRandomPlayers('batsman', difficulty as Difficulty);
    setOpponent(batsman);
    
    // Start countdown
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
  
  // Handle ball drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPlaying || ballReleased) return;
    
    setIsDragging(true);
    
    // Get start position
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    const clientY = 'touches' in e 
      ? e.touches[0].clientY 
      : e.clientY;
    
    setDragStartPos({ x: clientX, y: clientY });
  };
  
  // Handle ball drag end (release)
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || ballReleased) return;
    
    setIsDragging(false);
    setBallReleased(true);
    setIsPlaying(true);
    
    // Get end position
    const clientX = 'changedTouches' in e 
      ? e.changedTouches[0].clientX 
      : e.clientX;
    const clientY = 'changedTouches' in e 
      ? e.changedTouches[0].clientY 
      : e.clientY;
    
    // Calculate velocity and direction
    const deltaX = clientX - dragStartPos.x;
    const deltaY = clientY - dragStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Normalize to 0-100 scale
    // In a real game this would be more sophisticated
    const speed = Math.min(100, distance / 5);
    
    // Calculate accuracy (based on how centered the throw is)
    // For this demo, we'll consider horizontal deviation from center
    const fieldRect = document.querySelector('.cricket-field')?.getBoundingClientRect();
    let accuracy = 100;
    
    if (fieldRect) {
      const fieldCenterX = fieldRect.left + fieldRect.width / 2;
      const horizontalDeviation = Math.abs(clientX - fieldCenterX);
      accuracy = Math.max(0, 100 - (horizontalDeviation / (fieldRect.width / 2) * 100));
    }
    
    // Animate ball based on throw
    controls.start({
      y: [0, -100, -300],
      x: [0, deltaX/10, deltaX/5],
      rotate: 720,
      transition: { duration: 1.5, ease: "easeOut" }
    }).then(() => {
      // Ball reached the other end
      setPerformances(prev => [...prev, { speed, accuracy }]);
      setIsPlaying(false);
      setBallReleased(false);
      setCurrentBall(prev => prev + 1);
    });
  };
  
  // Between-ball timer
  useEffect(() => {
    if (gameStarted && !isPlaying && currentBall < 6 && !ballReleased) {
      // Wait a moment before allowing next ball
      const timer = setTimeout(() => {
        // Ready for next ball
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Check if all balls have been bowled
    if (currentBall >= 6) {
      // Game over, navigate to results
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
    <div className="min-h-screen w-full flex flex-col items-center relative">
      {/* Game stats header */}
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
      
      {/* Cricket field */}
      <div className="flex-1 w-full max-w-3xl relative">
        <CricketField className="w-full h-[70vh]">
          {/* Countdown or timer */}
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
          ) : (
            <CountdownTimer 
              duration={3} 
              className="absolute top-4 right-4"
              autoStart={false}
            />
          )}
          
          {/* Ball */}
          {gameStarted && !isPlaying && !ballReleased && (
            <motion.div
              ref={ballRef}
              className="absolute bottom-[10%] left-[calc(50%-24px)]"
              drag={!ballReleased}
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 0 }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              onMouseUp={handleDragEnd}
              onTouchEnd={handleDragEnd}
              animate={ballReleased ? controls : {}}
              whileDrag={{ scale: 1.2 }}
              style={{ cursor: ballReleased ? 'default' : 'grab' }}
            >
              <CricketBall animated={isDragging} />
            </motion.div>
          )}
          
          {/* Ball in motion */}
          {ballReleased && (
            <motion.div 
              className="absolute bottom-[10%] left-[calc(50%-24px)]"
              animate={controls}
            >
              <CricketBall animated={true} />
            </motion.div>
          )}
        </CricketField>
      </div>
      
      {/* Instructions */}
      <div className="w-full p-4 glass-card mt-4 rounded-lg text-center">
        <h3 className="text-white font-bold mb-2">
          {!ballReleased && currentBall < 6 
            ? "Drag and release to bowl!" 
            : "Ball " + (currentBall) + " of 6"
          }
        </h3>
        <div className="flex justify-center gap-2">
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
