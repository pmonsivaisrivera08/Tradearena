import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DatabaseTradingData {
  user: {
    id: string;
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
    const change = (Math.random() - 0.5) * basePrice * 0.02;
    currentPrice += change;
    history.push({
      time: now - (i * 10000),
      price: Math.max(currentPrice, basePrice * 0.5)
    });
  }
  
  return history;
};

export const useTradingDatabase = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DatabaseTradingData>(() => ({
    user: {
      id: '',
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
  }));

  const [loading, setLoading] = useState(true);

  // Load user data from database
  const loadUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Load user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Load recent trades
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', false)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load active position
      const { data: activePosition } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profile && userStats) {
        setData(prev => ({
          ...prev,
          user: {
            id: user.id,
            username: profile.username,
            xp: userStats.xp,
            level: userStats.level,
            rank: userStats.rank,
            totalTrades: userStats.total_trades,
            profitableTrades: userStats.profitable_trades,
            currentBalance: parseFloat(userStats.current_balance.toString())
          },
          activePosition: activePosition ? {
            type: activePosition.type as 'buy' | 'sell',
            entryPrice: parseFloat(activePosition.entry_price.toString()),
            entryTime: new Date(activePosition.entry_time).getTime()
          } : null,
          recentTrades: trades?.map(trade => ({
            id: trade.id,
            type: trade.type as 'buy' | 'sell',
            entryPrice: parseFloat(trade.entry_price.toString()),
            exitPrice: parseFloat(trade.exit_price?.toString() || '0'),
            profit: parseFloat(trade.profit_percentage?.toString() || '0'),
            timestamp: new Date(trade.created_at).getTime()
          })) || []
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update price every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const change = (Math.random() - 0.5) * prev.currentPrice * 0.015;
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

  // Load data when user changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

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

  const openPosition = useCallback(async (type: 'buy' | 'sell') => {
    if (!user || data.activePosition) return false;
    
    try {
      const { error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          type,
          entry_price: data.currentPrice,
          symbol: 'BTC-USD'
        });

      if (error) throw error;

      setData(prev => ({
        ...prev,
        activePosition: {
          type,
          entryPrice: prev.currentPrice,
          entryTime: Date.now()
        }
      }));

      return true;
    } catch (error) {
      console.error('Error opening position:', error);
      return false;
    }
  }, [user, data.activePosition, data.currentPrice]);

  const closePosition = useCallback(async () => {
    if (!user || !data.activePosition) return null;
    
    try {
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

      // Update the trade in database
      const { data: activeTrade } = await supabase
        .from('trades')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (activeTrade) {
        await supabase
          .from('trades')
          .update({
            exit_price: exitPrice,
            profit_percentage: profitPercentage,
            exit_time: new Date().toISOString(),
            is_active: false
          })
          .eq('id', activeTrade.id);
      }

      // Update user stats
      const newXP = data.user.xp + earnedXP;
      const newRank = getCurrentRank(newXP);
      const newTotalTrades = data.user.totalTrades + 1;
      const newProfitableTrades = data.user.profitableTrades + (isProfit ? 1 : 0);
      const newBalance = data.user.currentBalance + (profitPercentage * 100);

      await supabase
        .from('user_stats')
        .update({
          xp: newXP,
          rank: newRank.name,
          total_trades: newTotalTrades,
          profitable_trades: newProfitableTrades,
          current_balance: newBalance
        })
        .eq('user_id', user.id);

      const trade = {
        id: Date.now().toString(),
        type,
        entryPrice,
        exitPrice,
        profit: profitPercentage,
        timestamp: Date.now()
      };

      setData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          xp: newXP,
          rank: newRank.name,
          totalTrades: newTotalTrades,
          profitableTrades: newProfitableTrades,
          currentBalance: newBalance
        },
        activePosition: null,
        recentTrades: [trade, ...prev.recentTrades.slice(0, 9)]
      }));

      return { trade, earnedXP, isProfit };
    } catch (error) {
      console.error('Error closing position:', error);
      return null;
    }
  }, [user, data.activePosition, data.currentPrice, data.user, getCurrentRank]);

  return {
    data,
    loading,
    openPosition,
    closePosition,
    getCurrentRank,
    getNextRank,
    RANKS,
    refreshData: loadUserData
  };
};