import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, LogIn, TrendingUp } from 'lucide-react';

export const AuthScreen = () => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    if (signUpData.username.length < 3) {
      toast({
        title: "Error", 
        description: "El nombre de usuario debe tener al menos 3 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.username);

    if (error) {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "¡Registro exitoso!",
        description: "Bienvenido a TradeArenaX. ¡Comienza tu aventura!"
      });
    }

    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(signInData.email, signInData.password);

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Iniciando sesión en TradeArenaX..."
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4"
         style={{
           background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.1) 0%, hsl(var(--background)) 70%)'
         }}>
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-black text-primary font-audiowide">
              TRADE<span className="text-accent">ARENA</span><span className="text-secondary">X</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Entra a la arena y demuestra tus habilidades de trading
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center font-orbitron">
              Acceso a la Arena
            </CardTitle>
            <CardDescription className="text-center">
              Únete a la comunidad de traders más competitiva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="font-orbitron">
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="signup" className="font-orbitron">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Contraseña"
                      value={signInData.password}
                      onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full font-orbitron"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando..." : "Entrar a la Arena"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Nombre de usuario"
                      value={signUpData.username}
                      onChange={(e) => setSignUpData({...signUpData, username: e.target.value})}
                      required
                      disabled={isLoading}
                      minLength={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Contraseña"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Confirmar contraseña"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full font-orbitron"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrando..." : "Unirse a la Arena"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>¿Primera vez aquí? Crea tu cuenta y comienza tu journey como trader.</p>
        </div>
      </div>
    </div>
  );
};