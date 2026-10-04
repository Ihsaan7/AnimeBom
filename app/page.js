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

// High-quality local fallbacks in case Jikan API rate-limits, fails, or times out
const FALLBACK_SLIDER_ANIMES = [
  {
    mal_id: 5114,
    title: "Fullmetal Alchemist: Brotherhood",
    title_english: "Fullmetal Alchemist: Brotherhood",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60" } },
    score: 9.1,
    synopsis: "Two brothers search for the Philosopher's Stone."
  },
  {
    mal_id: 21,
    title: "One Piece",
    title_english: "One Piece",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60" } },
    score: 8.7,
    synopsis: "Luffy and his crew search for the ultimate treasure."
  },
  {
    mal_id: 16498,
    title: "Attack on Titan",
    title_english: "Attack on Titan",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=600&auto=format&fit=crop&q=60" } },
    score: 9.0,
    synopsis: "Humanity fights giant titans for survival."
  },
  {
    mal_id: 38000,
    title: "Demon Slayer: Kimetsu no Yaiba",
    title_english: "Demon Slayer: Kimetsu no Yaiba",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&auto=format&fit=crop&q=60" } },
    score: 8.5,
    synopsis: "Tanjiro fights demons to save his sister."
  },
  {
    mal_id: 44511,
    title: "Chainsaw Man",
    title_english: "Chainsaw Man",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=60" } },
    score: 8.6,
    synopsis: "Denji gains chainsaw powers and joins demon hunters."
  }
];

const FALLBACK_TRENDING_ANIMES = [
  {
    mal_id: 52991,
    title: "Sousou no Frieren",
    title_english: "Frieren: Beyond Journey's End",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=60" } },
    score: 9.3,
    synopsis: "An elf mage re-evaluates life and connections."
  },
  {
    mal_id: 51009,
    title: "Jujutsu Kaisen Season 2",
    title_english: "Jujutsu Kaisen Season 2",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60" } },
    score: 8.8,
    synopsis: "Sorcerers battle ancient cursed spirits."
  },
  {
    mal_id: 52299,
    title: "Solo Leveling",
    title_english: "Solo Leveling",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60" } },
    score: 8.5,
    synopsis: "The weakest hunter gets a chance to level up infinitely."
  },
  {
    mal_id: 47778,
    title: "Kimetsu no Yaiba: Katanakaji no Sato-hen",
    title_english: "Demon Slayer: Swordsmith Village Arc",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60" } },
    score: 8.4,
    synopsis: "Tanjiro visits the hidden swordsmith village."
  }
];

