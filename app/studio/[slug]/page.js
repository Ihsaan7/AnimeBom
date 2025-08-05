'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import { ArrowUpDown, Filter } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import GlitchLoader from '@/components/GlitchLoader';

export default function StudioPage() {
  const { isDark } = useTheme();
  const params = useParams();
  const studioSlug = params.slug;
  const [animes, setAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('popularity');
  const [format, setFormat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [studioName, setStudioName] = useState('');

  // Convert slug back to readable studio name
  useEffect(() => {
    if (studioSlug) {
      const decodedName = decodeURIComponent(studioSlug).replace(/-/g, ' ');
      setStudioName(decodedName);
    }
  }, [studioSlug]);

  // Map studio names to Jikan API producer IDs (common studios)
  const getStudioMapping = (studioName) => {
    const studioMap = {
      'madhouse': 11,
      'toei animation': 18,
      'studio pierrot': 1,
      'bones': 4,
      'mappa': 569,
      'wit studio': 858,
      'production i.g': 10,
      'sunrise': 14,
      'a-1 pictures': 56,
      'kyoto animation': 2,
      'studio ghibli': 21,
      'gainax': 6,
      'trigger': 803,
      'shaft': 44,
      'j.c.staff': 7,
      'deen': 37,
      'gonzo': 3,
      'studio deen': 37,
      'white fox': 314,
      'david production': 287,
      'ufotable': 43,
      'cloverworks': 1835,
      'silver link': 300,
      'brain\'s base': 112,
      'p.a. works': 132,
      'lerche': 456,
      'orange': 1109,
      'studio 3hz': 1127,
      'kinema citrus': 290,
      'tms entertainment': 73,
      'nippon animation': 22,
      'fuji tv': 1,
      'tv tokyo': 16,
      'nhk': 111,
      'tbs': 17,
      'tv asahi': 151,
      'ntv': 55,
      'wowow': 23,
      'at-x': 1211,
      'tokyo mx': 1365,
      'bs11': 1499,
      'funimation': 102,
      'crunchyroll': 1468,
      'netflix': 1365,
      'aniplex': 17,
      'bandai visual': 23,
      'pony canyon': 14,
      'avex entertainment': 166,
      'kadokawa': 1696,
      'shueisha': 1365,
      'kodansha': 1499,
      'square enix': 1365,
      'ascii media works': 1499,
      'media factory': 1365,
      'lantis': 1499,
      'king records': 1365,
      'sony music entertainment': 1499
    };
    
    return studioMap[studioName.toLowerCase()] || null;
  };

  useEffect(() => {
    const fetchStudioAnime = async () => {
      setLoading(true);
      try {
        const producerId = getStudioMapping(studioName);
        let allFetchedAnimes = [];
        
        if (producerId) {
          // Fetch anime by producer/studio
          for (let i = 1; i <= 10; i++) {
            try {
              const response = await fetch(`https://api.jikan.moe/v4/anime?producers=${producerId}&page=${i}&limit=25`);
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
          // Fallback: search by studio name
          for (let i = 1; i <= 5; i++) {
            try {
              const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(studioName)}&page=${i}&limit=25`);
              if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                  // Filter results to only include anime that actually have this studio
                  const filteredData = data.data.filter(anime => {
                    const allProducers = [
                      ...(anime.studios || []),
                      ...(anime.producers || []),
                      ...(anime.licensors || [])
                    ];
                    return allProducers.some(producer => 
                      producer.name.toLowerCase().includes(studioName.toLowerCase())
                    );
                  });
                  allFetchedAnimes = [...allFetchedAnimes, ...filteredData];
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
        console.error('Failed to fetch studio anime:', error);
        setAllAnimes([]);
      }
      setLoading(false);
    };

    if (studioName) {
      fetchStudioAnime();
    }
  }, [studioName]);

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

  const handleToggleFavorite = (anime) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.mal_id === anime.mal_id);
      if (isFavorite) {
        return prev.filter(fav => fav.mal_id !== anime.mal_id);
      } else {
        return [...prev, anime];
      }
    });
  };

  const handlePlay = (anime) => {
    const query = new URLSearchParams({
      id: anime.mal_id,
      title: anime.title || anime.title_english
    }).toString();
    window.open(`/watchNow?${query}`, '_blank');
  };

  const handleAdd = (anime) => {
    console.log('Add to list:', anime);
  };

  const totalPages = Math.ceil(allAnimes.length / 25);
  const currentPageAnimes = allAnimes.slice((page - 1) * 25, page * 25);

  return (
    <div className={`min-h-screen -mt-2 px-6 py-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="py-6 mb-8">
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            Anime by Studio {studioName}
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <GlitchLoader />
          </div>
        )}

        {/* No Results */}
        {!loading && currentPageAnimes.length === 0 && (
          <div className="text-center py-12">
            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>No Anime Found</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No anime found for studio "{studioName}". Try a different studio or check back later.</p>
          </div>
        )}

        {/* Anime Grid */}
        {!loading && currentPageAnimes.length > 0 && (
          <>
            <div className="grid px-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {currentPageAnimes.map((anime) => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={anime}
                  isFavorite={favorites.some(fav => fav.mal_id === anime.mal_id)}
                  onToggleFavorite={() => handleToggleFavorite(anime)}
                  onPlay={() => handlePlay(anime)}
                  onAdd={() => handleAdd(anime)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                   onClick={() => setPage(Math.max(1, page - 1))}
                   disabled={page === 1}
                   className={`px-3 py-1 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors ${
                     isDark 
                       ? 'bg-gray-800 border-gray-600 text-gray-300' 
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
                         onClick={() => setPage(pageNumber)}
                         className={`px-2 md:px-3 py-1 border font-bold rounded-md transition-colors ${
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
                   <span className={`px-1 md:px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>...</span>
                 )}
                 
                 <button
                   onClick={() => setPage(Math.min(totalPages, page + 1))}
                   disabled={page === totalPages}
                   className={`px-1 md:px-3 py-1 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors ${
                     isDark 
                       ? 'bg-gray-800 border-gray-600 text-gray-300' 
                       : 'bg-white border-gray-400 text-gray-400'
                   }`}
                 >
                   Next
                 </button>
              </div>
            )}

            {/* Results Info */}
            <div className={`text-center mt-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Showing {currentPageAnimes.length} of {allAnimes.length} unique anime from {studioName}
            </div>
          </>
        )}
      </div>
    </div>
  );
}