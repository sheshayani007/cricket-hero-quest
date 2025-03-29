
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StickBatsmanProps {
  className?: string;
  swinging?: boolean;
  onSwingComplete?: () => void;
}

const StickBatsman: React.FC<StickBatsmanProps> = ({
  className,
  swinging = false,
  onSwingComplete
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Stick figure batsman */}
      <div className="relative">
        {/* Head */}
        <div className="w-4 h-4 bg-black rounded-full mx-auto"></div>
        
        {/* Body */}
        <div className="w-0.5 h-10 bg-black mx-auto mt-1"></div>
        
        {/* Arms - one for holding bat */}
        <motion.div 
          className="absolute top-5 left-1/2 w-8 h-0.5 bg-black origin-left"
          animate={swinging ? {
            rotate: [0, 45, 90, 45, 0],
          } : {}}
          transition={{ duration: 0.3 }}
          onAnimationComplete={onSwingComplete}
        ></motion.div>
        
        {/* Bat */}
        <motion.div 
          className="absolute top-5 left-[calc(50%+8px)] w-6 h-1.5 bg-amber-800 origin-left"
          animate={swinging ? {
            rotate: [0, 45, 90, 45, 0],
          } : {}}
          transition={{ duration: 0.3 }}
        ></motion.div>
        
        {/* Legs */}
        <div className="flex justify-center mt-1">
          <div className="w-0.5 h-8 bg-black transform rotate-12 origin-top"></div>
          <div className="w-0.5 h-8 bg-black transform -rotate-12 origin-top ml-1"></div>
        </div>
      </div>
    </div>
  );
};

export default StickBatsman;
