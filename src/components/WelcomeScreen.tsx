import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Shield, Trophy, Zap } from 'lucide-react';
import heroImage from '@/assets/trading-arena-bg.jpg';

interface WelcomeScreenProps {
  onStart: (username: string) => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'welcome' | 'register'>('welcome');

  const handleStart = () => {
    if (username.trim()) {
      onStart(username.trim());
    }
  };

  if (step === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="hud-border rounded-2xl p-8 neon-glow">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="w-12 h-12 text-primary pulse-neon" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-primary font-audiowide">
                INICIALIZAR TRADER
              </h2>
              <p className="text-muted-foreground">
                Ingresa tu callsign para acceder a la arena
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary">
                  NOMBRE DE USUARIO
                </label>
                <Input
                  type="text"
                  placeholder="Ej: CyberTrader2024"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-muted border-primary/30 text-foreground placeholder:text-muted-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('welcome')}
                  className="flex-1"
                >
                  REGRESAR
                </Button>
                <Button
                  onClick={handleStart}
                  disabled={!username.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold neon-glow"
                >
                  INICIAR SESIÓN
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/80"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-accent rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl w-full text-center relative z-10">
        <div className="slide-up">
          <div className="flex items-center justify-center mb-8">
            <TrendingUp className="w-20 h-20 text-primary pulse-neon mr-4" />
            <h1 className="text-6xl font-black text-primary font-audiowide tracking-wider">
              TRADE<span className="text-accent">ARENA</span><span className="text-secondary">X</span>
            </h1>
          </div>

          <p className="text-xl text-foreground mb-4 font-orbitron">
            SIMULADOR DE TRADING COMPETITIVO
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Entra a la arena del trading con estética cyberpunk. Gana XP, sube de rango 
            y conviértete en el <span className="text-gold font-bold">Maestro de Mercado</span> definitivo.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="hud-border rounded-xl p-6 hover:purple-glow transition-all duration-300">
              <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-secondary mb-2">TRADING SIMULADO</h3>
              <p className="text-sm text-muted-foreground">
                Practica sin riesgo real con precios dinámicos
              </p>
            </div>

            <div className="hud-border rounded-xl p-6 hover:neon-glow transition-all duration-300">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary mb-2">SISTEMA DE RANGOS</h3>
              <p className="text-sm text-muted-foreground">
                Desde Pip Novato hasta Maestro de Mercado
              </p>
            </div>

            <div className="hud-border rounded-xl p-6 hover:profit-glow transition-all duration-300">
              <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-bold text-accent mb-2">XP & PROGRESIÓN</h3>
              <p className="text-sm text-muted-foreground">
                Gana experiencia y desbloquea nuevos logros
              </p>
            </div>
          </div>

          <Button
            onClick={() => setStep('register')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 py-4 font-bold neon-glow transform hover:scale-105 transition-all duration-200"
          >
            ENTRAR A LA ARENA
          </Button>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>🎮 Versión Beta v1.0 | Sin riesgo financiero real</p>
          </div>
        </div>
      </div>
    </div>
  );
};