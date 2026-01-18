'use client';

import { useState } from 'react';
import SummonerSearch from '@/components/SummonerSearch';
import SummonerProfile from '@/components/SummonerProfile';
import JungleStats from '@/components/JungleStats';
import ChampionStats from '@/components/ChampionStats';
import MatchHistory from '@/components/MatchHistory';
import { Summoner, RankedStats, Match } from '@/types/riot';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [rankedStats, setRankedStats] = useState<RankedStats[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [jungleStats, setJungleStats] = useState<any>(null);
  const [championStats, setChampionStats] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentStart, setCurrentStart] = useState(0);

  const handleSearch = async (gameName: string, tagLine: string) => {
    setLoading(true);
    setError(null);
    setSummoner(null);
    setRankedStats([]);
    setMatches([]);
    setJungleStats(null);
    setChampionStats([]);
    setCurrentStart(0);
    setHasMore(false);

    try {
      // Fetch summoner info
      const summonerResponse = await fetch(
        `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      );

      if (!summonerResponse.ok) {
        const errorData = await summonerResponse.json();
        throw new Error(errorData.error || 'Failed to fetch summoner');
      }

      const { summoner: summonerData, rankedStats: rankedData } = await summonerResponse.json();
      setSummoner(summonerData);
      setRankedStats(rankedData);

      // Fetch match history
      const matchesResponse = await fetch(
        `/api/matches?puuid=${summonerData.puuid}&count=20&start=0&returnCount=10`
      );

      if (!matchesResponse.ok) {
        const errorData = await matchesResponse.json();
        throw new Error(errorData.error || 'Failed to fetch matches');
      }

      const { matches: matchesData, jungleStats: jungleStatsData, championStats: championStatsData, cacheInfo } = await matchesResponse.json();
      setMatches(matchesData);
      setJungleStats(jungleStatsData);
      setChampionStats(championStatsData || []);
      setHasMore(cacheInfo.hasMore);
      setCurrentStart(10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!summoner || loadingMore) return;

    setLoadingMore(true);
    try {
      const matchesResponse = await fetch(
        `/api/matches?puuid=${summoner.puuid}&count=20&start=${currentStart}&returnCount=10`
      );

      if (!matchesResponse.ok) {
        const errorData = await matchesResponse.json();
        throw new Error(errorData.error || 'Failed to fetch more matches');
      }

      const { matches: newMatches, cacheInfo } = await matchesResponse.json();
      setMatches(prev => [...prev, ...newMatches]);
      setHasMore(cacheInfo.hasMore);
      setCurrentStart(prev => prev + 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more matches');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white text-center">
            🌲 Jungle Dashboard
          </h1>
          <p className="text-gray-400 text-center mt-2">
            Track your jungle performance and climb to Diamond
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search */}
        <SummonerSearch onSearch={handleSearch} loading={loading} />

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-red-400 font-medium">Error: {error}</p>
              <p className="text-red-300 text-sm mt-1">
                Make sure you entered the correct Riot ID (Name#TAG)
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading summoner data...</p>
          </div>
        )}

        {/* Results */}
        {summoner && !loading && (
          <>
            <SummonerProfile summoner={summoner} rankedStats={rankedStats} />

            {/* Champion Stats - Always show if we have matches */}
            {championStats.length > 0 && (
              <ChampionStats stats={championStats} />
            )}

            {jungleStats ? (
              <>
                <JungleStats stats={jungleStats} />
                <MatchHistory matches={matches} puuid={summoner.puuid} />

                {/* Load More Button */}
                {hasMore && (
                  <div className="w-full max-w-4xl mx-auto mt-6 mb-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Loading more matches...
                        </>
                      ) : (
                        <>
                          Load More Matches
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-6 text-center">
                  <p className="text-yellow-400 font-medium text-lg mb-2">
                    No jungle games found
                  </p>
                  <p className="text-yellow-300 text-sm">
                    This summoner hasn't played any ranked jungle games recently. Try playing some jungle matches!
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Welcome State */}
        {!summoner && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to Your Jungle Dashboard
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Enter your Riot ID above to view your jungle performance stats, track your progress,
              and identify areas for improvement on your climb to Diamond.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-bold text-white mb-2">Performance Metrics</h3>
                <p className="text-sm text-gray-400">
                  Track your KDA, CS/min, vision score, and objective control
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-bold text-white mb-2">Jungle-Specific Stats</h3>
                <p className="text-sm text-gray-400">
                  Monitor dragons, barons, and epic monster steals
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-bold text-white mb-2">Match History</h3>
                <p className="text-sm text-gray-400">
                  Review recent games with detailed breakdowns
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Jungle Dashboard - Built for competitive players</p>
          <p className="mt-1">Data provided by Riot Games API</p>
        </div>
      </footer>
    </div>
  );
}
