
import React from 'react';

interface BallTrailProps {
  ballPosition: { x: number; y: number };
  visible: boolean;
}

const BallTrail: React.FC<BallTrailProps> = ({ ballPosition, visible }) => {
  if (!visible) return null;
  
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="absolute w-10 h-10 rounded-full bg-red-500/20 blur-md"
           style={{ 
             left: `${ballPosition.x}px`, 
             top: `${ballPosition.y}px`,
             transform: "translate(-50%, -50%)"
           }}
      />
      <div className="absolute w-8 h-8 rounded-full bg-red-500/30 blur-md"
           style={{ 
             left: `${ballPosition.x}px`, 
             top: `${ballPosition.y - 15}px`,
             transform: "translate(-50%, -50%)"
           }}
      />
      <div className="absolute w-6 h-6 rounded-full bg-red-500/40 blur-md"
           style={{ 
             left: `${ballPosition.x}px`, 
             top: `${ballPosition.y - 30}px`,
             transform: "translate(-50%, -50%)"
           }}
      />
    </div>
  );
};

export default BallTrail;
