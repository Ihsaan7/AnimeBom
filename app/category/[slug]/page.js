'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import { ArrowUpDown, Filter } from 'lucide-react';
import Loader from '@/components/Loader';
import { useTheme } from '@/contexts/ThemeContext';

export default function CategoryPage() {
  const { isDark } = useTheme();
  const params = useParams();
  const categorySlug = params.slug;
  const [animes, setAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('popularity');
  const [format, setFormat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [categoryName, setCategoryName] = useState('');

  // Convert slug back to readable category name
  useEffect(() => {
    if (categorySlug) {
      const decodedName = decodeURIComponent(categorySlug).replace(/-/g, ' ');
      setCategoryName(decodedName);
    }
  }, [categorySlug]);

  // Map category names to Jikan API genres
  const getGenreMapping = (categoryName) => {
    const genreMap = {
      'action anime': 1,
      'adventure anime': 2,
      'romance anime': 22,
      'comedy anime': 4,
      'horror anime': 14,
      'sci-fi anime': 24,
      'fantasy anime': 10,
      'drama anime': 8,
      'sports anime': 30,
      'mecha anime': 18,
      'slice of life': 36,
      'supernatural': 37,
      'mystery anime': 7,
      'historical anime': 13,
      'music anime': 19,
      'thriller anime': 41,
      'school anime': 23,
      'psychological': 40,
      'martial arts': 17,
      'magic anime': 16,
      'samurai anime': 21,
      'military anime': 38,
      'space opera': 29,
      'vampire anime': 32,
      'shounen anime': 27,
      'shoujo anime': 25,
      'seinen anime': 42,
      'josei anime': 43,
      'ecchi anime': 9,
      'harem anime': 35
    };
    
    return genreMap[categoryName.toLowerCase()] || null;
  };

  useEffect(() => {
    const fetchCategoryAnime = async () => {
      setLoading(true);
      try {
        const genreId = getGenreMapping(categoryName);
        let allFetchedAnimes = [];
        
        if (genreId) {
          // Fetch anime by genre
          for (let i = 1; i <= 10; i++) {
            try {
              const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&page=${i}&limit=25`);
              if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                  allFetchedAnimes = [...allFetchedAnimes, ...data.data];
                  // Add delay to avoid rate limiting
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                  break;
                }
              }
            } catch (error) {
              console.error(`Error fetching page ${i}:`, error);
              break;
            }
          }
        } else {
          // Fallback: search by category name
          for (let i = 1; i <= 5; i++) {
            try {
              const searchTerm = categoryName.replace(' anime', '').trim();
              const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&page=${i}&limit=25`);
              if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                  allFetchedAnimes = [...allFetchedAnimes, ...data.data];
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                  break;
                }
              }
            } catch (error) {
              console.error(`Error fetching search page ${i}:`, error);
              break;
            }
          }
        }

        // Remove duplicates based on mal_id
        const uniqueAnimes = [];
        const seenIds = new Set();
        
        for (const anime of allFetchedAnimes) {
          if (!seenIds.has(anime.mal_id)) {
            seenIds.add(anime.mal_id);
            uniqueAnimes.push(anime);
          }
        }
        
        setAllAnimes(uniqueAnimes);
      } catch (error) {
        console.error('Failed to fetch category anime:', error);
        setAllAnimes([]);
      }
      setLoading(false);
    };

    if (categoryName) {
      fetchCategoryAnime();
    }
  }, [categoryName]);

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
    setPage(1);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
    setPage(1);
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

  // Apply filters
  const filteredAnimes = animes.filter((anime) => {
    if (format !== 'all' && anime.type?.toLowerCase() !== format.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} py-4 sm:py-8 px-4 sm:px-5 pt-6 sm:pt-10 -mt-2`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row md:gap-160 sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className={`text-xl sm:text-2xl md:text-4xl md:pl-10 font-bold ${isDark ? 'text-white' : 'text-black'} capitalize text-center sm:text-left`}>{categoryName}</h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full">
            <div className="flex items-center space-x-1 w-full sm:w-auto max-w-full">
              <ArrowUpDown className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select onChange={handleSortChange} value={sortBy} className={`${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border text-black'} text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-sm font-bold hover:cursor-pointer hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 w-full sm:w-auto min-w-0 max-w-[140px] sm:max-w-none truncate`}>
                <option value="popularity">Sort: Popularity</option>
                <option value="rating">Rating</option>
                <option value="title">Title</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div className="flex items-center space-x-1 w-full sm:w-auto max-w-full">
              <Filter className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select onChange={handleFormatChange} value={format} className={`${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border text-black'} rounded-sm font-bold hover:cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-2 hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 w-full sm:w-auto min-w-0 max-w-[140px] sm:max-w-none truncate`}>
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
          <Loader text="Loading " size="text-2xl" />
        </div>
      ) : (
        <>
          {animes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📺</div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No Anime Found</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                No anime found for {categoryName.toLowerCase()}. Try checking other categories or come back later!
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl">
                  {filteredAnimes.slice(0, 16).map((anime, index) => (
                    <AnimeCard 
                      key={`category-${categorySlug}-page-${page}-${index}-${anime.mal_id}`}
                      anime={anime} 
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favorites.includes(anime.mal_id)}
                      onPlay={handlePlay}
                      onAdd={handleAdd} />
                  ))}
                </div>
              </div>
              {/* Fill empty slots if less than 16 items */}
              {filteredAnimes.length < 16 && (
                <div className="flex justify-center mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl">
                    {Array.from({ length: 16 - filteredAnimes.length }).map((_, index) => (
                      <div key={`empty-${index}`} className={`h-96 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl opacity-30`}></div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      </div>

      {/* Pagination */}
      {(() => {
        const itemsPerPage = 25;
        const totalPages = Math.ceil(allAnimes.length / itemsPerPage);
        
        return totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-8 px-2 sm:px-4">
            <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-1 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-400'} font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              {(() => {
                // Show fewer pages on mobile
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                const maxPages = isMobile ? 2 : 4;
                const startPage = Math.max(1, page - Math.floor(maxPages / 2));
                const endPage = Math.min(totalPages, startPage + maxPages);
                const adjustedStartPage = Math.max(1, endPage - maxPages);
                
                return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, index) => {
                  const pageNumber = adjustedStartPage + index;
                  return (
                    <button
                      key={`page-${pageNumber}`}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-1 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border font-bold rounded-md transition-colors min-w-[28px] sm:min-w-[36px] ${
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
              
              {totalPages > 3 && page < totalPages - 1 && (
                <span className={`px-1 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>...</span>
              )}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-1 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-400'} font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors`}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </button>
          </div>
        );
      })()}

      {/* Page Info */}
      <div className="text-center mt-4 px-4">
        <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing {animes.length} anime • Total: {allAnimes.length} unique anime found
        </p>
      </div>
    </div>
  );
}
