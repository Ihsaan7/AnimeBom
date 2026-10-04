"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import CharacterCard from '@/components/CharacterCard';
import Loader from '@/components/Loader';

// High-quality fallback anime characters with official poster images
const FALLBACK_CHARACTERS = [
  {
    mal_id: 40,
    name: "Luffy Monkey D.",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/9/310307.jpg" } },
    favorites: 138000
  },
  {
    mal_id: 62,
    name: "Zoro Roronoa",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/3/100537.jpg" } },
    favorites: 112000
  },
  {
    mal_id: 45627,
    name: "Levi Ackerman",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/2/241413.jpg" } },
    favorites: 142000
  },
  {
    mal_id: 2734,
    name: "Naruto Uzumaki",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/9/131317.jpg" } },
    favorites: 89000
  },
  {
    mal_id: 164471,
    name: "Satoru Gojo",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/15/422168.jpg" } },
    favorites: 125000
  },
  {
    mal_id: 216,
    title: "Goku",
    name: "Goku Son",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/14/195983.jpg" } },
    favorites: 95000
  },
  {
    mal_id: 80,
    name: "Light Yagami",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/6/63870.jpg" } },
    favorites: 98000
  },
  {
    mal_id: 71,
    name: "L Lawliet",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/10/249633.jpg" } },
    favorites: 128000
  },
  {
    mal_id: 11,
    name: "Edward Elric",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/9/72533.jpg" } },
    favorites: 91000
  },
  {
    mal_id: 45625,
    name: "Mikasa Ackerman",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/9/215563.jpg" } },
    favorites: 78000
  },
  {
    mal_id: 146157,
    name: "Nezuko Kamado",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/2/385801.jpg" } },
    favorites: 84000
  },
  {
    mal_id: 85,
    name: "Kakashi Hatake",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/7/284129.jpg" } },
    favorites: 88000
  },
  {
    mal_id: 27,
    name: "Killua Zoldyck",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/2/325251.jpg" } },
    favorites: 92000
  },
  {
    mal_id: 160027,
    name: "Tanjiro Kamado",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/12/385799.jpg" } },
    favorites: 79000
  },
  {
    mal_id: 417,
    name: "Gintoki Sakata",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/11/276008.jpg" } },
    favorites: 82000
  }
];

