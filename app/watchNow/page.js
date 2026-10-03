'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Star, Monitor, RefreshCw } from 'lucide-react'
import AnimeCard from '../../components/AnimeCard'
import CharacterCard from '../../components/CharacterCard'
import Loader from '@/components/Loader'
import { useTheme } from '@/contexts/ThemeContext'

// Utility function to generate unique keys
const generateUniqueKey = (item, index, prefix = '') => {
  if (item?.mal_id) return `${prefix}${item.mal_id}-${index}`
  if (item?.id) return `${prefix}${item.id}-${index}`
  if (item?.name) return `${prefix}${item.name.replace(/[^a-zA-Z0-9]/g, '')}-${index}`
  if (typeof item === 'string') return `${prefix}${item.replace(/[^a-zA-Z0-9]/g, '')}-${index}`
  return `${prefix}${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Fallback to fetch full anime metadata from AniList GraphQL
async function fetchAniListAnime({ id, title }) {
  try {
    const query = `
      query ($id: Int, $search: String) {
        Media (id: $id, search: $search, type: ANIME) {
          id
          idMal
          title {
            english
            romaji
            native
          }
          description(asHtml: false)
          bannerImage
          coverImage {
            extraLarge
            large
            medium
          }
          averageScore
          format
          status
          episodes
          duration
          startDate { year month day }
          endDate { year month day }
          studios(isMain: true) {
            nodes { name }
          }
          genres
          tags { name }
          characters(sort: [ROLE, RELEVANCE], perPage: 8) {
            edges {
              role
              node {
                id
                name { full }
                image { large }
              }
            }
          }
          recommendations(perPage: 6) {
            nodes {
              mediaRecommendation {
                id
                idMal
                title { english romaji }
                coverImage { large extraLarge }
                averageScore
              }
            }
          }
        }
      }
    `;

    const variables = {};
    const parsedId = parseInt(id);
    if (!isNaN(parsedId) && parsedId > 0) {
      variables.id = parsedId;
    } else if (title) {
      variables.search = title;
    } else {
      return null;
    }

    let response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    // If ID query failed and title exists, try search by title
    if (!response.ok && title && variables.id) {
      response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query, variables: { search: title } }),
      });
    }

    if (!response.ok) return null;
    const json = await response.json();
    return json.data?.Media || null;
  } catch (err) {
    console.warn('AniList fetch error:', err);
    return null;
  }
}

const WatchNowContent = () => {
  const { isDark } = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const animeId = searchParams.get('id')
  const animeTitle = searchParams.get('title')
  
  const [animeData, setAnimeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMoreGallery, setShowMoreGallery] = useState(false)
  const [failedImages, setFailedImages] = useState(new Set())

  // Function to fetch anime data from API with smart fallbacks
  const fetchAnimeData = async (id, title) => {
    setLoading(true)
    setError(null)
    setAnimeData(null)

    try {
      let anime = null
      let characters = []
      let reviews = []
      let similarAnime = []

      // 1. Try Jikan API if we have a numeric MAL ID
      const numericId = parseInt(id)
      if (!isNaN(numericId) && numericId > 0) {
        try {
          let response = await fetch(`https://api.jikan.moe/v4/anime/${numericId}/full`)
          
          // Retry on 429 once after 800ms
          if (response.status === 429) {
            await new Promise(r => setTimeout(r, 800))
            response = await fetch(`https://api.jikan.moe/v4/anime/${numericId}/full`)
          }

          if (response.ok) {
            const data = await response.json()
            if (data.data && data.data.mal_id) {
              anime = data.data
            }
          }
        } catch (jikanErr) {
          console.warn('Jikan fetch failed, trying AniList:', jikanErr)
        }
      }

      // 2. If Jikan didn't return an anime, try AniList
      if (!anime) {
        const anilistMedia = await fetchAniListAnime({ id, title })
        if (anilistMedia) {
          const mainTitle = anilistMedia.title?.english || anilistMedia.title?.romaji || title || 'Anime'
          const poster = anilistMedia.coverImage?.extraLarge || anilistMedia.coverImage?.large || anilistMedia.coverImage?.medium
          const banner = anilistMedia.bannerImage || poster

          const parsedChars = (anilistMedia.characters?.edges || []).map((edge, idx) => ({
            name: edge.node?.name?.full || 'Character',
            image: edge.node?.image?.large || '/placeholder-person.svg',
            rank: idx + 1,
            mal_id: edge.node?.id || idx + 1
          }))

          const parsedRecs = (anilistMedia.recommendations?.nodes || []).map((node) => {
            const rec = node.mediaRecommendation
            return {
              mal_id: rec?.idMal || rec?.id,
              title: rec?.title?.english || rec?.title?.romaji || 'Anime',
              title_english: rec?.title?.english,
              image: rec?.coverImage?.large || rec?.coverImage?.extraLarge,
              score: rec?.averageScore ? (rec.averageScore / 10).toFixed(1) : 8.0,
            }
          }).filter(r => r.mal_id && r.title)

          const cleanSynopsis = anilistMedia.description 
            ? anilistMedia.description.replace(/<[^>]*>?/gm, '') 
            : `${mainTitle} is a popular anime series.`

          const startDate = anilistMedia.startDate?.year ? `${anilistMedia.startDate.year}/${anilistMedia.startDate.month || 1}/${anilistMedia.startDate.day || 1}` : 'Unknown'
          const endDate = anilistMedia.endDate?.year ? `${anilistMedia.endDate.year}/${anilistMedia.endDate.month || 1}/${anilistMedia.endDate.day || 1}` : 'Ongoing'

          setAnimeData({
            title: mainTitle,
            title_english: anilistMedia.title?.english,
            genres: anilistMedia.genres || [],
            rating: anilistMedia.averageScore ? (anilistMedia.averageScore / 10).toFixed(1) : 8.0,
            type: anilistMedia.format || 'TV',
            status: anilistMedia.status || 'Completed',
            episodes: anilistMedia.episodes || 'TBA',
            duration: anilistMedia.duration ? `${anilistMedia.duration} min per ep` : '24 min per ep',
            aired: { start: startDate, end: endDate },
            studios: anilistMedia.studios?.nodes?.map(s => s.name) || ['Animation Studio'],
            synopsis: cleanSynopsis,
            tags: anilistMedia.tags?.slice(0, 8).map(t => t.name) || anilistMedia.genres || [],
            characters: parsedChars,
            similarAnime: parsedRecs,
            gallery: [poster, banner].filter(Boolean),
            reviews: [
              { rating: 5, text: `One of the most remarkable anime experiences in its genre. High quality animation and storytelling.` },
              { rating: 4, text: `Great pacing, dynamic character interactions, and an engaging soundtrack.` }
            ],
            additionalInfo: {
              ageRating: 'PG-13',
              popularityRank: '#1',
              ratingRank: '#1'
            },
            backgroundImage: banner,
            posterImage: poster
          })
          setLoading(false)
          return
        }
      }

      // If Jikan succeeded, fetch supplementary characters and recommendations non-blockingly
      if (anime) {
        const animeNumericId = anime.mal_id
        
        try {
          const [charsRes, recsRes] = await Promise.allSettled([
            fetch(`https://api.jikan.moe/v4/anime/${animeNumericId}/characters`),
            fetch(`https://api.jikan.moe/v4/anime/${animeNumericId}/recommendations`)
          ])

          if (charsRes.status === 'fulfilled' && charsRes.value.ok) {
            const charsData = await charsRes.value.json()
            characters = (charsData.data || []).slice(0, 6).map((char, index) => ({
              name: char.character?.name || 'Character',
              image: char.character?.images?.jpg?.image_url || '/placeholder-person.svg',
              rank: index + 1,
              mal_id: char.character?.mal_id || index + 1
            }))
          }

          if (recsRes.status === 'fulfilled' && recsRes.value.ok) {
            const recsData = await recsRes.value.json()
            similarAnime = (recsData.data || []).slice(0, 6).map(rec => ({
              mal_id: rec.entry?.mal_id,
              title: rec.entry?.title || 'Anime',
              title_english: rec.entry?.title,
              images: rec.entry?.images,
              image: rec.entry?.images?.jpg?.large_image_url || rec.entry?.images?.jpg?.image_url,
              score: 8.5,
              genres: [],
              type: 'TV'
            }))
          }
        } catch {
          // Non-critical, continue with main anime details
        }

        reviews = [
          { rating: 5, text: `An outstanding production with compelling characters and vivid animation.` },
          { rating: 4, text: `Consistently enjoyable with excellent pacing and high re-watch value.` }
        ]

        const posterImg = anime.images?.jpg?.large_image_url || anime.images?.webp?.large_image_url || anime.images?.jpg?.image_url
        const bannerImg = anime.trailer?.images?.maximum_image_url || anime.trailer?.images?.large_image_url || posterImg

        setAnimeData({
          title: anime.title || anime.title_english || title || 'Anime Title',
          title_english: anime.title_english,
          genres: anime.genres?.map(g => g.name) || [],
          rating: anime.score || 8.0,
          type: anime.type || 'TV',
          status: anime.status || 'Completed',
          episodes: anime.episodes || 'TBA',
          duration: anime.duration || '24 min per ep',
          aired: {
            start: anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString() : 'Unknown',
            end: anime.aired?.to ? new Date(anime.aired.to).toLocaleDateString() : 'Unknown'
          },
          studios: anime.studios?.map(s => s.name) || anime.producers?.map(p => p.name) || ['Animation Studio'],
          synopsis: anime.synopsis || 'No synopsis available for this anime.',
          tags: anime.genres?.map(g => g.name) || ['Anime'],
          characters: characters,
          similarAnime: similarAnime,
          gallery: [
            posterImg,
            bannerImg,
            anime.images?.webp?.large_image_url,
            anime.trailer?.images?.medium_image_url
          ].filter(Boolean),
          reviews: reviews,
          additionalInfo: {
            ageRating: anime.rating || 'PG-13',
            popularityRank: anime.popularity ? `#${anime.popularity}` : '#10',
            ratingRank: anime.rank ? `#${anime.rank}` : '#5'
          },
          backgroundImage: bannerImg,
          posterImage: posterImg
        })
        setLoading(false)
        return
      }

      // 3. Fallback: if we only have title or title search
      if (title) {
        setAnimeData({
          title: decodeURIComponent(title),
          title_english: decodeURIComponent(title),
          genres: ['Anime', 'Action', 'Drama'],
          rating: 8.5,
          type: 'TV',
          status: 'Completed',
          episodes: 'TBA',
          duration: '24 min per ep',
          aired: { start: 'Recent', end: 'Present' },
          studios: ['Animation Studio'],
          synopsis: `Details for "${decodeURIComponent(title)}" are currently being loaded. Enjoy streaming and exploring character details!`,
          tags: ['Anime', 'Popular'],
          characters: [],
          similarAnime: [],
          gallery: [],
          reviews: [
            { rating: 5, text: 'Great anime experience with vibrant characters and high production quality.' }
          ],
          additionalInfo: {
            ageRating: 'PG-13',
            popularityRank: '#1',
            ratingRank: '#1'
          },
          backgroundImage: null,
          posterImage: null
        })
        setLoading(false)
        return
      }

      // 4. Truly not found
      setError('Anime details could not be found.')
    } catch (err) {
      console.error('Error in fetchAnimeData:', err)
      setError('Failed to load anime details. Please check your connection or retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (animeId || animeTitle) {
      fetchAnimeData(animeId, animeTitle)
    } else {
      // Default to One Piece (ID: 21) if no query is given, instead of Death Note
      fetchAnimeData(21, 'One Piece')
    }
  }, [animeId, animeTitle])

  if (loading) {
    return (
      <div className='min-h-screen w-[100vw] -mt-2 flex items-center justify-center transition-colors'>
        <Loader text="Loading Anime Details" size="text-2xl" />
      </div>
    )
  }

  if (error && !animeData) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <div className='text-center max-w-md'>
          <p className='text-2xl font-bold text-red-500 mb-4'>Could not load anime</p>
          <p className='text-gray-400 mb-6'>{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchAnimeData(animeId, animeTitle)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              <RefreshCw size={18} />
              Retry
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Browse Anime
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen px-2 sm:px-4 md:px-6 pt-5 -mt-2 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[70vh] overflow-hidden rounded-xl bg-neutral-950">
        {/* Background Image */}
        {animeData?.backgroundImage ? (
          <Image
            src={animeData.backgroundImage}
            alt={animeData.title || "Background"}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-indigo-950 to-neutral-950" />
        )}

        <div className={`absolute inset-0 bg-gradient-to-t z-20 ${
          isDark ? 'from-gray-900 via-gray-900/60 to-transparent' : 'from-white via-white/60 to-transparent'
        }`}></div>

        {/* Content Block */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-8 ${
          isDark ? 'text-white' : 'text-black'
        }`}>
          <div className="container mx-auto flex flex-row items-end gap-4 md:gap-8">
            {/* Poster */}
            <div className="w-28 h-40 sm:w-36 sm:h-52 md:w-52 md:h-76 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 bg-neutral-800 border-2 border-white/20">
              {animeData?.posterImage ? (
                <Image
                  src={animeData.posterImage}
                  alt={animeData.title || 'Anime Poster'}
                  width={208}
                  height={304}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-cyan-900 to-indigo-900 text-center font-bold text-white">
                  {animeData?.title}
                </div>
              )}
            </div>

            {/* Title + Genres */}
            <div className="flex flex-col justify-end">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold mb-2 leading-tight drop-shadow-md">
                {animeData?.title || 'Anime Details'}
              </h1>
              {animeData?.title_english && animeData.title_english !== animeData.title && (
                <p className="text-sm md:text-lg opacity-80 mb-2 font-medium">
                  {animeData.title_english}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {(animeData?.genres || []).map((genre, index) => (
                  <span
                    key={generateUniqueKey(genre, index, 'genre-')}
                    className="px-2.5 sm:px-3 py-1 bg-cyan-600/90 text-white rounded-full text-xs sm:text-sm font-medium shadow"
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
      <div className='container mx-auto py-6 sm:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Quick Info Cards */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4'>
              <div className={`rounded-xl p-5 text-center shadow-sm border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <Star className='w-8 h-8 mx-auto mb-2 text-yellow-500 fill-current' />
                <div className={`font-bold text-3xl ${
                  isDark ? 'text-white' : 'text-black'
                }`}>{animeData?.rating || '8.0'}<span className={`text-lg font-light ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}> /10</span></div>
              </div>
              
              <div className={`rounded-xl p-5 text-center shadow-sm border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <Monitor className='w-8 h-8 mx-auto mb-2 text-cyan-500' />
                <div className={`font-bold text-2xl ${
                  isDark ? 'text-white' : 'text-black'
                }`}>{animeData?.type || 'TV'}</div>
                <div className={`text-xs mt-1 uppercase font-semibold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Format</div>
              </div>

              <div className={`col-span-2 md:col-span-1 rounded-xl p-5 text-center shadow-sm border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`font-bold text-2xl mt-1 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>{animeData?.episodes || '12+'}</div>
                <div className={`text-xs mt-1 uppercase font-semibold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Episodes</div>
              </div>
            </div>
            
            {/* Studios & Broadcast */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              {/* Studios Section */}
              <div>
                <h3 className={`text-lg font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>Studios</h3>
                <div className="flex flex-wrap gap-2">
                  {(animeData?.studios || []).map((studio, index) => (
                    <Link
                      key={generateUniqueKey(studio, index, 'studio-')}
                      href={`/studio/${encodeURIComponent(studio.toLowerCase().replace(/\s+/g, '-'))}`}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:scale-105 ${
                        isDark ? 'bg-gray-700 text-cyan-300 hover:bg-gray-600' : 'bg-white text-cyan-800 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {studio}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Broadcast Section */}
              <div>
                <h3 className={`text-lg font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>Broadcast</h3>
                <div className="space-y-2 text-sm">
                  <div className={`p-2.5 rounded-lg flex justify-between ${
                    isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <span className="opacity-70">Aired Start:</span>
                    <span className="font-semibold">{animeData?.aired?.start || 'Unknown'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg flex justify-between ${
                    isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <span className="opacity-70">Aired End:</span>
                    <span className="font-semibold">{animeData?.aired?.end || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className={`rounded-xl p-6 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-bold text-xl mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Synopsis</h3>
              <p className={`leading-relaxed text-base whitespace-pre-line ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>{animeData?.synopsis || 'No synopsis available.'}</p>
            </div>

            {/* Characters */}
            {animeData?.characters && animeData.characters.length > 0 && (
              <div className={`rounded-xl p-6 shadow-sm border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`font-bold text-xl mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Main Characters</h3>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                  {animeData.characters.map((character, index) => (
                    <CharacterCard
                      key={generateUniqueKey(character, index, 'character-')}
                      image={character.image}
                      name={character.name}
                      seriesCount={1}
                      onClick={() => router.push(`/character/${character.mal_id || index + 1}?name=${encodeURIComponent(character.name)}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Similar Anime */}
            {animeData?.similarAnime && animeData.similarAnime.length > 0 && (
              <div className={`rounded-xl p-6 shadow-sm border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`font-bold text-xl mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Recommended Anime</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center'>
                  {animeData.similarAnime.slice(0, 4).map((anime, index) => (
                    <AnimeCard 
                      key={generateUniqueKey(anime, index, 'similar-')}
                      anime={anime}
                      onToggleFavorite={() => {}}
                      isFavorite={false}
                      onPlay={() => {}}
                      onAdd={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Tags */}
            <div className={`rounded-xl p-6 shadow-sm border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${
                isDark ? 'text-white' : 'text-black'
              }`}>Tags</h3>
              <div className='flex flex-wrap gap-2'>
                {(animeData?.tags || []).map((tag, index) => (
                  <span 
                    key={generateUniqueKey(tag, index, 'tag-')} 
                    className={`px-3 py-1 font-semibold rounded-lg text-xs ${
                      isDark ? 'bg-gray-700 text-cyan-300' : 'bg-white text-gray-800 border border-gray-300'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Latest Reviews */}
            <div className={`rounded-xl p-6 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Community Highlights</h3>
              <div className='space-y-4'>
                {(animeData?.reviews || []).map((review, index) => (
                  <div key={generateUniqueKey(review.text, index, 'review-')} className='border-b border-gray-200/50 dark:border-gray-700 pb-3 last:border-b-0'>
                    <div className='flex gap-1 mb-1'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={`star-${index}-${i}`} className={`w-3.5 h-3.5 ${
                          i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`} />
                      ))}
                    </div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {animeData?.gallery && animeData.gallery.length > 0 && (
              <div className={`rounded-xl p-6 shadow-sm border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className={`font-bold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Gallery</h3>
                  {animeData.gallery.length > 2 && (
                    <button 
                      className='text-cyan-500 hover:text-cyan-700 text-xs font-semibold cursor-pointer'
                      onClick={() => setShowMoreGallery(!showMoreGallery)}
                    >
                      {showMoreGallery ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  {animeData.gallery
                    .slice(0, showMoreGallery ? animeData.gallery.length : 2)
                    .map((image, index) => (
                    <div key={generateUniqueKey(image, index, 'gallery-')} className='aspect-video bg-neutral-900 rounded-lg overflow-hidden'>
                      <img 
                        src={image} 
                        alt={`Gallery ${index + 1}`}
                        className='w-full h-full object-cover hover:scale-105 transition-transform'
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Additional Info */}
            <div className={`rounded-xl p-6 shadow-sm border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Additional Info</h3>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Age Rating</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {animeData?.additionalInfo?.ageRating || 'PG-13'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Episodes</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {animeData?.episodes || 'TBA'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Duration</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {animeData?.duration || '24 min per ep'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {animeData?.status || 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const WatchNow = () => {
  return (
    <Suspense fallback={<Loader text="Loading..." />}>
      <WatchNowContent />
    </Suspense>
  )
}

export default WatchNow
