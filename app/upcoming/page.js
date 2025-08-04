"use client";

import { useState, useEffect } from 'react';
import AnimeCard from '@/components/AnimeCard';
import { ArrowUpDown, Filter } from 'lucide-react';
import Loader from '@/components/Loader';
import { useTheme } from '@/contexts/ThemeContext';
import { generateUniqueKey } from '@/lib/keyUtils';

export default function UpcomingPage() {
  const { isDark } = useTheme();
  const [animes, setAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]); // Store all fetched anime
  const [filteredCount, setFilteredCount] = useState(0); // Store count of filtered anime
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('popularity');
  const [format, setFormat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchAllUpcomingAnime = async () => {
      setLoading(true);
      try {
        console.log('🔄 Fetching upcoming anime data...');
        // Fetch multiple pages to get more data for filtering
        const promises = [];
        for (let i = 1; i <= 6; i++) {
          promises.push(fetch(`https://api.jikan.moe/v4/seasons/upcoming?page=${i}`));
        }
        
        const responses = await Promise.all(promises);
        console.log('📡 API Responses received:', responses.map(r => r.status));
        
        const dataPromises = responses.map(res => res.json());
        const allData = await Promise.all(dataPromises);
        
        console.log('📊 Raw API Data:', allData.map(d => ({ hasData: !!d.data, count: d.data?.length || 0 })));
        
        // Combine all anime from different pages
        const combinedAnimes = allData.flatMap(data => data.data || []);
        console.log('🔗 Combined anime count:', combinedAnimes.length);
        
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
        
        console.log('✨ Unique anime after deduplication:', uniqueAnimes.length);
        setAllAnimes(uniqueAnimes);
      } catch (error) {
        console.error('❌ Failed to fetch upcoming anime:', error);
        console.error('Error details:', error.message);
        setAllAnimes([]);
      }
      setLoading(false);
    };

    fetchAllUpcomingAnime();
  }, []); // Fetch data only on component mount

  // Separate effect for handling sort/filter changes
  useEffect(() => {
    if (allAnimes.length > 0) {
      // Reset to page 1 when sort or filter changes
      setPage(1);
    }
  }, [sortBy, format]);

  // Handle filtering, sorting, and pagination
  useEffect(() => {
    if (allAnimes.length === 0) return;
    
    // First filter by format
    const filtered = allAnimes.filter(anime => {
      if (format === 'all') return true;
      return anime.type?.toLowerCase() === format;
    });
    
    // Then sort
    const sorted = filtered.sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.members || 0) - (a.members || 0);
      }
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === 'release_date') {
        const dateA = new Date(a.aired?.from || '2099-01-01');
        const dateB = new Date(b.aired?.from || '2099-01-01');
        return dateA - dateB;
      }
      return 0;
    });
    
    // Set filtered count for pagination
    setFilteredCount(sorted.length);
    
    // Finally paginate
    const itemsPerPage = 24;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAnimes = sorted.slice(startIndex, endIndex);
    
    setAnimes(paginatedAnimes);
  }, [allAnimes, page, sortBy, format]);

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
    alert(`Coming Soon: ${anime.title || anime.title_english}`);
  };

  const handleAdd = (anime, type) => {
    alert(`Added ${anime.title || anime.title_english} to ${type}`);
  };

  const filteredAnimes = animes; // animes is already filtered, sorted, and paginated

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} -mt-2 py-4 sm:py-8 px-4 sm:pr-5 pt-6 sm:pt-10`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Upcoming Anime</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <ArrowUpDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select onChange={handleSortChange} value={sortBy} className={`${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border text-black'} text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-sm font-bold hover:cursor-pointer hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 w-full sm:w-auto`}>
                <option value="popularity">Sort: Popularity</option>
                <option value="score">Score</option>
                <option value="release_date">Release Date</option>
              </select>
            </div>
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select onChange={handleFormatChange} value={format} className={`${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border text-black'} rounded-sm font-bold hover:cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1 hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 w-full sm:w-auto`}>
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
        <div className={`flex justify-center items-center h-96 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <Loader text="Loading Upcoming" size="text-2xl" />
        </div>
      ) : (
        <>
          {animes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📺</div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No Anime Found</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                There are no upcoming anime available on this page. Try checking earlier pages or come back later for new releases!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 justify-items-center sm:justify-items-stretch">
                {filteredAnimes.map((anime, index) => (
                  <AnimeCard 
                    key={generateUniqueKey(anime, index, `upcoming-p${page}-`)}
                    anime={anime} 
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(anime.mal_id)}
                    onPlay={handlePlay}
                    onAdd={handleAdd} />
                ))}
              </div>
              {/* Fill empty slots if less than 24 items */}
              {animes.length < 24 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 justify-items-center sm:justify-items-stretch">
                  {Array.from({ length: 24 - animes.length }).map((_, index) => (
                    <div key={`empty-${index}`} className={`h-80 sm:h-96 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl opacity-30`}></div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

        {(() => {
          const itemsPerPage = 24;
          const totalPages = Math.ceil(filteredCount / itemsPerPage);
          
          return totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8 px-2">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-2 sm:px-3 py-1 border ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-400'} font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors text-xs sm:text-sm`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              {(() => {
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                const maxButtons = isMobile ? 3 : 5;
                const startPage = Math.max(1, page - Math.floor(maxButtons / 2));
                const endPage = Math.min(totalPages, startPage + maxButtons - 1);
                const adjustedStartPage = Math.max(1, endPage - maxButtons + 1);
                
                return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, index) => {
                  const pageNumber = adjustedStartPage + index;
                  return (
                    <button
                      key={`page-${pageNumber}`}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-2 sm:px-3 py-1 border font-bold rounded-md transition-colors text-xs sm:text-sm ${
                        page === pageNumber
                          ? 'bg-[#1a8ea0] text-white'
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
                <span className={`px-1 sm:px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm`}>...</span>
              )}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-2 sm:px-3 py-1 border ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-400'} font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors text-xs sm:text-sm`}
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
