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

  // Function to get a fallback image based on index
  const getFallbackImage = (index) => {
    return fallbackImages[index % fallbackImages.length];
  };

  return (
    <div className="w-fit h-fit flex justify-center items-center">
      <div
        className="relative w-[320px] h-[450px] rounded-2xl overflow-hidden shadow-lg group transition-transform duration-300 hover:scale-105 cursor-pointer "
        onClick={handleCardClick}
      >
        {/* Background Image with blur and darkness */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${collection.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#4A5568',
            filter: 'brightness(1.2) blur(2px)'
          }}
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Light fade from bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />



        {/* Anime Cards */}
        <div className="relative z-10 flex justify-center mt-20 transition-all duration-300 ">
          {/* Left Image */}
          <img
            src={collection.animeImages?.[0] || getFallbackImage(0)}
            alt={`${collection.name} anime 1`}
            className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-md shadow-md rotate-[-10deg] -mr-4 z-[10] 
                       transition-all duration-300 group-hover:z-[30] group-hover:scale-105 "
            onError={(e) => {
              e.target.src = getFallbackImage(0);
            }}
          />
          {/* Center Image */}
          <img
            src={collection.animeImages?.[1] || getFallbackImage(1)}
            alt={`${collection.name} anime 2`}
            className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-md shadow-lg z-[30] 
                      transition-all duration-300 group-hover:z-[0] group-hover:scale-105"
            onError={(e) => {
              e.target.src = getFallbackImage(1);
            }}
          />
          {/* Right Image */}
          <img
            src={collection.animeImages?.[2] || getFallbackImage(2)}
            alt={`${collection.name} anime 3`}
            className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-md shadow-md rotate-[10deg] -ml-4 z-[10] 
                       transition-all duration-300 group-hover:z-[30] group-hover:scale-105"
            onError={(e) => {
              e.target.src = getFallbackImage(2);
            }}
          />
        </div>

        {/* Text & Button */}
        <div className="absolute bottom-16 w-full text-center z-20 px-4">
          <p className="text-white text-xl font-bold mb-2 drop-shadow-lg">{collection.name}</p>
          <p className="text-gray-200 text-sm mb-4 drop-shadow-md">{collection.count}+ Anime</p>
        <button 
          className="bg-white/30 text-white font-medium px-4 py-2 rounded-lg backdrop-blur-lg hover:bg-white/50 transition-all duration-300 hover:cursor-pointer"
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
