'use client';

import { Summoner, RankedStats } from '@/types/riot';

interface SummonerProfileProps {
  summoner: Summoner;
  rankedStats: RankedStats[];
}

export default function SummonerProfile({ summoner, rankedStats }: SummonerProfileProps) {
  const soloQueueStats = rankedStats.find((stat) => stat.queueType === 'RANKED_SOLO_5x5');

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      IRON: 'text-gray-500',
      BRONZE: 'text-amber-700',
      SILVER: 'text-gray-400',
      GOLD: 'text-yellow-500',
      PLATINUM: 'text-cyan-400',
      EMERALD: 'text-emerald-500',
      DIAMOND: 'text-blue-400',
      MASTER: 'text-purple-500',
      GRANDMASTER: 'text-red-500',
      CHALLENGER: 'text-yellow-300',
    };
    return colors[tier] || 'text-white';
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-6">
          {/* Profile Icon */}
          <div className="relative">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner.profileIconId}.png`}
              alt="Profile Icon"
              className="w-24 h-24 rounded-full border-4 border-gray-700"
            />
            <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full px-3 py-1 border-2 border-gray-700">
              <span className="text-sm font-bold text-yellow-400">{summoner.summonerLevel}</span>
            </div>
          </div>

          {/* Summoner Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{summoner.name}</h1>

            {soloQueueStats ? (
              <div className="flex items-center gap-4">
                <div>
                  <span className={`text-2xl font-bold ${getTierColor(soloQueueStats.tier)}`}>
                    {soloQueueStats.tier} {soloQueueStats.rank}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {soloQueueStats.leaguePoints} LP
                  </span>
                </div>
                {soloQueueStats.hotStreak && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    🔥 HOT STREAK
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Unranked</p>
            )}
          </div>

          {/* Win Rate Stats */}
          {soloQueueStats && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Solo/Duo</div>
              <div className="text-2xl font-bold text-white">
                {soloQueueStats.wins}W {soloQueueStats.losses}L
              </div>
              <div className="text-sm text-gray-400">
                {((soloQueueStats.wins / (soloQueueStats.wins + soloQueueStats.losses)) * 100).toFixed(1)}% WR
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
