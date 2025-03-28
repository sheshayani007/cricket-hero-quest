
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
        "border-4 border-white/70 shadow-[0_0_25px_rgba(255,0,0,0.5)]",
        animated && "animate-spin-slow",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      {/* Enhanced seam lines for better visibility */}
      <div className="absolute w-full h-full rounded-full">
        <div className="absolute w-[60%] h-[3px] bg-white top-[50%] left-[20%] rotate-[30deg]"></div>
        <div className="absolute w-[60%] h-[3px] bg-white top-[50%] left-[20%] rotate-[150deg]"></div>
        <div className="absolute w-[60%] h-[3px] bg-white top-[50%] left-[20%] rotate-[90deg]"></div>
        <div className="absolute w-[60%] h-[3px] bg-white top-[50%] left-[20%] rotate-[0deg]"></div>
      </div>
    </motion.div>
  );
};

export default CricketBall;
