"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import { useRouter } from "next/navigation";
import AnimeCarousel from "@/components/AnimeCarousel";
import AnimeSlider from "@/components/AnimeSlider";
import AnimeCard from "@/components/AnimeCard";
import Loader from "@/components/Loader";
import { useTheme } from "@/contexts/ThemeContext";
import { generateAnimeKey } from "@/lib/keyUtils";

export default function HomePage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, loading: authLoading } = useSupabaseAuth();
  const [favorites, setFavorites] = useState([]);
  const [sliderAnimes, setSliderAnimes] = useState([]);
  const [trendingAnimes, setTrendingAnimes] = useState([]);
  const [topRatedAnimes, setTopRatedAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Redirect non-authenticated users to signup page
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
  }, [user, authLoading, router]);

  // Sequential API fetching to avoid rate limiting
  useEffect(() => {
    const fetchAllAnimeData = async () => {
      setLoading(true);
      
      try {
        // Fetch slider anime first
        console.log('Fetching slider anime...');
        const sliderRes = await fetch("https://api.jikan.moe/v4/top/anime?limit=20");
        if (sliderRes.ok) {
          const sliderData = await sliderRes.json();
          let sliderAnimes = sliderData.data || [];
          sliderAnimes = sliderAnimes.sort(() => 0.5 - Math.random());
          setSliderAnimes(sliderAnimes.slice(0, 10));
        }
        
        // Wait 2 seconds before next request
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fetch trending anime
        console.log('Fetching trending anime...');
        const trendingRes = await fetch("https://api.jikan.moe/v4/top/anime?filter=airing&limit=20");
        if (trendingRes.ok) {
          const trendingData = await trendingRes.json();
          const trendingAnimes = trendingData.data || [];
          
          // Filter out duplicates based on title
          const uniqueTrending = [];
          const seenTitles = new Set();
          
          for (const anime of trendingAnimes) {
            const title = anime.title || anime.title_english || anime.title_japanese;
            const normalizedTitle = title.toLowerCase().trim();
            
            if (!seenTitles.has(normalizedTitle)) {
              seenTitles.add(normalizedTitle);
              uniqueTrending.push(anime);
            }
            
            if (uniqueTrending.length >= 10) break;
          }
          
          setTrendingAnimes(uniqueTrending);
        }
        
        // Wait 2 seconds before next request
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fetch top rated anime
        console.log('Fetching top rated anime...');
        const topRatedRes = await fetch("https://api.jikan.moe/v4/top/anime?limit=25");
        if (topRatedRes.ok) {
          const topRatedData = await topRatedRes.json();
          const topRatedAnimes = topRatedData.data || [];
          
          // Filter out duplicates based on title
          const uniqueTopRated = [];
          const seenTitles = new Set();
          
          for (const anime of topRatedAnimes) {
            const title = anime.title || anime.title_english || anime.title_japanese;
            const normalizedTitle = title.toLowerCase().trim();
            
            if (!seenTitles.has(normalizedTitle)) {
              seenTitles.add(normalizedTitle);
              uniqueTopRated.push(anime);
            }
            
            if (uniqueTopRated.length >= 16) break;
          }
          
          setTopRatedAnimes(uniqueTopRated);
        }
        
      } catch (error) {
        console.error('Error fetching anime data:', error);
        // Set fallback data if needed
        if (sliderAnimes.length === 0) setSliderAnimes([]);
        if (trendingAnimes.length === 0) setTrendingAnimes([]);
        if (topRatedAnimes.length === 0) setTopRatedAnimes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllAnimeData();
  }, []);  // Remove retryCount dependency to prevent infinite loops

  // Simple retry mechanism if all data fails to load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sliderAnimes.length === 0 && trendingAnimes.length === 0 && topRatedAnimes.length === 0 && !loading && retryCount < 3) {
        console.log(`Retrying API calls... (attempt ${retryCount + 1})`);
        setRetryCount(prev => prev + 1);
        // Trigger refetch by updating a dependency
        window.location.reload();
      }
    }, 10000); // Wait 10 seconds before retry

    return () => clearTimeout(timer);
  }, [sliderAnimes, trendingAnimes, topRatedAnimes, loading, retryCount]);

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

  const handleRetry = () => {
    setLoading(true);
    setRetryCount(prev => prev + 1);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <main className={`min-h-screen -mt-2   transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Carousel Section - 70vh */}
      <div className="mb-8 md:px-4 pt-10">
        <AnimeCarousel />
      </div>

      {/* For You Section */}
      <div className="px-4 mb-2 ">
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
      <div className="px-4 mb-8 mt-20 ">
         <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold p-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Trending Now</h2>
          <div className="flex gap-2">
            {(trendingAnimes.length === 0 && !loading) && (
              <button 
                onClick={handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            )}
            <button 
              onClick={() => router.push('/trending')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              See All
            </button>
          </div>
        </div>
        {loading && trendingAnimes.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader text="Loading " size="text-xl" className="h-64" />
          </div>
        ) : trendingAnimes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Failed to load trending anime</p>
            <button 
              onClick={handleRetry}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Top Rated Anime Section */}
      <div className="px-4 mb-8 mt-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold p-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Top Rated Anime</h2>
          <div className="flex gap-2">
            {(topRatedAnimes.length === 0 && !loading) && (
              <button 
                onClick={handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            )}
            <button 
              onClick={() => router.push('/top-rated')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              See All
            </button>
          </div>
        </div>
        
        {loading && topRatedAnimes.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader text="Loading " size="text-xl" className="h-64" />
          </div>
        ) : topRatedAnimes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Failed to load top rated anime</p>
            <button 
              onClick={handleRetry}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
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
        )}
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
