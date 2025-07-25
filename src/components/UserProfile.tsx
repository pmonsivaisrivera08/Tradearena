import { Trophy, Star, TrendingUp, Target } from 'lucide-react';

interface UserProfileProps {
  user: {
    username: string;
    xp: number;
    level: number;
    rank: string;
    totalTrades: number;
    profitableTrades: number;
    currentBalance: number;
  };
  getCurrentRank: (xp: number) => any;
  getNextRank: (xp: number) => any;
}

export const UserProfile = ({ user, getCurrentRank, getNextRank }: UserProfileProps) => {
  const currentRank = getCurrentRank(user.xp);
  const nextRank = getNextRank(user.xp);
  
  const progressToNext = nextRank 
    ? ((user.xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100 
    : 100;

  const winRate = user.totalTrades > 0 ? (user.profitableTrades / user.totalTrades) * 100 : 0;

  const getRankColor = (color: string) => {
    switch (color) {
      case 'rank-bronze': return 'text-rank-bronze';
      case 'rank-silver': return 'text-rank-silver';
      case 'rank-gold': return 'text-rank-gold';
      case 'rank-diamond': return 'text-rank-diamond';
      case 'rank-master': return 'text-rank-master';
      case 'gold': return 'text-gold';
      default: return 'text-primary';
    }
  };

  return (
    <div className="hud-border rounded-xl p-6">
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4 neon-glow">
          <Trophy className="w-8 h-8 text-background" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-audiowide">
            {user.username}
          </h2>
          <p className={`text-sm font-bold ${getRankColor(currentRank.color)}`}>
            {user.rank}
          </p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Experiencia</span>
          <span className="text-sm font-bold text-foreground">
            {user.xp} XP {nextRank && `/ ${nextRank.minXP} XP`}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="xp-fill h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
        {nextRank && (
          <p className="text-xs text-muted-foreground mt-1">
            {nextRank.minXP - user.xp} XP hasta <span className={getRankColor(nextRank.color)}>{nextRank.name}</span>
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted/30 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-primary mr-1" />
          </div>
          <p className="text-2xl font-bold text-foreground">{user.totalTrades}</p>
          <p className="text-xs text-muted-foreground">Total Trades</p>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-profit mr-1" />
          </div>
          <p className="text-2xl font-bold text-profit">{winRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-accent mr-1" />
          </div>
          <p className="text-2xl font-bold text-accent">{user.profitableTrades}</p>
          <p className="text-xs text-muted-foreground">Profitable</p>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-secondary mr-1" />
          </div>
          <p className="text-2xl font-bold text-secondary">{user.level}</p>
          <p className="text-xs text-muted-foreground">Level</p>
        </div>
      </div>

      {/* Balance */}
      <div className="mt-4 p-4 bg-gradient-to-r from-profit/20 to-primary/20 rounded-lg border border-profit/30">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Portfolio Virtual</p>
          <p className="text-3xl font-bold text-foreground">
            ${user.currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};