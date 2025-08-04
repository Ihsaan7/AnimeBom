import React, { useRef, useEffect, useState } from "react";
import AnimeCard from "./AnimeCard";
import { generateAnimeKey } from "@/lib/keyUtils";

const AUTO_SCROLL_SPEED = 1.2; // px per frame

const AnimeSlider = ({ animes, favorites, onToggleFavorite, onPlay, onAdd }) => {
  const sliderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (!sliderRef.current || isPaused) return;
    let frame;
    const scroll = () => {
      if (!sliderRef.current) return;
      sliderRef.current.scrollLeft += AUTO_SCROLL_SPEED;
      // Loop scroll
      if (
        sliderRef.current.scrollLeft + sliderRef.current.offsetWidth >=
        sliderRef.current.scrollWidth - 1
      ) {
        sliderRef.current.scrollLeft = 0;
      }
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
    // Only depend on isPaused, not animes.length, to avoid dependency array size warning
  }, [isPaused]);

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div className="w-full py-6 px-5">
      <div
        ref={sliderRef}
        className="flex overflow-x-auto no-scrollbar px-4 gap-2 scrollbar-hide"
        style={{ scrollBehavior: "smooth", minHeight: 400 }}
      >
        {animes.map((anime, idx) => (
          <div
            key={generateAnimeKey(anime, idx)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className=""
          >
            <AnimeCard
              anime={anime}
              isFavorite={favorites.includes(anime.mal_id || anime.id)}
              onToggleFavorite={onToggleFavorite}
              onPlay={onPlay}
              onAdd={onAdd}
            />
          </div>
        ))}
      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar, .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar, .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AnimeSlider;