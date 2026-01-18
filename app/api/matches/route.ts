import { NextRequest, NextResponse } from 'next/server';
import { getMatchHistory, getMatchDetails, calculateJungleStats } from '@/lib/riot-api';
import { getCachedMatches, getCachedMatchIds, saveCachedMatches } from '@/lib/cache';

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const puuid = searchParams.get('puuid');
  const region = (searchParams.get('region') || 'na1') as any;
  const count = parseInt(searchParams.get('count') || '10'); // Reduced from 20 to 10

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

    // Get list of recent match IDs from API
    const allMatchIds = await getMatchHistory(puuid, region, count);

    // Filter out matches we already have cached
    const newMatchIds = allMatchIds.filter(id => !cachedMatchIds.has(id));

    console.log(`${newMatchIds.length} new matches to fetch, ${allMatchIds.length - newMatchIds.length} already cached`);

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

    // Combine cached and new matches, filter to only requested count
    const allMatches = [...newMatches, ...cachedMatches]
      .sort((a, b) => b.info.gameCreation - a.info.gameCreation)
      .slice(0, count);

    // Calculate jungle-specific stats
    const jungleStats = calculateJungleStats(allMatches, puuid);

    return NextResponse.json({
      matches: allMatches,
      jungleStats,
      cacheInfo: {
        cachedMatches: cachedMatches.length,
        newMatchesFetched: newMatches.length,
        totalMatches: allMatches.length,
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
