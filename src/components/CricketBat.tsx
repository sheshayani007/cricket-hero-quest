
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CricketBatProps {
  className?: string;
  onClick?: () => void;
}

const CricketBat: React.FC<CricketBatProps> = ({ className, onClick }) => {
  return (
    <motion.div 
      className={cn("relative cursor-pointer", className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <svg 
        width="60" 
        height="180" 
        viewBox="0 0 60 180" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M30 0L45 20L45 140L40 150L35 155L30 160L25 155L20 150L15 140L15 20L30 0Z" 
          fill="#CD9B6A"
        />
        <path 
          d="M15 140L20 150L25 155L30 160L35 155L40 150L45 140L45 130L15 130L15 140Z" 
          fill="#B37F4A"
        />
        <path 
          d="M15 20L45 20L30 0L15 20Z" 
          fill="#B37F4A"
        />
        <rect 
          x="15" 
          y="20" 
          width="30" 
          height="110" 
          fill="#CD9B6A"
        />
        <rect 
          x="20" 
          y="30" 
          width="20" 
          height="90" 
          fill="#B37F4A"
          fillOpacity="0.3"
        />
      </svg>
    </motion.div>
  );
};

export default CricketBat;
