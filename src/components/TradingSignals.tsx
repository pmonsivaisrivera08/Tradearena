import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Clock,
  AlertCircle,
  CheckCircle2,
  Play
} from 'lucide-react';
import { generateTradingSignals, type TradingSignal, type PriceData } from '@/lib/technicalIndicators';

interface TradingSignalsProps {
  priceHistory: Array<{ price: number; timestamp: number }>;
  onSignalAction?: (signal: TradingSignal) => void;
  autoTrading?: boolean;
}

export const TradingSignals = ({ 
  priceHistory, 
  onSignalAction,
  autoTrading = false 
}: TradingSignalsProps) => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [lastSignal, setLastSignal] = useState<TradingSignal | null>(null);

  useEffect(() => {
    if (priceHistory.length < 50) return;

    // Simular cálculo de indicadores y generar señales
    const data: PriceData[] = priceHistory.map(p => ({
      price: p.price,
      timestamp: p.timestamp
    }));

    // Por simplicidad, crear señales mock basadas en movimientos de precio
    const generateMockSignals = () => {
      const recent = data.slice(-10);
      const current = recent[recent.length - 1];
      const previous = recent[recent.length - 2];
      
      if (!current || !previous) return;

      const priceChange = ((current.price - previous.price) / previous.price) * 100;
      
      let signal: TradingSignal;

      if (Math.abs(priceChange) > 0.5) {
        if (priceChange > 0.5) {
          signal = {
            type: 'buy',
            strength: priceChange > 1 ? 'strong' : 'moderate',
            reason: `Impulso alcista detectado: +${priceChange.toFixed(2)}%`,
            timestamp: current.timestamp,
            confidence: Math.min(60 + Math.abs(priceChange) * 10, 90)
          };
        } else {
          signal = {
            type: 'sell',
            strength: priceChange < -1 ? 'strong' : 'moderate',
            reason: `Impulso bajista detectado: ${priceChange.toFixed(2)}%`,
            timestamp: current.timestamp,
            confidence: Math.min(60 + Math.abs(priceChange) * 10, 90)
          };
        }
      } else {
        signal = {
          type: 'hold',
          strength: 'weak',
          reason: 'Mercado en consolidación',
          timestamp: current.timestamp,
          confidence: 45
        };
      }

      setLastSignal(signal);
      
      // Solo agregar si es diferente al último
      setSignals(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.type !== signal.type || last.timestamp !== signal.timestamp) {
          return [...prev.slice(-4), signal]; // Mantener solo las últimas 5 señales
        }
        return prev;
      });
    };

    generateMockSignals();
  }, [priceHistory]);

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="w-4 h-4" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
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

  const getStrengthBadge = (strength: string) => {
    const colors = {
      strong: 'bg-accent/20 text-accent border-accent/30',
      moderate: 'bg-primary/20 text-primary border-primary/30',
      weak: 'bg-muted/20 text-muted-foreground border-muted/30'
    };
    
    return colors[strength as keyof typeof colors] || colors.weak;
  };

  return (
    <Card className="hud-border">
      <CardHeader>
        <CardTitle className="text-lg font-audiowide text-primary flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          SEÑALES DE TRADING
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Señal Actual */}
        {lastSignal && (
          <div className={`p-4 rounded-lg border-2 ${getSignalColor(lastSignal.type)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getSignalIcon(lastSignal.type)}
                <span className="font-bold text-base uppercase">
                  {lastSignal.type === 'buy' ? 'COMPRA' : 
                   lastSignal.type === 'sell' ? 'VENTA' : 'MANTENER'}
                </span>
                <Badge className={getStrengthBadge(lastSignal.strength)}>
                  {lastSignal.strength.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">
                  {lastSignal.confidence}% confianza
                </div>
                <div className="text-xs opacity-75">
                  {new Date(lastSignal.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <p className="text-sm mb-3 opacity-90">{lastSignal.reason}</p>
            
            <div className="space-y-2">
              <Progress 
                value={lastSignal.confidence} 
                className="h-2"
              />
              
              {onSignalAction && lastSignal.type !== 'hold' && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSignalAction(lastSignal)}
                    className="flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Ejecutar Señal</span>
                  </Button>
                  
                  {autoTrading && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Auto-Trading Activo
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Historial de Señales */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Historial Reciente
          </h4>
          
          {signals.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Esperando señales de trading...
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {signals.slice().reverse().map((signal, index) => (
                <div
                  key={`${signal.timestamp}-${index}`}
                  className={`p-3 rounded-lg border ${getSignalColor(signal.type)} opacity-80`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSignalIcon(signal.type)}
                      <span className="font-medium text-sm">
                        {signal.type === 'buy' ? 'COMPRA' : 
                         signal.type === 'sell' ? 'VENTA' : 'MANTENER'}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`${getStrengthBadge(signal.strength)} text-xs`}
                      >
                        {signal.strength}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium">
                        {signal.confidence}%
                      </div>
                      <div className="text-xs opacity-75">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{signal.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="pt-2 border-t border-border/50">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Señales Hoy</div>
              <div className="font-bold text-sm">{signals.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Última Actualización</div>
              <div className="font-bold text-xs">
                {lastSignal ? new Date(lastSignal.timestamp).toLocaleTimeString() : '--:--'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Estado</div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-profit rounded-full animate-pulse"></div>
                <span className="text-xs font-bold ml-1">ACTIVO</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};