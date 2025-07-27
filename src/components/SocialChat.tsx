import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  message_type: 'general' | 'trade_alert' | 'strategy';
  created_at: string;
  profiles?: {
    username: string;
  };
}

export const SocialChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'general' | 'trade_alert' | 'strategy'>('general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMessages();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Simular datos de perfil por ahora
      const messagesWithProfiles = data?.map(msg => ({
        ...msg,
        message_type: msg.message_type as 'general' | 'trade_alert' | 'strategy',
        profiles: { username: `Usuario ${msg.user_id.slice(-4)}` }
      })) || [];

      setMessages(messagesWithProfiles.reverse());
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: newMessage.trim(),
          message_type: messageType
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje se ha publicado en el chat",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'trade_alert':
        return <AlertTriangle className="w-4 h-4 text-accent" />;
      case 'strategy':
        return <TrendingUp className="w-4 h-4 text-profit" />;
      default:
        return <MessageCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'trade_alert':
        return 'border-l-accent';
      case 'strategy':
        return 'border-l-profit';
      default:
        return 'border-l-border';
    }
  };

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case 'trade_alert':
        return { label: 'ALERTA', color: 'bg-accent/20 text-accent' };
      case 'strategy':
        return { label: 'ESTRATEGIA', color: 'bg-profit/20 text-profit' };
      default:
        return { label: 'GENERAL', color: 'bg-muted/20 text-muted-foreground' };
    }
  };

  return (
    <Card className="hud-border h-96">
      <CardHeader>
        <CardTitle className="text-lg font-audiowide text-primary flex items-center">
          <Users className="w-5 h-5 mr-2" />
          CHAT SOCIAL
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mensajes */}
        <ScrollArea className="h-64 px-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">
                Cargando chat...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                No hay mensajes aún
              </p>
              <p className="text-xs text-muted-foreground">
                ¡Sé el primero en escribir!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const badge = getMessageTypeBadge(message.message_type);
                
                return (
                  <div
                    key={message.id}
                    className={`p-3 border-l-4 rounded-r-lg bg-card/50 ${getMessageTypeColor(message.message_type)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getMessageIcon(message.message_type)}
                        <span className="font-medium text-sm">
                          {message.profiles?.username || 'Usuario Anónimo'}
                        </span>
                        <Badge className={`${badge.color} text-xs`}>
                          {badge.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input de mensaje */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Button
              size="sm"
              variant={messageType === 'general' ? 'default' : 'outline'}
              onClick={() => setMessageType('general')}
              className="text-xs"
            >
              General
            </Button>
            <Button
              size="sm"
              variant={messageType === 'trade_alert' ? 'default' : 'outline'}
              onClick={() => setMessageType('trade_alert')}
              className="text-xs"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Alerta
            </Button>
            <Button
              size="sm"
              variant={messageType === 'strategy' ? 'default' : 'outline'}
              onClick={() => setMessageType('strategy')}
              className="text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Estrategia
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Presiona Enter para enviar</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-profit rounded-full animate-pulse"></div>
              <span>En línea</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};