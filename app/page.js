"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import AnimeCarousel from "@/components/AnimeCarousel";
import AnimeSlider from "@/components/AnimeSlider";
import AnimeCard from "@/components/AnimeCard";
import Loader from "@/components/Loader";
import { useTheme } from "@/contexts/ThemeContext";
import { generateAnimeKey } from "@/lib/keyUtils";
import dynamic from "next/dynamic";

// Authentic, official MyAnimeList CDN poster images for fallbacks (NO random photos)
const FALLBACK_SLIDER_ANIMES = [
  {
    mal_id: 5114,
    title: "Fullmetal Alchemist: Brotherhood",
    title_english: "Fullmetal Alchemist: Brotherhood",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg" } },
    score: 9.1,
    synopsis: "Two brothers search for the Philosopher's Stone after a failed alchemical ritual."
  },
  {
    mal_id: 21,
    title: "One Piece",
    title_english: "One Piece",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg" } },
    score: 8.7,
    synopsis: "Monkey D. Luffy and his pirate crew explore the Grand Line in search of the One Piece."
  },
  {
    mal_id: 16498,
    title: "Attack on Titan",
    title_english: "Attack on Titan",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg" } },
    score: 9.0,
    synopsis: "Humanity fights giant Titans behind massive walled cities."
  },
  {
    mal_id: 38000,
    title: "Demon Slayer: Kimetsu no Yaiba",
    title_english: "Demon Slayer: Kimetsu no Yaiba",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg" } },
    score: 8.5,
    synopsis: "Tanjiro becomes a demon slayer to save his sister and avenge his family."
  },
  {
    mal_id: 44511,
    title: "Chainsaw Man",
    title_english: "Chainsaw Man",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg" } },
    score: 8.6,
    synopsis: "Denji merges with his chainsaw devil Pochita to hunt demons for Public Safety."
  }
];

const FALLBACK_TRENDING_ANIMES = [
  {
    mal_id: 52991,
    title: "Sousou no Frieren",
    title_english: "Frieren: Beyond Journey's End",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg" } },
    score: 9.3,
    synopsis: "An elven mage re-evaluates the meaning of life after outliving her heroic companions."
  },
  {
    mal_id: 51009,
    title: "Jujutsu Kaisen Season 2",
    title_english: "Jujutsu Kaisen Season 2",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1792/138022l.jpg" } },
    score: 8.8,
    synopsis: "Satoru Gojo and Suguru Geto take on a dangerous mission in their youth."
  },
  {
    mal_id: 52299,
    title: "Solo Leveling",
    title_english: "Solo Leveling",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1869/136206l.jpg" } },
    score: 8.5,
    synopsis: "Sung Jinwoo, the weakest hunter, acquires the unique ability to level up endlessly."
  },
  {
    mal_id: 47778,
    title: "Kimetsu no Yaiba: Katanakaji no Sato-hen",
    title_english: "Demon Slayer: Swordsmith Village Arc",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1765/135099l.jpg" } },
    score: 8.4,
    synopsis: "Tanjiro travels to the hidden Swordsmith Village to repair his Nichirin blade."
  }
];

const FALLBACK_TOP_RATED_ANIMES = [
  {
    mal_id: 28977,
    title: "Gintama°",
    title_english: "Gintama Season 4",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/3/72078l.jpg" } },
    score: 9.1,
    synopsis: "Gintoki and the Odd Jobs crew navigate comedy, samurai action, and aliens."
  },
  {
    mal_id: 9253,
    title: "Steins;Gate",
    title_english: "Steins;Gate",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1935/127974l.jpg" } },
    score: 9.0,
    synopsis: "Self-proclaimed mad scientist Okabe Rintarou accidentally invents time travel."
  },
  {
    mal_id: 11061,
    title: "Hunter x Hunter (2011)",
    title_english: "Hunter x Hunter",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/13/33465l.jpg" } },
    score: 9.0,
    synopsis: "Gon Freecss embarks on a journey to become a Hunter and find his father."
  },
  {
    mal_id: 4181,
    title: "Clannad: After Story",
    title_english: "Clannad: After Story",
    images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1299/110774l.jpg" } },
    score: 8.9,
    synopsis: "Tomoya and Nagisa navigate adulthood, family, and hardship."
  }
];

