
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StickBowlerProps {
  className?: string;
  bowling?: boolean;
  onBowlComplete?: () => void;
}

const StickBowler: React.FC<StickBowlerProps> = ({
  className,
  bowling = false,
  onBowlComplete
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Stick figure bowler */}
      <div className="relative">
        {/* Head */}
        <div className="w-4 h-4 bg-black rounded-full mx-auto"></div>
        
        {/* Body */}
        <div className="w-0.5 h-10 bg-black mx-auto mt-1"></div>
        
        {/* Bowling arm */}
        <motion.div 
          className="absolute top-5 left-1/2 w-8 h-0.5 bg-black origin-left"
          animate={bowling ? {
            rotate: [-45, -90, -135, -90, -45],
          } : {}}
          transition={{ duration: 0.5 }}
          onAnimationComplete={onBowlComplete}
        ></motion.div>
        
        {/* Legs in bowling stance */}
        <div className="flex justify-center mt-1">
          <div className="w-0.5 h-8 bg-black transform rotate-20 origin-top"></div>
          <div className="w-0.5 h-8 bg-black transform -rotate-20 origin-top ml-1.5"></div>
        </div>
      </div>
    </div>
  );
};

export default StickBowler;
