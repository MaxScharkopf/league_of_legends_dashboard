import { NextRequest, NextResponse } from 'next/server';
import { getSummonerByRiotId, getRankedStats } from '@/lib/riot-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  const region = (searchParams.get('region') || 'na1') as any;

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: 'gameName and tagLine are required' },
      { status: 400 }
    );
  }

  try {
    const summoner = await getSummonerByRiotId(gameName, tagLine, region);
    const rankedStats = await getRankedStats(summoner.id, region);

    return NextResponse.json({
      summoner,
      rankedStats,
    });
  } catch (error) {
    console.error('Error fetching summoner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch summoner' },
      { status: 500 }
    );
  }
}
