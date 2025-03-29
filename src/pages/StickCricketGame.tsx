
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StickCricketField from '@/components/StickCricketField';
import StickBatsman from '@/components/StickBatsman';
import StickBowler from '@/components/StickBowler';
import CricketBall from '@/components/CricketBall';

const StickCricketGame = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [showBall, setShowBall] = useState(false);
  const [isBowling, setIsBowling] = useState(false);
  const [isSwinging, setIsSwinging] = useState(false);
  const [canHit, setCanHit] = useState(false);
  const [hitDirection, setHitDirection] = useState<number>(0);
  
  const ballControls = useAnimation();
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  const startGame = () => {
    if (wickets < 3 && !isPlaying) {
      setIsPlaying(true);
      bowlBall();
    }
  };
  
  const bowlBall = () => {
    setIsBowling(true);
    setShowBall(false);
    
    // Wait for bowling animation to complete
    setTimeout(() => {
      setShowBall(true);
      // Ball starts from bowler's position
      setBallPosition({ x: 30, y: 50 });
      
      // Animate ball from bowler to batsman
      ballControls.start({
        x: [30, 70],
        y: [50, 50],
        transition: { duration: 1, ease: "linear" }
      }).then(() => {
        // Ball reaches batsman, can now be hit
        setCanHit(true);
        
        // If not hit within a short time, it's a miss
        setTimeout(() => {
          if (canHit) {
            ballMissed();
          }
        }, 500);
      });
    }, 500);
  };
  
  const swingBat = () => {
    if (!canHit) return;
    
    setIsSwinging(true);
    setCanHit(false);
    
    // Random direction of hit (left or right)
    const direction = Math.random() > 0.5 ? -1 : 1;
    setHitDirection(direction);
    
    // Random score calculation (0-6)
    const newRuns = Math.floor(Math.random() * 7);
    
    if (newRuns === 0) {
      // Out!
      setTimeout(() => {
        setWickets(prev => prev + 1);
        endBall(true);
      }, 300);
    } else {
      // Runs scored
      setTimeout(() => {
        setScore(prev => prev + newRuns);
        
        // Animate ball according to runs scored
        ballControls.start({
          x: direction > 0 ? [70, 95] : [70, 5],
          y: [50, 50],
          opacity: [1, 0],
          transition: { duration: 0.8 }
        }).then(() => {
          endBall(false);
        });
      }, 300);
    }
  };
  
  const ballMissed = () => {
    setCanHit(false);
    // 50% chance of out when missing
    const isOut = Math.random() > 0.5;
    
    if (isOut) {
      setWickets(prev => prev + 1);
    }
    
    ballControls.start({
      x: [70, 80],
      y: [50, 50],
      opacity: [1, 0],
      transition: { duration: 0.5 }
    }).then(() => {
      endBall(isOut);
    });
  };
  
  const endBall = (wasOut: boolean) => {
    setShowBall(false);
    setIsPlaying(false);
    
    if (wickets >= 2 && wasOut) {
      setGameOver(true);
    }
  };
  
  const handleBowlComplete = () => {
    setIsBowling(false);
  };
  
  const handleSwingComplete = () => {
    setIsSwinging(false);
  };
  
  const resetGame = () => {
    setScore(0);
    setWickets(0);
    setGameOver(false);
    setIsPlaying(false);
    setShowBall(false);
    setCanHit(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 p-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 text-white z-10 bg-black/30 hover:bg-black/50"
        onClick={handleBackToHome}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <div className="max-w-lg mx-auto mt-10">
        <div className="glass-card p-4 rounded-lg mb-4 flex justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Score: {score}/{wickets}</h2>
          </div>
          
          {!isPlaying && !gameOver && (
            <Button 
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700"
            >
              {wickets === 0 && score === 0 ? 'Start Game' : 'Next Ball'}
            </Button>
          )}
          
          {gameOver && (
            <Button 
              onClick={resetGame}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Play Again
            </Button>
          )}
        </div>
        
        <StickCricketField className="mb-4">
          {/* Bowler */}
          <div className="absolute top-[40%] left-[20%]">
            <StickBowler bowling={isBowling} onBowlComplete={handleBowlComplete} />
          </div>
          
          {/* Batsman */}
          <div className="absolute top-[40%] right-[20%]">
            <StickBatsman swinging={isSwinging} onSwingComplete={handleSwingComplete} />
          </div>
          
          {/* Ball */}
          {showBall && (
            <motion.div 
              className="absolute"
              style={{ 
                top: `${ballPosition.y}%`, 
                left: `${ballPosition.x}%`,
              }}
              animate={ballControls}
            >
              <CricketBall size="tiny" />
            </motion.div>
          )}
        </StickCricketField>
        
        {canHit && (
          <div className="flex justify-center">
            <Button 
              onClick={swingBat}
              className="bg-red-600 hover:bg-red-700 animate-pulse"
              size="lg"
            >
              HIT NOW!
            </Button>
          </div>
        )}
        
        {gameOver && (
          <div className="glass-card p-6 rounded-lg text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
            <p className="text-xl text-white mb-4">Final Score: {score}/{wickets}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickCricketGame;
