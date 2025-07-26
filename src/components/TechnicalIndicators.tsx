import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Minus
} from 'lucide-react';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands,
  analyzeTrend,
  type PriceData,
  type TradingSignal
} from '@/lib/technicalIndicators';

interface TechnicalIndicatorsProps {
  priceHistory: Array<{ price: number; timestamp: number }>;
  currentPrice: number;
  signal?: TradingSignal;
}

export const TechnicalIndicators = ({ 
  priceHistory, 
  currentPrice, 
  signal 
}: TechnicalIndicatorsProps) => {
  const indicators = useMemo(() => {
    const data: PriceData[] = priceHistory.map(p => ({
      price: p.price,
      timestamp: p.timestamp
    }));

    if (data.length < 26) {
      return null;
    }

    const rsi = calculateRSI(data, 14);
    const macd = calculateMACD(data, 12, 26, 9);
    const bollinger = calculateBollingerBands(data, 20, 2);
    const trend = analyzeTrend(data, 20);

    return {
      rsi: rsi[rsi.length - 1],
      macd: macd[macd.length - 1],
      bollinger: bollinger[bollinger.length - 1],
      trend
    };
  }, [priceHistory]);

  if (!indicators) {
    return (
      <Card className="hud-border">
        <CardHeader>
          <CardTitle className="text-lg font-audiowide text-primary">
            ANÁLISIS TÉCNICO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Insuficientes datos para análisis
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Se requieren al menos 26 puntos de precio
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRSIColor = (rsi: number) => {
    if (rsi < 30) return 'text-profit';
    if (rsi > 70) return 'text-loss';
    return 'text-muted-foreground';
  };

  const getMACDColor = (trend: string) => {
    if (trend === 'bullish') return 'text-profit';
    if (trend === 'bearish') return 'text-loss';
    return 'text-muted-foreground';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'uptrend':
        return <TrendingUp className="w-4 h-4 text-profit" />;
      case 'downtrend':
        return <TrendingDown className="w-4 h-4 text-loss" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <CheckCircle className="w-4 h-4 text-profit" />;
      case 'sell':
        return <AlertTriangle className="w-4 h-4 text-loss" />;
      default:
        return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-profit/10 border-profit/30 text-profit';
      case 'sell':
        return 'bg-loss/10 border-loss/30 text-loss';
      default:
        return 'bg-muted/10 border-muted/30 text-muted-foreground';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-accent';
      case 'moderate':
        return 'bg-primary';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className="hud-border">
      <CardHeader>
        <CardTitle className="text-lg font-audiowide text-primary flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          ANÁLISIS TÉCNICO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Señal de Trading */}
        {signal && (
          <div className={`p-4 rounded-lg border-2 ${getSignalColor(signal.type)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getSignalIcon(signal.type)}
                <span className="font-bold uppercase">
                  {signal.type === 'buy' ? 'COMPRA' : signal.type === 'sell' ? 'VENTA' : 'MANTENER'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {signal.strength.toUpperCase()}
                </Badge>
              </div>
              <span className="text-sm font-bold">
                {signal.confidence}% confianza
              </span>
            </div>
            <p className="text-sm opacity-90">{signal.reason}</p>
            <Progress 
              value={signal.confidence} 
              className="mt-2 h-1"
            />
          </div>
        )}

        {/* RSI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">RSI (14)</span>
            <span className={`font-bold ${getRSIColor(indicators.rsi.value)}`}>
              {indicators.rsi.value.toFixed(1)}
            </span>
          </div>
          <Progress 
            value={indicators.rsi.value} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Sobreventa (30)</span>
            <span>Sobrecompra (70)</span>
          </div>
          <Badge 
            variant="outline" 
            className={`${getRSIColor(indicators.rsi.value)} text-xs`}
          >
            {indicators.rsi.signal === 'oversold' ? 'SOBREVENTA' : 
             indicators.rsi.signal === 'overbought' ? 'SOBRECOMPRA' : 'NEUTRAL'}
          </Badge>
        </div>

        {/* MACD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">MACD</span>
            <span className={`font-bold ${getMACDColor(indicators.macd.trend)}`}>
              {indicators.macd.macd.toFixed(4)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Señal:</span>
              <span>{indicators.macd.signal.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Histograma:</span>
              <span className={getMACDColor(indicators.macd.trend)}>
                {indicators.macd.histogram.toFixed(4)}
              </span>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${getMACDColor(indicators.macd.trend)} text-xs`}
          >
            {indicators.macd.trend === 'bullish' ? 'ALCISTA' : 
             indicators.macd.trend === 'bearish' ? 'BAJISTA' : 'NEUTRAL'}
          </Badge>
        </div>

        {/* Bollinger Bands */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Bandas de Bollinger</span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-muted-foreground">Superior</div>
              <div className="font-bold">${indicators.bollinger.upper.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Media</div>
              <div className="font-bold">${indicators.bollinger.middle.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Inferior</div>
              <div className="font-bold">${indicators.bollinger.lower.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-center">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                indicators.bollinger.position === 'above' ? 'text-loss' : 
                indicators.bollinger.position === 'below' ? 'text-profit' : 'text-muted-foreground'
              }`}
            >
              {indicators.bollinger.position === 'above' ? 'SOBRE BANDA' : 
               indicators.bollinger.position === 'below' ? 'BAJO BANDA' : 'EN RANGO'}
            </Badge>
          </div>
        </div>

        {/* Análisis de Tendencia */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tendencia</span>
            <div className="flex items-center space-x-2">
              {getTrendIcon(indicators.trend.trend)}
              <span className="font-bold">
                {indicators.trend.trend === 'uptrend' ? 'ALCISTA' : 
                 indicators.trend.trend === 'downtrend' ? 'BAJISTA' : 'LATERAL'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Fuerza:</span>
              <span>{indicators.trend.strength.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Soporte:</span>
              <span>${indicators.trend.support.toLocaleString()}</span>
            </div>
          </div>
          <Progress 
            value={Math.min(indicators.trend.strength * 10, 100)} 
            className="h-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};