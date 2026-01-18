import { NextRequest, NextResponse } from 'next/server';
import { getMatchHistory, getMatchDetails, calculateJungleStats } from '@/lib/riot-api';

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
    const matchIds = await getMatchHistory(puuid, region, count);

    // Fetch match details with rate limiting (max 10 requests per batch)
    const matches = [];
    const batchSize = 10;

    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);
      const batchPromises = batch.map((matchId) =>
        getMatchDetails(matchId, region).catch(err => {
          console.error(`Failed to fetch match ${matchId}:`, err.message);
          return null; // Return null for failed matches
        })
      );

      const batchResults = await Promise.all(batchPromises);
      matches.push(...batchResults.filter(m => m !== null));

      // Add 1.2 second delay between batches to respect rate limits
      if (i + batchSize < matchIds.length) {
        await delay(1200);
      }
    }

    // Calculate jungle-specific stats
    const jungleStats = calculateJungleStats(matches, puuid);

    return NextResponse.json({
      matches,
      jungleStats,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
