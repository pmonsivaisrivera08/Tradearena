import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Target, X, TrendingDown, Activity } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';

export const RiskMetrics = () => {
  const { metrics, alerts, markAlertAsRead, getDiversificationScore } = usePortfolio();

  const diversificationScore = getDiversificationScore();
  
  const riskMetrics = [
    {
      title: 'Score de Riesgo',
      value: metrics?.risk_score || 0,
      max: 100,
      color: getRiskColor(metrics?.risk_score || 0),
      icon: Shield,
      description: 'Evaluación general del riesgo del portfolio'
    },
    {
      title: 'Max Drawdown',
      value: Math.abs(metrics?.max_drawdown || 0),
      max: 50,
      color: 'destructive',
      icon: TrendingDown,
      description: 'Máxima pérdida desde el pico histórico'
    },
    {
      title: 'Diversificación',
      value: diversificationScore,
      max: 100,
      color: diversificationScore > 60 ? 'primary' : diversificationScore > 30 ? 'secondary' : 'destructive',
      icon: Target,
      description: 'Nivel de diversificación del portfolio'
    },
    {
      title: 'Volatilidad',
      value: calculateVolatility(),
      max: 100,
      color: 'accent',
      icon: Activity,
      description: 'Medida de la variabilidad de los retornos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Alertas de riesgo */}
      {alerts.length > 0 && (
        <Card className="hud-border border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg font-audiowide text-destructive flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              ALERTAS DE RIESGO ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={`border-${getSeverityColor(alert.severity)}/50`}>
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex-1">
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getSeverityVariant(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{alert.alert_type}</span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAlertAsRead(alert.id)}
                        className="ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas de riesgo */}
      <Card className="hud-border">
        <CardHeader>
          <CardTitle className="text-lg font-audiowide text-primary flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            MÉTRICAS DE RIESGO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className={`w-5 h-5 text-${metric.color}`} />
                    <span className="font-medium">{metric.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {metric.value.toFixed(metric.title === 'Diversificación' ? 0 : 1)}
                      {metric.title === 'Max Drawdown' ? '%' : metric.title === 'Diversificación' ? '%' : ''}
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className="h-2"
                />
                
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>

                {/* Recomendaciones específicas */}
                <div className="mt-2">
                  {getRecommendation(metric.title, metric.value)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis de exposición */}
      <Card className="hud-border">
        <CardHeader>
          <CardTitle className="text-lg font-audiowide text-primary">
            ANÁLISIS DE EXPOSICIÓN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary mb-2">
                {metrics?.sharpe_ratio?.toFixed(2) || 'N/A'}
              </div>
              <div className="font-medium mb-1">Sharpe Ratio</div>
              <div className="text-xs text-muted-foreground">
                Retorno ajustado por riesgo
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-secondary mb-2">
                {calculateCorrelation().toFixed(2)}
              </div>
              <div className="font-medium mb-1">Correlación</div>
              <div className="text-xs text-muted-foreground">
                Correlación promedio entre activos
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-accent mb-2">
                {calculateVaR().toFixed(1)}%
              </div>
              <div className="font-medium mb-1">VaR 95%</div>
              <div className="text-xs text-muted-foreground">
                Valor en riesgo (95% confianza)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getRiskColor(score: number): string {
  if (score < 25) return 'primary';
  if (score < 50) return 'secondary';
  if (score < 75) return 'accent';
  return 'destructive';
}

function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'low': return 'primary';
    case 'medium': return 'secondary';
    case 'high': return 'accent';
    case 'critical': return 'destructive';
    default: return 'muted';
  }
}

function getSeverityVariant(severity: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (severity.toLowerCase()) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    default: return 'outline';
  }
}

function getRecommendation(title: string, value: number) {
  switch (title) {
    case 'Score de Riesgo':
      if (value > 75) return (
        <Badge variant="destructive" className="text-xs">
          Riesgo muy alto - Considere reducir exposición
        </Badge>
      );
      if (value > 50) return (
        <Badge variant="secondary" className="text-xs">
          Riesgo moderado - Monitoree de cerca
        </Badge>
      );
      return (
        <Badge variant="outline" className="text-xs">
          Riesgo bajo - Portfolio saludable
        </Badge>
      );
      
    case 'Diversificación':
      if (value < 30) return (
        <Badge variant="destructive" className="text-xs">
          Baja diversificación - Agregue más activos
        </Badge>
      );
      if (value < 60) return (
        <Badge variant="secondary" className="text-xs">
          Diversificación moderada
        </Badge>
      );
      return (
        <Badge variant="outline" className="text-xs">
          Bien diversificado
        </Badge>
      );
      
    case 'Max Drawdown':
      if (value > 20) return (
        <Badge variant="destructive" className="text-xs">
          Drawdown alto - Revise estrategia
        </Badge>
      );
      return (
        <Badge variant="outline" className="text-xs">
          Drawdown controlado
        </Badge>
      );
      
    default:
      return null;
  }
}

function calculateVolatility(): number {
  // Simulación de cálculo de volatilidad
  return Math.random() * 40 + 10;
}

function calculateCorrelation(): number {
  // Simulación de correlación promedio
  return Math.random() * 0.8 + 0.1;
}

function calculateVaR(): number {
  // Simulación de Value at Risk
  return Math.random() * 15 + 5;
}