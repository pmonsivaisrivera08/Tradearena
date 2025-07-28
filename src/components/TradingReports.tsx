import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradeReport {
  id: string;
  period_start: string;
  period_end: string;
  total_trades: number;
  profitable_trades: number;
  total_volume: number;
  total_pnl: number;
  fees_paid: number;
  report_type: string;
}

export const TradingReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [reports] = useState<TradeReport[]>([
    {
      id: '1',
      period_start: '2024-06-01',
      period_end: '2024-06-30',
      total_trades: 45,
      profitable_trades: 32,
      total_volume: 125000,
      total_pnl: 8500,
      fees_paid: 125,
      report_type: 'monthly'
    },
    {
      id: '2',
      period_start: '2024-05-01',
      period_end: '2024-05-31',
      total_trades: 38,
      profitable_trades: 25,
      total_volume: 98000,
      total_pnl: 6200,
      fees_paid: 98,
      report_type: 'monthly'
    },
    {
      id: '3',
      period_start: '2024-04-01',
      period_end: '2024-04-30',
      total_trades: 52,
      profitable_trades: 34,
      total_volume: 156000,
      total_pnl: 9800,
      fees_paid: 156,
      report_type: 'monthly'
    }
  ]);

  const { toast } = useToast();

  const generateReport = () => {
    toast({
      title: 'Generando Reporte',
      description: 'El reporte se está generando y será descargado automáticamente.',
    });
    
    // Simular generación de reporte
    setTimeout(() => {
      toast({
        title: 'Reporte Generado',
        description: 'El reporte ha sido generado exitosamente.',
      });
    }, 2000);
  };

  const exportReport = (reportId: string, format: string) => {
    toast({
      title: 'Exportando Reporte',
      description: `Exportando reporte en formato ${format.toUpperCase()}...`,
    });
  };

  const filteredReports = reports.filter(report => report.report_type === selectedPeriod);

  // Métricas resumen
  const totalTrades = filteredReports.reduce((sum, r) => sum + r.total_trades, 0);
  const totalProfitable = filteredReports.reduce((sum, r) => sum + r.profitable_trades, 0);
  const totalVolume = filteredReports.reduce((sum, r) => sum + r.total_volume, 0);
  const totalPnL = filteredReports.reduce((sum, r) => sum + r.total_pnl, 0);
  const winRate = totalTrades > 0 ? (totalProfitable / totalTrades) * 100 : 0;

  const summaryCards = [
    {
      title: 'Total Trades',
      value: totalTrades.toLocaleString(),
      icon: BarChart3,
      color: 'text-primary'
    },
    {
      title: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: winRate > 70 ? 'text-primary' : winRate > 50 ? 'text-secondary' : 'text-destructive'
    },
    {
      title: 'Volumen Total',
      value: `$${totalVolume.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-accent'
    },
    {
      title: 'P&L Total',
      value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`,
      icon: TrendingUp,
      color: totalPnL >= 0 ? 'text-primary' : 'text-destructive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card className="hud-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-audiowide text-primary flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              REPORTES DE TRADING
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={generateReport} className="bg-primary hover:bg-primary/90">
                <Calendar className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="hud-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-primary/10`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla de reportes */}
      <Card className="hud-border">
        <CardHeader>
          <CardTitle className="text-lg">Historial de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Volumen</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const winRate = report.total_trades > 0 ? (report.profitable_trades / report.total_trades) * 100 : 0;
                
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {report.report_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.total_trades}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.profitable_trades} ganadores
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={winRate > 70 ? 'default' : winRate > 50 ? 'secondary' : 'destructive'}
                      >
                        {winRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${report.total_volume.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${
                        report.total_pnl >= 0 ? 'text-primary' : 'text-destructive'
                      }`}>
                        {report.total_pnl >= 0 ? '+' : ''}${report.total_pnl.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        ${report.fees_paid.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportReport(report.id, 'pdf')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportReport(report.id, 'csv')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hud-border">
          <CardHeader>
            <CardTitle className="text-lg">Análisis de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span>Mejor Mes</span>
                <span className="font-bold text-primary">Abril 2024 (+$9,800)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span>Peor Mes</span>
                <span className="font-bold text-destructive">Mayo 2024 (+$6,200)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span>Promedio Mensual</span>
                <span className="font-bold text-accent">+$8,167</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span>Consistencia</span>
                <Badge variant="default">Alta (100% meses positivos)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hud-border">
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas Avanzadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span>Factor de Ganancia</span>
                <span className="font-bold text-primary">2.45</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span>Trades/Mes Promedio</span>
                <span className="font-bold text-secondary">45</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span>Comisiones Totales</span>
                <span className="font-bold text-accent">$379</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span>ROI Mensual Promedio</span>
                <span className="font-bold text-primary">8.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};