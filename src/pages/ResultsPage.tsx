
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Trophy, ArrowLeft, Share2 } from 'lucide-react';
import { findMatchingPlayer, Player } from '@/data/playerData';
import { toast } from 'sonner';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameMode = 'batting' } = useParams<{ gameMode: 'batting' | 'bowling' }>();
  const [matchingPlayer, setMatchingPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract data from location state
  const state = location.state as any;
  const difficulty = state?.difficulty || 'medium';
  const opponent = state?.opponent;
  const scores = state?.scores || [];
  const performances = state?.performances || [];
  
  // Calculate average stats
  const averageScore = scores.length 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : 0;
  
  const averageSpeed = performances.length 
    ? performances.reduce((a, b) => a + b.speed, 0) / performances.length 
    : 0;
  
  const averageAccuracy = performances.length 
    ? performances.reduce((a, b) => a + b.accuracy, 0) / performances.length 
    : 0;
  
  useEffect(() => {
    // Simulate loading time for results calculation
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      // Find matching player based on performance
      const player = findMatchingPlayer(
        gameMode === 'batting' ? 'batsman' : 'bowler',
        {
          speed: gameMode === 'batting' ? 0 : averageSpeed,
          accuracy: averageAccuracy,
          reactionTime: gameMode === 'batting' ? Math.random() * 200 + 150 : undefined
        }
      );
      
      setMatchingPlayer(player);
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [gameMode, averageSpeed, averageAccuracy]);
  
  const handleShare = () => {
    if (navigator.share && matchingPlayer) {
      navigator.share({
        title: 'My IPL Player Match',
        text: `I'm most like ${matchingPlayer.name} from ${matchingPlayer.team}! Find out which IPL player you are!`,
        url: window.location.href,
      }).catch(() => {
        toast.success("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };
  
  const handlePlayAgain = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center relative bg-gradient-to-b from-ipl-blue via-ipl-purple to-black p-4">
      {/* Back button */}
      <button 
        onClick={handlePlayAgain}
        className="absolute top-4 left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      
      {/* Header */}
      <motion.div 
        className="text-center mt-16 mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex justify-center items-center mb-4">
          <Trophy className="h-10 w-10 text-yellow-400 animate-pulse-subtle" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Your Results
        </h1>
        <p className="text-white/70">
          {gameMode === 'batting' 
            ? "Based on your batting performance" 
            : "Based on your bowling performance"}
        </p>
      </motion.div>
      
      {/* Results content */}
      {isLoading ? (
        <div className="glass-card p-8 rounded-2xl w-full max-w-md flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-ipl-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">Analyzing your performance...</p>
        </div>
      ) : (
        <motion.div 
          className="glass-card p-6 rounded-2xl w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Player match */}
          <div className="text-center mb-6">
            <p className="text-white/70 text-sm uppercase tracking-wider mb-2">
              You play like
            </p>
            <h2 className="text-2xl font-bold text-white mb-1">
              {matchingPlayer?.name || "Unknown Player"}
            </h2>
            <p className="inline-block px-3 py-1 bg-white/10 rounded-full text-white/90 text-sm">
              {matchingPlayer?.team || "Team Unknown"}
            </p>
          </div>
          
          {/* Stats */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-white/80 text-sm font-medium mb-3">Your Performance</h3>
            
            {gameMode === 'batting' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-xs">Avg. Score</p>
                  <p className="text-white text-xl font-bold">{averageScore.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">Faced</p>
                  <p className="text-white text-xl font-bold">{scores.length} balls</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-white/60 text-xs">Avg. Speed</p>
                  <p className="text-white text-xl font-bold">{averageSpeed.toFixed(1)} km/h</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">Accuracy</p>
                  <p className="text-white text-xl font-bold">{averageAccuracy.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Fun facts */}
          <div className="mb-6">
            <h3 className="text-white/80 text-sm font-medium mb-3">Player Facts</h3>
            <ul className="space-y-2">
              {matchingPlayer?.funFacts.map((fact, index) => (
                <motion.li 
                  key={index}
                  className="text-white/90 text-sm flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <span className="inline-block h-5 w-5 rounded-full bg-ipl-blue/20 text-ipl-blue flex-shrink-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {fact}
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePlayAgain}
              className="flex-1 py-3 px-4 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Play Again
            </button>
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-lg bg-ipl-blue text-white hover:bg-ipl-lightblue transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResultsPage;
