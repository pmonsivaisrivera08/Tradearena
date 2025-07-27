import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Share2, 
  Heart, 
  Eye, 
  Plus, 
  BookOpen,
  TrendingUp,
  Settings,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Strategy {
  id: string;
  user_id: string;
  title: string;
  description: string;
  strategy_data: any;
  tags: string[];
  is_public: boolean;
  likes_count: number;
  views_count: number;
  created_at: string;
  profiles?: {
    username: string;
  };
  isLiked?: boolean;
}

interface StrategyFormData {
  title: string;
  description: string;
  tags: string;
  is_public: boolean;
  strategy_data: {
    indicators: string[];
    timeframe: string;
    risk_level: string;
    entry_conditions: string;
    exit_conditions: string;
  };
}

export const StrategySharing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<StrategyFormData>({
    title: '',
    description: '',
    tags: '',
    is_public: true,
    strategy_data: {
      indicators: [],
      timeframe: '1h',
      risk_level: 'medium',
      entry_conditions: '',
      exit_conditions: ''
    }
  });

  useEffect(() => {
    if (user) {
      loadStrategies();
    }
  }, [user]);

  const loadStrategies = async () => {
    try {
      const { data: strategiesData, error } = await supabase
        .from('trading_strategies')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Obtener likes del usuario
      const { data: likesData, error: likesError } = await supabase
        .from('strategy_likes')
        .select('strategy_id')
        .eq('user_id', user?.id);

      if (likesError) throw likesError;

      const likedIds = new Set(likesData?.map(l => l.strategy_id) || []);

      const strategiesWithLikes = strategiesData?.map(strategy => ({
        ...strategy,
        profiles: { username: `Trader ${strategy.user_id.slice(-4)}` },
        isLiked: likedIds.has(strategy.id)
      })) || [];

      setStrategies(strategiesWithLikes);
    } catch (error) {
      console.error('Error loading strategies:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estrategias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createStrategy = async () => {
    if (!user || !formData.title.trim()) return;

    try {
      const { error } = await supabase
        .from('trading_strategies')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          is_public: formData.is_public,
          strategy_data: formData.strategy_data
        });

      if (error) throw error;

      toast({
        title: "Estrategia creada",
        description: `Tu estrategia "${formData.title}" ha sido ${formData.is_public ? 'publicada' : 'guardada'}`,
      });

      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        tags: '',
        is_public: true,
        strategy_data: {
          indicators: [],
          timeframe: '1h',
          risk_level: 'medium',
          entry_conditions: '',
          exit_conditions: ''
        }
      });

      loadStrategies();
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la estrategia",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (strategyId: string, isCurrentlyLiked: boolean) => {
    if (!user) return;

    try {
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from('strategy_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('strategy_id', strategyId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('strategy_likes')
          .insert({
            user_id: user.id,
            strategy_id: strategyId
          });

        if (error) throw error;
      }

      // Actualizar estado local
      setStrategies(prev => prev.map(strategy => 
        strategy.id === strategyId 
          ? { 
              ...strategy, 
              isLiked: !isCurrentlyLiked,
              likes_count: strategy.likes_count + (isCurrentlyLiked ? -1 : 1)
            }
          : strategy
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el like",
        variant: "destructive"
      });
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-profit bg-profit/10 border-profit/30';
      case 'high':
        return 'text-loss bg-loss/10 border-loss/30';
      default:
        return 'text-accent bg-accent/10 border-accent/30';
    }
  };

  return (
    <Card className="hud-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-audiowide text-primary flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            ESTRATEGIAS
          </CardTitle>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Crear</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nueva Estrategia</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Nombre de tu estrategia"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu estrategia..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (separados por comas)</Label>
                  <Input
                    id="tags"
                    placeholder="RSI, MACD, Scalping..."
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <select
                      id="timeframe"
                      className="w-full p-2 border rounded-md bg-background"
                      value={formData.strategy_data.timeframe}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        strategy_data: { ...prev.strategy_data, timeframe: e.target.value }
                      }))}
                    >
                      <option value="1m">1 minuto</option>
                      <option value="5m">5 minutos</option>
                      <option value="15m">15 minutos</option>
                      <option value="1h">1 hora</option>
                      <option value="4h">4 horas</option>
                      <option value="1d">1 día</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="risk">Nivel de Riesgo</Label>
                    <select
                      id="risk"
                      className="w-full p-2 border rounded-md bg-background"
                      value={formData.strategy_data.risk_level}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        strategy_data: { ...prev.strategy_data, risk_level: e.target.value }
                      }))}
                    >
                      <option value="low">Bajo</option>
                      <option value="medium">Medio</option>
                      <option value="high">Alto</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                  />
                  <Label htmlFor="public">Hacer pública</Label>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={createStrategy} className="flex-1">
                    Crear Estrategia
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/20 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : strategies.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay estrategias públicas disponibles
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              ¡Sé el primero en compartir una estrategia!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground mb-1">
                        {strategy.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        por {strategy.profiles?.username || 'Usuario Anónimo'}
                      </p>
                      <p className="text-sm">{strategy.description}</p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getRiskColor(strategy.strategy_data?.risk_level || 'medium')}>
                        {strategy.strategy_data?.risk_level?.toUpperCase() || 'MEDIO'}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {strategy.strategy_data?.timeframe || '1h'}
                      </div>
                    </div>
                  </div>
                  
                  {strategy.tags && strategy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {strategy.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{strategy.views_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className={`w-3 h-3 ${strategy.isLiked ? 'text-loss fill-loss' : ''}`} />
                        <span>{strategy.likes_count}</span>
                      </div>
                      <span>{new Date(strategy.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleLike(strategy.id, strategy.isLiked || false)}
                        className="flex items-center space-x-1"
                      >
                        <Heart className={`w-3 h-3 ${strategy.isLiked ? 'text-loss fill-loss' : ''}`} />
                        <span>{strategy.isLiked ? 'Liked' : 'Like'}</span>
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Usar
                      </Button>
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