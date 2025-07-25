import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TradingChart } from './TradingChart';
import { TradingControls } from './TradingControls';
import { UserProfile } from './UserProfile';
import { RecentTrades } from './RecentTrades';
import { TradeNotification } from './TradeNotification';
import { useTrading } from '@/hooks/useTrading';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TradingDashboardProps {
  onLogout: () => void;
}

export const TradingDashboard = ({ onLogout }: TradingDashboardProps) => {
  const { data, openPosition, closePosition, getCurrentRank, getNextRank } = useTrading();
  const [notification, setNotification] = useState<any>(null);
  const { toast } = useToast();

  const handleBuy = () => {
    const success = openPosition('buy');
    if (success) {
      toast({
        title: "Posición Abierta",
        description: `Compra ejecutada a $${data.currentPrice.toLocaleString()}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Ya tienes una posición activa",
        variant: "destructive"
      });
    }
  };

  const handleSell = () => {
    const success = openPosition('sell');
    if (success) {
      toast({
        title: "Posición Abierta", 
        description: `Venta ejecutada a $${data.currentPrice.toLocaleString()}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Ya tienes una posición activa", 
        variant: "destructive"
      });
    }
  };

  const handleClosePosition = () => {
    const result = closePosition();
    if (result) {
      setNotification(result);
      toast({
        title: "Posición Cerrada",
        description: `${result.isProfit ? '¡Ganancia!' : 'Pérdida'} ${result.trade.profit.toFixed(2)}%`,
        variant: result.isProfit ? "default" : "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-primary font-audiowide">
            TRADE<span className="text-accent">ARENA</span><span className="text-secondary">X</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido de vuelta, <span className="text-primary font-bold">{data.user.username}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <TradingChart
            priceHistory={data.priceHistory}
            currentPrice={data.currentPrice}
            activePosition={data.activePosition}
          />
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile */}
          <UserProfile
            user={data.user}
            getCurrentRank={getCurrentRank}
            getNextRank={getNextRank}
          />

          {/* Trading Controls */}
          <TradingControls
            activePosition={data.activePosition}
            onBuy={handleBuy}
            onSell={handleSell}
            onClosePosition={handleClosePosition}
            currentPrice={data.currentPrice}
          />
        </div>

        {/* Recent Trades - Full width on small screens, 2 columns on large */}
        <div className="lg:col-span-4">
          <RecentTrades trades={data.recentTrades} />
        </div>
      </div>

      {/* Trade Notification */}
      {notification && (
        <TradeNotification
          trade={notification.trade}
          earnedXP={notification.earnedXP}
          isProfit={notification.isProfit}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};