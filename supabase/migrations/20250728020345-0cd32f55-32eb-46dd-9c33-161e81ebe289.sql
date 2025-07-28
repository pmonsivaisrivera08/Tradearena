-- Fase 5: Portfolio Management & Analytics

-- Tabla para tracking de múltiples activos/símbolos
CREATE TABLE public.trading_symbols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'crypto',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para posiciones del portfolio
CREATE TABLE public.portfolio_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_price NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unrealized_pnl NUMERIC NOT NULL DEFAULT 0,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Tabla para métricas de performance
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_portfolio_value NUMERIC NOT NULL DEFAULT 0,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  total_pnl_percentage NUMERIC NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  sharpe_ratio NUMERIC NOT NULL DEFAULT 0,
  max_drawdown NUMERIC NOT NULL DEFAULT 0,
  daily_return NUMERIC NOT NULL DEFAULT 0,
  weekly_return NUMERIC NOT NULL DEFAULT 0,
  monthly_return NUMERIC NOT NULL DEFAULT 0,
  yearly_return NUMERIC NOT NULL DEFAULT 0,
  best_trade NUMERIC NOT NULL DEFAULT 0,
  worst_trade NUMERIC NOT NULL DEFAULT 0,
  avg_trade_duration INTEGER NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  period_end DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para reportes históricos
CREATE TABLE public.trading_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'daily',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_trades INTEGER NOT NULL DEFAULT 0,
  profitable_trades INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  fees_paid NUMERIC NOT NULL DEFAULT 0,
  report_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para alertas de riesgo
CREATE TABLE public.risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar símbolos por defecto
INSERT INTO public.trading_symbols (symbol, name, category) VALUES
('BTC-USD', 'Bitcoin', 'crypto'),
('ETH-USD', 'Ethereum', 'crypto'),
('SOL-USD', 'Solana', 'crypto'),
('ADA-USD', 'Cardano', 'crypto'),
('DOT-USD', 'Polkadot', 'crypto'),
('AAPL', 'Apple Inc.', 'stocks'),
('GOOGL', 'Alphabet Inc.', 'stocks'),
('TSLA', 'Tesla Inc.', 'stocks'),
('MSFT', 'Microsoft Corp.', 'stocks'),
('NVDA', 'NVIDIA Corp.', 'stocks');

-- Enable RLS
ALTER TABLE public.trading_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies para trading_symbols
CREATE POLICY "Anyone can view trading symbols"
ON public.trading_symbols FOR SELECT
USING (true);

-- RLS Policies para portfolio_positions
CREATE POLICY "Users can view their own positions"
ON public.portfolio_positions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own positions"
ON public.portfolio_positions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions"
ON public.portfolio_positions FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies para performance_metrics
CREATE POLICY "Users can view their own metrics"
ON public.performance_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
ON public.performance_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
ON public.performance_metrics FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies para trading_reports
CREATE POLICY "Users can view their own reports"
ON public.trading_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
ON public.trading_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies para risk_alerts
CREATE POLICY "Users can view their own alerts"
ON public.risk_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
ON public.risk_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.risk_alerts FOR UPDATE
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_portfolio_positions_updated_at
BEFORE UPDATE ON public.portfolio_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at
BEFORE UPDATE ON public.performance_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para calcular métricas de performance
CREATE OR REPLACE FUNCTION public.calculate_performance_metrics(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_trades_count INTEGER;
  profitable_trades_count INTEGER;
  total_pnl_value NUMERIC;
  win_rate_value NUMERIC;
  portfolio_value NUMERIC;
BEGIN
  -- Calcular estadísticas básicas
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN profit_percentage > 0 THEN 1 END),
    COALESCE(SUM(profit_percentage), 0)
  INTO total_trades_count, profitable_trades_count, total_pnl_value
  FROM public.trades
  WHERE user_id = user_id_param AND NOT is_active;

  -- Calcular win rate
  win_rate_value := CASE 
    WHEN total_trades_count > 0 THEN (profitable_trades_count::NUMERIC / total_trades_count) * 100
    ELSE 0
  END;

  -- Obtener valor del portfolio
  SELECT current_balance INTO portfolio_value
  FROM public.user_stats
  WHERE user_id = user_id_param;

  -- Insertar o actualizar métricas
  INSERT INTO public.performance_metrics (
    user_id,
    total_portfolio_value,
    total_pnl,
    total_pnl_percentage,
    win_rate,
    period_start,
    period_end
  )
  VALUES (
    user_id_param,
    COALESCE(portfolio_value, 10000),
    total_pnl_value,
    CASE WHEN portfolio_value > 0 THEN (total_pnl_value / portfolio_value) * 100 ELSE 0 END,
    win_rate_value,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_portfolio_value = EXCLUDED.total_portfolio_value,
    total_pnl = EXCLUDED.total_pnl,
    total_pnl_percentage = EXCLUDED.total_pnl_percentage,
    win_rate = EXCLUDED.win_rate,
    updated_at = now();
END;
$$;