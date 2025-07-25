-- FASE 2: GAMIFICACIÓN AVANZADA - Sistema completo de misiones, logros y rankings

-- Insertar logros expandidos con más categorías
INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, xp_reward, icon) VALUES
-- Logros de Trading Básico
('Primer Trade', 'Ejecuta tu primera operación', 'trading', 'total_trades', 1, 50, '🎯'),
('Trader Novato', 'Completa 10 trades', 'trading', 'total_trades', 10, 100, '📈'),
('Trader Experimentado', 'Completa 50 trades', 'trading', 'total_trades', 50, 250, '🚀'),
('Trader Veterano', 'Completa 100 trades', 'trading', 'total_trades', 100, 500, '💎'),
('Trader Élite', 'Completa 500 trades', 'trading', 'total_trades', 500, 1000, '👑'),

-- Logros de Rentabilidad
('Primera Ganancia', 'Obtén tu primer trade rentable', 'profit', 'profitable_trades', 1, 75, '💰'),
('Racha Ganadora', 'Consigue 5 trades rentables consecutivos', 'profit', 'win_streak', 5, 200, '🔥'),
('Maestro del Profit', 'Alcanza 70% de trades rentables', 'profit', 'win_rate', 70, 300, '🎖️'),
('Rey del Profit', 'Alcanza 80% de trades rentables', 'profit', 'win_rate', 80, 500, '👑'),

-- Logros de Balance
('Millonario Virtual', 'Alcanza $100,000 en balance', 'balance', 'current_balance', 100000, 400, '💎'),
('Magnate Crypto', 'Alcanza $500,000 en balance', 'balance', 'current_balance', 500000, 800, '🏰'),
('Emperador Financiero', 'Alcanza $1,000,000 en balance', 'balance', 'current_balance', 1000000, 1500, '🌟'),

-- Logros de Tiempo y Dedicación
('Trader Diario', 'Opera por 7 días consecutivos', 'consistency', 'daily_streak', 7, 150, '📅'),
('Trader Semanal', 'Opera por 30 días consecutivos', 'consistency', 'daily_streak', 30, 400, '🗓️'),
('Adicto al Trading', 'Opera por 100 días consecutivos', 'consistency', 'daily_streak', 100, 1000, '⚡'),

-- Logros Especiales
('Velocista', 'Completa 10 trades en menos de 1 hora', 'special', 'trades_per_hour', 10, 300, '⚡'),
('Resistente', 'Sobrevive a 10 trades perdedores consecutivos', 'special', 'loss_streak', 10, 250, '🛡️'),
('Analista', 'Utiliza todos los indicadores técnicos', 'special', 'indicators_used', 5, 200, '📊'),

-- Logros de Misiones
('Misionero', 'Completa tu primera misión diaria', 'missions', 'missions_completed', 1, 50, '🎯'),
('Cazador de Misiones', 'Completa 10 misiones diarias', 'missions', 'missions_completed', 10, 200, '🏹'),
('Maestro de Misiones', 'Completa 50 misiones diarias', 'missions', 'missions_completed', 50, 500, '🏆'),

-- Logros de Ranking
('Top 100', 'Entra al top 100 del ranking', 'ranking', 'global_rank', 100, 300, '🥉'),
('Top 50', 'Entra al top 50 del ranking', 'ranking', 'global_rank', 50, 500, '🥈'),
('Top 10', 'Entra al top 10 del ranking', 'ranking', 'global_rank', 10, 800, '🥇'),
('Líder Global', 'Alcanza el puesto #1 del ranking', 'ranking', 'global_rank', 1, 1500, '👑');

-- Crear tabla para seguimiento de rachas y estadísticas adicionales
CREATE TABLE public.user_streaks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    win_streak INTEGER NOT NULL DEFAULT 0,
    loss_streak INTEGER NOT NULL DEFAULT 0,
    daily_streak INTEGER NOT NULL DEFAULT 0,
    max_win_streak INTEGER NOT NULL DEFAULT 0,
    max_loss_streak INTEGER NOT NULL DEFAULT 0,
    max_daily_streak INTEGER NOT NULL DEFAULT 0,
    last_trade_date DATE,
    last_login_date DATE,
    missions_completed INTEGER NOT NULL DEFAULT 0,
    indicators_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para user_streaks
CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
ON public.user_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.user_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at en user_streaks
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear tabla de leaderboards
CREATE TABLE public.leaderboards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    rank_position INTEGER NOT NULL,
    total_trades INTEGER NOT NULL DEFAULT 0,
    profitable_trades INTEGER NOT NULL DEFAULT 0,
    profit_percentage NUMERIC DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    balance_growth NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, period_type, period_start)
);

