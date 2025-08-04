'use client';
import React, { useState, useEffect } from 'react';
import CollectCard from '@/components/CollectCard';
import { useTheme } from '@/contexts/ThemeContext';

// List of all available card background images
const bgImages = [
  '/CardBgImages/bg1.jpg',
  '/CardBgImages/bg2.jpg',
  '/CardBgImages/bg3.jpg',
  '/CardBgImages/bg4.jpg',
  '/CardBgImages/bg5.jpg',
  '/CardBgImages/bg6.jpg',
  '/CardBgImages/bg7.jpg',
  '/CardBgImages/bg8.jpg',
  '/CardBgImages/bg9.jpg',
  '/CardBgImages/bg10.jpg',
];

// Expanded anime collection categories for better variety across pages
const animeCategories = [
  'Action Anime',
  'Adventure Anime', 
  'Romance Anime',
  'Comedy Anime',
  'Horror Anime',
  'Sci-Fi Anime',
  'Fantasy Anime',
  'Drama Anime',
  'Sports Anime',
  'Mecha Anime',
  'Slice of Life',
  'Supernatural',
  'Mystery Anime',
  'Historical Anime',
  'Music Anime',
  'Thriller Anime',
  'School Anime',
  'War Anime',
  'Isekai Anime',
  'Martial Arts',
  'Psychological',
  'Cyberpunk',
  'Post-Apocalyptic',
  'Vampire Anime',
  'Magic Anime',
  'Ninja Anime',
  'Samurai Anime',
  'Time Travel',
  'Alternate World',
  'Monster Anime',
  'Racing Anime',
  'Cooking Anime',
  'Detective Anime',
  'Military Anime',
  'Space Opera',
  'Steampunk',
  'Zombie Anime',
  'Idol Anime',
  'Magical Girl',
  'Yaoi/BL',
  'Yuri/GL',
  'Ecchi Anime',
  'Harem Anime',
  'Reverse Harem',
  'Shounen Anime',
  'Shoujo Anime',
  'Seinen Anime',
  'Josei Anime',
  'Kodomomuke',
  'Tournament Arc',
  'Battle Royale',
  'Virtual Reality',
  'Game Anime',
  'Card Games',
  'Board Games',
  'Otaku Culture',
  'Parody Anime',
  'Crossover',
  'Anthology',
  'Short Anime',
  'Movie Collection',
  'OVA Series',
  'Classic Anime',
  'Modern Anime',
  'Indie Anime',
  'Studio Ghibli',
  'Madhouse',
  'Bones Studio',
  'Pierrot Studio',
  'Toei Animation',
  'A-1 Pictures',
  'Trigger Studio'
];

// Sample anime images for each category
const sampleAnimeImages = [
  'https://cdn.myanimelist.net/images/anime/10/47347.jpg', // Attack on Titan
  'https://cdn.myanimelist.net/images/anime/1286/99889.jpg', // Demon Slayer
  'https://cdn.myanimelist.net/images/anime/1935/127974.jpg', // Jujutsu Kaisen
  'https://cdn.myanimelist.net/images/anime/6/73245.jpg', // One Piece
  'https://cdn.myanimelist.net/images/anime/13/17405.jpg', // Naruto
  'https://cdn.myanimelist.net/images/anime/1208/94745.jpg', // Dr. Stone
  'https://cdn.myanimelist.net/images/anime/1715/111486.jpg', // Your Name
  'https://cdn.myanimelist.net/images/anime/1829/106872.jpg', // Kaguya-sama
  'https://cdn.myanimelist.net/images/anime/1467/111147.jpg', // Toradora
  'https://cdn.myanimelist.net/images/anime/12/76049.jpg', // One Punch Man
  'https://cdn.myanimelist.net/images/anime/1444/89932.jpg', // Gintama
  'https://cdn.myanimelist.net/images/anime/8/81277.jpg', // Konosuba
];

// Generate comprehensive anime collections data (72 total collections for 4 pages)
const animeCollections = Array.from({ length: 72 }, (_, index) => {
  // Use deterministic selection based on index to avoid hydration mismatch
  const bgIndex = index % bgImages.length;
  const randomBg = bgImages[bgIndex];
  
  // Use categories in order to ensure no repetition and better distribution
  const categoryName = animeCategories[index % animeCategories.length];
  
  // Get 3 deterministic anime images for this collection
  const imageStartIndex = (index * 3) % sampleAnimeImages.length;
  let collectionAnimeImages = [];
  
  for (let i = 0; i < 3; i++) {
    const imageIndex = (imageStartIndex + i) % sampleAnimeImages.length;
    collectionAnimeImages.push(sampleAnimeImages[imageIndex]);
  }
  
  return {
    id: index + 1,
    name: categoryName,
    backgroundImage: randomBg,
    animeImages: collectionAnimeImages,
    count: ((index * 7) % 100) + 25, // Deterministic count between 25-124
  };
});

const CollectionPage = () => {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const collectionsPerPage = 12;
  const totalPages = Math.ceil(animeCollections.length / collectionsPerPage);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startIndex = (currentPage - 1) * collectionsPerPage;
  const endIndex = startIndex + collectionsPerPage;
  const currentCollections = animeCollections.slice(startIndex, endIndex);

  return (
    <div className={`min-h-screen -mt-2 py-4 sm:py-8 px-4 sm:px-8 lg:px-14 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        {/* <h1 className="text-4xl font-bold text-white mb-2">Anime Collections</h1>
        <p className="text-gray-400">Discover amazing anime by category</p> */}
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-4 lg:px-8 xl:px-16 justify-items-center md:justify-items-stretch">
        {currentCollections.map((collection, index) => (
          <CollectCard key={collection.id} collection={collection} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8 px-2">
          <button
             onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
             disabled={currentPage === 1}
             className={`px-2 sm:px-3 py-1 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors text-xs sm:text-sm ${
               isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-400'
             }`}
           >
             <span className="hidden sm:inline">Previous</span>
             <span className="sm:hidden">Prev</span>
           </button>
           
           {(() => {
             const maxButtons = isMobile ? 3 : 5;
             const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
             const endPage = Math.min(totalPages, startPage + maxButtons - 1);
             const adjustedStartPage = Math.max(1, endPage - maxButtons + 1);
             
             return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, index) => {
               const pageNumber = adjustedStartPage + index;
               return (
                 <button
                   key={`page-${pageNumber}`}
                   onClick={() => setCurrentPage(pageNumber)}
                   className={`px-2 sm:px-3 py-1 border font-bold rounded-md transition-colors text-xs sm:text-sm ${
                     currentPage === pageNumber
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
           
           {totalPages > 5 && currentPage < totalPages - 2 && (
             <span className={`px-1 sm:px-2 text-xs sm:text-sm ${
               isDark ? 'text-gray-400' : 'text-gray-500'
             }`}>...</span>
           )}
           
           <button
             onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
             disabled={currentPage === totalPages}
             className={`px-2 sm:px-3 py-1 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors text-xs sm:text-sm ${
               isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-400'
             }`}
           >
             <span className="hidden sm:inline">Next</span>
             <span className="sm:hidden">Next</span>
           </button>
        </div>
      )}


      {/* Page Info */}
      <div className="text-center mt-3 sm:mt-4 px-2">
        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Page {currentPage} of {totalPages} • Showing {currentCollections.length} collections
        </p>
      </div>
    </div>
  );
};

export default CollectionPage;
