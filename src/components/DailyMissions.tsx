import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Target, CheckCircle, Calendar, XCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Mission {
  id: string;
  mission_type: string;
  description: string;
  target_value: number;
  current_progress: number;
  xp_reward: number;
  is_completed: boolean;
  mission_date: string;
}

export const DailyMissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDailyMissions();
      generateMissionsIfNeeded();
    }
  }, [user]);

  const generateMissionsIfNeeded = async () => {
    if (!user) return;

    try {
      // Llamada a función SQL comentada temporalmente
      // const { error } = await supabase.rpc('generate_daily_missions', {
      //   _user_id: user.id
      // });

      // if (error) {
      //   console.error('Error generating missions:', error);
      // }
    } catch (error) {
      console.error('Error generating missions:', error);
    }
  };

  const loadDailyMissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('mission_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setMissions(data || []);
    } catch (error) {
      console.error('Error loading missions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las misiones diarias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getMissionIcon = (missionType: string) => {
    switch (missionType) {
      case 'complete_trades':
      case 'profit_trades':
        return Target;
      case 'volume_trading':
        return Zap;
      case 'win_streak':
        return CheckCircle;
      case 'early_bird':
        return Calendar;
      default:
        return Target;
    }
  };

  if (loading) {
    return (
      <div className="hud-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-audiowide">
          MISIONES DIARIAS
        </h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="hud-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-audiowide">
          MISIONES DIARIAS
        </h3>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No hay misiones disponibles hoy
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Las misiones se generan automáticamente cada día
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hud-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary font-audiowide">
          MISIONES DIARIAS
        </h3>
        <div className="text-xs text-muted-foreground">
          {missions.filter(m => m.is_completed).length}/{missions.length} completadas
        </div>
      </div>

      <div className="space-y-3">
        {missions.map((mission) => {
          const IconComponent = getMissionIcon(mission.mission_type);
          const progress = getProgressPercentage(mission.current_progress, mission.target_value);
          
          return (
            <div
              key={mission.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                mission.is_completed
                  ? 'bg-profit/10 border-profit/30'
                  : 'bg-card/50 border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {mission.is_completed ? (
                    <CheckCircle className="w-5 h-5 text-profit mr-3" />
                  ) : (
                    <IconComponent className="w-5 h-5 text-primary mr-3" />
                  )}
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {mission.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mission.current_progress}/{mission.target_value}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-accent font-bold">
                    +{mission.xp_reward} XP
                  </span>
                  {mission.is_completed && (
                    <CheckCircle className="w-4 h-4 text-profit" />
                  )}
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-muted/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    mission.is_completed
                      ? 'bg-profit'
                      : 'bg-gradient-to-r from-primary to-accent'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {missions.every(m => m.is_completed) && (
        <div className="mt-4 p-3 bg-profit/10 border border-profit/30 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-profit" />
            <span className="text-profit font-bold">
              ¡Todas las misiones completadas!
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Vuelve mañana para nuevos desafíos
          </p>
        </div>
      )}
    </div>
  );
};