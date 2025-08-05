"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import CharacterCard from '@/components/CharacterCard';
import GlitchLoader from '@/components/GlitchLoader';

const TopCharacterPage = () => {
  const { isDark } = useTheme();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('favorites');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchTopCharacters();
  }, [currentPage, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTopCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.jikan.moe/v4/top/characters?page=${currentPage}&limit=25`
      );
      const data = await response.json();
      
      if (data.data) {
        setCharacters(data.data);
        setTotalPages(data.pagination?.last_visible_page || 1);
      }
    } catch (error) {
      console.error('Error fetching top characters:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className={`min-h-screen -mt-2 flex items-center justify-center ${
        isDark ? 'bg-black' : 'bg-white'
      }`}>
        <GlitchLoader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen -mt-2 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl pl-2 md:pl-0 md:text-4xl  pt-15 font-bold ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            Top Characters
          </h1>
          
          {/* Sort Dropdown */}
           <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`flex items-center gap-2 mt-15 px-2 md:px-4  py-2  md:py-1 rounded-lg border font-medium transition-colors ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort: {sortBy === 'favorites' ? 'Most Popular' : sortBy === 'least_favorites' ? 'Least Popular' : sortBy === 'mal_id' ? 'ID' : sortBy === 'name' ? 'Relevance' : sortBy === 'role' ? 'Role' : 'Most Popular'}
              <svg className={`w-4 h-4 transition-transform ${
                showSortDropdown ? 'rotate-180' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSortDropdown && (
              <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                isDark
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="py-2">
                  <div className={`px-4 py-2 text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Sort By
                  </div>
                  
                  {[
                     { value: 'favorites', label: 'Most Popular' },
                     { value: 'least_favorites', label: 'Least Popular' },
                     { value: 'mal_id', label: 'ID' },
                     { value: 'name', label: 'Relevance' },
                     { value: 'role', label: 'Role' },
                   ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setCurrentPage(1);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === option.value
                          ? isDark
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {sortBy === option.value && (
                        <span className="inline-block w-2 h-2 bg-current rounded-full mr-2"></span>
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.mal_id}
              image={character.images?.jpg?.image_url || '/characters/l.jpg'}
              name={character.name || 'Unknown Character'}
              seriesCount={character.favorites || 1}
              onClick={() => {
                // Navigate to character detail page
                window.location.href = `/character/${character.mal_id}?name=${encodeURIComponent(character.name)}`;
              }}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
               onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
               disabled={currentPage === 1}
               className={`px-3 py-1 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors ${
                 isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-400'
               }`}
             >
               Previous
             </button>
             
             {(() => {
               const startPage = Math.max(1, currentPage - 2);
               const endPage = Math.min(totalPages, startPage + 4);
               const adjustedStartPage = Math.max(1, endPage - 4);
               
               return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, index) => {
                 const pageNumber = adjustedStartPage + index;
                 return (
                   <button
                     key={`page-${pageNumber}`}
                     onClick={() => setCurrentPage(pageNumber)}
                     className={`px-3 py-1 border font-bold rounded-md transition-colors ${
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
               <span className={`px-2 ${
                 isDark ? 'text-gray-400' : 'text-gray-500'
               }`}>...</span>
             )}
             
             <button
               onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
               disabled={currentPage === totalPages}
               className={`px-1 md:px-3 py-1 border font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b24dc8] hover:text-white hover:border-none hover:cursor-pointer transition-colors ${
                 isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-400 text-gray-400'
               }`}
             >
               Next
             </button>
          </div>
        )}

        {/* Page Info */}
        <div className="text-center mt-4">
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Page {currentPage} of {totalPages} • Showing {characters.length} characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopCharacterPage;