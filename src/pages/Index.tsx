import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { TradingDashboard } from '@/components/TradingDashboard';
import { useTrading } from '@/hooks/useTrading';

const Index = () => {
  const [gameState, setGameState] = useState<'welcome' | 'trading'>('welcome');
  const { data, setUsername } = useTrading();

  // Check if user is already logged in
  useEffect(() => {
    if (data.user.username) {
      setGameState('trading');
    }
  }, [data.user.username]);

  const handleStart = (username: string) => {
    setUsername(username);
    setGameState('trading');
  };

  const handleLogout = () => {
    localStorage.removeItem('tradeArenaX');
    setGameState('welcome');
    window.location.reload(); // Force reload to reset state
  };

  if (gameState === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return <TradingDashboard onLogout={handleLogout} />;
};

export default Index;
