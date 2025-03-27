
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CricketBallProps {
  className?: string;
  speed?: 'slow' | 'medium' | 'fast';
  onClick?: () => void;
  animated?: boolean;
}

const CricketBall: React.FC<CricketBallProps> = ({ 
  className, 
  speed = 'medium', 
  onClick,
  animated = false
}) => {
  return (
    <motion.div 
      className={cn(
        "relative cursor-pointer w-12 h-12 rounded-full bg-red-600 shadow-lg flex items-center justify-center",
        "border-2 border-white/20 shadow-xl",
        animated && "animate-spin-slow",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <div className="absolute w-full h-full rounded-full">
        <div className="absolute w-[40%] h-[1.5px] bg-white top-[50%] left-[30%] rotate-[30deg]"></div>
        <div className="absolute w-[40%] h-[1.5px] bg-white top-[50%] left-[30%] rotate-[150deg]"></div>
      </div>
    </motion.div>
  );
};

export default CricketBall;
