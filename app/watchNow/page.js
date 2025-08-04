'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Star, Play, Plus, Heart, Share2, Calendar, Monitor, Users, Eye } from 'lucide-react'
import AnimeCard from '../../components/AnimeCard'
import CharacterCard from '../../components/CharacterCard'
import { fetchAnimeImages } from '../../lib/utils'
import Loader from '@/components/Loader'
import { useTheme } from '@/contexts/ThemeContext'

// Utility function to generate unique keys
const generateUniqueKey = (item, index, prefix = '') => {
  // Always include index to ensure uniqueness even with duplicate mal_ids
  if (item?.mal_id) return `${prefix}${item.mal_id}-${index}`
  if (item?.id) return `${prefix}${item.id}-${index}`
  if (item?.name) return `${prefix}${item.name.replace(/[^a-zA-Z0-9]/g, '')}-${index}`
  if (typeof item === 'string') return `${prefix}${item.replace(/[^a-zA-Z0-9]/g, '')}-${index}`
  return `${prefix}${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const WatchNow = () => {
  const { isDark } = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const animeId = searchParams.get('id')
  
  const [animeData, setAnimeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Default fallback data
  const [defaultData] = useState({
    title: "Death Note",
    genres: ["Supernatural", "Suspense"],
    rating: 8.62,
    type: "TV",
    status: "Completed",
    episodes: 37,
    duration: "23 min per ep",
    aired: {
      start: "2006/10/4",
      end: "2007/6/27"
    },
    studios: ["MADHOUSE", "VAP", "Viz Media", "Nippon Television Network", "Konami", "Ashi Productions", "Shueisha", "Selecta Visión", "Funimation", "Crunchyroll", "Netflix", "Aniplex"],
    synopsis: "Brutal murders, petty thefts, and senseless violence pollute the human world. In contrast, the realm of death gods is a humdrum, unchanging gambling den. The ingenious 17-year-old Japanese student Light Yagami and sadistic god of death Ryuk share their worlds are rotten. For his own amusement, Ryuk drops his Death Note into the human world. Light stumbles upon it, deeming the first of its rules ridiculous: the human whose name is written in this note shall die. However, the temptation is too great, and Light experiments by writing a criminal's name, which disturbingly enacts his first murder. Aware of the terrifying godlike power that has fallen into his hands, Light—under the alias Kira—follows his wicked sense of justice with the ultimate goal of cleansing all evil-doers. The meticulous mastermind detective L is already on his trail, but as Light's brilliance rivals L's, the grand chase for Kira turns into an intense battle of wits that can only end when one of them is dead. [Written by MAL Rewrite]",
    tags: ["Crime", "Detective", "Anti-Hero", "Male Protagonist", "Fugitive", "Police", "Philosophy", "Primarily Adult Cast", "Kuudere", "Gods", "Memory Manipulation", "Urban Fantasy"],
    characters: [
      { name: "Lawliet, L", image: "/carouselImages/DeathNote.jpg", rank: 6 },
      { name: "Ryuk", image: "/carouselImages/DeathNote.jpg", rank: 8 },
      { name: "Yagami, Light", image: "/carouselImages/DeathNote.jpg", rank: 8 }
    ],
    similarAnime: [
      { title: "Code Geass: Hangyaku no Lelouch", image: "/carouselImages/AttackOnTaitan.jpg", rating: 9.0 },
      { title: "Monster", image: "/carouselImages/DemonSlayer.jpg", rating: 9.0 }
    ],
    gallery: [
      "/carouselImages/DeathNote.jpg",
      "/carouselImages/AttackOnTaitan.jpg",
      "/carouselImages/DemonSlayer.jpg",
      "/carouselImages/FullMetal.jpg",
      "/carouselImages/MyHeroAcademia.png",
      "/carouselImages/onePiece.jpg"
    ],
    reviews: [
      { rating: 4, text: "Interesting story but has sexist themes and the second half of the show is... not that good." },
      { rating: 5, text: "Death Note is one of those shows that we can easily call a classic, just like an opening 'the world' [Dr..." }
    ],
    additionalInfo: {
      ageRating: "R",
      popularityRank: "#5",
      ratingRank: "#62"
    }
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [showMoreGallery, setShowMoreGallery] = useState(false)
  const [failedImages, setFailedImages] = useState(new Set())

  // Debug logging
  useEffect(() => {
    console.log('WatchNow component mounted with animeId:', animeId)
    console.log('Current animeData:', animeData)
    console.log('Failed images:', Array.from(failedImages))
  }, [animeId, animeData, failedImages])

  // Function to fetch anime data from API
  const fetchAnimeData = async (id) => {
    try {
      setLoading(true)
      setError(null)
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Try Jikan API first (MyAnimeList)
      let response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`)
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        throw new Error(`Failed to fetch from Jikan API (Status: ${response.status})`)
      }
      
      const data = await response.json()
      const anime = data.data
      
      // Fetch characters
      let characters = []
      try {
        // Add delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        const charactersResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}/characters`)
        if (charactersResponse.ok) {
          const charactersData = await charactersResponse.json()
          characters = charactersData.data?.slice(0, 6).map((char, index) => ({
            name: char.character?.name || 'Unknown Character',
            image: char.character?.images?.jpg?.image_url || '/characters/l.jpg',
            rank: index + 1
          })) || []
        }
      } catch (err) {
        console.log('Characters fetch failed:', err)
      }
      
      // Fetch reviews from Jikan API
      let reviews = []
      try {
        // Add delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        const reviewsResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}/reviews?limit=5`)
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json()
          reviews = reviewsData.data?.map(review => ({
            rating: review.score || Math.floor(Math.random() * 5) + 6,
            text: review.review?.substring(0, 200) + '...' || 'Great anime with engaging storyline and characters.'
          })) || []
        }
      } catch (err) {
        console.log('Reviews fetch failed:', err)
      }
      
      // Fetch recommendations from Jikan API
      let similarAnime = []
      try {
        // Add delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        const recommendationsResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`)
        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json()
          similarAnime = recommendationsData.data?.slice(0, 6).map(rec => ({
            mal_id: rec.entry?.mal_id,
            title: rec.entry?.title || 'Unknown Title',
            title_english: rec.entry?.title,
            images: rec.entry?.images,
            image: rec.entry?.images?.jpg?.large_image_url || rec.entry?.images?.jpg?.image_url || '/anime/code-geass.jpg',
            score: Math.floor(Math.random() * 3) + 7,
            genres: [],
            type: 'TV',
            episodes: 12,
            status: 'Completed'
          })) || []
        }
      } catch (err) {
        console.log('Recommendations fetch failed:', err)
      }
      
      // Fallback to genre-based similar anime if recommendations failed
      if (similarAnime.length === 0 && anime.genres?.length > 0) {
        try {
          const genreIds = anime.genres.slice(0, 3).map(g => g.mal_id).join(',')
          const similarResponse = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreIds}&order_by=score&sort=desc&limit=10`)
          if (similarResponse.ok) {
            const similarData = await similarResponse.json()
            similarAnime = similarData.data
              ?.filter(a => a.mal_id !== parseInt(id)) // Exclude current anime
              .slice(0, 6) // Get up to 6 similar anime
              .map(a => ({
                mal_id: a.mal_id,
                title: a.title || 'Unknown Title',
                title_english: a.title_english,
                images: a.images,
                image: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || '/anime/code-geass.jpg',
                score: a.score || Math.floor(Math.random() * 3) + 7,
                genres: a.genres?.map(g => g.name) || [],
                type: a.type || 'TV',
                episodes: a.episodes || 12,
                status: a.status || 'Completed'
              })) || []
          }
        } catch (err) {
          console.log('Genre-based similar anime fetch failed:', err)
        }
      }
      
      // Generate fallback reviews if API reviews are insufficient
      const fallbackReviews = [
        { rating: 9, text: "An absolutely masterpiece! The storytelling, animation, and character development are top-notch. Highly recommended for any anime fan." },
        { rating: 7, text: "Great anime with compelling characters and an engaging plot. Some pacing issues but overall very enjoyable to watch." },
        { rating: 6, text: "Decent anime but felt rushed in some parts. The animation quality could be better, though the story has potential." },
        { rating: 8, text: "Solid anime with beautiful animation and soundtrack. The story keeps you hooked from start to finish." }
      ]
      
      // Use API reviews if available, otherwise use fallbacks
      const finalReviews = reviews.length > 0 ? reviews.slice(0, 3) : fallbackReviews.slice(0, 3)
      
      // Fetch high-quality images from AniList API
      let anilistImages = null
      try {
        const animeTitle = anime.title || anime.title_english
        if (animeTitle) {
          anilistImages = await fetchAnimeImages(animeTitle)
          console.log('AniList images fetched:', anilistImages)
        }
      } catch (err) {
        console.log('AniList images fetch failed:', err)
      }

      // Transform API data to match our component structure
      const transformedData = {
        title: anime.title || anime.title_english || 'Unknown Title',
        genres: anime.genres?.map(g => g.name) || [],
        rating: anime.score || Math.floor(Math.random() * 3) + 7, // Random rating between 7-9 if no score
        type: anime.type || 'TV',
        status: anime.status || 'Completed',
        episodes: anime.episodes || Math.floor(Math.random() * 20) + 12,
        duration: anime.duration || '24 min per ep',
        aired: {
          start: anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString() : '2020/01/01',
          end: anime.aired?.to ? new Date(anime.aired.to).toLocaleDateString() : '2020/12/31'
        },
        studios: [
          ...(anime.studios?.map(s => s.name) || []),
          ...(anime.producers?.map(p => p.name) || []),
          ...(anime.licensors?.map(l => l.name) || []),
          ...(anime.demographics?.map(d => d.name) || [])
        ].filter(Boolean).slice(0, 12) || ['Studio Pierrot', 'Madhouse', 'Bones', 'Toei Animation', 'Mappa', 'Wit Studio', 'Production I.G', 'Sunrise', 'Funimation', 'Crunchyroll', 'Netflix', 'Aniplex'],
        synopsis: anime.synopsis || `${anime.title || 'This anime'} is an exciting adventure that follows compelling characters through an engaging storyline. With stunning animation and memorable moments, it delivers both action and emotional depth that will keep viewers entertained from beginning to end. The series explores themes of friendship, determination, and growth while maintaining excellent pacing throughout.`,
        tags: anime.genres?.map(g => g.name) || ['Action', 'Adventure', 'Drama'],
        characters: characters,
        similarAnime: similarAnime,
        gallery: [
          anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          anime.trailer?.images?.large_image_url,
          anime.images?.webp?.large_image_url,
          anilistImages?.coverImage?.extraLarge,
          anilistImages?.coverImage?.large,
          anilistImages?.bannerImage,
          // Only use images that actually exist in our public folder
          "/carouselImages/DeathNote.jpg",
          "/carouselImages/AttackOnTaitan.jpg",
          "/carouselImages/DemonSlayer.jpg",
          "/carouselImages/FullMetal.jpg",
          "/carouselImages/MyHeroAcademia.png",
          "/carouselImages/onePiece.jpg"
        ].filter(Boolean).slice(0, 6),
        reviews: finalReviews,
        additionalInfo: {
          ageRating: anime.rating || 'PG-13',
          popularityRank: anime.popularity ? `#${anime.popularity}` : `#${Math.floor(Math.random() * 100) + 1}`,
          ratingRank: anime.rank ? `#${anime.rank}` : `#${Math.floor(Math.random() * 50) + 1}`
        },
        // Use AniList banner image for background if available, otherwise fallback to Jikan images
        backgroundImage: anilistImages?.bannerImage || 
                        anilistImages?.coverImage?.extraLarge || 
                        anilistImages?.coverImage?.large || 
                        anime.images?.jpg?.large_image_url || 
                        anime.images?.webp?.large_image_url || 
                        anime.images?.jpg?.image_url,
        // Use AniList cover image for poster if available, otherwise fallback to Jikan images
        posterImage: anilistImages?.coverImage?.extraLarge || 
                    anilistImages?.coverImage?.large || 
                    anilistImages?.coverImage?.medium || 
                    anime.images?.jpg?.large_image_url || 
                    anime.images?.jpg?.image_url,
        // Store AniList data for potential future use
        anilistData: anilistImages
      }
      
      setAnimeData(transformedData)
    } catch (err) {
      console.error('Error fetching anime data:', err)
      setError(err.message)
      // Use default data as fallback
      setAnimeData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (animeId) {
      fetchAnimeData(animeId)
    } else {
      // Use default data if no ID provided
      setAnimeData(defaultData)
      setLoading(false)
    }
  }, [animeId])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader text="Loading Anime Details" size="text-2xl" />
      </div>
    )
  }

  if (error && !animeData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-xl text-red-600 mb-4'>Error loading anime data</p>
          <p className='text-gray-600'>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen px-2 sm:px-4 md:px-6 pt-5 -mt-2 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Hero Section */}
     <div className="relative h-[50vh] md:h-[70vh] overflow-hidden ">
      
  {/* Background Image */}
  <Image
    src={animeData?.backgroundImage || '/hero-bg/death-note.jpg'}
    alt="Background"
    fill
    className="object-cover object-center"
    priority
    sizes="100vw"
  />
