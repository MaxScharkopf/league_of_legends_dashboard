'use client';

interface ChampionStat {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: string;
  kda: string;
  avgKills: string;
  avgDeaths: string;
  avgAssists: string;
}

interface ChampionStatsProps {
  stats: ChampionStat[];
}

export default function ChampionStats({ stats }: ChampionStatsProps) {
  const getWinRateColor = (wr: string) => {
    const wrNum = parseFloat(wr);
    if (wrNum >= 55) return 'text-green-400';
    if (wrNum >= 50) return 'text-blue-400';
    if (wrNum >= 45) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getKDAColor = (kda: string) => {
    if (kda === 'Perfect') return 'text-yellow-400';
    const kdaNum = parseFloat(kda);
    if (kdaNum >= 4) return 'text-yellow-400';
    if (kdaNum >= 3) return 'text-green-400';
    if (kdaNum >= 2) return 'text-blue-400';
    return 'text-gray-400';
  };

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">⚔️ Champion Statistics</h2>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-300">Champion</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">Games</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">Win Rate</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">W-L</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">KDA</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">K/D/A Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {stats.map((champ, index) => (
                <tr key={champ.championName} className="hover:bg-gray-750 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-white">{champ.championName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-white">{champ.games}</td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${getWinRateColor(champ.winRate)}`}>
                      {champ.winRate}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">{champ.wins}</span>
                    <span className="text-gray-500"> - </span>
                    <span className="text-red-400">{champ.losses}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${getKDAColor(champ.kda)}`}>
                      {champ.kda}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-400 text-sm">
                    {champ.avgKills} / {champ.avgDeaths} / {champ.avgAssists}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
