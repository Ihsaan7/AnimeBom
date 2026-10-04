'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import { ArrowUpDown, Filter } from 'lucide-react';
import Loader from '@/components/Loader';
import { useTheme } from '@/contexts/ThemeContext';

// Authentic category fallback sets with official poster images
const CATEGORY_FALLBACKS = [
  {
    mal_id: 5114,
    title: "Fullmetal Alchemist: Brotherhood",
    title_english: "Fullmetal Alchemist: Brotherhood",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg" } },
    score: 9.1,
    type: "TV",
    synopsis: "Two brothers search for the Philosopher's Stone."
  },
  {
    mal_id: 21,
    title: "One Piece",
    title_english: "One Piece",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg" } },
    score: 8.7,
    type: "TV",
    synopsis: "Luffy and his crew search for the One Piece."
  },
  {
    mal_id: 16498,
    title: "Attack on Titan",
    title_english: "Attack on Titan",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg" } },
    score: 9.0,
    type: "TV",
    synopsis: "Humanity fights giant Titans behind walls."
  },
  {
    mal_id: 38000,
    title: "Demon Slayer: Kimetsu no Yaiba",
    title_english: "Demon Slayer: Kimetsu no Yaiba",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg" } },
    score: 8.5,
    type: "TV",
    synopsis: "Tanjiro fights demons to save his sister."
  },
  {
    mal_id: 44511,
    title: "Chainsaw Man",
    title_english: "Chainsaw Man",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg" } },
    score: 8.6,
    type: "TV",
    synopsis: "Denji fights demons using chainsaw powers."
  },
  {
    mal_id: 52991,
    title: "Sousou no Frieren",
    title_english: "Frieren: Beyond Journey's End",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg" } },
    score: 9.3,
    type: "TV",
    synopsis: "An elven mage outlives her heroic companions."
  },
  {
    mal_id: 51009,
    title: "Jujutsu Kaisen Season 2",
    title_english: "Jujutsu Kaisen Season 2",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1792/138022l.jpg" } },
    score: 8.8,
    type: "TV",
    synopsis: "Sorcerers battle cursed spirits."
  },
  {
    mal_id: 9253,
    title: "Steins;Gate",
    title_english: "Steins;Gate",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1935/127974l.jpg" } },
    score: 9.0,
    type: "TV",
    synopsis: "A mad scientist invents a microwave time machine."
  }
];

// Map category names to official AniList genres
const getAniListGenre = (categoryName = '') => {
  const cleanName = categoryName.toLowerCase().replace(/ anime$/, '').trim();
  const genreMap = {
    'action': 'Action',
    'adventure': 'Adventure',
    'romance': 'Romance',
    'comedy': 'Comedy',
    'horror': 'Horror',
    'sci-fi': 'Sci-Fi',
    'scifi': 'Sci-Fi',
    'fantasy': 'Fantasy',
    'drama': 'Drama',
    'sports': 'Sports',
    'mecha': 'Mecha',
    'slice of life': 'Slice of Life',
    'supernatural': 'Supernatural',
    'mystery': 'Mystery',
    'psychological': 'Psychological',
    'music': 'Music',
    'thriller': 'Psychological',
    'martial arts': 'Action',
    'magic': 'Fantasy',
    'samurai': 'Action',
    'military': 'Mecha',
    'shounen': 'Action',
    'shoujo': 'Romance',
    'seinen': 'Psychological',
    'josei': 'Romance',
    'ecchi': 'Ecchi',
    'harem': 'Romance'
  };
  return genreMap[cleanName] || (cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
};

// Lightning-fast AniList GraphQL query by genre or search (~150ms response time)
const fetchAniListCategoryAnime = async (genreOrName, pageNumber = 1) => {
  const isGenre = !!getAniListGenre(genreOrName);
  const genreValue = getAniListGenre(genreOrName);
  const searchKeyword = genreOrName.replace(/ anime$/i, '').trim();

  const query = isGenre
    ? `
      query GetCategoryAnime($genre: String, $page: Int) {
        Page(page: $page, perPage: 28) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(genre: $genre, type: ANIME, sort: [POPULARITY_DESC, SCORE_DESC]) {
            id
            idMal
            title {
              english
              romaji
              native
            }
            coverImage {
              extraLarge
              large
            }
            averageScore
            popularity
            format
            description
          }
        }
      }
    `
    : `
      query GetCategoryAnimeBySearch($search: String, $page: Int) {
        Page(page: $page, perPage: 28) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: ANIME, sort: [POPULARITY_DESC, SCORE_DESC]) {
            id
            idMal
            title {
              english
              romaji
              native
            }
            coverImage {
              extraLarge
              large
            }
            averageScore
            popularity
            format
            description
          }
        }
      }
    `;

  const variables = isGenre
    ? { genre: genreValue, page: pageNumber }
    : { search: searchKeyword, page: pageNumber };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`AniList returned status ${res.status}`);

    const data = await res.json();
    const mediaList = data.data?.Page?.media || [];
    const lastPage = data.data?.Page?.pageInfo?.lastPage || 5;

    const transformed = mediaList.map((item) => ({
      mal_id: item.idMal || item.id,
      id: item.id,
      title: item.title?.english || item.title?.romaji || item.title?.native || "Anime",
      title_english: item.title?.english || item.title?.romaji || "",
      images: {
        jpg: {
          large_image_url: item.coverImage?.extraLarge || item.coverImage?.large || ""
        }
      },
      coverImage: item.coverImage,
      score: item.averageScore ? Number((item.averageScore / 10).toFixed(1)) : 8.5,
      type: item.format || "TV",
      members: item.popularity || 50000,
      synopsis: item.description ? item.description.replace(/<[^>]*>?/gm, '') : ''
    }));

    return {
      animes: transformed,
      totalPages: lastPage
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("AniList category query error:", err);
    return null;
  }
};

