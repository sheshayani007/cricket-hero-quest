
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CricketFieldProps {
  children?: React.ReactNode;
  className?: string;
}

const CricketField: React.FC<CricketFieldProps> = ({ children, className }) => {
  return (
    <motion.div 
      className={cn("cricket-field w-full h-full", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="cricket-pitch"></div>
      {children}
    </motion.div>
  );
};

export default CricketField;
