import React, { useState } from "react";
import { Star, Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const AnimeCard = ({ anime, onToggleFavorite, isFavorite, onPlay, onAdd }) => {
  const router = useRouter();
  // Only track hover for the + button dropdown
  const [showOptions, setShowOptions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    
    // Navigate to watchNow page with anime ID
    router.push(`/watchNow?id=${anime.mal_id}`);
  };

  const handleCardClick = () => {
    // Navigate to watchNow page with anime ID
    router.push(`/watchNow?id=${anime.mal_id}`);
  };

  return (
    <div
      className="shadow-lg relative w-56 sm:w-72 md:w-80 lg:w-70 min-w-56 h-80 sm:h-96 md:h-[28rem] rounded-xl md:rounded-2xl overflow-hidden group mx-2 md:mx-3 flex-shrink-0 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Anime Image (fills card, with blur and darkness) */}
      <img
        src={imageError ? '/carouselImages/DeathNote.jpg' : (anime.images?.jpg?.large_image_url || anime.image || '/carouselImages/DeathNote.jpg')}
        alt={anime.title}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-300 ease-in-out"
        style={{ filter: 'brightness(1) blur(3px)' }}
        onError={() => {
          console.log(`AnimeCard image failed for: ${anime.images?.jpg?.large_image_url || anime.image}. Using fallback.`)
          setImageError(true)
        }}
        onLoad={() => {
          console.log(`AnimeCard image loaded: ${imageError ? '/carouselImages/DeathNote.jpg' : (anime.images?.jpg?.large_image_url || anime.image)}`)
        }}
      />
      {/* Gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10" />
      {/* Rating badge */}
      <div className="absolute top-2 md:top-3 left-2 md:left-3 z-20 flex items-center bg-yellow-400/90 text-white text-xs md:text-sm font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded md:rounded-lg shadow">
        <Star className="w-3 h-3 md:w-4 md:h-4 mr-0.5 md:mr-1 text-white" fill="currentColor" />
        {anime.score?.toFixed ? anime.score.toFixed(1) : anime.score}
      </div>
      {/* Overlayed Buttons */}
      <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20 flex flex-col gap-1.5 md:gap-2 items-end">
        {/* Play Button */}
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-1.5 md:p-2 flex items-center justify-center w-7 h-7 md:w-9 md:h-9 shadow-lg"
          onClick={handlePlayClick}
          aria-label="Play"
        >
          <Play className="w-3 h-3 md:w-5 md:h-5" />
        </button>
        {/* Plus Button with options on hover */}
        <div className="relative group/options">
          <button
            className="bg-white/90 hover:bg-white text-purple-700 rounded-full p-1.5 md:p-2 flex items-center justify-center w-7 h-7 md:w-9 md:h-9 shadow-lg"
            onMouseEnter={() => setShowOptions(true)}
            onMouseLeave={() => setShowOptions(false)}
            aria-label="More Options"
            tabIndex={0}
            onClick={(e) => e.stopPropagation()} // Prevent card click event
          >
            <Plus className="w-3 h-3 md:w-5 md:h-5" />
          </button>
          {/* Dropdown on hover */}
          {showOptions && (
            <div
              className="absolute right-0 top-8 md:top-12 z-30 bg-white text-gray-900 rounded-lg md:rounded-xl shadow-lg py-1.5 md:py-2 px-2 md:px-3 min-w-[140px] md:min-w-[160px] animate-fade-in"
              onMouseEnter={() => setShowOptions(true)}
              onMouseLeave={() => setShowOptions(false)}
              onClick={(e) => e.stopPropagation()} // Prevent card click event
            >
              <button className="block w-full text-left py-1 px-1.5 md:px-2 hover:bg-gray-100 rounded text-xs md:text-sm" onClick={(e) => { e.stopPropagation(); onAdd(anime, 'watchlist'); }}>Add to Watchlist</button>
              <button className="block w-full text-left py-1 px-1.5 md:px-2 hover:bg-gray-100 rounded text-xs md:text-sm" onClick={(e) => { e.stopPropagation(); onAdd(anime, 'favorites'); }}>Add to Favorites</button>
              <button className="block w-full text-left py-1 px-1.5 md:px-2 hover:bg-gray-100 rounded text-xs md:text-sm" onClick={(e) => { e.stopPropagation(); onAdd(anime, 'custom'); }}>Add to Custom List</button>
            </div>
          )}
        </div>
        {/* Favorite Star Button */}
        <button
          className={`bg-white/90 hover:bg-yellow-400 text-yellow-500 rounded-full p-1.5 md:p-2 flex items-center justify-center w-7 h-7 md:w-9 md:h-9 shadow-lg ${isFavorite ? 'bg-yellow-400 text-white' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(anime); }}
          aria-label="Toggle Favorite"
        >
          <Star fill={isFavorite ? 'currentColor' : 'none'} className="w-3 h-3 md:w-5 md:h-5" />
        </button>
      </div>
      {/* Title at bottom */}
      <div className="absolute bottom-0 left-0 w-full z-20 p-2 md:p-4 flex flex-col">
        <span className="text-white text-sm md:text-lg font-bold drop-shadow mb-0.5 md:mb-1 truncate" title={anime.title}>{anime.title}</span>
        {anime.title_english && (
          <span className="text-white/80 text-xs md:text-sm font-semibold truncate" title={anime.title_english}>{anime.title_english}</span>
        )}
      </div>
    </div>
  );
};

export default AnimeCard;
