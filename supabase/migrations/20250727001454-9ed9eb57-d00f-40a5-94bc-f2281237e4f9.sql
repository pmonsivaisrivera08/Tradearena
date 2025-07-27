-- Fase 4: Social Trading - Tablas para funcionalidades sociales

-- Tabla para seguir traders
CREATE TABLE public.trader_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  followed_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, followed_id)
);

-- Tabla para chat en tiempo real
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'general', -- general, trade_alert, strategy
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para estrategias compartidas
CREATE TABLE public.trading_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  strategy_data JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para likes de estrategias
CREATE TABLE public.strategy_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strategy_id UUID NOT NULL REFERENCES public.trading_strategies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, strategy_id)
);

-- Tabla para alertas de trading
CREATE TABLE public.trade_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  alert_type TEXT NOT NULL, -- trade_opened, trade_closed, profit_alert
  trade_data JSONB NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para rankings sociales
CREATE TABLE public.social_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  strategies_shared INTEGER NOT NULL DEFAULT 0,
  total_likes_received INTEGER NOT NULL DEFAULT 0,
  social_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.trader_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_rankings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para trader_follows
CREATE POLICY "Users can view all follows" ON public.trader_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.trader_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.trader_follows FOR DELETE USING (auth.uid() = follower_id);

-- Políticas RLS para chat_messages
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para trading_strategies
CREATE POLICY "Users can view public strategies" ON public.trading_strategies FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create their own strategies" ON public.trading_strategies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own strategies" ON public.trading_strategies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own strategies" ON public.trading_strategies FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para strategy_likes
CREATE POLICY "Users can view all likes" ON public.strategy_likes FOR SELECT USING (true);
CREATE POLICY "Users can like strategies" ON public.strategy_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike strategies" ON public.strategy_likes FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para trade_alerts
CREATE POLICY "Users can view their own alerts" ON public.trade_alerts FOR SELECT USING (auth.uid() = target_user_id);
CREATE POLICY "Users can create alerts for followers" ON public.trade_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.trade_alerts FOR UPDATE USING (auth.uid() = target_user_id);

-- Políticas RLS para social_rankings
CREATE POLICY "Anyone can view social rankings" ON public.social_rankings FOR SELECT USING (true);
CREATE POLICY "Users can update their own social ranking" ON public.social_rankings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert social rankings" ON public.social_rankings FOR INSERT WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_trading_strategies_updated_at
  BEFORE UPDATE ON public.trading_strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_rankings_updated_at
  BEFORE UPDATE ON public.social_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para actualizar contadores sociales
CREATE OR REPLACE FUNCTION public.update_social_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar followers/following count
  IF TG_TABLE_NAME = 'trader_follows' THEN
    IF TG_OP = 'INSERT' THEN
      -- Incrementar following del follower
      INSERT INTO public.social_rankings (user_id, following_count)
      VALUES (NEW.follower_id, 1)
      ON CONFLICT (user_id) 
      DO UPDATE SET following_count = social_rankings.following_count + 1;
      
      -- Incrementar followers del seguido
      INSERT INTO public.social_rankings (user_id, followers_count)
      VALUES (NEW.followed_id, 1)
      ON CONFLICT (user_id) 
      DO UPDATE SET followers_count = social_rankings.followers_count + 1;
      
    ELSIF TG_OP = 'DELETE' THEN
      -- Decrementar contadores
      UPDATE public.social_rankings 
      SET following_count = GREATEST(following_count - 1, 0)
      WHERE user_id = OLD.follower_id;
      
      UPDATE public.social_rankings 
      SET followers_count = GREATEST(followers_count - 1, 0)
      WHERE user_id = OLD.followed_id;
    END IF;
  END IF;

  -- Actualizar likes count para estrategias
  IF TG_TABLE_NAME = 'strategy_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.trading_strategies 
      SET likes_count = likes_count + 1
      WHERE id = NEW.strategy_id;
      
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.trading_strategies 
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.strategy_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para actualizar contadores
CREATE TRIGGER update_follow_counters
  AFTER INSERT OR DELETE ON public.trader_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_social_counters();

CREATE TRIGGER update_like_counters
  AFTER INSERT OR DELETE ON public.strategy_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_social_counters();

-- Habilitar realtime para chat
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Habilitar realtime para alertas
ALTER TABLE public.trade_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_alerts;