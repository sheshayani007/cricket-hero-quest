
import React from 'react';

interface ScoreDisplayProps {
  scores: number[];
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ scores }) => {
  return (
    <div className="w-full p-4 glass-card mt-4 rounded-lg">
      <h3 className="text-white text-center font-bold mb-2">Current Over</h3>
      <div className="flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              i < scores.length 
                ? 'bg-ipl-blue text-white'
                : 'bg-white/20 text-white/50'
            }`}
          >
            {i < scores.length ? scores[i] : '-'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreDisplay;
