"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import Loader from "./Loader";
import { useTheme } from '@/contexts/ThemeContext';

const AnimeCarousel = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [animes, setAnimes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        // Define the anime we have local images for with search terms
        const targetAnime = [
          { search: "Fullmetal Alchemist", localImage: "/carouselImages/FullMetal.jpg" },
          { search: "Attack on Titan", localImage: "/carouselImages/AttackOnTaitan.jpg" },
          { search: "Death Note", localImage: "/carouselImages/DeathNote.jpg" },
          { search: "Demon Slayer", localImage: "/carouselImages/DemonSlayer.jpg" },
          { search: "My Hero Academia", localImage: "/carouselImages/MyHeroAcademia.png" },
          { search: "Chainsaw Man", localImage: "/carouselImages/Chainsaw.png" },
          { search: "Dragon Ball Z", localImage: "/carouselImages/DragonBallZ.jpg" },
          { search: "Sakamoto Days", localImage: "/carouselImages/SakamotoDays2.png" },
          { search: "To Be Hero X", localImage: "/carouselImages/ToBeHeroX.jpg" },
          { search: "One Piece", localImage: "/carouselImages/onePiece.jpg" }
        ];

        // Fetch specific anime from Kitsu API
        const promises = targetAnime.map(async (anime) => {
          const response = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(anime.search)}&page[limit]=5&sort=-averageRating`);
          const data = await response.json();
          return { anime: data.data?.[0], localImage: anime.localImage };
        });

        const results = await Promise.all(promises);
        const validAnime = results.filter(result => result.anime && result.anime.attributes?.synopsis);

        // Create a mapping of anime titles to their correct MAL IDs
        const titleToMalId = {
          "Fullmetal Alchemist: Brotherhood": 5114,
          "Fullmetal Alchemist": 5114,
          "Attack on Titan": 16498,
          "Shingeki no Kyojin": 16498,
          "Death Note": 1535,
          "Demon Slayer": 38000,
          "Kimetsu no Yaiba": 38000,
          "My Hero Academia": 31964,
          "Boku no Hero Academia": 31964,
          "Chainsaw Man": 44511,
          "Dragon Ball Z": 813,
          "Sakamoto Days": 32542,
          "To Be Hero X": 31710,
          "One Piece": 21
        };

        const transformedAnimes = validAnime.map(result => {
          const anime = result.anime;
          const englishTitle = anime.attributes?.titles?.en_jp || anime.attributes?.canonicalTitle;
          // Prioritize English titles over Japanese/Chinese titles
          const title = anime.attributes?.titles?.en_jp || anime.attributes?.canonicalTitle || anime.attributes?.titles?.ja_jp;
          
          // Try to find the correct MAL ID based on title matching
          let malId = null;
          for (const [titleKey, id] of Object.entries(titleToMalId)) {
            if (title?.toLowerCase().includes(titleKey.toLowerCase()) || 
                englishTitle?.toLowerCase().includes(titleKey.toLowerCase())) {
              malId = id;
              break;
            }
          }
          
          return {
            mal_id: malId || anime.id, // Use mapped MAL ID if found, otherwise fallback to Kitsu ID
            title: title,
            title_english: englishTitle,
            images: { 
              jpg: { 
                large_image_url: result.localImage // Always use local image
              } 
            },
            score: parseFloat(anime.attributes?.averageRating) / 10 || 8.5,
            synopsis: anime.attributes?.synopsis
          };
        });

        setAnimes(transformedAnimes);
      } catch (error) {
        console.error('Error fetching anime:', error);
        // Fallback data using local images with correct MAL IDs
        setAnimes([
          {
            mal_id: 5114,
            title: "Fullmetal Alchemist: Brotherhood",
            title_english: "Fullmetal Alchemist: Brotherhood",
            images: { jpg: { large_image_url: "/carouselImages/FullMetal.jpg" } },
            score: 9.2,
            synopsis: "Two brothers lose their bodies in an alchemical ritual gone wrong. Now they must journey to find the Philosopher's Stone to restore what was lost."
          },
          {
            mal_id: 16498,
            title: "Attack on Titan",
            title_english: "Attack on Titan",
            images: { jpg: { large_image_url: "/carouselImages/AttackOnTaitan.jpg" } },
            score: 9.0,
            synopsis: "Humanity's last stronghold is under siege by giant humanoid creatures. A young soldier seeks revenge and uncovers the truth about these titans."
          },
          {
            mal_id: 1535,
            title: "Death Note",
            title_english: "Death Note",
            images: { jpg: { large_image_url: "/carouselImages/DeathNote.jpg" } },
            score: 8.9,
            synopsis: "A brilliant student discovers a supernatural notebook that allows him to kill anyone whose name he writes in it."
          },
          {
            mal_id: 38000,
            title: "Demon Slayer: Kimetsu no Yaiba",
            title_english: "Demon Slayer: Kimetsu no Yaiba",
            images: { jpg: { large_image_url: "/carouselImages/DemonSlayer.jpg" } },
            score: 8.8,
            synopsis: "A young boy becomes a demon slayer to save his sister and avenge his family."
          },
          {
            mal_id: 31964,
            title: "My Hero Academia",
            title_english: "My Hero Academia",
            images: { jpg: { large_image_url: "/carouselImages/MyHeroAcademia.png" } },
            score: 8.5,
            synopsis: "In a world where people have superpowers, a boy without powers strives to become a hero."
          },
          {
            mal_id: 44511,
            title: "Chainsaw Man",
            title_english: "Chainsaw Man",
            images: { jpg: { large_image_url: "/carouselImages/Chainsaw.png" } },
            score: 8.7,
            synopsis: "A young man becomes a demon hunter with chainsaw powers to save his dog and pay off his debts."
          },
          {
            mal_id: 813,
            title: "Dragon Ball Z",
            title_english: "Dragon Ball Z",
            images: { jpg: { large_image_url: "/carouselImages/DragonBallZ.jpg" } },
            score: 8.6,
            synopsis: "A warrior protects Earth from various threats while searching for the Dragon Balls."
          },
          {
            mal_id: 32542,
            title: "Sakamoto Days",
            title_english: "Sakamoto Days",
            images: { jpg: { large_image_url: "/carouselImages/SakamotoDays2.png" } },
            score: 8.4,
            synopsis: "A legendary hitman retires to run a convenience store but trouble keeps finding him."
          },
          {
            mal_id: 31710,
            title: "To Be Hero X",
            title_english: "To Be Hero X",
            images: { jpg: { large_image_url: "/carouselImages/ToBeHeroX.jpg" } },
            score: 8.3,
            synopsis: "A father becomes a hero to protect his daughter in a bizarre adventure."
          },
          {
            mal_id: 21,
            title: "One Piece",
            title_english: "One Piece",
            images: { jpg: { large_image_url: "/carouselImages/onePiece.jpg" } },
            score: 8.6,
            synopsis: "A pirate crew searches for the ultimate treasure in a world of adventure and danger."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === animes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? animes.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      } else if (event.key === ' ') {
        event.preventDefault();
        setIsPaused(!isPaused);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPaused]);

  // Auto-play functionality
  useEffect(() => {
    if (animes.length > 0 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === animes.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [animes.length, isPaused]);

  if (loading) {
    return (
      <div className={`h-[70vh] flex items-center justify-center transition-colors ${
        isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-100 to-gray-200'
      }`}>
        <Loader text="Loading Anime" size="text-xl" className="h-64" />
      </div>
    );
  }

  const currentAnime = animes[currentIndex];

  return (
    <div className={`relative h-[70vh] pb-10 md:pb-0 lg:pb-0 w-full overflow-hidden ${
      loading ? '' : (isDark ? 'bg-black' : 'bg-white')
    }`}>
      {/* Background Image */}
      <div 
        className=" absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 filter brightness-90"
        style={{
          backgroundImage: `url(${currentAnime?.images?.jpg?.large_image_url})`,
        }}
      />
      
      {/* Bottom Gradient Overlay (covers only up to text height) */}
      <div
        className="absolute left-0 right-0 bottom-0 h-1/2 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.0) 100%)"
        }}
      />

      {/* Content - Bottom Left */}
      <div className="relative z-10 h-full flex items-end">
        <div className="p-8 max-w-md">
          {/* Title */}
          <motion.h1 
            key={currentAnime?.mal_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {currentAnime?.title}
          </motion.h1>

          {/* Rating */}
          <motion.div 
            key={`rating-${currentAnime?.mal_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center mb-3"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-semibold text-white">
              {currentAnime?.score?.toFixed(1)}
            </span>
          </motion.div>

          {/* Synopsis */}
          <motion.p 
            key={`synopsis-${currentAnime?.mal_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-gray-300 mb-4 leading-relaxed"
          >
            {currentAnime?.synopsis?.length > 150 
              ? `${currentAnime.synopsis.substring(0, 150)}...` 
              : currentAnime?.synopsis
            }
          </motion.p>

          {/* Watch Now Button */}
          <motion.button
            key={`button-${currentAnime?.mal_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => {
              if (currentAnime?.mal_id) {
                router.push(`/watchNow?id=${currentAnime.mal_id}`);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center transition-colors duration-200 cursor-pointer"
          >
            <Play className="w-3 h-3 mr-1" />
            Watch Now
          </motion.button>
        </div>
      </div>

      {/* Navigation Arrows - Bottom Right */}
      <div className="absolute bottom-8 right-8 flex space-x-2 z-20">
        <button
          onClick={prevSlide}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={nextSlide}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {animes.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white w-3' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-full text-sm z-20 transition-colors duration-200"
      >
        {isPaused ? 'Play' : 'Pause'}
      </button>
    </div>
  );
};

export default AnimeCarousel;