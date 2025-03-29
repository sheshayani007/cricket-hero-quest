
import React from 'react';
import { motion } from 'framer-motion';

interface BallTimerProps {
  ballTimer: number;
  showTimer: boolean;
}

const BallTimer: React.FC<BallTimerProps> = ({ ballTimer, showTimer }) => {
  if (!showTimer) return null;
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <motion.div 
        className="text-4xl font-bold text-white"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
      >
        {ballTimer}
      </motion.div>
    </div>
  );
};

export default BallTimer;
