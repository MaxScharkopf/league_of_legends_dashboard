'use client';

import { useState } from 'react';

interface SummonerSearchProps {
  onSearch: (gameName: string, tagLine: string) => void;
  loading: boolean;
}

export default function SummonerSearch({ onSearch, loading }: SummonerSearchProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Split input by # to get gameName and tagLine
    const parts = input.split('#');
    const gameName = parts[0]?.trim() || '';
    const tagLine = parts[1]?.trim() || 'NA1'; // Default to NA1 if no tag provided

    if (gameName) {
      onSearch(gameName, tagLine);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="summoner" className="text-sm font-medium text-gray-300">
          Enter Summoner Name
        </label>
        <div className="flex gap-2">
          <input
            id="summoner"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="GameName#TAG (e.g., HideOnBush#KR1)"
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Enter your Riot ID (Name#TAG). If no tag is provided, NA1 will be used.
        </p>
      </div>
    </form>
  );
}
