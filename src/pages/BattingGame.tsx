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
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REAL_PITCH_LENGTH_METERS = 20.12; // Standard cricket pitch length in meters

const BattingGame = () => {
  const { difficulty = 'medium' } = useParams<{ difficulty: Difficulty }>();
  const navigate = useNavigate();
  const [currentBall, setCurrentBall] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [showBall, setShowBall] = useState(true);
  const [batSwung, setBatSwung] = useState(false);
  const [ballReleased, setBallReleased] = useState(false);
  const [ballTimer, setBallTimer] = useState(5);
  const [fieldSize, setFieldSize] = useState(0);
  const [pitchLength, setPitchLength] = useState(0);
  const [speedRatio, setSpeedRatio] = useState(1);
  const controls = useAnimation();
  const batRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const speedRanges = {
    'easy': { min: 100, max: 120 },
    'medium': { min: 125, max: 145 },
    'hard': { min: 150, max: 170 }
  };

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

  const handleBackToHome = () => {
    navigate('/');
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
    setBallReleased(true);
    
    const diffSettings = speedRanges[difficulty as keyof typeof speedRanges];
    const speedKmh = diffSettings.min + Math.random() * (diffSettings.max - diffSettings.min);
    
    const speedMs = speedKmh / 3.6;
    
    const realWorldTravelTime = REAL_PITCH_LENGTH_METERS / speedMs;
    const scaledTravelTime = Math.max(1.2, realWorldTravelTime / 5);
    
    console.log(`Ball speed: ${speedKmh} km/h, Real travel time: ${realWorldTravelTime}s, Game travel time: ${scaledTravelTime}s`);
    
    const randomHorizontal = Math.random() * 30 - 15;
    
    controls.start({
      y: ['-50vh', '70vh'],
      x: [randomHorizontal, randomHorizontal],
      rotate: [0, 720],
      transition: { 
        duration: scaledTravelTime,
        ease: "linear"
      }
    }).then(() => {
      if (!batSwung) {
        setScores(prev => [...prev, 0]);
      }
      setShowBall(false);
      setIsPlaying(false);
      setBallReleased(false);
      setCurrentBall(prev => prev + 1);
      setBallTimer(5);
    });
  };

  const handleBatDrag = (_: any, info: any) => {
    if (!isPlaying || batSwung) return;
    
    if (ballRef.current && batRef.current) {
      const ballRect = ballRef.current.getBoundingClientRect();
      const batRect = batRef.current.getBoundingClientRect();
      
      const batCenterX = batRect.left + batRect.width / 2;
      const batCenterY = batRect.top + batRect.height / 2;
      const ballCenterX = ballRect.left + ballRect.width / 2;
      const ballCenterY = ballRect.top + ballRect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(batCenterX - ballCenterX, 2) + 
        Math.pow(batCenterY - ballCenterY, 2)
      );
      
      if (distance < 70 && !batSwung) {
        setBatSwung(true);
        
        const verticalDistance = Math.abs(ballCenterY - batCenterY);
        const perfectDistance = 20;
        const tolerance = 30;
        
        const timingScore = Math.max(0, 6 - Math.floor(Math.abs(verticalDistance - perfectDistance) / tolerance));
        
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
    }
  };

  useEffect(() => {
    if (gameStarted && !isPlaying && currentBall < 6 && !ballReleased) {
      const timer = setInterval(() => {
        setBallTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            startNewBall();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameStarted, isPlaying, currentBall, ballReleased]);

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
          <h2 className="text-white font-bold">Facing: {opponent?.name || 'Bowler'}</h2>
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
                {countdown > 0 ? countdown : "Play!"}
              </motion.div>
            </div>
          ) : !isPlaying && !ballReleased ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div 
                className="text-4xl font-bold text-white"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                {ballTimer}
              </motion.div>
            </div>
          ) : null}
          
          {showBall && (
            <motion.div 
              ref={ballRef}
              className="absolute top-[10%] left-1/2 -translate-x-1/2 z-10"
              animate={isPlaying ? controls : undefined}
            >
              <CricketBall animated={!isPlaying} className="shadow-[0_0_30px_rgba(255,0,0,0.7)]" />
            </motion.div>
          )}
          
          <div 
            ref={batRef}
            className="absolute bottom-[15%] left-[calc(50%-18px)]"
          >
            <CricketBat 
              onDrag={handleBatDrag}
              dragConstraints={{
                top: 0,
                left: -100,
                right: 100,
                bottom: 100
              }}
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