const FALLBACK_TOP_RATED_ANIMES = [
  {
    mal_id: 28977,
    title: "Gintama°",
    title_english: "Gintama Season 4",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600&auto=format&fit=crop&q=60" } },
    score: 9.1,
    synopsis: "Gintoki and his friends in bizarre comedy/action."
  },
  {
    mal_id: 9253,
    title: "Steins;Gate",
    title_english: "Steins;Gate",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60" } },
    score: 9.0,
    synopsis: "A mad scientist discovers time travel."
  },
  {
    mal_id: 11061,
    title: "Hunter x Hunter (2011)",
    title_english: "Hunter x Hunter",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60" } },
    score: 9.0,
    synopsis: "Gon aims to become a legendary Hunter."
  },
  {
    mal_id: 4181,
    title: "Clannad: After Story",
    title_english: "Clannad: After Story",
    images: { jpg: { large_image_url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop&q=60" } },
    score: 8.9,
    synopsis: "A legendary story of love, family, and loss."
  }
];

// Helper to fetch with strict timeout
const fetchWithTimeout = async (resource, options = {}) => {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
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

  // 1. Initial mounting and loading from Cache
  useEffect(() => {
    setMounted(true);
    
    // Load from Cache immediately to support instant rendering (UX Optimistic Load)
    try {
      const cachedSlider = localStorage.getItem("animabom_cache_slider");
      const cachedTrending = localStorage.getItem("animabom_cache_trending");
      const cachedTopRated = localStorage.getItem("animabom_cache_toprated");

      if (cachedSlider) setSliderAnimes(JSON.parse(cachedSlider));
      if (cachedTrending) setTrendingAnimes(JSON.parse(cachedTrending));
      if (cachedTopRated) setTopRatedAnimes(JSON.parse(cachedTopRated));

      if (cachedSlider || cachedTrending || cachedTopRated) {
        // If we have any cached data, skip full-screen loading state
        setLoading(false);
      }
    } catch (e) {
      console.warn("Could not read localStorage cache:", e);
    }
  }, []);

  // 2. Fetch API Data in Background
  useEffect(() => {
    if (!mounted) return;

    const fetchAllAnimeData = async () => {
      let sliderFetched = null;
      let trendingFetched = null;
      let topRatedFetched = null;

      try {
        // 1. Fetch Slider (Timeout 4s)
        try {
          const sliderRes = await fetchWithTimeout("https://api.jikan.moe/v4/top/anime?limit=15", { timeout: 4000 });
          if (sliderRes.ok) {
            const sliderData = await sliderRes.json();
            let arr = sliderData.data || [];
            arr = arr.sort(() => 0.5 - Math.random());
            sliderFetched = arr.slice(0, 10);
            setSliderAnimes(sliderFetched);
          }
        } catch (err) {
          console.warn("Failed fetching slider:", err);
        }

        // Wait 1 second to stay within Jikan rate limits safely
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 2. Fetch Trending (Timeout 4s)
        try {
          const trendingRes = await fetchWithTimeout("https://api.jikan.moe/v4/top/anime?filter=airing&limit=15", { timeout: 4000 });
          if (trendingRes.ok) {
            const trendingData = await trendingRes.json();
            const arr = trendingData.data || [];
            
            // Unique filtering
            const unique = [];
            const seen = new Set();
            for (const item of arr) {
              const title = (item.title || item.title_english || "").toLowerCase().trim();
              if (title && !seen.has(title)) {
                seen.add(title);
                unique.push(item);
              }
              if (unique.length >= 10) break;
            }
            trendingFetched = unique;
            setTrendingAnimes(trendingFetched);
          }
        } catch (err) {
          console.warn("Failed fetching trending:", err);
        }

        // Wait 1 second to stay within Jikan rate limits safely
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Fetch Top Rated (Timeout 4s)
        try {
          const topRatedRes = await fetchWithTimeout("https://api.jikan.moe/v4/top/anime?limit=15", { timeout: 4000 });
          if (topRatedRes.ok) {
            const topRatedData = await topRatedRes.json();
            const arr = topRatedData.data || [];

            const unique = [];
            const seen = new Set();
            for (const item of arr) {
              const title = (item.title || item.title_english || "").toLowerCase().trim();
              if (title && !seen.has(title)) {
                seen.add(title);
                unique.push(item);
              }
              if (unique.length >= 12) break;
            }
            topRatedFetched = unique;
            setTopRatedAnimes(topRatedFetched);
          }
        } catch (err) {
          console.warn("Failed fetching toprated:", err);
        }

        // Cache successful requests
        try {
          if (sliderFetched) localStorage.setItem("animabom_cache_slider", JSON.stringify(sliderFetched));
          if (trendingFetched) localStorage.setItem("animabom_cache_trending", JSON.stringify(trendingFetched));
          if (topRatedFetched) localStorage.setItem("animabom_cache_toprated", JSON.stringify(topRatedFetched));
        } catch (e) {
          console.warn("Failed saving cache:", e);
        }

      } catch (error) {
        console.error("Critical error in overall fetching lifecycle:", error);
      } finally {
        // Enforce Fallback sets if state is still empty after fetch lifecycle
        setSliderAnimes(prev => prev.length > 0 ? prev : FALLBACK_SLIDER_ANIMES);
        setTrendingAnimes(prev => prev.length > 0 ? prev : FALLBACK_TRENDING_ANIMES);
        setTopRatedAnimes(prev => prev.length > 0 ? prev : FALLBACK_TOP_RATED_ANIMES);
        
        // Remove fullscreen loader completely
        setLoading(false);
      }
    };

    fetchAllAnimeData();
  }, [mounted, authLoading, user]);

  const handleToggleFavorite = (anime) => {
    setFavorites((prev) =>
      prev.includes(anime.mal_id)
        ? prev.filter((id) => id !== anime.mal_id)
        : [...prev, anime.mal_id]
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

  const handleRetry = () => {
    setLoading(true);
    // Directly clear cache and reload window to guarantee clean state
    try {
      localStorage.removeItem("animabom_cache_slider");
      localStorage.removeItem("animabom_cache_trending");
      localStorage.removeItem("animabom_cache_toprated");
    } catch {}
    window.location.reload();
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
                isFavorite={favorites.includes(anime.mal_id)}
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
                isFavorite={favorites.includes(anime.mal_id)}
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
