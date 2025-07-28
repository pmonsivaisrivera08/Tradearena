import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTradingDatabase } from '@/hooks/useTradingDatabase';

export const PerformanceAnalytics = () => {
  const { metrics, positions } = usePortfolio();
  const { data } = useTradingDatabase();

  // Datos para gráfico de performance temporal
  const performanceData = [
    { period: 'Ene', value: 10000, pnl: 0 },
    { period: 'Feb', value: 10500, pnl: 500 },
    { period: 'Mar', value: 11200, pnl: 1200 },
    { period: 'Abr', value: 10800, pnl: 800 },
    { period: 'May', value: 12300, pnl: 2300 },
    { period: 'Jun', value: 11900, pnl: 1900 },
  ];

  // Datos para distribución de activos
  const assetDistribution = positions.map(position => ({
    name: position.symbol,
    value: position.current_value,
    percentage: 0 // Se calculará abajo
  }));

  const totalValue = assetDistribution.reduce((sum, asset) => sum + asset.value, 0);
  assetDistribution.forEach(asset => {
    asset.percentage = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
  });

  // Datos para análisis de trades
  const monthlyTrades = [
    { month: 'Ene', trades: 12, profitable: 8, winRate: 66.7 },
    { month: 'Feb', trades: 15, profitable: 10, winRate: 66.7 },
    { month: 'Mar', trades: 18, profitable: 13, winRate: 72.2 },
    { month: 'Abr', trades: 14, profitable: 9, winRate: 64.3 },
    { month: 'May', trades: 20, profitable: 15, winRate: 75.0 },
    { month: 'Jun', trades: 16, profitable: 11, winRate: 68.8 },
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5a2b'];

  return (
    <Card className="hud-border">
      <CardHeader>
        <CardTitle className="text-lg font-audiowide text-primary flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          ANALYTICS AVANZADOS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4" />
              <span>Distribución</span>
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Trades</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Métricas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de performance histórica */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Performance Histórica</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Métricas de retorno */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Retornos por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { period: 'Diario', value: metrics?.daily_return || 0, color: 'text-primary' },
                      { period: 'Semanal', value: metrics?.weekly_return || 0, color: 'text-secondary' },
                      { period: 'Mensual', value: metrics?.monthly_return || 0, color: 'text-accent' },
                      { period: 'Anual', value: metrics?.yearly_return || 0, color: 'text-muted-foreground' },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="font-medium">{item.period}</span>
                        <span className={`font-bold ${item.color}`}>
                          {item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de torta */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Distribución de Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {assetDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Valor']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lista detallada */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Detalle de Posiciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assetDistribution.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{asset.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${asset.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {asset.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Análisis de Trading Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrades}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="trades" fill="hsl(var(--primary))" name="Total Trades" />
                    <Bar dataKey="profitable" fill="hsl(var(--secondary))" name="Trades Ganadores" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  title: 'Sharpe Ratio', 
                  value: metrics?.sharpe_ratio?.toFixed(2) || 'N/A',
                  description: 'Retorno ajustado por riesgo'
                },
                { 
                  title: 'Max Drawdown', 
                  value: `${metrics?.max_drawdown?.toFixed(2) || 0}%`,
                  description: 'Máxima pérdida desde pico'
                },
                { 
                  title: 'Win Rate', 
                  value: `${metrics?.win_rate?.toFixed(1) || 0}%`,
                  description: 'Porcentaje de trades ganadores'
                },
                { 
                  title: 'Mejor Trade', 
                  value: `${metrics?.best_trade?.toFixed(2) || 0}%`,
                  description: 'Mayor ganancia en un trade'
                },
                { 
                  title: 'Peor Trade', 
                  value: `${metrics?.worst_trade?.toFixed(2) || 0}%`,
                  description: 'Mayor pérdida en un trade'
                },
                { 
                  title: 'Duración Promedio', 
                  value: `${metrics?.avg_trade_duration || 0}h`,
                  description: 'Tiempo promedio por trade'
                }
              ].map((metric, index) => (
                <Card key={index} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {metric.value}
                      </div>
                      <div className="font-medium text-sm mb-2">
                        {metric.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metric.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};