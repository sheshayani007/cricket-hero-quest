
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StickCricketFieldProps {
  children?: React.ReactNode;
  className?: string;
}

const StickCricketField: React.FC<StickCricketFieldProps> = ({ children, className }) => {
  return (
    <motion.div 
      className={cn(
        "relative w-full aspect-[2/1] bg-green-600 overflow-hidden rounded-md",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Pitch */}
      <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-amber-200 border-l border-r border-white/30"></div>
      
      {/* Crease lines */}
      <div className="absolute top-[45%] bottom-[45%] left-[25%] w-[50%] border-t border-b border-white"></div>
      
      {/* Wickets */}
      <div className="absolute top-[40%] left-[30%] h-[20%] w-1 bg-white"></div>
      <div className="absolute top-[40%] left-[31%] h-[20%] w-1 bg-white ml-1"></div>
      <div className="absolute top-[40%] left-[32%] h-[20%] w-1 bg-white ml-1"></div>
      
      <div className="absolute top-[40%] right-[30%] h-[20%] w-1 bg-white"></div>
      <div className="absolute top-[40%] right-[31%] h-[20%] w-1 bg-white mr-1"></div>
      <div className="absolute top-[40%] right-[32%] h-[20%] w-1 bg-white mr-1"></div>
      
      {/* Simple field markings */}
      <div className="absolute top-0 bottom-0 left-[10%] right-[10%] border-2 border-white/20 rounded-full"></div>
      
      {children}
    </motion.div>
  );
};

export default StickCricketField;
