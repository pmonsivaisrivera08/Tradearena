import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  rank_position: number;
  total_trades: number;
  profitable_trades: number;
  profit_percentage: number;
  total_xp: number;
  balance_growth: number;
  profiles?: {
    username: string;
  };
}

interface LeaderboardProps {
  period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export const Leaderboard = ({ period = 'all_time' }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      // Si es all_time, usamos user_stats directamente para tener datos
      if (period === 'all_time') {
        const { data, error } = await supabase
          .from('user_stats')
          .select(`
            user_id,
            total_trades,
            profitable_trades,
            xp,
            current_balance
          `)
          .gt('total_trades', 0)
          .order('xp', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedData = data?.map((entry, index) => ({
          user_id: entry.user_id,
          rank_position: index + 1,
          total_trades: entry.total_trades,
          profitable_trades: entry.profitable_trades,
          profit_percentage: entry.total_trades > 0 
            ? (entry.profitable_trades / entry.total_trades) * 100 
            : 0,
          total_xp: entry.xp,
          balance_growth: entry.current_balance - 10000,
          profiles: { username: `Usuario ${index + 1}` }
        })) || [];

        setEntries(formattedData);
      } else {
        // Para otros períodos, mostrar datos vacíos por ahora
        setEntries([]);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-bold">#{position}</span>;
    }
  };

  const getRankColors = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'bg-card/50 border-border hover:border-primary/30';
    }
  };

  const getPeriodTitle = () => {
    switch (period) {
      case 'daily':
        return 'RANKING DIARIO';
      case 'weekly':
        return 'RANKING SEMANAL';
      case 'monthly':
        return 'RANKING MENSUAL';
      default:
        return 'RANKING GLOBAL';
    }
  };

  if (loading) {
    return (
      <div className="hud-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-audiowide">
          {getPeriodTitle()}
        </h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="hud-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-audiowide">
          {getPeriodTitle()}
        </h3>
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No hay datos de ranking disponibles
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ¡Sé el primero en aparecer aquí!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hud-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary font-audiowide">
          {getPeriodTitle()}
        </h3>
        <Trophy className="w-6 h-6 text-accent" />
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.user_id}
            className={`p-4 rounded-lg border transition-all duration-200 ${getRankColors(entry.rank_position)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank_position)}
                </div>
                
                <div>
                  <p className="font-bold text-foreground">
                    {entry.profiles?.username || 'Usuario Anónimo'}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{entry.total_trades} trades</span>
                    <span>{entry.profit_percentage.toFixed(1)}% éxito</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-accent font-bold">
                    {entry.total_xp.toLocaleString()} XP
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-profit" />
                  <span className={`${entry.balance_growth >= 0 ? 'text-profit' : 'text-loss'}`}>
                    ${entry.balance_growth.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Actualizado en tiempo real
        </p>
      </div>
    </div>
  );
};