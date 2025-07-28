import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PortfolioPosition {
  id: string;
  symbol: string;
  quantity: number;
  average_price: number;
  current_value: number;
  unrealized_pnl: number;
  total_invested: number;
}

interface PerformanceMetrics {
  total_portfolio_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  win_rate: number;
  sharpe_ratio: number;
  max_drawdown: number;
  daily_return: number;
  weekly_return: number;
  monthly_return: number;
  yearly_return: number;
  best_trade: number;
  worst_trade: number;
  avg_trade_duration: number;
  risk_score: number;
}

interface TradingSymbol {
  symbol: string;
  name: string;
  category: string;
}

interface RiskAlert {
  id: string;
  alert_type: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

export const usePortfolio = () => {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [symbols, setSymbols] = useState<TradingSymbol[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Cargar posiciones del portfolio
      const { data: positionsData, error: positionsError } = await supabase
        .from('portfolio_positions')
        .select('*')
        .order('current_value', { ascending: false });

      if (positionsError) throw positionsError;

      // Cargar métricas de performance
      const { data: metricsData, error: metricsError } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (metricsError) throw metricsError;

      // Cargar símbolos disponibles
      const { data: symbolsData, error: symbolsError } = await supabase
        .from('trading_symbols')
        .select('symbol, name, category')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (symbolsError) throw symbolsError;

      // Cargar alertas de riesgo
      const { data: alertsData, error: alertsError } = await supabase
        .from('risk_alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      setPositions(positionsData || []);
      setMetrics(metricsData);
      setSymbols(symbolsData || []);
      setAlerts(alertsData || []);

    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del portfolio',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePosition = async (symbol: string, quantity: number, price: number) => {
    try {
      const currentValue = quantity * price;
      const { data: existingPosition } = await supabase
        .from('portfolio_positions')
        .select('*')
        .eq('symbol', symbol)
        .maybeSingle();

      if (existingPosition) {
        // Actualizar posición existente
        const newQuantity = existingPosition.quantity + quantity;
        const newTotalInvested = existingPosition.total_invested + (quantity * price);
        const newAveragePrice = newTotalInvested / newQuantity;

        const { error } = await supabase
          .from('portfolio_positions')
          .update({
            quantity: newQuantity,
            average_price: newAveragePrice,
            current_value: newQuantity * price,
            total_invested: newTotalInvested,
            unrealized_pnl: (price - newAveragePrice) * newQuantity
          })
          .eq('id', existingPosition.id);

        if (error) throw error;
      } else {
        // Crear nueva posición
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const { error } = await supabase
          .from('portfolio_positions')
          .insert({
            user_id: user.id,
            symbol,
            quantity,
            average_price: price,
            current_value: currentValue,
            total_invested: currentValue,
            unrealized_pnl: 0
          });

        if (error) throw error;
      }

      await loadPortfolioData();
      await calculateMetrics();

    } catch (error) {
      console.error('Error updating position:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la posición',
        variant: 'destructive'
      });
    }
  };

  const calculateMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Llamar función para calcular métricas
      const { error } = await supabase.rpc('calculate_performance_metrics', {
        user_id_param: user.id
      });

      if (error) throw error;

      await loadPortfolioData();

    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('risk_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));

    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getPortfolioValue = () => {
    return positions.reduce((total, position) => total + position.current_value, 0);
  };

  const getTotalPnL = () => {
    return positions.reduce((total, position) => total + position.unrealized_pnl, 0);
  };

  const getTopPosition = () => {
    return positions.reduce((top, position) => 
      position.current_value > (top?.current_value || 0) ? position : top, null);
  };

  const getDiversificationScore = () => {
    if (positions.length === 0) return 0;
    const totalValue = getPortfolioValue();
    if (totalValue === 0) return 0;

    // Calcular índice de diversificación basado en la distribución de activos
    const weights = positions.map(p => p.current_value / totalValue);
    const herfindahl = weights.reduce((sum, weight) => sum + weight * weight, 0);
    return Math.round((1 - herfindahl) * 100);
  };

  return {
    positions,
    metrics,
    symbols,
    alerts,
    loading,
    updatePosition,
    calculateMetrics,
    markAlertAsRead,
    getPortfolioValue,
    getTotalPnL,
    getTopPosition,
    getDiversificationScore,
    refetch: loadPortfolioData
  };
};