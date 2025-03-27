
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
      whileTap={{ scale: 0.95, rotate: 15 }}
      onClick={onClick}
    >
      <svg 
        width="40" 
        height="90" 
        viewBox="0 0 40 90" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Handle */}
        <rect x="15" y="50" width="10" height="40" fill="#8B4513" />
        
        {/* Bat body */}
        <path 
          d="M5 10C5 4.5 35 4.5 35 10L35 50H5L5 10Z" 
          fill="#CD9B6A"
        />
        
        {/* Bat edge & details */}
        <path 
          d="M5 10C5 4.5 35 4.5 35 10L35 20H5L5 10Z" 
          fill="#B37F4A"
        />
        <rect 
          x="10" 
          y="20" 
          width="20" 
          height="25" 
          fill="#B37F4A"
          fillOpacity="0.3"
        />
        
        {/* Handle grip */}
        <rect x="15" y="50" width="10" height="40" stroke="#333" strokeWidth="0.5" />
        <rect x="15" y="55" width="10" height="2" fill="#333" />
        <rect x="15" y="60" width="10" height="2" fill="#333" />
        <rect x="15" y="65" width="10" height="2" fill="#333" />
        <rect x="15" y="70" width="10" height="2" fill="#333" />
        <rect x="15" y="75" width="10" height="2" fill="#333" />
        <rect x="15" y="80" width="10" height="2" fill="#333" />
      </svg>
    </motion.div>
  );
};

export default CricketBat;
