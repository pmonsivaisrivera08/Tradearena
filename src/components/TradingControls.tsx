import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

interface TradingControlsProps {
  activePosition: any;
  onBuy: () => void;
  onSell: () => void;
  onClosePosition: () => void;
  currentPrice: number;
}

export const TradingControls = ({ 
  activePosition, 
  onBuy, 
  onSell, 
  onClosePosition,
  currentPrice 
}: TradingControlsProps) => {
  const formatPrice = (price: number) => `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  if (activePosition) {
    return (
      <div className="hud-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-audiowide">
          POSICIÓN ACTIVA
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground">Tipo:</span>
            <span className={`font-bold ${
              activePosition.type === 'buy' ? 'text-profit' : 'text-secondary'
            }`}>
              {activePosition.type === 'buy' ? 'COMPRA' : 'VENTA'}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground">Precio Entrada:</span>
            <span className="font-bold text-foreground">
              {formatPrice(activePosition.entryPrice)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground">Precio Actual:</span>
            <span className="font-bold text-foreground">
              {formatPrice(currentPrice)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground">P&L:</span>
            <span className={`font-bold ${
              ((activePosition.type === 'buy' && currentPrice > activePosition.entryPrice) ||
               (activePosition.type === 'sell' && currentPrice < activePosition.entryPrice))
                ? 'text-profit' : 'text-loss'
            }`}>
              {(activePosition.type === 'buy' 
                ? ((currentPrice - activePosition.entryPrice) / activePosition.entryPrice) * 100
                : ((activePosition.entryPrice - currentPrice) / activePosition.entryPrice) * 100
              ).toFixed(2)}%
            </span>
          </div>
          
          <Button
            onClick={onClosePosition}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-3 mt-6"
          >
            <X className="w-5 h-5 mr-2" />
            CERRAR POSICIÓN
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="hud-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-primary mb-4 font-audiowide">
        PANEL DE CONTROL
      </h3>
      
      <div className="space-y-4">
        <div className="p-3 bg-muted/30 rounded-lg text-center">
          <p className="text-xs text-muted-foreground mb-1">Precio Actual</p>
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(currentPrice)}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onBuy}
            className="bg-profit hover:bg-profit/90 text-background font-bold py-6 profit-glow hover:scale-105 transition-all duration-200"
          >
            <TrendingUp className="w-6 h-6 mr-2" />
            COMPRAR
          </Button>
          
          <Button
            onClick={onSell}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-6 purple-glow hover:scale-105 transition-all duration-200"
          >
            <TrendingDown className="w-6 h-6 mr-2" />
            VENDER
          </Button>
        </div>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>Selecciona una operación para comenzar</p>
          <p className="text-primary">+50 XP por trade exitoso</p>
        </div>
      </div>
    </div>
  );
};