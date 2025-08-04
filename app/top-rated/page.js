"use client";

import { useState, useEffect } from 'react';
import AnimeCard from '@/components/AnimeCard';
import { ArrowUpDown, Filter } from 'lucide-react';
import Loader from '@/components/Loader';

export default function TopRatedPage() {
  const [animes, setAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]); // Store all fetched anime
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('score');
  const [format, setFormat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchAllTopRatedAnime = async () => {
      setLoading(true);
      try {
        // Fetch multiple pages to get more top-rated data
        const promises = [];
        for (let i = 1; i <= 15; i++) {
          promises.push(fetch(`https://api.jikan.moe/v4/top/anime?page=${i}`));
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
        console.error('Failed to fetch top-rated anime:', error);
        setAllAnimes([]);
      }
      setLoading(false);
    };

    fetchAllTopRatedAnime();
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
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === 'popularity') {
        return (b.members || 0) - (a.members || 0);
      }
      if (sortBy === 'rank') {
        return (a.rank || 999999) - (b.rank || 999999);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-white py-8 pr-5 mt-10">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-black">Top Rated Anime</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <select onChange={handleSortChange} value={sortBy} className="bg-white border text-sm text-black px-3 py-1 rounded-sm font-bold hover:cursor-pointer hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200">
                <option value="score">Sort: Score</option>
                <option value="popularity">Popularity</option>
                <option value="rank">Rank</option>
              </select>
            </div>
            <div className="flex items-center space-x-1">
              <Filter className="w-4 h-4 text-gray-600" />
              <select onChange={handleFormatChange} value={format} className="bg-white border rounded-sm font-bold hover:cursor-pointer text-sm text-black px-3 py-1 hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200">
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
        <div className="flex justify-center items-center h-96 bg-white">
          <Loader text="Loading Top Rated" size="text-2xl" />
        </div>
      ) : (
        <>
          {animes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Top Rated Anime Found</h3>
              <p className="text-gray-500 text-center max-w-md">
                There are no top-rated anime available on this page. Try checking different filters or come back later!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {filteredAnimes.slice(0, 16).map((anime, index) => (
                  <AnimeCard 
                    key={`toprated-page-${page}-${index}-${anime.mal_id}`}
                    anime={anime} 
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(anime.mal_id)}
                    onPlay={handlePlay}
                    onAdd={handleAdd} />
                ))}
              </div>
              {/* Fill empty slots if less than 16 items */}
              {filteredAnimes.length < 16 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
                  {Array.from({ length: 16 - filteredAnimes.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-96 bg-gray-100 rounded-2xl opacity-30"></div>
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
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border border-gray-400 font-bold text-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors"
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
                      className={`px-3 py-1 border border-gray-400 font-bold text-gray-700 rounded-md transition-colors ${
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
                className="px-3 py-1 bg-white border border-gray-400 font-bold text-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors"
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