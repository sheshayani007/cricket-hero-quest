
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
      className={cn(
        "cricket-field w-full aspect-square rounded-full relative overflow-hidden",
        "bg-gradient-to-b from-green-600 via-green-500 to-green-700", 
        className
      )}
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
      
      {/* Realistic Field Mowing Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.05)_40px,rgba(255,255,255,0.05)_80px)]"></div>
      </div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
      </div>
      
      {/* Wickets */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 h-8 w-6 bg-white/80 shadow-md"></div>
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 h-8 w-6 bg-white/80 shadow-md"></div>
      
      {/* Cricket pitch - more realistic */}
      <div className="absolute top-[10%] bottom-[10%] left-1/2 -translate-x-1/2 w-[15%] bg-gradient-to-b from-amber-100 via-amber-200 to-amber-100"></div>
      <div className="absolute top-[10%] bottom-[10%] left-1/2 -translate-x-1/2 w-[15%] opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]"></div>
      
      {/* Creases */}
      <div className="absolute top-[calc(10%+10px)] left-1/2 -translate-x-1/2 w-[25%] h-[2px] bg-white/70"></div>
      <div className="absolute bottom-[calc(10%+10px)] left-1/2 -translate-x-1/2 w-[25%] h-[2px] bg-white/70"></div>
      
      {children}
    </motion.div>
  );
};

export default CricketField;