// Ultra-fast GraphQL query to AniList API (Returns authentic official anime posters in ~150ms)
const fetchAniListHomePageData = async () => {
  const query = `
    query GetHomePageAnime {
      trending: Page(page: 1, perPage: 12) {
        media(sort: [TRENDING_DESC, POPULARITY_DESC], type: ANIME) {
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
          description
        }
      }
      popular: Page(page: 1, perPage: 12) {
        media(sort: [POPULARITY_DESC], type: ANIME) {
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
          description
        }
      }
      topRated: Page(page: 1, perPage: 12) {
        media(sort: [SCORE_DESC], type: ANIME) {
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
      body: JSON.stringify({ query }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`AniList status ${res.status}`);

    const data = await res.json();
    const trending = data.data?.trending?.media || [];
    const popular = data.data?.popular?.media || [];
    const topRated = data.data?.topRated?.media || [];

    const transform = (item) => ({
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
      synopsis: item.description ? item.description.replace(/<[^>]*>?/gm, '') : ''
    });

    return {
      slider: popular.map(transform),
      trending: trending.map(transform),
      topRated: topRated.map(transform)
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("AniList GraphQL fetch error:", err);
    return null;
  }
};

// Prevent server-side rendering to avoid hydration mismatch
const ClientOnlyHomePage = dynamic(() => Promise.resolve(HomePageContent), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <Loader />
    </div>
  )
});

function HomePageContent() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [sliderAnimes, setSliderAnimes] = useState([]);
  const [trendingAnimes, setTrendingAnimes] = useState([]);
  const [topRatedAnimes, setTopRatedAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 1. Initial mounting and loading from official cache
  useEffect(() => {
    setMounted(true);

    try {
      // Clear legacy stock image cache if present
      const cacheVersion = localStorage.getItem("animabom_cache_v2");
      if (!cacheVersion) {
        localStorage.removeItem("animabom_cache_slider");
        localStorage.removeItem("animabom_cache_trending");
        localStorage.removeItem("animabom_cache_toprated");
        localStorage.setItem("animabom_cache_v2", "true");
      }

      const cachedSlider = localStorage.getItem("animabom_cache_slider");
      const cachedTrending = localStorage.getItem("animabom_cache_trending");
      const cachedTopRated = localStorage.getItem("animabom_cache_toprated");

      if (cachedSlider) setSliderAnimes(JSON.parse(cachedSlider));
      if (cachedTrending) setTrendingAnimes(JSON.parse(cachedTrending));
      if (cachedTopRated) setTopRatedAnimes(JSON.parse(cachedTopRated));

      if (cachedSlider || cachedTrending || cachedTopRated) {
        setLoading(false);
      }
    } catch (e) {
      console.warn("Could not read localStorage cache:", e);
    }
  }, []);

  // 2. Fetch official AniList API Data in Background
  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      const result = await fetchAniListHomePageData();

      if (result) {
        if (result.slider?.length > 0) setSliderAnimes(result.slider);
        if (result.trending?.length > 0) setTrendingAnimes(result.trending);
        if (result.topRated?.length > 0) setTopRatedAnimes(result.topRated);

        // Update persistent cache with official anime posters
        try {
          if (result.slider) localStorage.setItem("animabom_cache_slider", JSON.stringify(result.slider));
          if (result.trending) localStorage.setItem("animabom_cache_trending", JSON.stringify(result.trending));
          if (result.topRated) localStorage.setItem("animabom_cache_toprated", JSON.stringify(result.topRated));
          localStorage.setItem("animabom_cache_v2", "true");
        } catch (e) {
          console.warn("Failed saving cache:", e);
        }
      } else {
        // Enforce Official MyAnimeList CDN Fallbacks if API is unreachable
        setSliderAnimes(prev => (prev.length > 0 && !prev[0]?.images?.jpg?.large_image_url?.includes("unsplash")) ? prev : FALLBACK_SLIDER_ANIMES);
        setTrendingAnimes(prev => (prev.length > 0 && !prev[0]?.images?.jpg?.large_image_url?.includes("unsplash")) ? prev : FALLBACK_TRENDING_ANIMES);
        setTopRatedAnimes(prev => (prev.length > 0 && !prev[0]?.images?.jpg?.large_image_url?.includes("unsplash")) ? prev : FALLBACK_TOP_RATED_ANIMES);
      }

      setLoading(false);
    };

    loadData();
  }, [mounted, authLoading, user]);

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
    router.push(`/watchNow?id=${id}&title=${encodeURIComponent(title)}`);
  };

  const handleAdd = (anime, type) => {
    alert(`Added "${anime.title || anime.title_english}" to ${type}`);
  };

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <main className={`min-h-screen -mt-2 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Carousel Section - 70vh */}
      <div className="mb-8 md:px-4 pt-10">
        <AnimeCarousel />
      </div>

      {/* For You Section */}
      <div className="px-4 mb-2">
        <h2 className={`text-3xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>For You</h2>
      </div>
      <AnimeSlider
        animes={sliderAnimes}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onPlay={handlePlay}
        onAdd={handleAdd}
      />

      {/* Trending Now Section */}
      <div className="px-4 mb-8 mt-20">
         <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold p-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Trending Now</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/trending')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              See All
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl px-4">
            {trendingAnimes.slice(0, 9).map((anime, index) => (
              <AnimeCard
                key={generateAnimeKey(anime, index)}
                anime={anime}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(anime.mal_id || anime.id)}
                onPlay={handlePlay}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top Rated Anime Section */}
      <div className="px-4 mb-8 mt-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold p-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Top Rated Anime</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/top-rated')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              See All
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl px-4">
            {topRatedAnimes.slice(0, 12).map((anime, index) => (
              <AnimeCard
                key={generateAnimeKey(anime, index)}
                anime={anime}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(anime.mal_id || anime.id)}
                onPlay={handlePlay}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Centered Button Section */}
      <div className="flex justify-center px-10 py-12">
        <button 
          onClick={() => router.push('/top-anime')}
          className="bg-teal-500 text-white font-bold hover:cursor-pointer hover:bg-teal-400 duration-200 rounded-sm py-1 w-full"
        >
          Top anime by year and seasons
        </button>
      </div>
    </main>
  );
}

export default function HomePage() {
  return <ClientOnlyHomePage />;
}
