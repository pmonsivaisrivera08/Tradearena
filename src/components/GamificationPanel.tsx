import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyMissions } from './DailyMissions';
import { AchievementsList } from './AchievementsList';
import { Leaderboard } from './Leaderboard';
import { Trophy, Target, Crown, Star, Zap, Flame, Shield, Calendar } from 'lucide-react';

const achievementCategories = [
  { id: null, name: 'Todos', icon: Star },
  { id: 'trading', name: 'Trading', icon: Zap },
  { id: 'profit', name: 'Rentabilidad', icon: Trophy },
  { id: 'balance', name: 'Balance', icon: Crown },
  { id: 'consistency', name: 'Consistencia', icon: Calendar },
  { id: 'special', name: 'Especiales', icon: Flame },
  { id: 'missions', name: 'Misiones', icon: Target },
  { id: 'ranking', name: 'Ranking', icon: Shield }
];

const leaderboardPeriods = [
  { id: 'all_time', name: 'Global' },
  { id: 'monthly', name: 'Mensual' },
  { id: 'weekly', name: 'Semanal' },
  { id: 'daily', name: 'Diario' }
];

export const GamificationPanel = () => {
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState<string | null>(null);
  const [selectedLeaderboardPeriod, setSelectedLeaderboardPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');

  return (
    <div className="hud-border rounded-xl p-6">
      <h2 className="text-xl font-bold text-primary mb-6 font-audiowide">
        PANEL DE GAMIFICACIÓN
      </h2>

      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="missions" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Misiones</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Logros</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>Rankings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-4">
          <DailyMissions />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {/* Filtros de categorías de logros */}
          <div className="flex flex-wrap gap-2 mb-4">
            {achievementCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id || 'all'}
                  onClick={() => setSelectedAchievementCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                    selectedAchievementCategory === category.id
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-card/50 border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>

          <div className="max-h-96 overflow-y-auto">
            <AchievementsList category={selectedAchievementCategory} />
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          {/* Filtros de período del leaderboard */}
          <div className="flex flex-wrap gap-2 mb-4">
            {leaderboardPeriods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedLeaderboardPeriod(period.id as any)}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                  selectedLeaderboardPeriod === period.id
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-card/50 border-border hover:border-accent/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-sm font-medium">{period.name}</span>
              </button>
            ))}
          </div>

          <Leaderboard period={selectedLeaderboardPeriod} />
        </TabsContent>
      </Tabs>
    </div>
  );
};