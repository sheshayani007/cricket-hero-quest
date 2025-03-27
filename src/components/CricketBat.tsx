
import React from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CricketBatProps {
  className?: string;
  onClick?: () => void;
  onDrag?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  dragConstraints?: React.RefObject<HTMLDivElement>;
}

const CricketBat: React.FC<CricketBatProps> = ({ 
  className, 
  onClick, 
  onDrag,
  dragConstraints 
}) => {
  const controls = useDragControls();

  return (
    <motion.div 
      className={cn("relative cursor-grab active:cursor-grabbing", className)}
      drag
      dragControls={controls}
      dragConstraints={dragConstraints}
      dragElastic={0.1}
      dragMomentum={false}
      onDrag={onDrag}
      whileTap={{ scale: 1.1 }}
    >
      <svg 
        width="36" 
        height="72" 
        viewBox="0 0 36 72" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
      >
        {/* Handle */}
        <rect x="14" y="40" width="8" height="32" fill="#8B4513" />
        
        {/* Bat body */}
        <path 
          d="M4 8C4 4 32 4 32 8L32 40H4L4 8Z" 
          fill="#CD9B6A"
        />
        
        {/* Bat edge & details */}
        <path 
          d="M4 8C4 4 32 4 32 8L32 16H4L4 8Z" 
          fill="#B37F4A"
        />
        <rect 
          x="9" 
          y="16" 
          width="18" 
          height="20" 
          fill="#B37F4A"
          fillOpacity="0.3"
        />
        
        {/* Handle grip */}
        <rect x="14" y="40" width="8" height="32" stroke="#333" strokeWidth="0.5" />
        <rect x="14" y="44" width="8" height="2" fill="#333" />
        <rect x="14" y="48" width="8" height="2" fill="#333" />
        <rect x="14" y="52" width="8" height="2" fill="#333" />
        <rect x="14" y="56" width="8" height="2" fill="#333" />
        <rect x="14" y="60" width="8" height="2" fill="#333" />
        <rect x="14" y="64" width="8" height="2" fill="#333" />
      </svg>
    </motion.div>
  );
};

export default CricketBat;
