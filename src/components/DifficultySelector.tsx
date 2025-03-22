
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultySelectorProps {
  selected: Difficulty | null;
  onChange: (difficulty: Difficulty) => void;
  className?: string;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  selected, 
  onChange,
  className
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className={cn("flex justify-center gap-3", className)}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.button
        variants={item}
        className={cn(
          "difficulty-chip easy-chip",
          selected === 'easy' && "ring-2 ring-green-500"
        )}
        onClick={() => onChange('easy')}
      >
        Easy
      </motion.button>
      
      <motion.button
        variants={item}
        className={cn(
          "difficulty-chip medium-chip",
          selected === 'medium' && "ring-2 ring-yellow-500"
        )}
        onClick={() => onChange('medium')}
      >
        Medium
      </motion.button>
      
      <motion.button
        variants={item}
        className={cn(
          "difficulty-chip hard-chip",
          selected === 'hard' && "ring-2 ring-red-500"
        )}
        onClick={() => onChange('hard')}
      >
        Hard
      </motion.button>
    </motion.div>
  );
};

export default DifficultySelector;
