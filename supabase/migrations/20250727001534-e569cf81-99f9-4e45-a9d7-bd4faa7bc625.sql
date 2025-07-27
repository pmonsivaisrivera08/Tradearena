-- Arreglar problemas de seguridad detectados

-- 1. Arreglar Function Search Path Mutable
-- Actualizar función para establecer search_path seguro
CREATE OR REPLACE FUNCTION public.update_social_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Actualizar followers/following count
  IF TG_TABLE_NAME = 'trader_follows' THEN
    IF TG_OP = 'INSERT' THEN
      -- Incrementar following del follower
      INSERT INTO public.social_rankings (user_id, following_count)
      VALUES (NEW.follower_id, 1)
      ON CONFLICT (user_id) 
      DO UPDATE SET following_count = public.social_rankings.following_count + 1;
      
      -- Incrementar followers del seguido
      INSERT INTO public.social_rankings (user_id, followers_count)
      VALUES (NEW.followed_id, 1)
      ON CONFLICT (user_id) 
      DO UPDATE SET followers_count = public.social_rankings.followers_count + 1;
      
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
$$;