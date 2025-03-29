
import React from 'react';
import { motion } from 'framer-motion';

interface GameStartCountdownProps {
  countdown: number;
  gameStarted: boolean;
}

const GameStartCountdown: React.FC<GameStartCountdownProps> = ({ countdown, gameStarted }) => {
  if (gameStarted) return null;
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <motion.div 
        className="text-6xl font-bold text-white"
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        key={countdown}
      >
        {countdown > 0 ? countdown : "Play!"}
      </motion.div>
    </div>
  );
};

export default GameStartCountdown;
