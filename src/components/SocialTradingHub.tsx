import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialChat } from './SocialChat';
import { TopTraders } from './TopTraders';
import { StrategySharing } from './StrategySharing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Share2, TrendingUp } from 'lucide-react';

export const SocialTradingHub = () => {
  return (
    <Card className="hud-border">
      <CardHeader>
        <CardTitle className="text-lg font-audiowide text-primary flex items-center">
          <Users className="w-5 h-5 mr-2" />
          SOCIAL TRADING HUB
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="traders" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Top Traders</span>
            </TabsTrigger>
            <TabsTrigger value="strategies" className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Estrategias</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-4">
            <SocialChat />
          </TabsContent>
          
          <TabsContent value="traders" className="mt-4">
            <TopTraders />
          </TabsContent>
          
          <TabsContent value="strategies" className="mt-4">
            <StrategySharing />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};