import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  Eye,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface MarketAnalysisProps {
  priceHistory: Array<{ price: number; timestamp: number }>;
  currentPrice: number;
}

interface MarketData {
  volatility: number;
  momentum: number;
  support: number;
  resistance: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
  volume: number;
  priceChange24h: number;
}

export const MarketAnalysis = ({ priceHistory, currentPrice }: MarketAnalysisProps) => {
  const marketData = useMemo((): MarketData => {
    if (priceHistory.length < 10) {
      return {
        volatility: 0,
        momentum: 0,
        support: currentPrice,
        resistance: currentPrice,
        marketSentiment: 'neutral',
        riskLevel: 'medium',
        volume: 0,
        priceChange24h: 0
      };
    }

    const recent24h = priceHistory.slice(-24);
    const recent1h = priceHistory.slice(-12);
    const prices = recent24h.map(p => p.price);
    
    // Calcular volatilidad (desviación estándar)
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / mean * 100;

    // Calcular momentum (cambio de precio en las últimas horas)
    const oldPrice = recent1h[0]?.price || currentPrice;
    const momentum = ((currentPrice - oldPrice) / oldPrice) * 100;

    // Soporte y resistencia
    const support = Math.min(...prices);
    const resistance = Math.max(...prices);

    // Cambio en 24h
    const price24hAgo = recent24h[0]?.price || currentPrice;
    const priceChange24h = ((currentPrice - price24hAgo) / price24hAgo) * 100;

    // Sentimiento del mercado
    let marketSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (momentum > 1 && priceChange24h > 2) marketSentiment = 'bullish';
    else if (momentum < -1 && priceChange24h < -2) marketSentiment = 'bearish';

    // Nivel de riesgo
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (volatility < 2) riskLevel = 'low';
    else if (volatility > 5) riskLevel = 'high';

    // Volumen simulado basado en volatilidad
    const volume = Math.floor(volatility * 1000000 + Math.random() * 500000);

    return {
      volatility,
      momentum,
      support,
      resistance,
      marketSentiment,
      riskLevel,
      volume,
      priceChange24h
    };
  }, [priceHistory, currentPrice]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-profit bg-profit/10 border-profit/30';
      case 'bearish':
        return 'text-loss bg-loss/10 border-loss/30';
      default:
        return 'text-muted-foreground bg-muted/10 border-muted/30';
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

  const getMomentumIcon = (momentum: number) => {
    if (momentum > 0.5) return <TrendingUp className="w-4 h-4 text-profit" />;
    if (momentum < -0.5) return <TrendingDown className="w-4 h-4 text-loss" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Card className="hud-border">
      <CardHeader>
        <CardTitle className="text-lg font-audiowide text-primary flex items-center">
          <BarChart className="w-5 h-5 mr-2" />
          ANÁLISIS DE MERCADO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen de Mercado */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sentimiento</span>
              <Badge className={getSentimentColor(marketData.marketSentiment)}>
                {marketData.marketSentiment === 'bullish' ? 'ALCISTA' : 
                 marketData.marketSentiment === 'bearish' ? 'BAJISTA' : 'NEUTRAL'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Riesgo</span>
              <Badge className={getRiskColor(marketData.riskLevel)}>
                {marketData.riskLevel === 'low' ? 'BAJO' : 
                 marketData.riskLevel === 'high' ? 'ALTO' : 'MEDIO'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cambio 24h</span>
              <span className={`font-bold ${marketData.priceChange24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                {marketData.priceChange24h >= 0 ? '+' : ''}{marketData.priceChange24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Volumen</span>
              <span className="font-bold text-xs">
                ${(marketData.volume / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>

        {/* Momentum */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getMomentumIcon(marketData.momentum)}
              <span className="text-sm font-medium">Momentum</span>
            </div>
            <span className={`font-bold ${marketData.momentum >= 0 ? 'text-profit' : 'text-loss'}`}>
              {marketData.momentum >= 0 ? '+' : ''}{marketData.momentum.toFixed(2)}%
            </span>
          </div>
          <Progress 
            value={Math.min(Math.abs(marketData.momentum) * 20, 100)} 
            className="h-2"
          />
        </div>

        {/* Volatilidad */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Volatilidad</span>
            </div>
            <span className="font-bold text-accent">
              {marketData.volatility.toFixed(2)}%
            </span>
          </div>
          <Progress 
            value={Math.min(marketData.volatility * 10, 100)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Estable</span>
            <span>Volátil</span>
          </div>
        </div>

        {/* Soporte y Resistencia */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Niveles Clave
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/10 rounded">
              <span className="text-sm text-muted-foreground">Resistencia</span>
              <span className="font-bold text-loss">
                ${marketData.resistance.toLocaleString()}
              </span>
            </div>
            
            <div className="relative">
              <div className="h-8 bg-gradient-to-r from-loss/20 via-muted/20 to-profit/20 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs font-bold ml-2">
                  ${currentPrice.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/10 rounded">
              <span className="text-sm text-muted-foreground">Soporte</span>
              <span className="font-bold text-profit">
                ${marketData.support.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Distancia a niveles */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-muted-foreground">A Resistencia</div>
              <div className="font-bold text-loss">
                {(((marketData.resistance - currentPrice) / currentPrice) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">A Soporte</div>
              <div className="font-bold text-profit">
                {(((currentPrice - marketData.support) / currentPrice) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores de Mercado */}
        <div className="pt-2 border-t border-border/50">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            Estado del Mercado
          </h4>
          
          <div className="grid grid-cols-1 gap-2">
            {marketData.volatility > 4 && (
              <div className="flex items-center space-x-2 text-xs text-loss">
                <AlertTriangle className="w-3 h-3" />
                <span>Alta volatilidad detectada</span>
              </div>
            )}
            
            {Math.abs(marketData.momentum) > 2 && (
              <div className="flex items-center space-x-2 text-xs text-accent">
                <TrendingUp className="w-3 h-3" />
                <span>Fuerte momentum {marketData.momentum > 0 ? 'alcista' : 'bajista'}</span>
              </div>
            )}
            
            {marketData.riskLevel === 'high' && (
              <div className="flex items-center space-x-2 text-xs text-loss">
                <Shield className="w-3 h-3" />
                <span>Condiciones de alto riesgo</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              <span>Rango: ${marketData.support.toLocaleString()} - ${marketData.resistance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};