import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/components/AuthScreen';
import { TradingDashboard } from '@/components/TradingDashboard';

const Index = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-audiowide text-primary">
            TRADE<span className="text-accent">ARENA</span><span className="text-secondary">X</span>
          </div>
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {!user ? (
        <AuthScreen />
      ) : (
        <TradingDashboard onLogout={handleLogout} />
      )}
    </>
  );
};

export default Index;
