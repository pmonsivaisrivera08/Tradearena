import { useState, useEffect, useCallback } from 'react';

export interface TradingData {
  user: {
    username: string;
    xp: number;
    level: number;
    rank: string;
    totalTrades: number;
    profitableTrades: number;
    currentBalance: number;
  };
  currentPrice: number;
  priceHistory: { time: number; price: number }[];
  activePosition: {
    type: 'buy' | 'sell' | null;
    entryPrice: number;
    entryTime: number;
  } | null;
  recentTrades: Array<{
    id: string;
    type: 'buy' | 'sell';
    entryPrice: number;
    exitPrice: number;
    profit: number;
    timestamp: number;
  }>;
}

const RANKS = [
  { name: 'Pip Novato I', minXP: 0, maxXP: 200, color: 'rank-bronze' },
  { name: 'Pip Novato II', minXP: 200, maxXP: 400, color: 'rank-bronze' },
  { name: 'Pip Novato III', minXP: 400, maxXP: 600, color: 'rank-bronze' },
  { name: 'Pip Experto I', minXP: 600, maxXP: 900, color: 'rank-silver' },
  { name: 'Pip Experto II', minXP: 900, maxXP: 1200, color: 'rank-silver' },
  { name: 'Pip Experto III', minXP: 1200, maxXP: 1600, color: 'rank-silver' },
  { name: 'Trader Junior I', minXP: 1600, maxXP: 2100, color: 'rank-gold' },
  { name: 'Trader Junior II', minXP: 2100, maxXP: 2700, color: 'rank-gold' },
  { name: 'Trader Junior III', minXP: 2700, maxXP: 3400, color: 'rank-gold' },
  { name: 'Trader Senior I', minXP: 3400, maxXP: 4200, color: 'rank-diamond' },
  { name: 'Trader Senior II', minXP: 4200, maxXP: 5100, color: 'rank-diamond' },
  { name: 'Trader Senior III', minXP: 5100, maxXP: 6100, color: 'rank-diamond' },
  { name: 'Analista I', minXP: 6100, maxXP: 7200, color: 'rank-master' },
  { name: 'Analista II', minXP: 7200, maxXP: 8400, color: 'rank-master' },
  { name: 'Estratega', minXP: 8400, maxXP: 10000, color: 'rank-master' },
  { name: 'Maestro de Mercado', minXP: 10000, maxXP: Infinity, color: 'gold' }
];

const generatePriceHistory = (length: number, basePrice: number) => {
  const history = [];
  let currentPrice = basePrice;
  const now = Date.now();
  
  for (let i = length; i >= 0; i--) {
    const change = (Math.random() - 0.5) * basePrice * 0.02; // 2% max change
    currentPrice += change;
    history.push({
      time: now - (i * 10000), // 10 seconds intervals
      price: Math.max(currentPrice, basePrice * 0.5) // Don't go below 50% of base
    });
  }
  
  return history;
};

export const useTrading = () => {
  const [data, setData] = useState<TradingData>(() => {
    const savedData = localStorage.getItem('tradeArenaX');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        ...parsed,
        priceHistory: generatePriceHistory(50, 50000), // Generate fresh price history
        currentPrice: 50000 + (Math.random() - 0.5) * 10000
      };
    }
    
    return {
      user: {
        username: '',
        xp: 0,
        level: 1,
        rank: 'Pip Novato I',
        totalTrades: 0,
        profitableTrades: 0,
        currentBalance: 10000
      },
      currentPrice: 50000,
      priceHistory: generatePriceHistory(50, 50000),
      activePosition: null,
      recentTrades: []
    };
  });

  const getCurrentRank = useCallback((xp: number) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXP) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  }, []);

  const getNextRank = useCallback((xp: number) => {
    const currentRankIndex = RANKS.findIndex(rank => xp >= rank.minXP && xp < rank.maxXP);
    return currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  }, []);

  // Update price every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const change = (Math.random() - 0.5) * prev.currentPrice * 0.015; // 1.5% max change
        const newPrice = Math.max(prev.currentPrice + change, 1000);
        
        const newPriceHistory = [...prev.priceHistory.slice(1), {
          time: Date.now(),
          price: newPrice
        }];
        
        return {
          ...prev,
          currentPrice: newPrice,
          priceHistory: newPriceHistory
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('tradeArenaX', JSON.stringify({
      ...data,
      priceHistory: [], // Don't save price history, regenerate it
    }));
  }, [data]);

  const setUsername = useCallback((username: string) => {
    setData(prev => ({
      ...prev,
      user: { ...prev.user, username }
    }));
  }, []);

  const openPosition = useCallback((type: 'buy' | 'sell') => {
    if (data.activePosition) return false;
    
    setData(prev => ({
      ...prev,
      activePosition: {
        type,
        entryPrice: prev.currentPrice,
        entryTime: Date.now()
      }
    }));
    return true;
  }, [data.activePosition]);

  const closePosition = useCallback(() => {
    if (!data.activePosition) return null;
    
    const { type, entryPrice } = data.activePosition;
    const exitPrice = data.currentPrice;
    const isProfit = (type === 'buy' && exitPrice > entryPrice) || 
                    (type === 'sell' && exitPrice < entryPrice);
    const profitPercentage = type === 'buy' 
      ? ((exitPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - exitPrice) / entryPrice) * 100;
    
    const baseXP = 25;
    const bonusXP = isProfit ? Math.floor(Math.abs(profitPercentage) * 5) : 0;
    const earnedXP = isProfit ? baseXP + bonusXP : 0;
    
    const trade = {
      id: Date.now().toString(),
      type,
      entryPrice,
      exitPrice,
      profit: profitPercentage,
      timestamp: Date.now()
    };

    setData(prev => {
      const newXP = prev.user.xp + earnedXP;
      const newRank = getCurrentRank(newXP);
      
      return {
        ...prev,
        user: {
          ...prev.user,
          xp: newXP,
          rank: newRank.name,
          totalTrades: prev.user.totalTrades + 1,
          profitableTrades: prev.user.profitableTrades + (isProfit ? 1 : 0),
          currentBalance: prev.user.currentBalance + (profitPercentage * 100)
        },
        activePosition: null,
        recentTrades: [trade, ...prev.recentTrades.slice(0, 9)]
      };
    });

    return { trade, earnedXP, isProfit };
  }, [data.activePosition, data.currentPrice, getCurrentRank]);

  return {
    data,
    setUsername,
    openPosition,
    closePosition,
    getCurrentRank,
    getNextRank,
    RANKS
  };
};