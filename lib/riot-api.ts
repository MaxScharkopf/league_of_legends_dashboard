import axios from 'axios';
import { Summoner, RankedStats, Match, Region, RegionalRoute } from '@/types/riot';

const API_KEY = process.env.RIOT_API_KEY;

// Map regions to their routing values
const ROUTING_MAP: Record<Region, RegionalRoute> = {
  na1: 'americas',
  br1: 'americas',
  la1: 'americas',
  la2: 'americas',
  euw1: 'europe',
  eun1: 'europe',
  tr1: 'europe',
  ru: 'europe',
  kr: 'asia',
  jp1: 'asia',
  oc1: 'sea',
};

// Get summoner by Riot ID (name#tag)
export async function getSummonerByRiotId(
  gameName: string,
  tagLine: string,
  region: Region = 'na1'
): Promise<Summoner> {
  try {
    const routing = ROUTING_MAP[region];

    // First, get account info by Riot ID
    const accountResponse = await axios.get(
      `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: { 'X-Riot-Token': API_KEY },
      }
    );

    const { puuid } = accountResponse.data;

    // Then get summoner info by PUUID
    const summonerResponse = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: { 'X-Riot-Token': API_KEY },
      }
    );

    return {
      ...summonerResponse.data,
      name: `${gameName}#${tagLine}`,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch summoner: ${error.response?.data?.status?.message || error.message}`);
    }
    throw error;
  }
}

// Get ranked stats for a summoner
export async function getRankedStats(
  summonerId: string,
  region: Region = 'na1'
): Promise<RankedStats[]> {
  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      {
        headers: { 'X-Riot-Token': API_KEY },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Ranked stats error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      });
      throw new Error(`Failed to fetch ranked stats: ${error.response?.data?.status?.message || error.message}`);
    }
    throw error;
  }
}

// Get match history by PUUID
export async function getMatchHistory(
  puuid: string,
  region: Region = 'na1',
  count: number = 20,
  start: number = 0
): Promise<string[]> {
  try {
    const routing = ROUTING_MAP[region];
    const response = await axios.get(
      `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      {
        headers: { 'X-Riot-Token': API_KEY },
        params: {
          start,
          count,
          type: 'ranked', // Only get ranked games
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch match history: ${error.response?.data?.status?.message || error.message}`);
    }
    throw error;
  }
}

// Get match details by match ID
export async function getMatchDetails(
  matchId: string,
  region: Region = 'na1'
): Promise<Match> {
  try {
    const routing = ROUTING_MAP[region];
    const response = await axios.get(
      `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: { 'X-Riot-Token': API_KEY },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch match details: ${error.response?.data?.status?.message || error.message}`);
    }
    throw error;
  }
}

// Helper function to calculate champion winrates
export function calculateChampionStats(matches: Match[], puuid: string) {
  const championStats: Record<string, {
    championName: string;
    games: number;
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
    assists: number;
  }> = {};

  matches.forEach((match) => {
    const player = match.info.participants.find((p) => p.puuid === puuid);
    if (!player) return;

    const champName = player.championName;

    if (!championStats[champName]) {
      championStats[champName] = {
        championName: champName,
        games: 0,
        wins: 0,
        losses: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
      };
    }

    championStats[champName].games++;
    if (player.win) {
      championStats[champName].wins++;
    } else {
      championStats[champName].losses++;
    }
    championStats[champName].kills += player.kills;
    championStats[champName].deaths += player.deaths;
    championStats[champName].assists += player.assists;
  });

  // Convert to array and add calculated stats
  return Object.values(championStats).map(champ => ({
    ...champ,
    winRate: ((champ.wins / champ.games) * 100).toFixed(1),
    kda: champ.deaths > 0
      ? ((champ.kills + champ.assists) / champ.deaths).toFixed(2)
      : 'Perfect',
    avgKills: (champ.kills / champ.games).toFixed(1),
    avgDeaths: (champ.deaths / champ.games).toFixed(1),
    avgAssists: (champ.assists / champ.games).toFixed(1),
  })).sort((a, b) => b.games - a.games); // Sort by most played
}

// Helper function to calculate jungle-specific stats from matches
export function calculateJungleStats(matches: Match[], puuid: string) {
  const jungleMatches = matches.filter((match) => {
    const player = match.info.participants.find((p) => p.puuid === puuid);
    return player?.individualPosition === 'JUNGLE';
  });

  if (jungleMatches.length === 0) {
    return null;
  }

  const stats = jungleMatches.reduce(
    (acc, match) => {
      const player = match.info.participants.find((p) => p.puuid === puuid)!;

      acc.totalGames++;
      if (player.win) acc.wins++;

      acc.totalKills += player.kills;
      acc.totalDeaths += player.deaths;
      acc.totalAssists += player.assists;
      acc.totalCS += player.totalMinionsKilled + player.neutralMinionsKilled;
      acc.totalVisionScore += player.visionScore;
      acc.totalDamage += player.totalDamageDealtToChampions;

      if (player.challenges) {
        acc.totalDragonTakedowns += player.challenges.dragonTakedowns || 0;
        acc.totalBaronTakedowns += player.challenges.baronTakedowns || 0;
        acc.totalEpicSteals += player.challenges.epicMonsterSteals || 0;
      }

      return acc;
    },
    {
      totalGames: 0,
      wins: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      totalCS: 0,
      totalVisionScore: 0,
      totalDamage: 0,
      totalDragonTakedowns: 0,
      totalBaronTakedowns: 0,
      totalEpicSteals: 0,
    }
  );

  const gameDuration = jungleMatches.reduce((sum, m) => sum + m.info.gameDuration, 0);
  const avgGameDurationMin = gameDuration / jungleMatches.length / 60;

  return {
    gamesPlayed: stats.totalGames,
    winRate: ((stats.wins / stats.totalGames) * 100).toFixed(1),
    kda: stats.totalDeaths > 0
      ? ((stats.totalKills + stats.totalAssists) / stats.totalDeaths).toFixed(2)
      : 'Perfect',
    avgKills: (stats.totalKills / stats.totalGames).toFixed(1),
    avgDeaths: (stats.totalDeaths / stats.totalGames).toFixed(1),
    avgAssists: (stats.totalAssists / stats.totalGames).toFixed(1),
    csPerMin: (stats.totalCS / (stats.totalGames * avgGameDurationMin)).toFixed(1),
    avgVisionScore: (stats.totalVisionScore / stats.totalGames).toFixed(1),
    avgDamage: Math.round(stats.totalDamage / stats.totalGames),
    dragonsPerGame: (stats.totalDragonTakedowns / stats.totalGames).toFixed(1),
    baronsPerGame: (stats.totalBaronTakedowns / stats.totalGames).toFixed(1),
    epicStealsPerGame: (stats.totalEpicSteals / stats.totalGames).toFixed(2),
  };
}
