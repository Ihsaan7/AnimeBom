"use client";

import { useState, useEffect } from 'react';
import AnimeCard from '@/components/AnimeCard';
import { ArrowUpDown, Filter, Calendar } from 'lucide-react';
import Loader from '@/components/Loader';
import { useTheme } from '@/contexts/ThemeContext';

export default function TopAnimePage() {
  const { isDark } = useTheme();
  const [animes, setAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]); // Store all fetched anime
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('score');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedSeason, setSelectedSeason] = useState('summer');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Generate years from 1986 to 2025
  const years = [];
  for (let year = 2025; year >= 1986; year--) {
    years.push(year);
  }

  const seasons = ['winter', 'spring', 'summer', 'fall'];

  useEffect(() => {
    const fetchAnimeByYearAndSeason = async () => {
      setLoading(true);
      try {
        const allFetchedAnimes = [];
        
        // Fetch multiple pages to get more anime
        for (let pageNum = 1; pageNum <= 3; pageNum++) {
          try {
            const response = await fetch(
              `https://api.jikan.moe/v4/seasons/${selectedYear}/${selectedSeason}?page=${pageNum}&limit=25`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.data && data.data.length > 0) {
                allFetchedAnimes.push(...data.data);
              }
            }
            
            // Add delay between requests to avoid rate limiting
            if (pageNum < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error(`Error fetching page ${pageNum}:`, error);
          }
        }
        
        // Remove duplicates based on mal_id
        const uniqueAnimes = allFetchedAnimes.filter((anime, index, self) => 
          index === self.findIndex(a => a.mal_id === anime.mal_id)
        );
        
        setAllAnimes(uniqueAnimes);
      } catch (error) {
        console.error('Error fetching anime by year and season:', error);
        setAllAnimes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimeByYearAndSeason();
  }, [selectedYear, selectedSeason]);

  // Pagination effect
  useEffect(() => {
    const itemsPerPage = 25;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setAnimes(allAnimes.slice(startIndex, endIndex));
  }, [allAnimes, page]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setPage(1); // Reset to first page when changing year
  };

  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value);
    setPage(1); // Reset to first page when changing season
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    alert(`Add ${(anime.title || anime.title_english)} to ${type}`);
  };

  const filteredAnimes = animes
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      } else if (sortBy === 'popularity') {
        return (a.popularity || 999999) - (b.popularity || 999999);
      } else if (sortBy === 'rank') {
        return (a.rank || 999999) - (b.rank || 999999);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className={`min-h-screen -mt-2 flex justify-center items-center transition-colors ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <Loader text="Loading" size="text-2xl" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen -mt-2 py-4 sm:py-8 px-4 sm:px-5 pt-20 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto ">
        <div className=" flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-center sm:text-left ${
            isDark ? 'text-white' : 'text-black'
          }`}>Top Anime by Year & Season</h1>
          <div className=" flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select 
                onChange={handleYearChange} 
                value={selectedYear} 
                className={`border text-sm px-2 sm:px-3 py-1 rounded-sm font-bold hover:cursor-pointer hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 min-w-[80px] ${
                  isDark ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'
                }`}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-1">
              <Filter className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select 
                onChange={handleSeasonChange} 
                value={selectedSeason} 
                className={`border rounded-sm font-bold hover:cursor-pointer text-sm px-2 sm:px-3 py-1 hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 min-w-[90px] ${
                  isDark ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'
                }`}
              >
                <option value="winter">Winter</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
              </select>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpDown className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select 
                onChange={handleSortChange} 
                value={sortBy} 
                className={`border text-sm px-2 sm:px-3 py-1 rounded-sm font-bold hover:cursor-pointer hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 min-w-[100px] ${
                  isDark ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'
                }`}
              >
                <option value="score">Sort: Score</option>
                <option value="popularity">Popularity</option>
                <option value="rank">Rank</option>
              </select>
            </div>
          </div>
        </div>

      {animes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📅</div>
              <h3 className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>No Anime Found</h3>
              <p className={`text-center max-w-md ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                There are no anime available for {selectedYear} {selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} season. Try selecting a different year or season!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 justify-items-center xs:justify-items-stretch sm:justify-items-center md:justify-items-stretch [&>*]:w-full [&>*]:max-w-xs sm:[&>*]:max-w-none">
                {filteredAnimes.map((anime, index) => (
                  <AnimeCard
                    key={`${selectedYear}-${selectedSeason}-${anime.mal_id}-${index}`}
                    anime={anime}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(anime.mal_id)}
                    onPlay={handlePlay}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
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
                className="px-2 sm:px-3 py-1 bg-white border border-gray-400 font-bold text-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
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
                      className={`px-2 sm:px-3 py-1 border border-gray-400 font-bold text-gray-700 rounded-md transition-colors text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] ${
                        page === pageNumber
                          ? 'bg-[#1a8ea0] text-white'
                          : 'bg-white text-gray-700 hover:bg-[#b24dc8] hover:text-white hover:cursor-pointer'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                });
              })()}
              
              {totalPages > 5 && page < totalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-2 sm:px-3 py-1 bg-white border border-gray-400 font-bold text-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}