"use client";

import { useState, useEffect } from 'react';
import AnimeCard from '@/components/AnimeCard';
import { ArrowUpDown, Filter } from 'lucide-react';
import Loader from '@/components/Loader';
import { useTheme } from '@/contexts/ThemeContext';

export default function TrendingPage() {
  const { isDark } = useTheme();
  const [animes, setAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]); // Store all fetched anime
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('popularity');
  const [format, setFormat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchAllTrendingAnime = async () => {
      setLoading(true);
      try {
        // Fetch multiple pages to get more trending data
        const promises = [];
        for (let i = 1; i <= 10; i++) {
          promises.push(fetch(`https://api.jikan.moe/v4/top/anime?filter=airing&page=${i}`));
          // Add delay between requests to avoid rate limiting
          if (i > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        const responses = await Promise.all(promises);
        const dataPromises = responses.map(res => res.json());
        const allData = await Promise.all(dataPromises);
        
        // Combine all anime from different pages
        const combinedAnimes = allData.flatMap(data => data.data || []);
        
        // Filter out duplicates based on title
        const uniqueAnimes = [];
        const seenTitles = new Set();
        
        for (const anime of combinedAnimes) {
          const title = anime.title || anime.title_english || anime.title_japanese;
          const normalizedTitle = title.toLowerCase().trim();
          
          if (!seenTitles.has(normalizedTitle)) {
            seenTitles.add(normalizedTitle);
            uniqueAnimes.push(anime);
          }
        }
        
        setAllAnimes(uniqueAnimes);
      } catch (error) {
        console.error('Failed to fetch trending anime:', error);
        setAllAnimes([]);
      }
      setLoading(false);
    };

    fetchAllTrendingAnime();
  }, [sortBy, format]);

  // Handle pagination from filtered unique anime
  useEffect(() => {
    const itemsPerPage = 25;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAnimes = allAnimes.slice(startIndex, endIndex);
    setAnimes(paginatedAnimes);
  }, [allAnimes, page]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to page 1 when sorting changes
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
    setPage(1); // Reset to page 1 when format changes
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= 50) {
      setPage(newPage);
    }
  };

  const handleToggleFavorite = (anime) => {
    setFavorites((prev) =>
      prev.includes(anime.mal_id)
        ? prev.filter((id) => id !== anime.mal_id)
        : [...prev, anime.mal_id]
    );
  };

  const handlePlay = (anime) => {
    alert(`Play: ${anime.title || anime.title_english}`);
  };

  const handleAdd = (anime, type) => {
    alert(`Added ${anime.title || anime.title_english} to ${type}`);
  };

  const filteredAnimes = animes
    .filter(anime => {
      if (format === 'all') return true;
      return anime.type?.toLowerCase() === format;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.members || 0) - (a.members || 0);
      }
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === 'rank') {
        return (a.rank || 999999) - (b.rank || 999999);
      }
      return 0;
    });

  return (
    <div className={`min-h-screen py-8 pr-5 pt-20 -mt-2 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-black'
          }`}>Trending Anime</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-3">
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <ArrowUpDown className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select 
                onChange={handleSortChange} 
                value={sortBy} 
                className={`border text-sm px-3 py-1 rounded-sm font-bold hover:cursor-pointer focus:outline-none duration-200 w-full sm:w-auto ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-600 hover:bg-fuchsia-500 focus:border-purple-400' 
                    : 'bg-white text-black border-gray-300 hover:text-white hover:bg-fuchsia-500 focus:border-purple-400'
                }`}
              >
                <option value="popularity">Sort: Popularity</option>
                <option value="score">Score</option>
                <option value="rank">Rank</option>
              </select>
            </div>
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <Filter className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select 
                onChange={handleFormatChange} 
                value={format} 
                className={`border rounded-sm font-bold hover:cursor-pointer text-sm px-3 py-1 focus:outline-none duration-200 w-full sm:w-auto ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-600 hover:bg-fuchsia-500 focus:border-purple-400' 
                    : 'bg-white text-black border-gray-300 hover:text-white hover:bg-fuchsia-500 focus:border-purple-400'
                }`}
              >
                <option value="all">Format: All Formats</option>
                <option value="tv">TV</option>
                <option value="movie">Movie</option>
                <option value="ova">OVA</option>
                <option value="special">Special</option>
                <option value="ona">ONA</option>
                <option value="music">Music</option>
              </select>
            </div>
          </div>
        </div>

      {loading ? (
        <div className={`flex justify-center items-center h-96 ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}>
          <Loader text="Loading" size="text-2xl" />
        </div>
      ) : (
        <>
          {animes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🔥</div>
              <h3 className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>No Trending Anime Found</h3>
              <p className={`text-center max-w-md ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                There are no trending anime available on this page. Try checking different filters or come back later!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                {filteredAnimes.slice(0, 16).map((anime, index) => (
                  <AnimeCard 
                    key={`trending-page-${page}-${index}-${anime.mal_id}`}
                    anime={anime} 
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(anime.mal_id)}
                    onPlay={handlePlay}
                    onAdd={handleAdd} />
                ))}
              </div>
              {/* Fill empty slots if less than 16 items */}
              {filteredAnimes.length < 16 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8 justify-items-center">
                  {Array.from({ length: 16 - filteredAnimes.length }).map((_, index) => (
                    <div key={`empty-${index}`} className={`h-96 rounded-2xl opacity-30 ${
                      isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}></div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

        {(() => {
          const itemsPerPage = 25;
          const totalPages = Math.ceil(allAnimes.length / itemsPerPage);
          
          return totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8 px-4">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-gray-400' 
                    : 'bg-white border-gray-400 text-gray-400'
                }`}
              >
                Previous
              </button>
              
              {(() => {
                const startPage = Math.max(1, page - 2);
                const endPage = Math.min(totalPages, startPage + 4);
                const adjustedStartPage = Math.max(1, endPage - 4);
                
                return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, index) => {
                  const pageNumber = adjustedStartPage + index;
                  return (
                    <button
                      key={`page-${pageNumber}`}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 border font-bold rounded-md transition-colors ${
                        page === pageNumber
                          ? 'bg-[#1a8ea0] text-white border-[#1a8ea0]'
                          : isDark 
                            ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-[#b24dc8] hover:text-white hover:cursor-pointer'
                            : 'bg-white border-gray-400 text-gray-700 hover:bg-[#b24dc8] hover:text-white hover:cursor-pointer'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                });
              })()}
              
              {totalPages > 5 && page < totalPages - 2 && (
                <span className={`px-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>...</span>
              )}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-gray-400' 
                    : 'bg-white border-gray-400 text-gray-400'
                }`}
              >
                Next
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}