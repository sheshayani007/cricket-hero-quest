
export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'batsman' | 'bowler' | 'all-rounder';
  image?: string; // URL to player image
  battingStats?: BattingStats;
  bowlingStats?: BowlingStats;
  funFacts: string[];
}

export interface BattingStats {
  averageSpeed: number; // in km/h
  reactionTime: number; // in milliseconds
  strongAgainst: ('pace' | 'spin' | 'both')[]; 
  weakAgainst: ('pace' | 'spin' | 'both')[];
  style: string; // aggressive, defensive, etc.
}

export interface BowlingStats {
  averageSpeed: number; // in km/h
  type: 'pace' | 'spin'; 
  variation: string; // yorker, googly, etc.
  accuracy: number; // 0-100
  style: string; // aggressive, defensive, etc.
}

// Mock data - to be replaced with real IPL data
export const BATSMEN: Player[] = [
  {
    id: 'vk-18',
    name: 'Virat Kohli',
    team: 'RCB',
    role: 'batsman',
    battingStats: {
      averageSpeed: 145,
      reactionTime: 180,
      strongAgainst: ['pace'],
      weakAgainst: ['spin'],
      style: 'Aggressive'
    },
    funFacts: [
      "Known as the 'King' of cricket",
      "Has scored the most IPL centuries",
      "Famous for his cover drive"
    ]
  },
  {
    id: 'rg-45',
    name: 'Rohit Sharma',
    team: 'MI',
    role: 'batsman',
    battingStats: {
      averageSpeed: 140,
      reactionTime: 190,
      strongAgainst: ['spin'],
      weakAgainst: ['pace'],
      style: 'Elegant'
    },
    funFacts: [
      "Called the 'Hitman' for his explosive batting",
      "Holds the record for highest individual ODI score",
      "Known for his pull shots"
    ]
  },
  {
    id: 'kl-1',
    name: 'KL Rahul',
    team: 'LSG',
    role: 'batsman',
    battingStats: {
      averageSpeed: 138,
      reactionTime: 185,
      strongAgainst: ['both'],
      weakAgainst: [],
      style: 'Technical'
    },
    funFacts: [
      "One of the most consistent IPL batsmen",
      "Known for his classical batting technique",
      "Great wicketkeeper-batsman"
    ]
  }
];

export const BOWLERS: Player[] = [
  {
    id: 'jb-93',
    name: 'Jasprit Bumrah',
    team: 'MI',
    role: 'bowler',
    bowlingStats: {
      averageSpeed: 145,
      type: 'pace',
      variation: 'Yorker',
      accuracy: 90,
      style: 'Unorthodox'
    },
    funFacts: [
      "Has a unique bowling action",
      "Best death bowler in IPL",
      "Known for pin-point yorkers"
    ]
  },
  {
    id: 'rk-8',
    name: 'Rashid Khan',
    team: 'GT',
    role: 'bowler',
    bowlingStats: {
      averageSpeed: 90,
      type: 'spin',
      variation: 'Googly',
      accuracy: 95,
      style: 'Attacking'
    },
    funFacts: [
      "Best T20 spinner in the world",
      "Batsmen struggle to read his variations",
      "Can bat explosively in the lower order"
    ]
  },
  {
    id: 'yc-90',
    name: 'Yuzvendra Chahal',
    team: 'RR',
    role: 'bowler',
    bowlingStats: {
      averageSpeed: 85,
      type: 'spin',
      variation: 'Leg Break',
      accuracy: 88,
      style: 'Crafty'
    },
    funFacts: [
      "IPL's highest wicket-taker among spinners",
      "Former chess player",
      "Known for his celebrations"
    ]
  }
];

// Function to get random players based on difficulty
export const getRandomPlayers = (
  role: 'batsman' | 'bowler',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 1
): Player[] => {
  const players = role === 'batsman' ? BATSMEN : BOWLERS;
  
  // For demo purposes, let's use a simple mapping
  // In a real app, you'd have more sophisticated selection logic
  const difficultyMapping = {
    'easy': players.slice(0, 1),
    'medium': players.slice(1, 2),
    'hard': players.slice(2)
  };
  
  const pool = difficultyMapping[difficulty];
  
  // If we need multiple players, randomly select from the pool
  if (count > 1) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, pool.length));
  }
  
  // Return a single random player
  return [pool[Math.floor(Math.random() * pool.length)]];
};

// Function to find player match based on performance
export const findMatchingPlayer = (
  role: 'batsman' | 'bowler',
  metrics: { speed: number; accuracy: number; reactionTime?: number }
): Player => {
  const players = role === 'batsman' ? BATSMEN : BOWLERS;
  
  // Dummy matching logic - in a real app this would be more sophisticated
  // Based on similarity of metrics
  return players[Math.floor(Math.random() * players.length)];
};
