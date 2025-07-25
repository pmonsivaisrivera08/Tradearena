import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Star, Trophy, Lock, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  icon: string;
  is_earned?: boolean;
  earned_at?: string;
}

interface AchievementsListProps {
  category?: string | null;
}

export const AchievementsList = ({ category = null }: AchievementsListProps) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [user, category]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      // Obtener todos los logros
      let query = supabase.from('achievements').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data: allAchievements, error: achievementsError } = await query.order('requirement_value', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Obtener logros del usuario
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user.id);

      if (userError) throw userError;

      // Combinar datos
      const userAchievementIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      const userAchievementMap = new Map(
        userAchievements?.map(ua => [ua.achievement_id, ua.earned_at]) || []
      );

      const combinedAchievements = allAchievements?.map(achievement => ({
        ...achievement,
        is_earned: userAchievementIds.has(achievement.id),
        earned_at: userAchievementMap.get(achievement.id)
      })) || [];

      setAchievements(combinedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trading':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'profit':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'balance':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'consistency':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'special':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'missions':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'ranking':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-muted-foreground bg-muted/10 border-muted/30';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'trading':
        return 'Trading';
      case 'profit':
        return 'Rentabilidad';
      case 'balance':
        return 'Balance';
      case 'consistency':
        return 'Consistencia';
      case 'special':
        return 'Especiales';
      case 'missions':
        return 'Misiones';
      case 'ranking':
        return 'Ranking';
      default:
        return 'General';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No hay logros disponibles en esta categoría
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`p-4 rounded-lg border transition-all duration-200 ${
            achievement.is_earned
              ? 'bg-profit/10 border-profit/30 hover:bg-profit/15'
              : 'bg-card/50 border-border hover:border-primary/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                achievement.is_earned ? 'bg-profit/20' : 'bg-muted/20'
              }`}>
                {achievement.is_earned ? achievement.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-bold ${
                    achievement.is_earned ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {achievement.name}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(achievement.category)}`}>
                    {getCategoryName(achievement.category)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {achievement.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-accent" />
                    <span className="text-accent font-bold">
                      +{achievement.xp_reward} XP
                    </span>
                  </div>
                  
                  {achievement.is_earned && achievement.earned_at && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-profit" />
                      <span className="text-profit">
                        Obtenido {new Date(achievement.earned_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {achievement.is_earned && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-profit/20">
                <Trophy className="w-5 h-5 text-profit" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};