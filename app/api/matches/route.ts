import { NextRequest, NextResponse } from 'next/server';
import { getMatchHistory, getMatchDetails, calculateJungleStats } from '@/lib/riot-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const puuid = searchParams.get('puuid');
  const region = (searchParams.get('region') || 'na1') as any;
  const count = parseInt(searchParams.get('count') || '20');

  if (!puuid) {
    return NextResponse.json(
      { error: 'puuid is required' },
      { status: 400 }
    );
  }

  try {
    const matchIds = await getMatchHistory(puuid, region, count);

    // Fetch details for all matches
    const matchPromises = matchIds.map((matchId) =>
      getMatchDetails(matchId, region)
    );
    const matches = await Promise.all(matchPromises);

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
