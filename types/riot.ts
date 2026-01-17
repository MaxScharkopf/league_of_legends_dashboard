// Riot API Types

export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
  name?: string;
}

export interface RankedStats {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  summonerId: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export interface Participant {
  puuid: string;
  summonerId: string;
  summonerName: string;
  championId: number;
  championName: string;
  teamId: number;
  role: string;
  individualPosition: string;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  goldEarned: number;
  champLevel: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  visionScore: number;
  visionWardsBoughtInGame: number;
  wardsPlaced: number;
  wardsKilled: number;
  win: boolean;
  // Jungle-specific stats
  challenges?: {
    killParticipation?: number;
    kda?: number;
    soloKills?: number;
    baronTakedowns?: number;
    dragonTakedowns?: number;
    epicMonsterSteals?: number;
    jungleCsBefore10Minutes?: number;
    junglerKillsEarlyJungle?: number;
    controlWardsPlaced?: number;
    controlWardTimeCoverageInRiverAndEnemyJungle?: number;
  };
}

export interface MatchInfo {
  gameCreation: number;
  gameDuration: number;
  gameId: number;
  gameMode: string;
  gameType: string;
  queueId: number;
}

export interface Match {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: MatchInfo & {
    participants: Participant[];
  };
}

export interface MatchTimeline {
  metadata: {
    matchId: string;
  };
  info: {
    frames: TimelineFrame[];
    frameInterval: number;
  };
}

export interface TimelineFrame {
  timestamp: number;
  participantFrames: {
    [key: string]: {
      participantId: number;
      position: { x: number; y: number };
      currentGold: number;
      totalGold: number;
      level: number;
      xp: number;
      minionsKilled: number;
      jungleMinionsKilled: number;
    };
  };
  events: TimelineEvent[];
}

export interface TimelineEvent {
  type: string;
  timestamp: number;
  participantId?: number;
  killerId?: number;
  victimId?: number;
  position?: { x: number; y: number };
  monsterType?: string;
  monsterSubType?: string;
}

export type Region = 'na1' | 'euw1' | 'eun1' | 'kr' | 'br1' | 'jp1' | 'la1' | 'la2' | 'oc1' | 'ru' | 'tr1';
export type RegionalRoute = 'americas' | 'asia' | 'europe' | 'sea';
