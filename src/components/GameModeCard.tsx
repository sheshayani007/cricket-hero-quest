
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import DifficultySelector, { Difficulty } from './DifficultySelector';

export type GameMode = 'batting' | 'bowling';

interface GameModeCardProps {
  mode: GameMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  selectedDifficulty: Difficulty | null;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onStart: () => void;
  className?: string;
}

const GameModeCard: React.FC<GameModeCardProps> = ({
  mode,
  title,
  description,
  icon,
  selectedDifficulty,
  onSelectDifficulty,
  onStart,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        "glass-card overflow-hidden rounded-2xl max-w-xs w-full",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className={cn(
        "h-2 w-full",
        mode === 'batting' ? "bg-ipl-blue" : "bg-ipl-purple"
      )} />
      
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-full",
            mode === 'batting' ? "bg-ipl-blue/10" : "bg-ipl-purple/10"
          )}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        
        <p className="text-white/80 text-sm">{description}</p>
        
        <DifficultySelector 
          selected={selectedDifficulty} 
          onChange={onSelectDifficulty} 
        />
        
        <button
          className={cn(
            "w-full py-2 rounded-lg font-medium text-white transition-all",
            !selectedDifficulty && "opacity-50 cursor-not-allowed",
            mode === 'batting' ? "batting-btn" : "bowling-btn"
          )}
          disabled={!selectedDifficulty}
          onClick={onStart}
        >
          Start {title}
        </button>
      </div>
    </motion.div>
  );
};

export default GameModeCard;
