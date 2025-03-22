
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Baseball, GripHorizontal } from 'lucide-react';
import GameModeCard from '@/components/GameModeCard';
import { Difficulty } from '@/components/DifficultySelector';
import { GameMode } from '@/components/GameModeCard';

const Index = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = React.useState<GameMode | null>(null);
  const [battingDifficulty, setBattingDifficulty] = React.useState<Difficulty | null>(null);
  const [bowlingDifficulty, setBowlingDifficulty] = React.useState<Difficulty | null>(null);

  const handleStartGame = (mode: GameMode) => {
    const difficulty = mode === 'batting' ? battingDifficulty : bowlingDifficulty;
    if (!difficulty) return;
    
    navigate(`/play/${mode}/${difficulty}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-ipl-blue via-ipl-purple to-black">
      {/* Logo and title */}
      <motion.div 
        className="text-center mb-12"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <div className="inline-block mb-4">
          <Baseball className="h-16 w-16 text-white animate-bounce-soft" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Which IPL Player Are You?
        </h1>
        <p className="text-white/70 max-w-md mx-auto">
          Test your cricket skills and discover which IPL star matches your playing style!
        </p>
      </motion.div>

      {/* Game mode selection */}
      <div className="flex flex-wrap justify-center gap-6 px-4">
        <GameModeCard
          mode="batting"
          title="Batting"
          description="Face balls from IPL bowlers and see which batsman your style matches!"
          icon={<GripHorizontal className="h-6 w-6 text-ipl-blue" />}
          selectedDifficulty={battingDifficulty}
          onSelectDifficulty={setBattingDifficulty}
          onStart={() => handleStartGame('batting')}
        />
        
        <GameModeCard
          mode="bowling"
          title="Bowling"
          description="Bowl your best deliveries and discover which IPL bowler you resemble!"
          icon={<Baseball className="h-6 w-6 text-ipl-purple" />}
          selectedDifficulty={bowlingDifficulty}
          onSelectDifficulty={setBowlingDifficulty}
          onStart={() => handleStartGame('bowling')}
        />
      </div>
      
      {/* Footer */}
      <motion.div 
        className="mt-12 text-white/50 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Test your cricket skills and discover your IPL player match!
      </motion.div>
    </div>
  );
};

export default Index;
