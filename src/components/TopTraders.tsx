import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UserPlus, 
  UserMinus, 
  Users, 
  TrendingUp, 
  Award,
  Crown,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TopTrader {
  user_id: string;
  username: string;
  total_trades: number;
  profitable_trades: number;
  profit_percentage: number;
  followers_count: number;
  xp: number;
  rank: string;
  isFollowing: boolean;
}

export const TopTraders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [traders, setTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTopTraders();
    }
  }, [user]);

  const loadTopTraders = async () => {
    try {
      // Obtener top traders desde user_stats
      const { data: topTradersData, error: tradersError } = await supabase
        .from('user_stats')
        .select('*')
        .gt('total_trades', 0)
        .order('xp', { ascending: false })
        .limit(10);

      if (tradersError) throw tradersError;

      // Obtener seguimientos del usuario actual
      const { data: followsData, error: followsError } = await supabase
        .from('trader_follows')
        .select('followed_id')
        .eq('follower_id', user?.id);

      if (followsError) throw followsError;

      const followedIds = new Set(followsData?.map(f => f.followed_id) || []);

      // Obtener datos sociales
      const { data: socialData, error: socialError } = await supabase
        .from('social_rankings')
        .select('user_id, followers_count');

      if (socialError) throw socialError;

      const socialMap = new Map(socialData?.map(s => [s.user_id, s.followers_count]) || []);

      // Combinar datos
      const tradersWithSocial = topTradersData?.map((trader, index) => ({
        user_id: trader.user_id,
        username: `TopTrader ${index + 1}`,
        total_trades: trader.total_trades,
        profitable_trades: trader.profitable_trades,
        profit_percentage: trader.total_trades > 0 
          ? (trader.profitable_trades / trader.total_trades) * 100 
          : 0,
        followers_count: socialMap.get(trader.user_id) || 0,
        xp: trader.xp,
        rank: trader.rank,
        isFollowing: followedIds.has(trader.user_id)
      })) || [];

      setTraders(tradersWithSocial);
    } catch (error) {
      console.error('Error loading top traders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los traders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (traderId: string, isCurrentlyFollowing: boolean) => {
    if (!user || traderId === user.id) return;

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('trader_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', traderId);

        if (error) throw error;

        toast({
          title: "Dejaste de seguir",
          description: "Ya no sigues a este trader",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('trader_follows')
          .insert({
            follower_id: user.id,
            followed_id: traderId
          });

        if (error) throw error;

        toast({
          title: "Siguiendo",
          description: "Ahora sigues a este trader",
        });
      }

      // Actualizar estado local
      setTraders(prev => prev.map(trader => 
        trader.user_id === traderId 
          ? { 
              ...trader, 
              isFollowing: !isCurrentlyFollowing,
              followers_count: trader.followers_count + (isCurrentlyFollowing ? -1 : 1)
            }
          : trader
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el seguimiento",
        variant: "destructive"
      });
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Award className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Star className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankColors = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 2:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'bg-card/50 border-border hover:border-primary/30';
    }
  };

  return (
    <Card className="hud-border">
      <CardHeader>
        <CardTitle className="text-lg font-audiowide text-primary flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          TOP TRADERS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : traders.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay traders disponibles
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {traders.map((trader, index) => (
                <div
                  key={trader.user_id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${getRankColors(index)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index)}
                      </div>
                      
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {trader.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-foreground">
                            {trader.username}
                          </p>
                          {index < 3 && (
                            <Badge variant="outline" className="text-xs">
                              TOP {index + 1}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span>{trader.total_trades} trades</span>
                          <span className="text-profit">
                            {trader.profit_percentage.toFixed(1)}% éxito
                          </span>
                          <span>{trader.followers_count} seguidores</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-accent font-bold text-sm">
                          {trader.xp.toLocaleString()} XP
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trader.rank}
                        </div>
                      </div>
                      
                      {trader.user_id !== user?.id && (
                        <Button
                          size="sm"
                          variant={trader.isFollowing ? "outline" : "default"}
                          onClick={() => toggleFollow(trader.user_id, trader.isFollowing)}
                          className="shrink-0"
                        >
                          {trader.isFollowing ? (
                            <>
                              <UserMinus className="w-3 h-3 mr-1" />
                              Dejar
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 mr-1" />
                              Seguir
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};