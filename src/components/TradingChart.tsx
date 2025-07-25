import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TradingChartProps {
  priceHistory: Array<{ time: number; price: number }>;
  currentPrice: number;
  activePosition: any;
}

export const TradingChart = ({ priceHistory, currentPrice, activePosition }: TradingChartProps) => {
  const formatPrice = (price: number) => `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const priceChange = priceHistory.length > 1 
    ? currentPrice - priceHistory[priceHistory.length - 2].price 
    : 0;
  const priceChangePercent = priceHistory.length > 1 
    ? (priceChange / priceHistory[priceHistory.length - 2].price) * 100 
    : 0;

  const isPositive = priceChange >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="hud-border p-3 rounded-lg bg-card">
          <p className="text-primary font-bold">
            {formatTime(label)}
          </p>
          <p className="text-foreground">
            Precio: <span className="font-bold">{formatPrice(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hud-border rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-audiowide">BTC/USD</h2>
          <p className="text-sm text-muted-foreground">Bitcoin / US Dollar</p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-foreground">
            {formatPrice(currentPrice)}
          </div>
          <div className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-profit' : 'text-loss'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isPositive ? '+' : ''}{formatPrice(priceChange)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {activePosition && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-primary/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Posición Activa:</span>
            <span className={`font-bold text-sm ${
              activePosition.type === 'buy' ? 'text-profit' : 'text-secondary'
            }`}>
              {activePosition.type === 'buy' ? 'COMPRA' : 'VENTA'} @ {formatPrice(activePosition.entryPrice)}
            </span>
          </div>
          
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">P&L: </span>
            <span className={`font-bold ${
              ((activePosition.type === 'buy' && currentPrice > activePosition.entryPrice) ||
               (activePosition.type === 'sell' && currentPrice < activePosition.entryPrice))
                ? 'text-profit' : 'text-loss'
            }`}>
              {activePosition.type === 'buy' 
                ? formatPrice(currentPrice - activePosition.entryPrice)
                : formatPrice(activePosition.entryPrice - currentPrice)
              } ({(activePosition.type === 'buy' 
                ? ((currentPrice - activePosition.entryPrice) / activePosition.entryPrice) * 100
                : ((activePosition.entryPrice - currentPrice) / activePosition.entryPrice) * 100
              ).toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory}>
            <XAxis 
              dataKey="time" 
              tickFormatter={formatTime}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              domain={['dataMin - 1000', 'dataMax + 1000']}
              tickFormatter={formatPrice}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-xs text-muted-foreground">24h High</p>
          <p className="font-bold text-sm text-foreground">
            {formatPrice(Math.max(...priceHistory.map(p => p.price)))}
          </p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-xs text-muted-foreground">24h Low</p>
          <p className="font-bold text-sm text-foreground">
            {formatPrice(Math.min(...priceHistory.map(p => p.price)))}
          </p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-xs text-muted-foreground">Volume</p>
          <p className="font-bold text-sm text-foreground">1.2M BTC</p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-xs text-muted-foreground">Market Cap</p>
          <p className="font-bold text-sm text-foreground">$985B</p>
        </div>
      </div>
    </div>
  );
};