<div className={`absolute inset-0 bg-gradient-to-t z-20 ${
  isDark ? 'from-black/100 via-black/40 to-transparent' : 'from-white/100 via-white/40 to-transparent'
}`}></div>
  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>

  {/* Content Block */}
  <div className={`absolute bottom-0 left-0 right-0 z-20 p-2 sm:p-4 md:p-8 ${
      isDark ? 'text-white' : 'text-black'
    }`}>
    <div className="container mx-auto flex flex-row gap-2 sm:gap-4 md:gap-8">
      
      {/* Poster */}
      <div className="w-24 h-36 sm:w-32 sm:h-48 md:w-48 md:h-72 rounded-xl shadow-2xl overflow-hidden flex-shrink-0">
        <Image
          src={animeData?.posterImage || '/posters/death-note.jpg'}
          alt={animeData?.title || 'Anime Poster'}
          width={192}
          height={288}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Title + Genres */}
      <div className="flex flex-col justify-end">
        <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
          {animeData?.title || 'Loading...'}
        </h1>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {(animeData?.genres || []).map((genre, index) => (
            <span
              key={generateUniqueKey(genre, index, 'genre-')}
              className="px-2 sm:px-3 py-1 bg-white/90 rounded-full text-xs sm:text-sm"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>

      
      {/* Content */}
      <div className='container mx-auto py-4 sm:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Quick Info Cards */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4'>
              <div className={`rounded-lg px- py-7 text-center shadow-sm border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <Star className='w-10 h-8 mx-auto mb-2 text-yellow-500' />
                <div className={`font-bold text-3xl ${
                  isDark ? 'text-white' : 'text-black'
                }`}>{animeData?.rating || 0}<span className={`text-xl font-light ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}> /10</span></div>
              </div>
              
              <div className={`rounded-lg p-4 text-center shadow-sm border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <Monitor className='w-10 h-8 mx-auto mb-2 mt-4 text-blue-500' />
                <div className={`font-bold text-2xl ${
                  isDark ? 'text-white' : 'text-black'
                }`}>{animeData?.type || 'Unknown'}</div>
                <div className={`text-md ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Type</div>
              </div>
              
              {/* <div className='bg-white rounded-lg p-4 text-center shadow-sm border'>
                <Eye className='w-6 h-6 mx-auto mb-2 text-green-500' />
                <div className='font-bold'>{animeData.episodes}</div>
                <div className='text-sm text-gray-600'>Episodes</div>
              </div> */}
              
              {/* <div className='bg-white rounded-lg p-4 text-center shadow-sm border'>
                <Calendar className='w-6 h-6 mx-auto mb-2 text-purple-500' />
                <div className='font-bold'>{animeData.status}</div>
                <div className='text-sm text-gray-600'>Status</div>
              </div> */}
            </div>
            
            {/* Studios & Broadcast */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-xl border transition-colors ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-[#fefcf8] border-[#d5cdb8]'
        }`}>
  {/* Studios Section */}
<div className=' '>
  <h3 className={`text-xl font-bold mb-6 ${
    isDark ? 'text-white' : 'text-black'
  }`}>Studios</h3>
  <div className="flex flex-wrap gap-2 sm:gap-3">
    {(animeData?.studios?.length > 0 ? animeData.studios : defaultData.studios).map((studio, index) => (
      <Link
        key={generateUniqueKey(studio, index, 'studio-')}
        href={`/studio/${encodeURIComponent(studio.toLowerCase().replace(/\s+/g, '-'))}`}
        className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-md font-medium shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 break-words ${
          index === 0 || index === 6
            ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
            : 'bg-[#ece6da] text-gray-800 hover:bg-[#e0d4c8]'
        }`}
      >
        {studio}
      </Link>
    ))}
  </div>
</div>



  {/* Broadcast Section */}
  <div>
    <h3 className={`text-xl font-bold mb-6 ${
      isDark ? 'text-white' : 'text-black'
    }`}>Broadcast</h3>
    <div className="flex flex-col gap-3">
      <div className={`px-4 py-5 rounded-lg ${
        isDark ? 'bg-gray-700' : 'bg-[#e9e3d8]'
      }`}>
        <span className={`text-md font-medium ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Started:</span>
        <span className={`ml-2 font-semibold ${
          isDark ? 'text-white' : 'text-black'
        }`}>{animeData?.aired?.start || 'Unknown'}</span>
      </div>
      <div className={`px-4 py-5 rounded-lg ${
        isDark ? 'bg-gray-700' : 'bg-[#e9e3d8]'
      }`}>
        <span className={`text-md font-medium ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>Ended:</span>
        <span className={`ml-2 font-semibold ${
          isDark ? 'text-white' : 'text-black'
        }`}>{animeData?.aired?.end || 'Unknown'}</span>
      </div>
    </div>
  </div>
</div>

            
            {/* Synopsis */}
            <div className={`rounded-lg p-8 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-bold text-2xl mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Synopsis</h3>
              <p className={`leading-relaxed text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>{animeData?.synopsis || 'No synopsis available.'}</p>
            </div>
            

            
            {/* Characters */}
            <div className={`rounded-lg p-8 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className='flex justify-between items-center mb-8'>
                <h3 className={`font-bold text-2xl ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Main Characters</h3>
                <button className='text-cyan-600 hover:text-cyan-800 hover:cursor-pointer text-lg'>View All Characters</button>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {animeData?.characters?.length > 0 ? animeData.characters.map((character, index) => (
                  <CharacterCard
                    key={generateUniqueKey(character, index, 'character-')}
                    image={character.image}
                    name={character.name}
                    seriesCount={1}
                    onClick={() => router.push(`/character/${character.mal_id || index + 1}?name=${encodeURIComponent(character.name)}`)}
                  />
                )) : (
                  <div className={`col-span-full text-center py-8 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Character information not available
                  </div>
                )}
              </div>
            </div>
            
            {/* Similar Anime */}
            <div className={`rounded-lg p-6 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-bold text-xl mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Similar Anime</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center'>
                {animeData?.similarAnime?.length > 0 ? animeData.similarAnime.map((anime, index) => (
                  <AnimeCard 
                    key={generateUniqueKey(anime, index, 'similar-')}
                    anime={anime}
                    onToggleFavorite={() => console.log('Toggle favorite:', anime.title)}
                    isFavorite={false}
                    onPlay={() => console.log('Play:', anime.title)}
                    onAdd={(anime, listType) => console.log('Add to', listType, ':', anime.title)}
                  />
                )) : (
                  <div className='col-span-1 md:col-span-2 text-center py-8 text-gray-500'>
                    No similar anime recommendations available
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Tags */}
            <div className={`rounded-lg p-4 sm:p-8 shadow-sm border w-full h-fit transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-[#fbf8f5] border-[#d5cdb8]'
            }`}>
              <h3 className={`font-bold text-xl mb-6 ${
                isDark ? 'text-white' : 'text-black'
              }`}>Tags</h3>
              <div className='flex flex-wrap gap-2 sm:gap-5'>
                {animeData?.tags?.length > 0 ? animeData.tags.map((tag, index) => (
                  <span key={generateUniqueKey(tag, index, 'tag-')} className={`px-2 sm:px-4 py-1 sm:py-2 font-bold border rounded-lg text-sm sm:text-base hover:border-cyan-200 duration-200 cursor-pointer break-words ${
                    isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-[#eae4d6] text-gray-700 border-[#d5cdb8]'
                  }`}>
                    {tag}
                  </span>
                )) : (
                  <span className={`px-5 py-2 rounded-lg text-sm ${
                    isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    No tags available
                  </span>
                )}
              </div>
            </div>
            
            {/* Latest Reviews */}
            <div className={`rounded-lg p-8 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-bold text-xl mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Latest Reviews</h3>
              <div className='space-y-4'>
                {animeData?.reviews?.length > 0 ? animeData.reviews.map((review, index) => (
                  <div key={generateUniqueKey(review.text, index, 'review-')} className='border-b pb-4 last:border-b-0'>
                    <div className='flex gap-1 mb-2'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={`star-${index}-${i}`} className={`w-4 h-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`} />
                      ))}
                    </div>
                    <p className={`text-base ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{review.text}</p>
                  </div>
                )) : (
                  <div className='text-center py-4 text-gray-500'>
                    No reviews available
                  </div>
                )}
              </div>
            </div>
            
            {/* Gallery */}
            <div className={`rounded-lg p-8 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className='flex justify-between items-center mb-6'>
                <h3 className={`font-bold text-xl ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Gallery</h3>
                <button 
                  className='text-cyan-500 hover:text-cyan-800 hover:cursor-pointer text-lg'
                  onClick={() => setShowMoreGallery(!showMoreGallery)}
                >
                  {showMoreGallery ? 'Show Less' : 'Show More'}
                </button>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {animeData?.gallery?.length > 0 ? animeData.gallery
                  .slice(0, showMoreGallery ? animeData.gallery.length : 4)
                  .map((image, index) => (
                  <div key={generateUniqueKey(image, index, 'gallery-')} className='aspect-video bg-gray-200 rounded-lg overflow-hidden'>
                    <Image 
                      src={failedImages.has(image) ? '/carouselImages/DeathNote.jpg' : image} 
                      alt={`Gallery ${index + 1}`}
                      width={200}
                      height={120}
                      className='w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer'
                      onError={() => {
                        console.log(`Image loading failed for: ${image}. Switching to fallback.`)
                        setFailedImages(prev => {
                          if (!prev.has(image)) {
                            console.log(`Adding ${image} to failed images list`)
                            return new Set([...prev, image])
                          }
                          return prev
                        })
                      }}
                      onLoad={() => {
                        console.log(`Image loaded successfully: ${failedImages.has(image) ? '/carouselImages/DeathNote.jpg' : image}`)
                      }}
                    />
                  </div>
                )) : (
                  <div className='col-span-full text-center py-8 text-gray-500'>
                    No gallery images available
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Info */}
            <div className={`rounded-lg p-8 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-bold text-xl mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Additional Info</h3>
              <div className='space-y-4'>
                <div className='flex justify-between'>
                  <span className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Age Rating</span>
                  <span className={`font-semibold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{animeData?.additionalInfo?.ageRating || 'Unknown'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Popularity Rank</span>
                  <span className={`font-semibold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{animeData?.additionalInfo?.popularityRank || 'Unknown'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Rating Rank</span>
                  <span className={`font-semibold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{animeData?.additionalInfo?.ratingRank || 'Unknown'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Episodes</span>
                  <span className={`font-semibold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{animeData?.episodes || 'Unknown'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</span>
                  <span className={`font-semibold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{animeData?.status || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchNow
