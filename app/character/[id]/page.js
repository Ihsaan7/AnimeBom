'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Heart, 
  Mic, 
  Star, 
  User, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Cake,
  Eye,
  Calendar,
  Users
} from 'lucide-react';
import Loader from '@/components/Loader';
import { useTheme } from '@/contexts/ThemeContext';

export default function CharacterDetails() {
  const { isDark } = useTheme();
  const params = useParams();
  const searchParams = useSearchParams();
  const [characterData, setCharacterData] = useState(null);
  const [bannerImage, setBannerImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [isAppearancesLoading, setIsAppearancesLoading] = useState(true);
  const [voiceActors, setVoiceActors] = useState([]);
  const [isVoiceActorsLoading, setIsVoiceActorsLoading] = useState(true);

  // Fetch character data directly from Jikan API
  useEffect(() => {
    const fetchCharacterData = async () => {
      setIsLoading(true);
      setIsGalleryLoading(true);
      setIsAppearancesLoading(true);
      setIsVoiceActorsLoading(true);
      
      try {
        const characterName = searchParams.get('name');
        let characterId = params.id;
        
        // If name parameter is provided, search by name first
        if (characterName) {
          const searchResponse = await fetch(
            `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(characterName)}&limit=1`
          );
          const searchData = await searchResponse.json();
          
          if (searchData.data && searchData.data.length > 0) {
            characterId = searchData.data[0].mal_id;
          } else {
            // If no character found by name, show error
            setIsLoading(false);
            setIsGalleryLoading(false);
            setIsAppearancesLoading(false);
            return;
          }
        }
        
        if (!characterId) return;
        
        // Fetch character details first
        const characterResponse = await fetch(`https://api.jikan.moe/v4/characters/${characterId}/full`);
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch remaining data with delays
        const [animeResponse, galleryResponse, voiceActorsResponse] = await Promise.allSettled([
          new Promise(resolve => 
            setTimeout(async () => {
              try {
                const res = await fetch(`https://api.jikan.moe/v4/characters/${characterId}/anime`);
                if (!res.ok) throw new Error(`Anime API failed: ${res.status}`);
                resolve({ status: 'fulfilled', value: res });
              } catch (error) {
                resolve({ status: 'rejected', reason: error });
              }
            }, 500)
          ),
          new Promise(resolve => 
            setTimeout(async () => {
              try {
                const res = await fetch(`https://api.jikan.moe/v4/characters/${characterId}/pictures`);
                if (!res.ok) throw new Error(`Gallery API failed: ${res.status}`);
                resolve({ status: 'fulfilled', value: res });
              } catch (error) {
                resolve({ status: 'rejected', reason: error });
              }
            }, 1000)
          ),
          new Promise(resolve => 
            setTimeout(async () => {
              try {
                const res = await fetch(`https://api.jikan.moe/v4/characters/${characterId}/voices`);
                if (!res.ok) throw new Error(`Voice Actors API failed: ${res.status}`);
                resolve({ status: 'fulfilled', value: res });
              } catch (error) {
                resolve({ status: 'rejected', reason: error });
              }
            }, 1500)
          )
        ]);
        
        // Process character data
        let characterData = null;
        if (characterResponse.ok) {
          try {
            characterData = await characterResponse.json();
          } catch (error) {
            console.error('Error parsing character data:', error);
          }
        } else {
          console.error('Character API failed:', characterResponse.status);
        }
        
        // Process anime data
        let animeData = { data: [] };
        if (animeResponse.status === 'fulfilled' && animeResponse.value.status === 'fulfilled') {
          try {
            animeData = await animeResponse.value.value.json();
          } catch (error) {
            console.error('Error parsing anime data:', error);
          }
        } else {
          console.error('Anime API failed:', animeResponse.status === 'fulfilled' ? animeResponse.value.reason : animeResponse.reason);
        }
        setIsAppearancesLoading(false);
        
        // Process gallery data
        let galleryData = { data: [] };
        if (galleryResponse.status === 'fulfilled' && galleryResponse.value.status === 'fulfilled') {
          try {
            galleryData = await galleryResponse.value.value.json();
          } catch (error) {
            console.error('Error parsing gallery data:', error);
          }
        } else {
          console.error('Gallery API failed:', galleryResponse.status === 'fulfilled' ? galleryResponse.value.reason : galleryResponse.reason);
        }
        setIsGalleryLoading(false);
        
        // Process voice actors data
        let voiceActorsData = { data: [] };
        if (voiceActorsResponse.status === 'fulfilled' && voiceActorsResponse.value.status === 'fulfilled') {
          try {
            voiceActorsData = await voiceActorsResponse.value.value.json();
          } catch (error) {
            console.error('Error parsing voice actors data:', error);
          }
        } else {
          console.error('Voice Actors API failed:', voiceActorsResponse.status === 'fulfilled' ? voiceActorsResponse.value.reason : voiceActorsResponse.reason);
        }
        setIsVoiceActorsLoading(false);
        
        // Always set gallery images and voice actors regardless of character data
        setGalleryImages(galleryData.data || []);
        setVoiceActors(voiceActorsData.data || []);
        
        if (characterData && characterData.data) {
          // Extract gender and age from description text
          const description = characterData.data.about || '';
          
          // Extract gender
          let gender = characterData.data.gender;
          if (!gender && description) {
            const genderMatch = description.match(/\b(Male|Female|male|female)\b/);
            gender = genderMatch ? genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1).toLowerCase() : null;
          }
          
          // Extract age from description
           let age = null;
           if (characterData.data.birthday) {
             const birthDate = new Date(characterData.data.birthday);
             const today = new Date();
             age = today.getFullYear() - birthDate.getFullYear();
             const monthDiff = today.getMonth() - birthDate.getMonth();
             if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
               age--;
             }
           } else if (description) {
             // Try to extract age from description text
             const ageMatch = description.match(/\b(\d{1,2})\s*years?\s*old\b/i) || 
                            description.match(/\bAge[:\s]*(\d{1,2})\b/i) ||
                            description.match(/\b(\d{1,2})\s*-year-old\b/i);
             age = ageMatch ? parseInt(ageMatch[1]) : null;
           }
           
           // Extract birthday from description
           let birthday = null;
           if (characterData.data.birthday) {
             const birthDate = new Date(characterData.data.birthday);
             birthday = {
               month: birthDate.getMonth() + 1,
               day: birthDate.getDate()
             };
           } else if (description) {
             // Try to extract birthday from description text
             const birthdayMatch = description.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\b/i) ||
                                 description.match(/\b(\d{1,2})\/(\d{1,2})\b/) ||
                                 description.match(/\b(\d{1,2})-(\d{1,2})\b/);
             if (birthdayMatch) {
               if (birthdayMatch[1].match(/^\d/)) {
                 // Numeric format
                 birthday = {
                   month: parseInt(birthdayMatch[1]),
                   day: parseInt(birthdayMatch[2])
                 };
               } else {
                 // Month name format
                 const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                               'july', 'august', 'september', 'october', 'november', 'december'];
                 const monthIndex = months.indexOf(birthdayMatch[1].toLowerCase());
                 if (monthIndex !== -1) {
                   birthday = {
                     month: monthIndex + 1,
                     day: parseInt(birthdayMatch[2])
                   };
                 }
               }
             }
           }
          
          // Transform the data to match our component structure
          const transformedData = {
            id: characterData.data.mal_id,
            name: {
              full: characterData.data.name,
              native: characterData.data.name_kanji || characterData.data.name
            },
            description: characterData.data.about || 'No description available.',
            image: {
              large: characterData.data.images?.jpg?.image_url || '/carouselImages/DeathNote.jpg'
            },
            favourites: characterData.data.favorites || 0,
            gender: gender,
            age: age,
            dateOfBirth: birthday,
            media: {
              nodes: (animeData.data || []).slice(0, 12).map(anime => ({
                idMal: anime.anime.mal_id,
                title: {
                  english: anime.anime.title,
                  romaji: anime.anime.title
                },
                coverImage: {
                  large: anime.anime.images?.jpg?.large_image_url || anime.anime.images?.jpg?.image_url
                },
                bannerImage: anime.anime.images?.jpg?.large_image_url,
                averageScore: anime.anime.score ? anime.anime.score * 10 : null,
                type: anime.anime.type,
                role: anime.role
              }))
            }
          };
          
          setCharacterData(transformedData);
          
          // Set banner image from anime appearances
          if (transformedData.media.nodes.length > 0) {
            const randomAnime = transformedData.media.nodes[Math.floor(Math.random() * transformedData.media.nodes.length)];
            setBannerImage(randomAnime.bannerImage || randomAnime.coverImage.large);
          }
        } else {
          console.error('Character not found');
        }
      } catch (error) {
        console.error('Error fetching character data:', error);
        // Ensure loading states are reset even on error
        setIsGalleryLoading(false);
        setIsAppearancesLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacterData();
  }, [params.id, searchParams]);



  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <Loader text="Loading Character" size="text-2xl" />
      </div>
    );
  }

  if (!characterData) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😞</div>
          <h2 className={`text-2xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>Character Not Found</h2>
          <p className={`mb-6 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>Unable to load character data</p>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Hero Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <Image
          src={bannerImage || characterData.image.large}
          alt={characterData.name.full}
          fill
          className="object-cover object-center brightness-75"
          priority
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${
          isDark ? 'from-gray-900' : 'from-gray-50'
        }`} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Character Profile */}
          <div className="md:col-span-1">
            <div className={`backdrop-blur-xl rounded-2xl p-6 border h-full shadow-lg transition-colors ${
              isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-[#d5cdb8]'
            }`}>
              <div className="flex flex-col gap-6">
                <div className="relative w-full max-w-[300px] mx-auto">
                  <Image
                    src={characterData.image.large}
                    alt={characterData.name.full}
                    width={300}
                    height={400}
                    className="rounded-xl shadow-xl w-full object-cover"
                  />
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h1 className={`text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {characterData.name.full}
                    </h1>
                    {characterData.name.native && (
                      <p className={`${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {characterData.name.native}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Favorites */}
                    <div className={`p-4 rounded-xl ${
                      isDark ? 'bg-teal-900/50' : 'bg-teal-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <Heart className="text-teal-600 w-5 h-5" />
                        <span className={`font-medium ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {characterData.favourites?.toLocaleString() || 0} Favorites
                        </span>
                      </div>
                    </div>

                    {/* Voice Actors */}
                    <Link href={`/voice-actor?id=${characterData?.media?.nodes?.[0]?.idMal || ''}`}>
                      <div className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        isDark 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Mic className={`w-5 h-5 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`} />
                          <span className={`font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            Voice Actors
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Gender */}
                    <div className={`p-4 rounded-xl mt-3 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <Users className={`w-5 h-5 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`} />
                        <span className={`font-medium ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {characterData.gender || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Age */}
                    <div className={`p-4 rounded-xl ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <User className={`w-5 h-5 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`} />
                        <span className={`font-medium ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {characterData.age ? `${characterData.age} years old` : 'Age unknown'}
                        </span>
                      </div>
                    </div>
                    {/* Birthday */}
                    {characterData.dateOfBirth?.month && (
                      <div className={`p-4 rounded-xl ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Calendar className={`w-5 h-5 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`} />
                          <span className={`font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {new Intl.DateTimeFormat('en-US', {
                              day: '2-digit',
                              month: 'short',
                            }).format(
                              new Date(
                                0,
                                characterData.dateOfBirth.month - 1,
                                characterData.dateOfBirth?.day ?? 0
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="md:col-span-2 space-y-8">
            {/* About Section */}
            <div className={`backdrop-blur-xl rounded-2xl p-8 shadow-lg transition-colors ${
              isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-[#d5cdb8]'
            }`}>
              <h2 className={`text-2xl font-semibold mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>About</h2>
              <div className="space-y-4">
                {(() => {
                  // Check if this is a One Piece character
                  const isOnePieceCharacter = characterData.media?.nodes?.some(media => 
                    media.title?.english?.toLowerCase().includes('one piece') ||
                    media.title?.romaji?.toLowerCase().includes('one piece')
                  ) || characterData.name?.full?.toLowerCase().includes('luffy') ||
                     characterData.name?.full?.toLowerCase().includes('zoro') ||
                     characterData.name?.full?.toLowerCase().includes('sanji') ||
                     characterData.name?.full?.toLowerCase().includes('nami') ||
                     characterData.name?.full?.toLowerCase().includes('usopp') ||
                     characterData.name?.full?.toLowerCase().includes('chopper') ||
                     characterData.name?.full?.toLowerCase().includes('robin') ||
                     characterData.name?.full?.toLowerCase().includes('franky') ||
                     characterData.name?.full?.toLowerCase().includes('brook');

                  if (isOnePieceCharacter) {
                    return (
                      <>
                        {/* Height */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-blue-600 font-semibold min-w-[120px]">Height:</span>
                          <span className={`${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>{characterData.height || '172 cm'}</span>
                        </div>
                        
                        {/* Affiliations */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <span className="text-blue-600 font-semibold min-w-[120px]">Affiliations:</span>
                          <span className={`${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {characterData.name?.full?.toLowerCase().includes('luffy') 
                              ? 'Straw Hat Pirates (Captain); Four Emperors'
                              : characterData.name?.full?.toLowerCase().includes('zoro')
                              ? 'Straw Hat Pirates (First Mate)'
                              : characterData.name?.full?.toLowerCase().includes('sanji')
                              ? 'Straw Hat Pirates (Cook)'
                              : 'Straw Hat Pirates'
                            }
                          </span>
                        </div>
                        
                        {/* Devil Fruit */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <span className="text-blue-600 font-semibold min-w-[120px]">Devil Fruit:</span>
                          <span className={`${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {characterData.name?.full?.toLowerCase().includes('luffy')
                              ? 'Gomu Gomu no Mi (Rubber-Rubber Fruit)'
                              : characterData.name?.full?.toLowerCase().includes('chopper')
                              ? 'Hito Hito no Mi (Human-Human Fruit)'
                              : characterData.name?.full?.toLowerCase().includes('robin')
                              ? 'Hana Hana no Mi (Flower-Flower Fruit)'
                              : 'None'
                            }
                          </span>
                        </div>
                        
                        {/* Devil Fruit Type */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-blue-600 font-semibold min-w-[120px]">Devil Fruit Type:</span>
                          <span className={`${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {characterData.name?.full?.toLowerCase().includes('luffy')
                              ? 'Paramecia (Mythical Zoan)'
                              : characterData.name?.full?.toLowerCase().includes('chopper')
                              ? 'Zoan'
                              : characterData.name?.full?.toLowerCase().includes('robin')
                              ? 'Paramecia'
                              : 'N/A'
                            }
                          </span>
                        </div>
                        
                        {/* Bounty */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <span className="text-blue-600 font-semibold min-w-[120px]">Bounty:</span>
                          <span className={`${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {characterData.name?.full?.toLowerCase().includes('luffy')
                              ? '3,000,000,000 (previously: 1,500,000,000, 500,000,000, 400,000,000, 300,000,000, 100,000,000 and 30,000,000)'
                              : characterData.name?.full?.toLowerCase().includes('zoro')
                              ? '1,111,000,000'
                              : characterData.name?.full?.toLowerCase().includes('sanji')
                              ? '1,032,000,000'
                              : 'Unknown'
                            }
                          </span>
                        </div>
                      </>
                    );
                  } else {
                    // For non-One Piece characters
                    return (
                      <>
                        {/* Height */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-blue-600 font-semibold min-w-[120px]">Height:</span>
                          <span className={`${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>{characterData.height || 'Unknown'}</span>
                        </div>
                        
                        {/* Birth Place */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-blue-600 font-semibold min-w-[120px]">Birth Place:</span>
                          <span className={`${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>{characterData.birthPlace || 'Unknown'}</span>
                        </div>
                        
                        {/* Family */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <span className="text-blue-600 font-semibold min-w-[120px]">Family:</span>
                          <span className={`${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>{characterData.family || 'Unknown'}</span>
                        </div>
                        
                        {/* Age */}
                        {characterData.age && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-blue-600 font-semibold min-w-[120px]">Age:</span>
                            <span className={`${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>{characterData.age} years old</span>
                          </div>
                        )}
                        
                        {/* Gender */}
                        {characterData.gender && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-blue-600 font-semibold min-w-[120px]">Gender:</span>
                            <span className={`${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>{characterData.gender}</span>
                          </div>
                        )}
                      </>
                    );
                  }
                })()}
                
                {/* Description */}
                <div className={`mt-6 pt-4 border-t ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <div className="relative">
                    <div
                      className={`leading-relaxed ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      } ${
                        !isExpanded &&
                        `max-h-[200px] overflow-hidden relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-16 after:bg-gradient-to-t ${
                          isDark ? 'after:from-gray-800 after:to-transparent' : 'after:from-white after:to-transparent'
                        }`
                      }`}
                    >
                      <p className="mb-4">
                        Luffy is the captain of the Straw Hat Pirates and is best friends with all of them and values them over all else. At first glance, Luffy does not appear to be very intelligent, often seeing things in childish manner and can easily be amazed by the simplest things. However, because he views the world in a straightforward and simple manner, he is occasionally the only person who can see past the events and see what should be done.
                      </p>
                      <p className="mb-4">
                        Luffy seems to have an unstoppable appetite, a characteristic that is common to the Japanese archetype of the (at times simple-minded) young male hero/adventurer with a heart of gold. Perhaps as a result of his Devil Fruit, Luffy seems to be able to eat almost anything, and a lot of it.
                      </p>
                      {isExpanded && (
                        <div>
                          <p className="mb-4">
                            Despite his carefree nature, Luffy is a capable leader who inspires loyalty in his crew through his actions and unwavering determination. His dream of becoming the Pirate King drives him forward, and he never backs down from a challenge when his friends or ideals are threatened.
                          </p>
                          <p>
                            Luffy's rubber powers, granted by the Gomu Gomu no Mi (later revealed to be the Hito Hito no Mi, Model: Nika), allow him to stretch his body like rubber and have made him immune to most blunt attacks. His fighting style is unique and unpredictable, often catching opponents off guard.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-4">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-6 py-2 text-sm text-white hover:text-white/90 transition-all duration-200 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold cursor-pointer inline-flex gap-1 items-center shadow-lg hover:shadow-blue-600/30"
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Section */}
            <div className={`backdrop-blur-xl rounded-2xl p-8 shadow-lg transition-colors ${
              isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Gallery</h2>
              {isGalleryLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className={`${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Loading gallery images...</p>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>No gallery images available</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(showAllGallery ? galleryImages : galleryImages.slice(0, 8)).map((image, index) => (
                      <div key={index} className="relative aspect-square group">
                        <Image
                          src={image.jpg?.image_url || '/carouselImages/DeathNote.jpg'}
                          alt={`${characterData?.name.full} gallery image ${
                            index + 1
                          }`}
                          fill
                          className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md"
                        />
                      </div>
                    ))}
                  </div>
                  {galleryImages.length > 8 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAllGallery(!showAllGallery)}
                        className="px-6 py-2 text-sm text-white hover:text-white/90 transition-all duration-200 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold cursor-pointer inline-flex gap-1 items-center shadow-lg hover:shadow-blue-600/30"
                      >
                        {showAllGallery ? 'Show Less' : 'Show More'}
                        {showAllGallery ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Width Voice Actors Section */}
        <div className={`mt-8 backdrop-blur-xl rounded-2xl p-8 shadow-lg transition-colors ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-[#d5cdb8]'
        }`}>
          <h2 className={`text-2xl font-semibold mb-6 ${
             isDark ? 'text-white' : 'text-gray-900'
           }`}>Voice Actors for {characterData?.name.full}</h2>
          {isVoiceActorsLoading ? (
            <div className="text-center py-12">
              <Loader text="Loading Voice Actors" size="text-lg" className="h-32" />
            </div>
          ) : voiceActors.length === 0 ? (
            <div className="text-center py-8">
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>No voice actors information available for this character</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {voiceActors.map((voiceActor, index) => (
                <div key={index} className={`rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="relative aspect-square">
                    <Image
                      src={voiceActor.person?.images?.jpg?.image_url || '/carouselImages/DeathNote.jpg'}
                      alt={voiceActor.person?.name || 'Voice Actor'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Language Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        voiceActor.language === 'Japanese' ? 'bg-red-100 text-red-700' :
                        voiceActor.language === 'English' ? 'bg-blue-100 text-blue-700' :
                        voiceActor.language === 'Korean' ? 'bg-green-100 text-green-700' :
                        voiceActor.language === 'Spanish' ? 'bg-yellow-100 text-yellow-700' :
                        voiceActor.language === 'German' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {voiceActor.language || 'Unknown'}
                      </span>
                    </div>
                    {/* Favorite Icon */}
                    <div className="absolute top-2 right-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
                        <Heart className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold text-sm line-clamp-2 mb-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {voiceActor.person?.name || 'Unknown Actor'}
                    </h3>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {voiceActor.person?.given_name && voiceActor.person?.family_name 
                        ? `${voiceActor.person.family_name}, ${voiceActor.person.given_name}`
                        : voiceActor.person?.name || 'Voice Actor'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full Width Appearances Section */}
        <div className={`mt-8 backdrop-blur-xl rounded-2xl p-8 shadow-lg transition-colors ${
          isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-[#d5cdb8]'
        }`}>
          <h2 className={`text-2xl font-semibold mb-6 ${
             isDark ? 'text-white' : 'text-gray-900'
           }`}>Appears In</h2>
          {isAppearancesLoading ? (
            <div className="text-center py-12">
              <Loader text="Loading Appearances" size="text-lg" className="h-32" />
            </div>
          ) : characterData.media?.nodes?.length === 0 ? (
            <div className="text-center py-8">
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>No anime appearances found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characterData.media?.nodes?.map((media) => (
                <Link
                  href={`/watchNow?id=${media.idMal}`}
                  key={media.idMal}
                  className={`group block rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-4 p-4">
                    <div className="relative w-16 h-24 flex-shrink-0">
                      <Image
                        src={media.coverImage.large || '/carouselImages/DeathNote.jpg'}
                        alt={media.title.english || media.title.romaji}
                        fill
                        className="object-cover rounded-lg shadow-sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-base line-clamp-2 group-hover:text-blue-600 transition-colors ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {media.title.english || media.title.romaji}
                      </h3>
                      {media.averageScore && media.averageScore > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Eye className="text-blue-500 w-4 h-4" />
                          <span className="text-blue-600 font-medium text-sm">
                            {(media.averageScore / 10).toFixed(1)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {media.type}
                        </span>
                        {media.role && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {media.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )) || []}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}