
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
      className={cn("cricket-field w-full aspect-square rounded-full relative", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Field circles */}
      <div className="absolute inset-0 rounded-full border-[12px] border-ipl-orange/20"></div>
      <div className="absolute inset-[10%] rounded-full border-[8px] border-white/10"></div>
      <div className="absolute inset-[20%] rounded-full border-[4px] border-white/5"></div>
      
      {/* Field patterns */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_transparent_30%,_#43A047_70%)]"></div>
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.03)_20px,rgba(255,255,255,0.03)_40px)]"></div>
      </div>
      
      {/* Wickets */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 h-8 w-6 bg-white/70"></div>
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 h-8 w-6 bg-white/70"></div>
      
      {/* Cricket pitch */}
      <div className="cricket-pitch"></div>
      
      {children}
    </motion.div>
  );
};

export default CricketField;
