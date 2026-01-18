'use client';

import { useState } from 'react';

interface JunglerMatchup {
  enemyJungler: string;
  games: number;
  wins: number;
  losses: number;
  winRate: string;
  kda: string;
  avgKills: string;
  avgDeaths: string;
  avgAssists: string;
  avgGold: number;
  avgDamage: number;
}

interface JunglerMatchupsProps {
  matchups: JunglerMatchup[];
}

type SortField = 'games' | 'winRate' | 'kda' | 'avgGold' | 'avgDamage';

export default function JunglerMatchups({ matchups }: JunglerMatchupsProps) {
  const [sortField, setSortField] = useState<SortField>('games');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedMatchups = [...matchups].sort((a, b) => {
    let aVal: number, bVal: number;

    switch (sortField) {
      case 'games':
        aVal = a.games;
        bVal = b.games;
        break;
      case 'winRate':
        aVal = parseFloat(a.winRate);
        bVal = parseFloat(b.winRate);
        break;
      case 'kda':
        aVal = a.kda === 'Perfect' ? 999 : parseFloat(a.kda);
        bVal = b.kda === 'Perfect' ? 999 : parseFloat(b.kda);
        break;
      case 'avgGold':
        aVal = a.avgGold;
        bVal = b.avgGold;
        break;
      case 'avgDamage':
        aVal = a.avgDamage;
        bVal = b.avgDamage;
        break;
      default:
        return 0;
    }

    return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      {label}
      {sortField === field && (
        <svg
          className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );

  if (!matchups || matchups.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">⚔️ Jungler Matchups</h2>
      <p className="text-gray-400 text-sm mb-4">
        Your performance against enemy junglers. Click headers to sort.
      </p>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-300">Enemy Jungler</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">
                  <SortButton field="games" label="Games" />
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">
                  <SortButton field="winRate" label="Win Rate" />
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">W-L</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">
                  <SortButton field="kda" label="KDA" />
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">K/D/A Avg</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">
                  <SortButton field="avgGold" label="Avg Gold" />
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-300">
                  <SortButton field="avgDamage" label="Avg Dmg" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedMatchups.map((matchup) => (
                <tr key={matchup.enemyJungler} className="hover:bg-gray-750 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${matchup.enemyJungler}.png`}
                        alt={matchup.enemyJungler}
                        className="w-10 h-10 rounded"
                      />
                      <span className="font-medium text-white">{matchup.enemyJungler}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-white">{matchup.games}</td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${getWinRateColor(matchup.winRate)}`}>
                      {matchup.winRate}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">{matchup.wins}</span>
                    <span className="text-gray-500"> - </span>
                    <span className="text-red-400">{matchup.losses}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${getKDAColor(matchup.kda)}`}>
                      {matchup.kda}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-400 text-sm">
                    {matchup.avgKills} / {matchup.avgDeaths} / {matchup.avgAssists}
                  </td>
                  <td className="p-4 text-center text-yellow-400 text-sm">
                    {matchup.avgGold.toLocaleString()}
                  </td>
                  <td className="p-4 text-center text-orange-400 text-sm">
                    {matchup.avgDamage.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        💡 Tip: Low winrate matchups show where you can improve. High gold/damage with low winrate suggests
        you need to focus on objectives and map pressure, not just fighting.
      </div>
    </div>
  );
}
