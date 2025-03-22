
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
  const speedMultiplier = speed === 'slow' ? 1.5 : speed === 'medium' ? 1 : 0.7;
  
  return (
    <motion.div 
      className={cn(
        "relative cursor-pointer w-12 h-12 rounded-full bg-red-600 shadow-lg flex items-center justify-center",
        animated && "animate-spin-slow",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9, rotate: 720, transition: { duration: 0.8 } }}
      onClick={onClick}
    >
      <div className="absolute w-full h-full rounded-full">
        <div className="absolute w-[40%] h-[1px] bg-white top-[50%] left-[30%] rotate-[30deg]"></div>
        <div className="absolute w-[40%] h-[1px] bg-white top-[50%] left-[30%] rotate-[150deg]"></div>
      </div>
    </motion.div>
  );
};

export default CricketBall;
