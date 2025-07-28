import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Target, AlertTriangle } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';

export const PortfolioOverview = () => {
  const { 
    positions, 
    metrics, 
    getPortfolioValue, 
    getTotalPnL, 
    getDiversificationScore,
    loading 
  } = usePortfolio();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="hud-border animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const portfolioValue = getPortfolioValue();
  const totalPnL = getTotalPnL();
  const pnlPercentage = portfolioValue > 0 ? (totalPnL / portfolioValue) * 100 : 0;
  const diversificationScore = getDiversificationScore();

  const cards = [
    {
      title: 'Valor Total',
      value: `$${portfolioValue.toLocaleString()}`,
      icon: DollarSign,
      change: `${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%`,
      trend: pnlPercentage >= 0 ? 'up' : 'down'
    },
    {
      title: 'P&L No Realizado',
      value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`,
      icon: pnlPercentage >= 0 ? TrendingUp : TrendingDown,
      change: metrics ? `Win Rate: ${metrics.win_rate.toFixed(1)}%` : 'N/A',
      trend: pnlPercentage >= 0 ? 'up' : 'down'
    },
    {
      title: 'Diversificación',
      value: `${diversificationScore}%`,
      icon: PieChart,
      change: `${positions.length} activos`,
      trend: diversificationScore > 60 ? 'up' : 'down'
    },
    {
      title: 'Score de Riesgo',
      value: metrics?.risk_score ? `${metrics.risk_score}/100` : 'N/A',
      icon: Target,
      change: getRiskLevel(metrics?.risk_score || 0),
      trend: (metrics?.risk_score || 0) < 50 ? 'up' : 'down'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="hud-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <div className="text-2xl font-bold text-primary">
                    {card.value}
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={card.trend === 'up' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {card.change}
                    </Badge>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${
                  card.trend === 'up' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de posiciones principales */}
      <Card className="hud-border">
        <CardHeader>
          <CardTitle className="text-lg font-audiowide text-primary flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            POSICIONES PRINCIPALES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tienes posiciones activas</p>
              <p className="text-sm">Ejecuta tu primera operación para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.slice(0, 5).map((position) => {
                const percentage = portfolioValue > 0 ? (position.current_value / portfolioValue) * 100 : 0;
                const pnl = position.unrealized_pnl;
                const pnlPerc = position.total_invested > 0 ? (pnl / position.total_invested) * 100 : 0;

                return (
                  <div key={position.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {position.symbol.substring(0, 3)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{position.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {position.quantity.toFixed(4)} unidades
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        ${position.current_value.toLocaleString()}
                      </div>
                      <div className={`text-sm ${pnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPerc >= 0 ? '+' : ''}{pnlPerc.toFixed(2)}%)
                      </div>
                    </div>

                    <div className="w-20">
                      <div className="text-xs text-muted-foreground mb-1">
                        {percentage.toFixed(1)}%
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function getRiskLevel(score: number): string {
  if (score < 25) return 'Bajo';
  if (score < 50) return 'Moderado';
  if (score < 75) return 'Alto';
  return 'Muy Alto';
}