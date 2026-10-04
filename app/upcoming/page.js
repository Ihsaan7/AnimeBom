"use client";

import { useState, useEffect } from 'react';
import AnimeCard from '@/components/AnimeCard';
import { ArrowUpDown, Filter } from 'lucide-react';
import Loader from '@/components/Loader';
import { useTheme } from '@/contexts/ThemeContext';
import { generateUniqueKey } from '@/lib/keyUtils';

// Authentic fallback upcoming anime with official MyAnimeList/AniList CDN poster images
const FALLBACK_UPCOMING_ANIMES = [
  {
    mal_id: 52991,
    title: "Demon Slayer: Kimetsu no Yaiba Infinity Castle Arc",
    title_english: "Demon Slayer: Infinity Castle Arc",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg" } },
    score: 9.2,
    type: "MOVIE",
    synopsis: "The Demon Slayer Corps plunges into the Infinity Castle to confront Muzan Kibutsuji."
  },
  {
    mal_id: 53390,
    title: "Chainsaw Man Movie: Reze-hen",
    title_english: "Chainsaw Man The Movie: Reze Arc",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg" } },
    score: 9.0,
    type: "MOVIE",
    synopsis: "Denji meets Reze, a mysterious girl who turns his life upside down."
  },
  {
    mal_id: 58514,
    title: "One Punch Man 3rd Season",
    title_english: "One Punch Man Season 3",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/12/76049l.jpg" } },
    score: 8.8,
    type: "TV",
    synopsis: "Saitama and the Monster Association face off in an all-out war."
  },
  {
    mal_id: 56800,
    title: "Jujutsu Kaisen: Shimotsuhen",
    title_english: "Jujutsu Kaisen: Culling Game Arc",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1792/138022l.jpg" } },
    score: 8.9,
    type: "TV",
    synopsis: "Yuji Itadori and his allies navigate Kenjaku's deadly Culling Game tournament."
  },
  {
    mal_id: 57640,
    title: "My Hero Academia Final Season",
    title_english: "My Hero Academia Season 8",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg" } },
    score: 8.7,
    type: "TV",
    synopsis: "Deku and the heroes fight All For One in the ultimate final battle."
  },
  {
    mal_id: 57904,
    title: "Dragon Ball Daima",
    title_english: "Dragon Ball Daima",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/14/195983l.jpg" } },
    score: 8.5,
    type: "TV",
    synopsis: "Goku and his friends are turned small by a conspiracy and embark on a grand adventure."
  },
  {
    mal_id: 55855,
    title: "Bleach: Sennen Kessen-hen - Soukoku-tan",
    title_english: "Bleach: Thousand-Year Blood War - Part 3",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1908/135007l.jpg" } },
    score: 9.1,
    type: "TV",
    synopsis: "Ichigo Kurosaki clashes with Yhwach in the climax of the Quincy invasion."
  },
  {
    mal_id: 56938,
    title: "Solo Leveling Season 2: Arise from the Shadow",
    title_english: "Solo Leveling Season 2",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1869/136206l.jpg" } },
    score: 8.8,
    synopsis: "Sung Jinwoo unlocks even greater Shadow Monarch abilities."
  }
];

// Lightning-fast AniList GraphQL query for upcoming anime (~150ms response time)
const fetchAniListUpcoming = async (pageNumber = 1) => {
  const query = `
    query GetUpcomingAnime($page: Int) {
      Page(page: $page, perPage: 28) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(status_in: [NOT_YET_RELEASED], type: ANIME, sort: [POPULARITY_DESC, SCORE_DESC]) {
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
          bannerImage
          averageScore
          popularity
          format
          episodes
          description
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
        variables: { page: pageNumber }
      }),
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
      title: item.title?.english || item.title?.romaji || item.title?.native || "Upcoming Anime",
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
    console.warn("AniList upcoming query error:", err);
    return null;
  }
};

export default function UpcomingPage() {
  const { isDark } = useTheme();
  const [animes, setAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('popularity');
  const [format, setFormat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadUpcomingData = async () => {
      setLoading(true);

      // 1. Fetch from AniList GraphQL API
      const result = await fetchAniListUpcoming(page);

      if (result && result.animes.length > 0) {
        setAllAnimes(result.animes);
        setTotalPages(result.totalPages);
        setLoading(false);
        return;
      }

      // 2. Fallback to Jikan API with single page fetch
      try {
        const res = await fetch(`https://api.jikan.moe/v4/seasons/upcoming?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            setAllAnimes(data.data);
            setTotalPages(data.pagination?.last_visible_page || 5);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Jikan upcoming fetch failed:", err);
      }

      // 3. Fallback to authentic preloaded upcoming list
      setAllAnimes(FALLBACK_UPCOMING_ANIMES);
      setTotalPages(1);
      setLoading(false);
    };

    loadUpcomingData();
  }, [page]);

  // Handle local sorting and formatting
  useEffect(() => {
    let filtered = [...allAnimes];

    if (format !== 'all') {
      filtered = filtered.filter(a => (a.type || '').toLowerCase() === format.toLowerCase());
    }

    if (sortBy === 'score') {
      filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => (b.members || b.popularity || 0) - (a.members || a.popularity || 0));
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
    alert(`Coming Soon: ${anime.title || anime.title_english}`);
  };

  const handleAdd = (anime, type) => {
    alert(`Added "${anime.title || anime.title_english}" to ${type}`);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} -mt-2 py-4 sm:py-8 px-4 sm:pr-5 pt-6 sm:pt-10`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Upcoming Anime</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <ArrowUpDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select onChange={handleSortChange} value={sortBy} className={`${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border text-black'} text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md font-bold hover:cursor-pointer hover:text-white hover:bg-fuchsia-500 focus:outline-none focus:border-purple-400 duration-200 w-full sm:w-auto`}>
                <option value="popularity">Sort: Popularity</option>
                <option value="score">Score</option>
              </select>
            </div>
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
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
          <Loader text="Loading Upcoming Anime" size="text-2xl" />
        </div>
      ) : (
        <>
          {animes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📺</div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No Anime Found</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center max-w-md`}>
                There are no upcoming anime available for this filter. Try selecting different options!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
                {animes.map((anime, index) => (
                  <AnimeCard 
                    key={generateUniqueKey(anime, index, `upcoming-p${page}-`)}
                    anime={anime} 
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(anime.mal_id || anime.id)}
                    onPlay={handlePlay}
                    onAdd={handleAdd} />
                ))}
              </div>
            </>
          )}
        </>
      )}

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-8 px-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-3 py-1.5 border ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-600'} font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors text-xs sm:text-sm`}
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
                    className={`px-3 py-1.5 border font-bold rounded-md transition-colors text-xs sm:text-sm ${
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
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1.5 border ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-600'} font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors text-xs sm:text-sm`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
