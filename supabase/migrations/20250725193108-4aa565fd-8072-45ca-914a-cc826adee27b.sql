-- Limpiar logros existentes e insertar el conjunto completo
DELETE FROM public.achievements;

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