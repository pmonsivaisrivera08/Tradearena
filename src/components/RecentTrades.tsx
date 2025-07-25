import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice: number;
  profit: number;
  timestamp: number;
}

interface RecentTradesProps {
  trades: Trade[];
}

export const RecentTrades = ({ trades }: RecentTradesProps) => {
  const formatPrice = (price: number) => `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (trades.length === 0) {
    return (
      <div className="hud-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-audiowide">
          HISTORIAL DE TRADES
        </h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No hay trades registrados aún
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Ejecuta tu primera operación para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hud-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-primary mb-4 font-audiowide">
        HISTORIAL DE TRADES
      </h3>
      
      <div className="space-y-3">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
              trade.profit > 0 
                ? 'bg-profit/10 border-profit/30 hover:profit-glow' 
                : 'bg-loss/10 border-loss/30 hover:loss-glow'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {trade.type === 'buy' ? (
                  <TrendingUp className="w-5 h-5 text-profit mr-2" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-secondary mr-2" />
                )}
                <span className="font-bold text-sm text-foreground">
                  {trade.type === 'buy' ? 'COMPRA' : 'VENTA'}
                </span>
              </div>
              
              <span className="text-xs text-muted-foreground">
                {formatTime(trade.timestamp)}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Entrada</p>
                <p className="font-bold text-foreground">{formatPrice(trade.entryPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Salida</p>
                <p className="font-bold text-foreground">{formatPrice(trade.exitPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">P&L</p>
                <p className={`font-bold ${trade.profit > 0 ? 'text-profit' : 'text-loss'}`}>
                  {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {trades.length >= 10 && (
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Mostrando los últimos 10 trades
          </p>
        </div>
      )}
    </div>
  );
};