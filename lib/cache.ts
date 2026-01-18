import fs from 'fs';
import path from 'path';
import { Match } from '@/types/riot';

const CACHE_DIR = path.join(process.cwd(), 'cache');

// Ensure cache directory exists
export function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Get cache file path for a summoner
function getCacheFilePath(puuid: string, region: string): string {
  ensureCacheDir();
  return path.join(CACHE_DIR, `${puuid}_${region}.json`);
}

// Read cached matches for a summoner
export function getCachedMatches(puuid: string, region: string): Match[] {
  try {
    const filePath = getCacheFilePath(puuid, region);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const cached = JSON.parse(data);

    return cached.matches || [];
  } catch (error) {
    console.error('Error reading cache:', error);
    return [];
  }
}

// Save matches to cache (merging with existing data)
export function saveCachedMatches(puuid: string, region: string, newMatches: Match[]) {
  try {
    const filePath = getCacheFilePath(puuid, region);

    // Get existing cached matches
    const existingMatches = getCachedMatches(puuid, region);

    // Create a Set of existing match IDs for fast lookup
    const existingMatchIds = new Set(
      existingMatches.map(m => m.metadata.matchId)
    );

    // Only add matches that don't already exist
    const uniqueNewMatches = newMatches.filter(
      m => !existingMatchIds.has(m.metadata.matchId)
    );

    // Merge and sort by game creation (newest first)
    const allMatches = [...uniqueNewMatches, ...existingMatches].sort(
      (a, b) => b.info.gameCreation - a.info.gameCreation
    );

    // Save to file
    const cacheData = {
      puuid,
      region,
      lastUpdated: new Date().toISOString(),
      matchCount: allMatches.length,
      matches: allMatches,
    };

    fs.writeFileSync(filePath, JSON.stringify(cacheData, null, 2), 'utf-8');

    console.log(`Cache updated: ${uniqueNewMatches.length} new matches added, ${allMatches.length} total`);

    return {
      newMatchesAdded: uniqueNewMatches.length,
      totalMatches: allMatches.length,
    };
  } catch (error) {
    console.error('Error writing cache:', error);
    throw error;
  }
}

// Get match IDs that are already cached
export function getCachedMatchIds(puuid: string, region: string): Set<string> {
  const matches = getCachedMatches(puuid, region);
  return new Set(matches.map(m => m.metadata.matchId));
}

// Clear cache for a specific summoner
export function clearCache(puuid: string, region: string) {
  try {
    const filePath = getCacheFilePath(puuid, region);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cache cleared for ${puuid} in ${region}`);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
