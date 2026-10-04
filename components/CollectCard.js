import React from 'react';
import { useRouter } from 'next/navigation';

const CollectCard = ({ collection }) => {
  const router = useRouter();
  
  if (!collection) return null;

  const handleCardClick = () => {
    // Convert collection name to URL-friendly slug
    const slug = encodeURIComponent(collection.name.toLowerCase().replace(/\s+/g, '-'));
    router.push(`/category/${slug}`);
  };

  // Available fallback images from carousel folder
  const fallbackImages = [
    '/carouselImages/AttackOnTaitan.jpg',
    '/carouselImages/onePiece.jpg',
    '/carouselImages/DemonSlayer.jpg',
    '/carouselImages/DragonBallZ.jpg',
    '/carouselImages/DeathNote.jpg',
    '/carouselImages/FullMetal.jpg',
    '/carouselImages/MyHeroAcademia.png',
    '/carouselImages/Chainsaw.png',
    '/carouselImages/SakamotoDays2.png',
    '/carouselImages/ToBeHeroX.jpg'
  ];

  const getFallbackImage = (index) => {
    return fallbackImages[index % fallbackImages.length];
  };

  return (
    <div className="w-full max-w-[310px] mx-auto flex justify-center items-center">
      <div
        className="relative w-full h-[430px] rounded-2xl overflow-hidden shadow-xl group transition-all duration-300 hover:scale-102 cursor-pointer border border-white/10"
        onClick={handleCardClick}
      >
        {/* Background Image with blur and darkness */}
        <div 
          className="absolute inset-0 w-full h-full transform transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url(${collection.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#1a202c',
            filter: 'brightness(0.9) blur(2px)'
          }}
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Light fade from bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Anime Cards Preview */}
        <div className="relative z-10 flex justify-center items-center mt-16 px-4 transition-all duration-300">
          {/* Left Image */}
          <div className="relative w-20 h-28 sm:w-22 sm:h-32 rounded-lg overflow-hidden shadow-md transform -rotate-12 -mr-3 z-10 transition-all duration-300 group-hover:-translate-x-2 group-hover:rotate-[-16deg]">
            <img
              src={collection.animeImages?.[0] || getFallbackImage(0)}
              alt={`${collection.name} anime 1`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getFallbackImage(0);
              }}
            />
          </div>
          {/* Center Image */}
          <div className="relative w-24 h-32 sm:w-26 sm:h-36 rounded-lg overflow-hidden shadow-2xl z-20 transition-all duration-300 group-hover:scale-105">
            <img
              src={collection.animeImages?.[1] || getFallbackImage(1)}
              alt={`${collection.name} anime 2`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getFallbackImage(1);
              }}
            />
          </div>
          {/* Right Image */}
          <div className="relative w-20 h-28 sm:w-22 sm:h-32 rounded-lg overflow-hidden shadow-md transform rotate-12 -ml-3 z-10 transition-all duration-300 group-hover:translate-x-2 group-hover:rotate-[16deg]">
            <img
              src={collection.animeImages?.[2] || getFallbackImage(2)}
              alt={`${collection.name} anime 3`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getFallbackImage(2);
              }}
            />
          </div>
        </div>

        {/* Text & Button */}
        <div className="absolute bottom-6 left-0 right-0 w-full text-center z-20 px-4">
          <p className="text-white text-xl font-bold mb-1 drop-shadow-lg tracking-wide">{collection.name}</p>
          <p className="text-gray-300 text-xs font-semibold mb-4 drop-shadow-md">{collection.count}+ Anime</p>
          <button 
            className="bg-white/20 hover:bg-white/40 text-white font-semibold text-sm px-5 py-2 rounded-xl backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-white/40 hover:cursor-pointer shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            View Collection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectCard;
