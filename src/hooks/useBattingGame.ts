
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Difficulty } from '@/components/DifficultySelector';
import { getRandomPlayers, Player } from '@/data/playerData';
import { useAnimation } from 'framer-motion';

// Real cricket pitch length constant
const REAL_PITCH_LENGTH_METERS = 20.12;

export interface BattingGameState {
  currentBall: number;
  isPlaying: boolean;
  opponent: Player | null;
  scores: number[];
  countdown: number;
  gameStarted: boolean;
  showBall: boolean;
  batSwung: boolean;
  ballReleased: boolean;
  ballTimer: number;
  fieldSize: number;
  pitchLength: number;
  speedRatio: number;
  ballPosition: { x: number; y: number };
  showBallTrail: boolean;
}

export const useBattingGame = (difficulty: Difficulty = 'medium') => {
  const navigate = useNavigate();
  const [state, setState] = useState<BattingGameState>({
    currentBall: 0,
    isPlaying: false,
    opponent: null,
    scores: [],
    countdown: 3,
    gameStarted: false,
    showBall: true,
    batSwung: false,
    ballReleased: false,
    ballTimer: 5,
    fieldSize: 0,
    pitchLength: 0,
    speedRatio: 1,
    ballPosition: { x: 0, y: 0 },
    showBallTrail: false,
  });
  
  const controls = useAnimation();
  const batRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const speedRanges = {
    'easy': { min: 100, max: 120 },
    'medium': { min: 125, max: 145 },
    'hard': { min: 150, max: 170 }
  };

  // Update field size based on container
  useEffect(() => {
    const updateFieldSize = () => {
      if (fieldRef.current) {
        const fieldRect = fieldRef.current.getBoundingClientRect();
        const fieldDiameter = Math.min(fieldRect.width, fieldRect.height);
        
        const pitchLengthPx = fieldDiameter * 0.7;
        const pitchLengthCm = pitchLengthPx / 10;
        const calculatedRatio = REAL_PITCH_LENGTH_METERS * 100 / pitchLengthCm;
        
        setState(prev => ({
          ...prev,
          fieldSize: fieldDiameter,
          pitchLength: pitchLengthPx,
          speedRatio: calculatedRatio
        }));
        
        console.log(`Field size: ${fieldDiameter}px, Pitch length: ${pitchLengthPx}px, Speed ratio: ${calculatedRatio}`);
      }
    };
    
    updateFieldSize();
    window.addEventListener('resize', updateFieldSize);
    
    return () => {
      window.removeEventListener('resize', updateFieldSize);
    };
  }, []);

  // Initialize the game with a random opponent
  useEffect(() => {
    const [bowler] = getRandomPlayers('bowler', difficulty);
    setState(prev => ({ ...prev, opponent: bowler }));
    
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(timer);
          return { ...prev, countdown: 0, gameStarted: true };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [difficulty]);

  // Update ball position during animation for trail effect
  useEffect(() => {
    if (state.isPlaying && ballRef.current) {
      const updateBallPosition = () => {
        const ballRect = ballRef.current?.getBoundingClientRect();
        if (ballRect) {
          setState(prev => ({
            ...prev,
            ballPosition: {
              x: ballRect.left + ballRect.width/2,
              y: ballRect.top + ballRect.height/2
            }
          }));
        }
        
        if (state.isPlaying) {
          requestAnimationFrame(updateBallPosition);
        }
      };
      
      requestAnimationFrame(updateBallPosition);
    }
  }, [state.isPlaying]);

  // Ball timer countdown
  useEffect(() => {
    if (state.gameStarted && !state.isPlaying && state.currentBall < 6 && !state.ballReleased) {
      const timer = setInterval(() => {
        setState(prev => {
          if (prev.ballTimer <= 1) {
            clearInterval(timer);
            startNewBall();
            return { ...prev, ballTimer: 5 };
          }
          return { ...prev, ballTimer: prev.ballTimer - 1 };
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [state.gameStarted, state.isPlaying, state.currentBall, state.ballReleased]);

  const startNewBall = () => {
    if (state.currentBall >= 6) {
      navigate('/results/batting', { 
        state: { 
          scores: state.scores, 
          difficulty,
          opponent: state.opponent 
        } 
      });
      return;
    }
    
    setState(prev => ({
      ...prev,
      isPlaying: true,
      showBall: true,
      batSwung: false,
      ballReleased: true,
      showBallTrail: true
    }));
    
    const diffSettings = speedRanges[difficulty];
    const speedKmh = diffSettings.min + Math.random() * (diffSettings.max - diffSettings.min);
    
    const speedMs = speedKmh / 3.6;
    
    const realWorldTravelTime = REAL_PITCH_LENGTH_METERS / speedMs;
    // Significantly increase the base time for slower ball movement and better visibility
    const scaledTravelTime = Math.max(3.0, realWorldTravelTime / 3);
    
    console.log(`Ball speed: ${speedKmh} km/h, Real travel time: ${realWorldTravelTime}s, Game travel time: ${scaledTravelTime}s`);
    
    // Randomize horizontal position a bit less for better playability
    const randomHorizontal = Math.random() * 20 - 10;
    
    controls.start({
      y: ['-50vh', '70vh'],
      x: [randomHorizontal, randomHorizontal],
      rotate: [0, 720],
      transition: { 
        duration: scaledTravelTime,
        ease: "linear"
      }
    }).then(() => {
      if (!state.batSwung) {
        setState(prev => ({
          ...prev,
          scores: [...prev.scores, 0]
        }));
      }
      setState(prev => ({
        ...prev,
        showBall: false,
        isPlaying: false,
        ballReleased: false,
        showBallTrail: false,
        currentBall: prev.currentBall + 1,
        ballTimer: 5
      }));
    });
  };

  const handleBatDrag = (_: any, info: any) => {
    if (!state.isPlaying || state.batSwung) return;
    
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
      
      // Increase the hit detection radius for better playability
      if (distance < 80 && !state.batSwung) {
        setState(prev => ({
          ...prev,
          batSwung: true,
          showBallTrail: false
        }));
        
        const verticalDistance = Math.abs(ballCenterY - batCenterY);
        const perfectDistance = 20;
        const tolerance = 35; // Increased tolerance
        
        const timingScore = Math.max(0, 6 - Math.floor(Math.abs(verticalDistance - perfectDistance) / tolerance));
        
        setState(prev => ({
          ...prev,
          scores: [...prev.scores, timingScore]
        }));
        
        controls.start({
          x: [0, timingScore > 3 ? 300 : 100, -100],
          y: [0, -100, 200],
          scale: [1, 1.2, 0.8],
          opacity: [1, 1, 0],
          transition: { duration: 1 }
        }).then(() => {
          setState(prev => ({
            ...prev,
            showBall: false
          }));
        });
      }
    }
  };

  return {
    state,
    controls,
    batRef,
    ballRef,
    fieldRef,
    handleBatDrag,
    navigateToHome: () => navigate('/')
  };
};
