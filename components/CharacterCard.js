import React, { useState } from 'react'

const CharacterCard = ({ image, name, seriesCount = 1, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer w-full max-w-xs mx-auto"
      onClick={onClick}
    >
      {/* Character Badge */}
      <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10">
        <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded md:rounded-md font-semibold border border-white/20">
          Character
        </span>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute top-2 md:top-3 right-2 md:right-3 z-10 flex flex-col gap-1.5 md:gap-2">
        <button className="bg-purple-600 text-white p-1.5 md:p-2 rounded-full hover:bg-purple-700 transition-colors">
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
          </svg>
        </button>
        
        {/* Add to Favorites/Watchlist Dropdown */}
        <div className="relative">
          <button 
            className="bg-white/20 backdrop-blur-sm text-white p-1.5 md:p-2 rounded-full hover:bg-white/30 transition-colors border border-white/20"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div 
              className="absolute top-full right-0 mt-1.5 md:mt-2 w-32 md:w-40 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 z-50"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 text-white text-xs md:text-sm hover:bg-purple-600/50 transition-colors rounded-t-lg">
                Add to Favorites
              </button>
              <button className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 text-white text-xs md:text-sm hover:bg-purple-600/50 transition-colors rounded-b-lg">
                Add to Watchlist
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Series Count Badge */}
      <div className="absolute bottom-12 md:bottom-14 left-2 md:left-3 z-10">
        <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded md:rounded-md font-semibold border border-white/20 flex items-center gap-1">
          <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
          </svg>
          {seriesCount}
        </span>
      </div>
      
      {/* Character Image */}
      <div className="aspect-[3/4] overflow-hidden bg-gray-700 flex items-center justify-center">
        {imageError ? (
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-1 md:mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs">{name}</p>
          </div>
        ) : (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>
      
      {/* Character Name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-4">
        <h3 className="text-white font-bold text-sm md:text-lg truncate">{name}</h3>
      </div>
      
      {/* Blue Blur Effect - visible by default, disappears on hover */}
      <div className="absolute inset-0 backdrop-blur-xs bg-blue-500/20 group-hover:opacity-0 transition-opacity duration-300"></div>
    </div>
  );
};

export default CharacterCard;