// Lightning-fast AniList GraphQL query for top characters (~150ms response, zero rate limits)
const fetchAniListCharacters = async (page = 1) => {
  const query = `
    query GetTopCharacters($page: Int) {
      Page(page: $page, perPage: 25) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        characters(sort: FAVORITES_DESC) {
          id
          idMal
          name {
            full
            native
          }
          image {
            large
            medium
          }
          favourites
        }
      }
    }
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { page }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`AniList returned status ${res.status}`);

    const data = await res.json();
    const characterList = data.data?.Page?.characters || [];
    const lastPage = data.data?.Page?.pageInfo?.lastPage || 10;

    const transformed = characterList.map((char) => ({
      mal_id: char.idMal || char.id,
      id: char.id,
      name: char.name?.full || char.name?.native || "Anime Character",
      images: {
        jpg: {
          image_url: char.image?.large || char.image?.medium || "/characters/l.jpg"
        }
      },
      favorites: char.favourites || 1000
    }));

    return {
      characters: transformed,
      totalPages: lastPage
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("AniList character query error:", err);
    return null;
  }
};

const TopCharacterPage = () => {
  const { isDark } = useTheme();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [sortBy, setSortBy] = useState('favorites');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCharactersData();
  }, [currentPage, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCharactersData = async () => {
    setLoading(true);

    // 1. Try ultra-fast AniList GraphQL query first
    const aniListResult = await fetchAniListCharacters(currentPage);

    if (aniListResult && aniListResult.characters.length > 0) {
      setCharacters(aniListResult.characters);
      setTotalPages(aniListResult.totalPages);
      setLoading(false);
      return;
    }

    // 2. Fallback to Jikan API if AniList is unreachable
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/top/characters?page=${currentPage}&limit=25`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setCharacters(data.data);
          setTotalPages(data.pagination?.last_visible_page || 10);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('Error fetching Jikan characters:', error);
    }

    // 3. Official static character fallbacks as final safety net (never show 0 characters!)
    setCharacters(FALLBACK_CHARACTERS);
    setTotalPages(1);
    setLoading(false);
  };

  // Sort local characters based on selected filter
  const sortedCharacters = [...characters].sort((a, b) => {
    if (sortBy === 'least_favorites') {
      return (a.favorites || 0) - (b.favorites || 0);
    }
    if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return (b.favorites || 0) - (a.favorites || 0);
  });

  if (loading) {
    return (
      <div className={`min-h-screen -mt-2 flex items-center justify-center transition-colors ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <Loader text="Loading Characters" size="text-2xl" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen -mt-2 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl pl-2 md:pl-0 md:text-4xl pt-12 font-bold ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            Top Characters
          </h1>
          
          {/* Sort Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`flex items-center gap-2 mt-12 px-3 md:px-4 py-2 rounded-lg border font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort: {sortBy === 'favorites' ? 'Most Popular' : sortBy === 'least_favorites' ? 'Least Popular' : sortBy === 'name' ? 'Name' : 'Most Popular'}
              <svg className={`w-4 h-4 transition-transform ${
                showSortDropdown ? 'rotate-180' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSortDropdown && (
              <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                isDark
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="py-2">
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Sort By
                  </div>
                  
                  {[
                     { value: 'favorites', label: 'Most Popular' },
                     { value: 'least_favorites', label: 'Least Popular' },
                     { value: 'name', label: 'Name' },
                   ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setCurrentPage(1);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                        sortBy === option.value
                          ? isDark
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {sortBy === option.value && (
                        <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          {sortedCharacters.map((character) => (
            <CharacterCard
              key={character.mal_id || character.id}
              image={character.images?.jpg?.image_url || '/characters/l.jpg'}
              name={character.name || 'Unknown Character'}
              seriesCount={character.favorites ? `${(character.favorites / 1000).toFixed(0)}k Likes` : 'Popular'}
              onClick={() => {
                window.location.href = `/character/${character.mal_id || character.id}?name=${encodeURIComponent(character.name)}`;
              }}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
               onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
               disabled={currentPage === 1}
               className={`px-3 py-1.5 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none transition-colors cursor-pointer text-sm ${
                 isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-600'
               }`}
             >
               Previous
             </button>
             
             {(() => {
               const startPage = Math.max(1, currentPage - 2);
               const endPage = Math.min(totalPages, startPage + 4);
               const adjustedStartPage = Math.max(1, endPage - 4);
               
               return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, index) => {
                 const pageNumber = adjustedStartPage + index;
                 return (
                   <button
                     key={`page-${pageNumber}`}
                     onClick={() => setCurrentPage(pageNumber)}
                     className={`px-3 py-1.5 border font-bold rounded-md transition-colors cursor-pointer text-sm ${
                       currentPage === pageNumber
                         ? 'bg-[#1a8ea0] text-white border-[#1a8ea0]'
                         : isDark 
                           ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-[#b24dc8] hover:text-white'
                           : 'bg-white border-gray-400 text-gray-700 hover:bg-[#b24dc8] hover:text-white'
                     }`}
                   >
                     {pageNumber}
                   </button>
                 );
               });
             })()} 
             
             {totalPages > 5 && currentPage < totalPages - 2 && (
               <span className={`px-2 ${
                 isDark ? 'text-gray-400' : 'text-gray-500'
               }`}>...</span>
             )}
             
             <button
               onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
               disabled={currentPage === totalPages}
               className={`px-3 py-1.5 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none transition-colors cursor-pointer text-sm ${
                 isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-600'
               }`}
             >
               Next
             </button>
          </div>
        )}

        {/* Page Info */}
        <div className="text-center mt-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Page {currentPage} of {totalPages} • Showing {sortedCharacters.length} characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopCharacterPage;