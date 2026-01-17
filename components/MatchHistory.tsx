'use client';

import { Match } from '@/types/riot';

interface MatchHistoryProps {
  matches: Match[];
  puuid: string;
}

export default function MatchHistory({ matches, puuid }: MatchHistoryProps) {
  const getTimeSince = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getGameDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const jungleMatches = matches.filter((match) => {
    const player = match.info.participants.find((p) => p.puuid === puuid);
    return player?.individualPosition === 'JUNGLE';
  });

  if (jungleMatches.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-400">
            No jungle games found in recent matches. Try playing some jungle games!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">📜 Recent Jungle Matches</h2>

      <div className="space-y-3">
        {jungleMatches.slice(0, 10).map((match) => {
          const player = match.info.participants.find((p) => p.puuid === puuid)!;
          const isWin = player.win;
          const kda = player.deaths > 0
            ? ((player.kills + player.assists) / player.deaths).toFixed(2)
            : 'Perfect';

          return (
            <div
              key={match.metadata.matchId}
              className={`rounded-lg p-4 border-l-4 ${
                isWin
                  ? 'bg-blue-900/20 border-blue-500'
                  : 'bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Champion & Result */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${player.championName}.png`}
                      alt={player.championName}
                      className="w-16 h-16 rounded-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded px-1.5 py-0.5 text-xs font-bold">
                      {player.champLevel}
                    </div>
                  </div>

                  <div>
                    <div className={`font-bold text-lg ${isWin ? 'text-blue-400' : 'text-red-400'}`}>
                      {isWin ? 'VICTORY' : 'DEFEAT'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {getTimeSince(match.info.gameCreation)} • {getGameDuration(match.info.gameDuration)}
                    </div>
                  </div>
                </div>

                {/* Middle: KDA & Stats */}
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">
                      {player.kills} / {player.deaths} / {player.assists}
                    </div>
                    <div className="text-sm text-gray-400">
                      {kda} KDA
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold text-white">
                      {player.totalMinionsKilled + player.neutralMinionsKilled}
                    </div>
                    <div className="text-sm text-gray-400">CS</div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold text-white">
                      {player.visionScore}
                    </div>
                    <div className="text-sm text-gray-400">Vision</div>
                  </div>
                </div>

                {/* Right: Jungle-specific */}
                <div className="text-right">
                  {player.challenges && (
                    <div className="flex gap-4 text-sm">
                      {player.challenges.dragonTakedowns !== undefined && (
                        <div>
                          <span className="text-orange-400">🐉 {player.challenges.dragonTakedowns}</span>
                        </div>
                      )}
                      {player.challenges.baronTakedowns !== undefined && (
                        <div>
                          <span className="text-purple-400">👑 {player.challenges.baronTakedowns}</span>
                        </div>
                      )}
                      {player.challenges.epicMonsterSteals !== undefined && player.challenges.epicMonsterSteals > 0 && (
                        <div>
                          <span className="text-yellow-400">⭐ {player.challenges.epicMonsterSteals}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {(player.totalDamageDealtToChampions / 1000).toFixed(1)}k dmg
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
