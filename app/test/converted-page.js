'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Heart, 
  Mic, 
  Star, 
  User, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Cake 
} from 'lucide-react';

export default function CharacterDetails() {
  const params = useParams();
  const [characterData, setCharacterData] = useState(null);
  const [bannerImage, setBannerImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const [anilistId, setAnilistId] = useState(null);

  // First, fetch the character from Jikan API to get the correct mapping
  useEffect(() => {
    const fetchMalCharacter = async () => {
      try {
        const response = await fetch(
          `https://api.jikan.moe/v4/characters/${params.id}`
        );
        const data = await response.json();

        if (data.data) {
          // Now we have the MAL character data
          // We need to find the corresponding Anilist ID
          const malId = parseInt(params.id);
          await fetchAnilistIdFromMalId(malId);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching MAL character data:', error);
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchMalCharacter();
    }
  }, [params.id]);

  // Function to find Anilist ID from MAL ID
  const fetchAnilistIdFromMalId = async (malId) => {
    try {
      // Use Jikan API to get character info which might contain external links
      const response = await fetch(
        `https://api.jikan.moe/v4/characters/${malId}/full`
      );
      const data = await response.json();

      if (data.data) {
        // Try to find Anilist ID from external links if available
        const anilistLink = data.data.external?.find((link) =>
          link.url?.includes('anilist.co/character/')
        );

        if (anilistLink) {
          // Extract Anilist ID from URL
          const match = anilistLink.url.match(/\/character\/(\d+)/);
          if (match && match[1]) {
            setAnilistId(parseInt(match[1]));
          }
        } else {
          // If no direct link, search by name in Anilist
          await searchCharacterInAnilist(data.data.name);
        }
      }
    } catch (error) {
      console.error('Error finding Anilist ID:', error);
      setIsLoading(false);
    }
  };

  // Search character by name in Anilist as fallback
  const searchCharacterInAnilist = async (characterName) => {
    const query = `
      query ($search: String) {
        Character(search: $search) {
          id
        }
      }
    `;

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { search: characterName },
        }),
      });

      const { data } = await response.json();
      if (data?.Character?.id) {
        setAnilistId(data.Character.id);
      } else {
        // If all else fails, use the MAL ID directly
        setAnilistId(parseInt(params.id));
      }
    } catch (error) {
      console.error('Error searching character in Anilist:', error);
      setAnilistId(parseInt(params.id));
    }
  };

  // Once we have the Anilist ID, fetch the full character data
  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!anilistId) return;

      const query = `
      query ($id: Int) {
          Character(id: $id) {
            id
            name {
              full
              native
            }
            description(asHtml: true)
            image {
              large
            }
            gender
            dateOfBirth {
              year
              month
              day
            }
            age
            favourites
            media(sort: POPULARITY_DESC, perPage: 30) {
              nodes {
                idMal
                title {
                  english
                  romaji
                }
                coverImage {
                  large
                }
                bannerImage
                averageScore
                type
              }
            }
          }
        }`;

      try {
        const response = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: { id: anilistId },
          }),
        });

        const { data } = await response.json();
        if (!data?.Character) {
          setIsLoading(false);
          return;
        }
        setCharacterData(data.Character);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching character data:', error);
        setIsLoading(false);
      }
    };

    if (anilistId) {
      fetchCharacterData();
    }
  }, [anilistId]);

  useEffect(() => {
    if (characterData?.media?.nodes) {
      const mediaWithImages = characterData.media.nodes.filter(
        (media) => media.bannerImage || media.coverImage.large
      );
      if (mediaWithImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * mediaWithImages.length);
        setBannerImage(
          mediaWithImages[randomIndex].bannerImage ||
            mediaWithImages[randomIndex].coverImage.large
        );
      }
    }
  }, [characterData]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(
          `https://api.jikan.moe/v4/characters/${params.id}/pictures`
        );
        const data = await response.json();
        setGalleryImages(data.data || []);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      }
    };

    if (params.id) {
      fetchGallery();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading character...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching data from MyAnimeList...</p>
        </div>
      </div>
    );
  }

  if (!characterData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Character Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load character data</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <Image
          src={bannerImage || characterData.image.large}
          alt={characterData.name.full}
          fill
          className="object-cover object-center brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Character Profile */}
          <div className="md:col-span-1">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 h-full shadow-lg">
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
                    <h1 className="text-2xl font-bold text-gray-900">
                      {characterData.name.full}
                    </h1>
                    {characterData.name.native && (
                      <p className="text-gray-600">
                        {characterData.name.native}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-2 bg-red-50 p-4 rounded-xl">
                      <Heart className="text-red-500 text-xl" />
                      <span className="text-red-700 font-medium">
                        {characterData.favourites?.toLocaleString() || 0} Favorites
                      </span>
                    </div>

                    <Link href={`/voice-actor/${characterData.id}`}>
                      <div className="flex items-center gap-2 bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-all duration-300">
                        <Mic className="text-blue-600 text-xl" />
                        <span className="text-blue-700 font-medium">
                          Voice Actors
                        </span>
                      </div>
                    </Link>

                    {characterData.gender && (
                      <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl">
                        <User className="text-gray-600 text-xl" />
                        <span className="font-medium text-gray-700">
                          {characterData.gender}
                        </span>
                      </div>
                    )}

                    {characterData.age && (
                      <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl">
                        <Clock className="text-gray-600 text-xl" />
                        <span className="font-medium text-gray-700">
                          {characterData.age}
                        </span>
                      </div>
                    )}

                    {characterData.dateOfBirth?.month && (
                      <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl">
                        <Cake className="text-gray-600 text-xl" />
                        <span className="font-medium text-gray-700">
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="md:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">About</h2>
              <div className="relative">
                <div
                  className={`text-gray-700 leading-relaxed prose max-w-none rounded-b-xl ${
                    !isExpanded &&
                    'max-h-[400px] overflow-hidden relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-24 after:bg-gradient-to-t after:from-white after:to-transparent'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html:
                      characterData.description ||
                      'No description available.',
                  }}
                />
                {characterData.description &&
                  characterData.description.length > 200 && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 ${
                        !isExpanded && '-translate-y-1/2'
                      }`}
                    >
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 px-6 py-2 text-sm text-white hover:text-white/90 transition-all duration-200 mx-auto bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold cursor-pointer inline-flex gap-1 items-center shadow-lg hover:shadow-blue-600/30"
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Gallery</h2>
              <div className="relative">
                <div
                  className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                    !isGalleryExpanded &&
                    'max-h-[600px] overflow-hidden relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-24 after:bg-gradient-to-t after:from-white after:to-transparent'
                  }`}
                >
                  {galleryImages.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image.jpg?.image_url || '/placeholder.jpg'}
                        alt={`${characterData?.name.full} gallery image ${
                          index + 1
                        }`}
                        fill
                        className="object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
                {galleryImages.length > 8 && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 ${
                      !isGalleryExpanded && '-translate-y-1/2'
                    }`}
                  >
                    <button
                      onClick={() =>
                        setIsGalleryExpanded(!isGalleryExpanded)
                      }
                      className="mt-2 px-6 py-2 text-sm text-white hover:text-white/90 transition-all duration-200 mx-auto bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold cursor-pointer inline-flex gap-1 items-center shadow-lg hover:shadow-blue-600/30"
                    >
                      {isGalleryExpanded ? 'Show Less' : 'Show More'}
                      {isGalleryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Appearances Section */}
        <div className="mt-8 bg-white/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Appearances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characterData.media?.nodes?.map((media) => (
              <Link
                href={`/anime/${media.idMal}`}
                key={media.idMal}
                className="block bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="relative w-20 h-28 flex-shrink-0">
                    <Image
                      src={media.coverImage.large}
                      alt={media.title.english || media.title.romaji}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg line-clamp-2 text-gray-900">
                      {media.title.english || media.title.romaji}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="text-yellow-500 w-4 h-4" />
                      <span className="text-yellow-600 font-medium">
                        {media.averageScore ? (media.averageScore / 10).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{media.type}</p>
                  </div>
                </div>
              </Link>
            )) || []}
          </div>
        </div>
      </div>
    </div>
  );
}