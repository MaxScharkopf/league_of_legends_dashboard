import { NextRequest, NextResponse } from 'next/server';
import { getMatchHistory, getMatchDetails, calculateJungleStats, calculateChampionStats, calculateJunglerMatchups } from '@/lib/riot-api';
import { getCachedMatches, getCachedMatchIds, saveCachedMatches } from '@/lib/cache';

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const puuid = searchParams.get('puuid');
  const region = (searchParams.get('region') || 'na1') as any;
  const count = parseInt(searchParams.get('count') || '20'); // Number of matches to fetch from API
  const start = parseInt(searchParams.get('start') || '0'); // Offset for pagination
  const returnCount = parseInt(searchParams.get('returnCount') || '10'); // Number to return to client

  if (!puuid) {
    return NextResponse.json(
      { error: 'puuid is required' },
      { status: 400 }
    );
  }

  try {
    // Get cached matches first
    const cachedMatches = getCachedMatches(puuid, region);
    const cachedMatchIds = getCachedMatchIds(puuid, region);

    console.log(`Found ${cachedMatches.length} cached matches for ${puuid}`);

    // Get list of recent match IDs from API (fetch more to ensure we get new ones)
    const allMatchIds = await getMatchHistory(puuid, region, count, start);

    // Filter out matches we already have cached
    const newMatchIds = allMatchIds.filter(id => !cachedMatchIds.has(id));

    console.log(`${newMatchIds.length} new matches to fetch from API, ${allMatchIds.length - newMatchIds.length} already cached`);

    // Fetch details only for new matches
    const newMatches = [];
    if (newMatchIds.length > 0) {
      const batchSize = 10;

      for (let i = 0; i < newMatchIds.length; i += batchSize) {
        const batch = newMatchIds.slice(i, i + batchSize);
        const batchPromises = batch.map((matchId) =>
          getMatchDetails(matchId, region).catch(err => {
            console.error(`Failed to fetch match ${matchId}:`, err.message);
            return null; // Return null for failed matches
          })
        );

        const batchResults = await Promise.all(batchPromises);
        newMatches.push(...batchResults.filter(m => m !== null));

        // Add 1.2 second delay between batches to respect rate limits
        if (i + batchSize < newMatchIds.length) {
          await delay(1200);
        }
      }

      // Save new matches to cache
      if (newMatches.length > 0) {
        saveCachedMatches(puuid, region, newMatches);
      }
    }

    // Get all cached matches sorted by date
    const allCachedMatches = getCachedMatches(puuid, region);
    const sortedMatches = allCachedMatches.sort((a, b) => b.info.gameCreation - a.info.gameCreation);

    // Return the requested slice of matches
    const matchesToReturn = sortedMatches.slice(start, start + returnCount);
    const hasMore = sortedMatches.length > start + returnCount;

    // Calculate jungle-specific stats from ALL cached matches (not just returned ones)
    const jungleStats = calculateJungleStats(sortedMatches, puuid);

    // Calculate champion stats from ALL cached matches
    const championStats = calculateChampionStats(sortedMatches, puuid);

    // Calculate jungler matchup stats from ALL cached matches
    const junglerMatchups = calculateJunglerMatchups(sortedMatches, puuid);

    return NextResponse.json({
      matches: matchesToReturn,
      jungleStats,
      championStats,
      junglerMatchups,
      cacheInfo: {
        totalCachedMatches: sortedMatches.length,
        newMatchesFetched: newMatches.length,
        returnedMatches: matchesToReturn.length,
        hasMore,
        currentStart: start,
        nextStart: start + returnCount,
      },
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
