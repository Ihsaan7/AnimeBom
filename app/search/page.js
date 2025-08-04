"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import CharacterCard from '@/components/CharacterCard';
import { Search, Filter, Play, Users, Mic } from 'lucide-react';
import Loader from '@/components/Loader';
import { useTheme } from '@/contexts/ThemeContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { isDark } = useTheme();
  
  const [activeTab, setActiveTab] = useState('anime');
  const [animeResults, setAnimeResults] = useState([]);
  const [characterResults, setCharacterResults] = useState([]);
  const [voiceActorResults, setVoiceActorResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState(query);

  // Fetch search results
  const fetchSearchResults = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      // Fetch anime results
      const animeResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=20`);
      const animeData = await animeResponse.json();
      setAnimeResults(animeData.data || []);

      // Fetch character results
      const characterResponse = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(searchTerm)}&limit=20`);
      const characterData = await characterResponse.json();
      setCharacterResults(characterData.data || []);

      // Fetch voice actor results (people)
      const voiceActorResponse = await fetch(`https://api.jikan.moe/v4/people?q=${encodeURIComponent(searchTerm)}&limit=20`);
      const voiceActorData = await voiceActorResponse.json();
      setVoiceActorResults(voiceActorData.data || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    }
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery);
      // Update URL without page reload
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleToggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handlePlay = (anime) => {
    console.log('Play anime:', anime);
  };

  const handleAdd = (anime) => {
    console.log('Add anime:', anime);
  };

  const tabs = [
    { id: 'anime', label: 'Anime', icon: Play, count: animeResults.length },
    { id: 'characters', label: 'Characters', icon: Users, count: characterResults.length },
    { id: 'voice-actors', label: 'Voice Actors', icon: Mic, count: voiceActorResults.length },
    { id: 'genres', label: 'Genres', icon: Filter, count: 0 }
  ];

  const renderAnimeResults = () => (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 justify-items-center xs:justify-items-stretch sm:justify-items-center md:justify-items-stretch [&>*]:w-full [&>*]:max-w-xs sm:[&>*]:max-w-none">
      {animeResults.map((anime, index) => (
        <AnimeCard
          key={`search-anime-${anime.mal_id}-${index}`}
          anime={anime}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favorites.includes(anime.mal_id)}
          onPlay={handlePlay}
          onAdd={handleAdd}
        />
      ))}
    </div>
  );

  const renderCharacterResults = () => (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      {characterResults.map((character, index) => (
        <CharacterCard
          key={`search-character-${character.mal_id}-${index}`}
          character={character}
        />
      ))}
    </div>
  );

  const renderVoiceActorResults = () => (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      {voiceActorResults.map((person, index) => (
        <div key={`search-va-${person.mal_id}-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-[3/4] relative">
            <img
              src={person.images?.jpg?.image_url || '/placeholder-person.svg'}
              alt={person.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-person.svg';
              }}
            />
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{person.name}</h3>
            {person.given_name && (
              <p className="text-xs text-gray-600 mb-1">{person.given_name}</p>
            )}
            {person.birthday && (
              <p className="text-xs text-gray-500">Born: {new Date(person.birthday).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const getCurrentResults = () => {
    switch (activeTab) {
      case 'anime':
        return animeResults;
      case 'characters':
        return characterResults;
      case 'voice-actors':
        return voiceActorResults;
      case 'genres':
        return [];
      default:
        return [];
    }
  };

  const renderCurrentResults = () => {
    switch (activeTab) {
      case 'anime':
        return renderAnimeResults();
      case 'characters':
        return renderCharacterResults();
      case 'voice-actors':
        return renderVoiceActorResults();
      case 'genres':
        return (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Genres coming soon
            </h3>
            <p className="text-gray-500">
              Genre-based search will be available in a future update.
            </p>
          </div>
        );
      default:
         return null;
     }
   };

  return (
    <div className={`min-h-screen pt-20 pb-8 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Search Results
          </h1>
          
          {/* Search Form */}
          {/* <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime, characters, or voice actors..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-600 text-white px-4 py-1.5 rounded-md hover:bg-cyan-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form> */}

          {query && (
            <p className={`mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Showing results for: <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className={`rounded-xl p-2 shadow-sm border transition-colors ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? (isDark ? 'bg-cyan-900 text-cyan-400 shadow-sm' : 'bg-cyan-50 text-cyan-600 shadow-sm')
                        : (isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`ml-1 py-0.5 px-2 rounded-full text-xs font-medium ${
                        activeTab === tab.id
                          ? (isDark ? 'bg-cyan-800 text-cyan-300' : 'bg-cyan-100 text-cyan-700')
                          : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : getCurrentResults().length > 0 ? (
          renderCurrentResults()
        ) : query ? (
          <div className="text-center py-12">
            <Search className={`mx-auto h-12 w-12 mb-4 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No {activeTab} found
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Try searching with different keywords or check another category.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className={`mx-auto h-12 w-12 mb-4 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Start your search
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Enter a search term to find anime, characters, or voice actors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SearchContent />
    </Suspense>
  );
}