
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BallCounterProps {
  totalBalls?: number;
  currentBall: number;
  className?: string;
}

const BallCounter: React.FC<BallCounterProps> = ({ 
  totalBalls = 6, 
  currentBall,
  className
}) => {
  return (
    <div className={cn("flex space-x-2", className)}>
      {Array.from({ length: totalBalls }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            "ball-counter",
            index < currentBall && "active"
          )}
          initial={index === currentBall - 1 ? { scale: 0.8 } : {}}
          animate={index === currentBall - 1 ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        />
      ))}
    </div>
  );
};

export default BallCounter;
