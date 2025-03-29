
import React from 'react';
import BallCounter from '@/components/BallCounter';
import { Player } from '@/data/playerData';

interface GameInfoProps {
  currentBall: number;
  opponent: Player | null;
}

const GameInfo: React.FC<GameInfoProps> = ({ currentBall, opponent }) => {
  return (
    <div className="w-full p-4 flex justify-between items-center">
      <div className="glass-card px-4 py-2 rounded-lg">
        <h2 className="text-white font-bold">Facing: {opponent?.name || 'Bowler'}</h2>
        <p className="text-white/70 text-sm">{opponent?.team || 'Team'}</p>
      </div>
      
      <BallCounter 
        currentBall={currentBall} 
        className="glass-card px-3 py-2 rounded-lg"
      />
    </div>
  );
};

export default GameInfo;