-- Habilitar RLS en leaderboards
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para leaderboards
CREATE POLICY "Anyone can view leaderboards" 
ON public.leaderboards 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" 
ON public.leaderboards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entries" 
ON public.leaderboards 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at en leaderboards
CREATE TRIGGER update_leaderboards_updated_at
BEFORE UPDATE ON public.leaderboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para generar misiones diarias automáticamente
CREATE OR REPLACE FUNCTION public.generate_daily_missions(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missions_config JSONB[] := ARRAY[
        '{"type": "complete_trades", "description": "Completa 3 trades exitosos hoy", "target": 3, "xp": 50}',
        '{"type": "profit_trades", "description": "Obtén 2 trades rentables hoy", "target": 2, "xp": 75}',
        '{"type": "volume_trading", "description": "Opera por un volumen de $10,000 hoy", "target": 10000, "xp": 60}',
        '{"type": "win_streak", "description": "Consigue una racha de 3 trades ganadores", "target": 3, "xp": 100}',
        '{"type": "early_bird", "description": "Realiza tu primer trade antes de las 10 AM", "target": 1, "xp": 40}',
        '{"type": "risk_management", "description": "No pierdas más del 2% en ningún trade hoy", "target": 1, "xp": 80}',
        '{"type": "diversify", "description": "Opera con al menos 2 criptomonedas diferentes", "target": 2, "xp": 70}',
        '{"type": "quick_trades", "description": "Completa 5 trades en menos de 30 minutos", "target": 5, "xp": 90}'
    ];
    mission JSONB;
    selected_missions JSONB[];
    i INTEGER;
BEGIN
    -- Verificar si ya existen misiones para hoy
    IF EXISTS (
        SELECT 1 FROM public.daily_missions 
        WHERE user_id = _user_id 
        AND mission_date = CURRENT_DATE
    ) THEN
        RETURN;
    END IF;

    -- Seleccionar 3 misiones aleatorias
    selected_missions := ARRAY(
        SELECT missions_config[i] 
        FROM generate_series(1, array_length(missions_config, 1)) AS i 
        ORDER BY random() 
        LIMIT 3
    );

    -- Insertar las misiones seleccionadas
    FOREACH mission IN ARRAY selected_missions
    LOOP
        INSERT INTO public.daily_missions (
            user_id,
            mission_type,
            description,
            target_value,
            xp_reward,
            mission_date
        ) VALUES (
            _user_id,
            mission->>'type',
            mission->>'description',
            (mission->>'target')::INTEGER,
            (mission->>'xp')::INTEGER,
            CURRENT_DATE
        );
    END LOOP;
END;
$$;

-- Función para actualizar el ranking global
CREATE OR REPLACE FUNCTION public.update_global_ranking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Actualizar ranking all_time
    WITH ranked_users AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (
                ORDER BY 
                    xp DESC, 
                    profitable_trades DESC, 
                    current_balance DESC
            ) as rank_position,
            total_trades,
            profitable_trades,
            CASE 
                WHEN total_trades > 0 
                THEN (profitable_trades::NUMERIC / total_trades * 100)
                ELSE 0 
            END as profit_percentage,
            xp,
            current_balance
        FROM public.user_stats
        WHERE total_trades > 0
    )
    INSERT INTO public.leaderboards (
        user_id, 
        period_type, 
        period_start, 
        period_end, 
        rank_position, 
        total_trades, 
        profitable_trades, 
        profit_percentage, 
        total_xp, 
        balance_growth
    )
    SELECT 
        user_id,
        'all_time',
        '2024-01-01'::DATE,
        '2099-12-31'::DATE,
        rank_position,
        total_trades,
        profitable_trades,
        profit_percentage,
        xp,
        current_balance - 10000 -- Crecimiento desde balance inicial
    FROM ranked_users
    ON CONFLICT (user_id, period_type, period_start) 
    DO UPDATE SET
        rank_position = EXCLUDED.rank_position,
        total_trades = EXCLUDED.total_trades,
        profitable_trades = EXCLUDED.profitable_trades,
        profit_percentage = EXCLUDED.profit_percentage,
        total_xp = EXCLUDED.total_xp,
        balance_growth = EXCLUDED.balance_growth,
        updated_at = now();
END;
$$;

-- Función para verificar y otorgar logros
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    achievement_record RECORD;
    user_stat RECORD;
    user_streak RECORD;
BEGIN
    -- Obtener estadísticas del usuario
    SELECT * INTO user_stat 
    FROM public.user_stats 
    WHERE user_id = _user_id;
    
    -- Obtener rachas del usuario
    SELECT * INTO user_streak 
    FROM public.user_streaks 
    WHERE user_id = _user_id;

    -- Verificar cada logro
    FOR achievement_record IN 
        SELECT * FROM public.achievements 
        WHERE id NOT IN (
            SELECT achievement_id 
            FROM public.user_achievements 
            WHERE user_id = _user_id
        )
    LOOP
        -- Verificar si el usuario cumple los requisitos
        IF (
            (achievement_record.requirement_type = 'total_trades' AND user_stat.total_trades >= achievement_record.requirement_value) OR
            (achievement_record.requirement_type = 'profitable_trades' AND user_stat.profitable_trades >= achievement_record.requirement_value) OR
            (achievement_record.requirement_type = 'current_balance' AND user_stat.current_balance >= achievement_record.requirement_value) OR
            (achievement_record.requirement_type = 'win_rate' AND user_stat.total_trades > 0 AND 
             (user_stat.profitable_trades::NUMERIC / user_stat.total_trades * 100) >= achievement_record.requirement_value) OR
            (achievement_record.requirement_type = 'win_streak' AND user_streak.max_win_streak >= achievement_record.requirement_value) OR
            (achievement_record.requirement_type = 'loss_streak' AND user_streak.max_loss_streak >= achievement_record.requirement_value) OR
            (achievement_record.requirement_type = 'daily_streak' AND user_streak.max_daily_streak >= achievement_record.requirement_value) OR
            (achievement_record.requirement_type = 'missions_completed' AND user_streak.missions_completed >= achievement_record.requirement_value)
        ) THEN
            -- Otorgar el logro
            INSERT INTO public.user_achievements (user_id, achievement_id)
            VALUES (_user_id, achievement_record.id);
            
            -- Otorgar XP
            UPDATE public.user_stats 
            SET xp = xp + achievement_record.xp_reward,
                updated_at = now()
            WHERE user_id = _user_id;
        END IF;
    END LOOP;
END;
$$;