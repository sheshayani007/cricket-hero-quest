
import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Difficulty } from '@/components/DifficultySelector';
import CricketField from '@/components/CricketField';
import CricketBat from '@/components/CricketBat';
import CricketBall from '@/components/CricketBall';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBattingGame } from '@/hooks/useBattingGame';

// Refactored components
import BallTrail from '@/components/batting-game/BallTrail';
import GameStartCountdown from '@/components/batting-game/GameStartCountdown';
import BallTimer from '@/components/batting-game/BallTimer';
import GameInfo from '@/components/batting-game/GameInfo';
import ScoreDisplay from '@/components/batting-game/ScoreDisplay';

const BattingGame = () => {
  const { difficulty = 'medium' } = useParams<{ difficulty: Difficulty }>();
  const { 
    state, 
    controls, 
    batRef, 
    ballRef, 
    fieldRef, 
    handleBatDrag, 
    navigateToHome 
  } = useBattingGame(difficulty as Difficulty);

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative bg-gradient-to-b from-ipl-blue via-ipl-purple to-black">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 text-white z-10 bg-black/30 hover:bg-black/50"
        onClick={navigateToHome}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <GameInfo 
        currentBall={state.currentBall} 
        opponent={state.opponent} 
      />
      
      <div className="flex-1 w-full max-w-md relative" ref={fieldRef}>
        <CricketField className="w-full aspect-square mx-auto">
          <GameStartCountdown 
            countdown={state.countdown} 
            gameStarted={state.gameStarted} 
          />
          
          <BallTimer 
            ballTimer={state.ballTimer} 
            showTimer={state.gameStarted && !state.isPlaying && !state.ballReleased} 
          />
          
          <BallTrail 
            ballPosition={state.ballPosition} 
            visible={state.showBallTrail && state.isPlaying} 
          />
          
          {state.showBall && (
            <motion.div 
              ref={ballRef}
              className="absolute top-[10%] left-1/2 -translate-x-1/2 z-10"
              animate={state.isPlaying ? controls : undefined}
            >
              <CricketBall 
                animated={!state.isPlaying} 
                size="large"
                trailEffect={state.isPlaying}
                glowColor="rgba(255,0,0,0.9)"
              />
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
              className={state.batSwung ? "opacity-50" : ""}
            />
          </div>
        </CricketField>
      </div>
      
      <ScoreDisplay scores={state.scores} />
    </div>
  );
};

export default BattingGame;
