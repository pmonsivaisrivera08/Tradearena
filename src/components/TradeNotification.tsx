import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, TrendingUp, Star } from 'lucide-react';

interface TradeNotificationProps {
  trade: {
    type: 'buy' | 'sell';
    profit: number;
    entryPrice: number;
    exitPrice: number;
  } | null;
  earnedXP: number;
  isProfit: boolean;
  onClose: () => void;
}

export const TradeNotification = ({ trade, earnedXP, isProfit, onClose }: TradeNotificationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trade) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [trade, onClose]);

  if (!trade) return null;

  const formatPrice = (price: number) => `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`hud-border rounded-xl p-6 min-w-[300px] ${
        isProfit ? 'profit-glow bg-card' : 'loss-glow bg-card'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {isProfit ? (
              <CheckCircle className="w-6 h-6 text-profit mr-3" />
            ) : (
              <XCircle className="w-6 h-6 text-loss mr-3" />
            )}
            <div>
              <h3 className={`font-bold text-lg ${isProfit ? 'text-profit' : 'text-loss'}`}>
                {isProfit ? '¡TRADE EXITOSO!' : 'TRADE CERRADO'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {trade.type === 'buy' ? 'Compra' : 'Venta'} ejecutada
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entrada:</span>
            <span className="font-bold text-foreground">{formatPrice(trade.entryPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Salida:</span>
            <span className="font-bold text-foreground">{formatPrice(trade.exitPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ganancia:</span>
            <span className={`font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
              {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}%
            </span>
          </div>
        </div>

        {isProfit && (
          <div className="bg-profit/20 border border-profit/30 rounded-lg p-3">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-profit mr-2" />
              <div>
                <p className="font-bold text-profit">+{earnedXP} XP Ganados</p>
                <p className="text-xs text-muted-foreground">¡Sigue así, trader!</p>
              </div>
            </div>
          </div>
        )}

        {!isProfit && (
          <div className="bg-muted/30 border border-muted rounded-lg p-3">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-muted-foreground mr-2" />
              <div>
                <p className="font-bold text-muted-foreground">Sin XP esta vez</p>
                <p className="text-xs text-muted-foreground">Analiza y vuelve a intentar</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};