export default function CategoryPage() {
  const { isDark } = useTheme();
  const params = useParams();
  const categorySlug = params.slug;
  const [animes, setAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  useEffect(() => {
    if (!categoryName) return;

    const loadCategoryData = async () => {
      setLoading(true);

      // 1. Fetch from AniList GraphQL API
      const result = await fetchAniListCategoryAnime(categoryName, page);

      if (result && result.animes.length > 0) {
        setAllAnimes(result.animes);
        setTotalPages(result.totalPages);
        setLoading(false);
        return;
      }

      // 2. Fallback to authentic category fallbacks if network error
      setAllAnimes(CATEGORY_FALLBACKS);
      setTotalPages(1);
      setLoading(false);
    };

    loadCategoryData();
  }, [categoryName, page]);

  // Handle local sorting and formatting
  useEffect(() => {
    let filtered = [...allAnimes];

    if (format !== 'all') {
      filtered = filtered.filter(a => (a.type || '').toLowerCase() === format.toLowerCase());
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => (b.members || b.popularity || 0) - (a.members || a.popularity || 0));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    setAnimes(filtered);
  }, [allAnimes, sortBy, format]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleToggleFavorite = (anime) => {
    setFavorites((prev) =>
      prev.includes(anime.mal_id || anime.id)
        ? prev.filter((id) => id !== (anime.mal_id || anime.id))
        : [...prev, anime.mal_id || anime.id]
    );
  };

  const handlePlay = (anime) => {
    const id = anime.mal_id || anime.id || "";
    const title = anime.title_english || anime.title || "";
    window.location.href = `/watchNow?id=${id}&title=${encodeURIComponent(title)}`;
  };

  const handleAdd = (anime, type) => {
    alert(`Added "${anime.title || anime.title_english}" to ${type}`);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} py-4 sm:py-8 px-4 sm:px-5 pt-6 sm:pt-10 -mt-2`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-black'} capitalize text-center sm:text-left`}>{categoryName}</h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <ArrowUpDown className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select onChange={handleSortChange} value={sortBy} className={`${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border text-black'} text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md font-bold hover:cursor-pointer hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 w-full sm:w-auto`}>
                <option value="popularity">Sort: Popularity</option>
                <option value="rating">Rating</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <Filter className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select onChange={handleFormatChange} value={format} className={`${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border text-black'} rounded-md font-bold hover:cursor-pointer text-xs sm:text-sm px-2 sm:px-3 py-1.5 hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 w-full sm:w-auto`}>
                <option value="all">Format: All Formats</option>
                <option value="tv">TV</option>
                <option value="movie">Movie</option>
                <option value="ova">OVA</option>
                <option value="special">Special</option>
                <option value="ona">ONA</option>
              </select>
            </div>
          </div>
        </div>

      {loading ? (
        <div className={`flex justify-center items-center h-96 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <Loader text="Loading Collection" size="text-2xl" />
        </div>
      ) : (
        <>
          {animes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📺</div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No Anime Found</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                No anime found for {categoryName.toLowerCase()}. Try checking other categories or filters!
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl justify-items-center">
                  {animes.map((anime, index) => (
                    <AnimeCard 
                      key={`category-${categorySlug}-page-${page}-${index}-${anime.mal_id || anime.id}`}
                      anime={anime} 
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favorites.includes(anime.mal_id || anime.id)}
                      onPlay={handlePlay}
                      onAdd={handleAdd} />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-8 px-2 sm:px-4">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 text-xs sm:text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-600'} font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors`}
          >
            Previous
          </button>
            
          {(() => {
            const startPage = Math.max(1, page - 2);
            const endPage = Math.min(totalPages, startPage + 4);
            const adjustedStartPage = Math.max(1, endPage - 4);
            
            return Array.from({ length: Math.max(1, endPage - adjustedStartPage + 1) }, (_, index) => {
              const pageNumber = adjustedStartPage + index;
              return (
                <button
                  key={`page-${pageNumber}`}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1.5 text-xs sm:text-sm border font-bold rounded-md transition-colors min-w-[32px] ${
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
            
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1.5 text-xs sm:text-sm ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-600'} font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
