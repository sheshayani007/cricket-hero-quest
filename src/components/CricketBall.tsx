
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CricketBallProps {
  className?: string;
  speed?: 'slow' | 'medium' | 'fast';
  onClick?: () => void;
  animated?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  trailEffect?: boolean;
  glowColor?: string;
}

const CricketBall: React.FC<CricketBallProps> = ({ 
  className, 
  speed = 'medium', 
  onClick,
  animated = false,
  size = 'small',
  trailEffect = false,
  glowColor = "rgba(255,0,0,0.7)"
}) => {
  // Size mapping for different ball sizes - added 'tiny' for stick cricket
  const sizeMap = {
    tiny: "w-3 h-3",
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-10 h-10"
  };

  return (
    <motion.div 
      className={cn(
        "relative cursor-pointer rounded-full bg-red-600 shadow-lg flex items-center justify-center",
        "border-2 border-white/70",
        animated && "animate-spin-slow",
        sizeMap[size],
        trailEffect && "after:content-[''] after:absolute after:w-full after:h-full after:rounded-full after:bg-red-500/30 after:-z-10 after:blur-md after:animate-pulse",
        className
      )}
      style={{
        boxShadow: `0 0 15px ${glowColor}`,
        background: 'radial-gradient(circle at 35% 35%, #e53e3e 0%, #9b2c2c 70%, #7b1818 100%)'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      {/* Enhanced seam lines for better visibility */}
      <div className="absolute w-full h-full rounded-full">
        <div className="absolute w-[60%] h-[2px] bg-white top-[50%] left-[20%] rotate-[30deg]"></div>
        <div className="absolute w-[60%] h-[2px] bg-white top-[50%] left-[20%] rotate-[150deg]"></div>
        <div className="absolute w-[60%] h-[2px] bg-white top-[50%] left-[20%] rotate-[90deg]"></div>
        <div className="absolute w-[60%] h-[2px] bg-white top-[50%] left-[20%] rotate-[0deg]"></div>
      </div>

      {/* Center dot */}
      <div className="absolute w-1 h-1 bg-white rounded-full"></div>
    </motion.div>
  );
};

export default CricketBall;
