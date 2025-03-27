import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Difficulty } from '@/components/DifficultySelector';
import CricketField from '@/components/CricketField';
import CricketBat from '@/components/CricketBat';
import CricketBall from '@/components/CricketBall';
import BallCounter from '@/components/BallCounter';
import CountdownTimer from '@/components/CountdownTimer';
import { getRandomPlayers, Player } from '@/data/playerData';

const BattingGame = () => {
  const { difficulty = 'medium' } = useParams<{ difficulty: Difficulty }>();
  const navigate = useNavigate();
  const [currentBall, setCurrentBall] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [showBall, setShowBall] = useState(false);
  const [batSwung, setBatSwung] = useState(false);
  
  const controls = useAnimation();
  const batRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  
  const speedMap = {
    'easy': { min: 2, max: 3 },
    'medium': { min: 1.5, max: 2.5 },
    'hard': { min: 1, max: 2 }
  };
  
  useEffect(() => {
    const [bowler] = getRandomPlayers('bowler', difficulty as Difficulty);
    setOpponent(bowler);
    
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
  
  const startNewBall = () => {
    if (currentBall >= 6) {
      navigate('/results/batting', { 
        state: { 
          scores, 
          difficulty,
          opponent 
        } 
      });
      return;
    }
    
    setIsPlaying(true);
    setShowBall(true);
    setBatSwung(false);
    
    const speed = speedMap[difficulty as keyof typeof speedMap];
    const ballSpeed = speed.min + Math.random() * (speed.max - speed.min);
    
    const randomHorizontal = Math.random() * 60 - 30;
    
    controls.start({
      y: ['-60vh', '75vh'],
      x: [randomHorizontal, randomHorizontal],
      rotate: [0, 720],
      transition: { 
        duration: ballSpeed,
        ease: "easeIn"
      }
    }).then(() => {
      if (!batSwung) {
        setScores(prev => [...prev, 0]);
      }
      setShowBall(false);
      setIsPlaying(false);
      setCurrentBall(prev => prev + 1);
    });
  };
  
  const handleBatSwing = () => {
    if (!isPlaying || batSwung) return;
    
    setBatSwung(true);
    
    if (ballRef.current && batRef.current) {
      const ballRect = ballRef.current.getBoundingClientRect();
      const batRect = batRef.current.getBoundingClientRect();
      
      const distance = Math.abs((ballRect.top + ballRect.height/2) - batRect.top);
      const perfectDistance = 50;
      const tolerance = 30;
      
      const timingScore = Math.max(0, 6 - Math.floor(Math.abs(distance - perfectDistance) / tolerance));
      
      setScores(prev => [...prev, timingScore]);
      
      controls.start({
        x: [0, timingScore > 3 ? 300 : 100, -100],
        y: [0, -100, 200],
        scale: [1, 1.2, 0.8],
        opacity: [1, 1, 0],
        transition: { duration: 1 }
      }).then(() => {
        setShowBall(false);
      });
    }
  };
  
  useEffect(() => {
    if (gameStarted && !isPlaying && currentBall < 6) {
      const timer = setTimeout(() => {
        startNewBall();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameStarted, isPlaying, currentBall]);
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center relative">
      <div className="w-full p-4 flex justify-between items-center">
        <div className="glass-card px-4 py-2 rounded-lg">
          <h2 className="text-white font-bold">Facing: {opponent?.name || 'Bowler'}</h2>
          <p className="text-white/70 text-sm">{opponent?.team || 'Team'}</p>
        </div>
        
        <BallCounter 
          currentBall={currentBall} 
          className="glass-card px-3 py-2 rounded-lg"
        />
      </div>
      
      <div className="flex-1 w-full max-w-md relative">
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
                {countdown > 0 ? countdown : "Play!"}
              </motion.div>
            </div>
          ) : (
            <CountdownTimer 
              duration={3} 
              className="absolute top-4 right-4"
              autoStart={!isPlaying && currentBall < 6}
            />
          )}
          
          {showBall && (
            <motion.div 
              ref={ballRef}
              className="absolute top-0 left-[calc(50%-20px)]"
              animate={controls}
            >
              <CricketBall />
            </motion.div>
          )}
          
          <div 
            ref={batRef}
            className="absolute bottom-[10%] left-[calc(50%-20px)]"
          >
            <CricketBat 
              onClick={handleBatSwing} 
              className={batSwung ? "opacity-50" : ""}
            />
          </div>
        </CricketField>
      </div>
      
      <div className="w-full p-4 glass-card mt-4 rounded-lg">
        <h3 className="text-white text-center font-bold mb-2">Current Over</h3>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                i < scores.length 
                  ? 'bg-ipl-blue text-white'
                  : 'bg-white/20 text-white/50'
              }`}
            >
              {i < scores.length ? scores[i] : '-'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattingGame;
