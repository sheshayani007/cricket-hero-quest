
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CricketBallProps {
  className?: string;
  speed?: 'slow' | 'medium' | 'fast';
  onClick?: () => void;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const CricketBall: React.FC<CricketBallProps> = ({ 
  className, 
  speed = 'medium', 
  onClick,
  animated = false,
  size = 'medium'
}) => {
  // Size mapping for different ball sizes
  const sizeMap = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };

  return (
    <motion.div 
      className={cn(
        "relative cursor-pointer rounded-full bg-red-600 shadow-lg flex items-center justify-center",
        "border-4 border-white/70 shadow-[0_0_25px_rgba(255,0,0,0.7)]",
        animated && "animate-spin-slow",
        sizeMap[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      {/* Enhanced seam lines for better visibility */}
      <div className="absolute w-full h-full rounded-full">
        <div className="absolute w-[60%] h-[4px] bg-white top-[50%] left-[20%] rotate-[30deg]"></div>
        <div className="absolute w-[60%] h-[4px] bg-white top-[50%] left-[20%] rotate-[150deg]"></div>
        <div className="absolute w-[60%] h-[4px] bg-white top-[50%] left-[20%] rotate-[90deg]"></div>
        <div className="absolute w-[60%] h-[4px] bg-white top-[50%] left-[20%] rotate-[0deg]"></div>
      </div>

      {/* Center dot */}
      <div className="absolute w-2 h-2 bg-white rounded-full"></div>
    </motion.div>
  );
};

export default CricketBall;
