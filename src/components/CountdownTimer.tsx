
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  duration: number;
  onComplete?: () => void;
  className?: string;
  autoStart?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  duration, 
  onComplete,
  className,
  autoStart = true
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning) return;
    
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isRunning, onComplete]);

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(autoStart);
  }, [duration, autoStart]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => setTimeLeft(duration);

  return (
    <motion.div 
      className={cn(
        "glass-card flex items-center gap-2 px-3 py-2 rounded-full",
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Clock className="h-4 w-4 text-white/80" />
      <span className="text-white font-medium">{timeLeft}s</span>
    </motion.div>
  );
};

export default CountdownTimer;
