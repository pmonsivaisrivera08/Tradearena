import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioOverview } from './PortfolioOverview';
import { PerformanceAnalytics } from './PerformanceAnalytics';
import { RiskMetrics } from './RiskMetrics';
import { TradingReports } from './TradingReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, BarChart3, Shield, FileText } from 'lucide-react';

export const PortfolioHub = () => {
  return (
    <Card className="hud-border">
      <CardHeader>
        <CardTitle className="text-lg font-audiowide text-primary flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          PORTFOLIO MANAGEMENT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Riesgo</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Reportes</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <PortfolioOverview />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <PerformanceAnalytics />
          </TabsContent>
          
          <TabsContent value="risk" className="mt-6">
            <RiskMetrics />
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <TradingReports />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};