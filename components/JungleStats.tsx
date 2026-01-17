'use client';

interface JungleStatsProps {
  stats: {
    gamesPlayed: number;
    winRate: string;
    kda: string;
    avgKills: string;
    avgDeaths: string;
    avgAssists: string;
    csPerMin: string;
    avgVisionScore: string;
    avgDamage: number;
    dragonsPerGame: string;
    baronsPerGame: string;
    epicStealsPerGame: string;
  };
}

export default function JungleStats({ stats }: JungleStatsProps) {
  const StatCard = ({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );

  const getKDAColor = (kda: string) => {
    if (kda === 'Perfect') return 'text-yellow-400';
    const kdaNum = parseFloat(kda);
    if (kdaNum >= 4) return 'text-yellow-400';
    if (kdaNum >= 3) return 'text-green-400';
    if (kdaNum >= 2) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getWinRateColor = (wr: string) => {
    const wrNum = parseFloat(wr);
    if (wrNum >= 55) return 'text-green-400';
    if (wrNum >= 50) return 'text-blue-400';
    if (wrNum >= 45) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">🌲 Jungle Performance</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Games Played" value={stats.gamesPlayed} />
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Win Rate</div>
          <div className={`text-2xl font-bold ${getWinRateColor(stats.winRate)}`}>
            {stats.winRate}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">KDA</div>
          <div className={`text-2xl font-bold ${getKDAColor(stats.kda)}`}>
            {stats.kda}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.avgKills} / {stats.avgDeaths} / {stats.avgAssists}
          </div>
        </div>
        <StatCard label="CS/Min" value={stats.csPerMin} />
      </div>

      <h3 className="text-lg font-semibold text-white mb-3">🎯 Key Jungle Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Vision Score" value={stats.avgVisionScore} subtitle="per game" />
        <StatCard
          label="Damage"
          value={stats.avgDamage.toLocaleString()}
          subtitle="per game"
        />
        <StatCard label="Dragons" value={stats.dragonsPerGame} subtitle="per game" />
        <StatCard label="Barons" value={stats.baronsPerGame} subtitle="per game" />
      </div>

      {parseFloat(stats.epicStealsPerGame) > 0 && (
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 border border-purple-500">
          <div className="text-sm text-purple-300 mb-1">Epic Monster Steals</div>
          <div className="text-2xl font-bold text-white">
            {stats.epicStealsPerGame} per game
          </div>
          <div className="text-xs text-purple-400 mt-1">
            Keep it up! Baron and Dragon steals win games.
          </div>
        </div>
      )}
    </div>
  );
}
