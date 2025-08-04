'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Star, Calendar, User, Mic } from 'lucide-react'
import AnimeCard from '../../components/AnimeCard'
import Loader from '@/components/Loader'
import { useTheme } from '@/contexts/ThemeContext'

const VoiceActorContent = () => {
  const { isDark } = useTheme()
  const searchParams = useSearchParams()
  const animeId = searchParams.get('id') || searchParams.get('animeId')
  
  const [actorData, setActorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
  // Default fallback data
  const [defaultData] = useState({
    name: "Daisuke Ono",
    image: "/carouselImages/DeathNote.jpg",
    birthday: "May 4, 1978",
    birthplace: "Kochi, Japan",
    about: "Daisuke Ono is a Japanese voice actor and singer who works for Mausu Promotion. He is best known for his roles as Jotaro Kujo in JoJo's Bizarre Adventure, Sebastian Michaelis in Black Butler, Shizuo Heiwajima in Durarara!!, Itsuki Koizumi in The Melancholy of Haruhi Suzumiya, and Sinbad in Magi: The Labyrinth of Magic.",
    roles: [
      {
        character: "Sebastian Michaelis",
        characterId: 1,
        anime: "Black Butler",
        image: "/carouselImages/AttackOnTaitan.jpg",
        year: "2008",
        type: "Main Character",
        voiceActorId: 1
      },
      {
        character: "Jotaro Kujo",
        characterId: 2,
        anime: "JoJo's Bizarre Adventure",
        image: "/carouselImages/DemonSlayer.jpg",
        year: "2012",
        type: "Main Character",
        voiceActorId: 1
      },
      {
        character: "Shizuo Heiwajima",
        characterId: 3,
        anime: "Durarara!!",
        image: "/carouselImages/DragonBallZ.jpg",
        year: "2010",
        type: "Main Character",
        voiceActorId: 1
      },
      {
        character: "Itsuki Koizumi",
        characterId: 4,
        anime: "The Melancholy of Haruhi Suzumiya",
        image: "/carouselImages/FullMetal.jpg",
        year: "2006",
        type: "Main Character",
        voiceActorId: 1
      },
      {
        character: "Sinbad",
        characterId: 5,
        anime: "Magi: The Labyrinth of Magic",
        image: "/carouselImages/MyHeroAcademia.png",
        year: "2012",
        type: "Supporting Character",
        voiceActorId: 1
      },
      {
        character: "Kyoya Ootori",
        characterId: 6,
        anime: "Ouran High School Host Club",
        image: "/carouselImages/onePiece.jpg",
        year: "2006",
        type: "Main Character",
        voiceActorId: 1
      },
      {
        character: "Kotetsu T. Kaburagi",
        characterId: 7,
        anime: "Tiger & Bunny",
        image: "/carouselImages/Chainsaw.png",
        year: "2011",
        type: "Main Character",
        voiceActorId: 1
      },
      {
        character: "Erwin Smith",
        characterId: 8,
        anime: "Attack on Titan",
        image: "/carouselImages/AttackOnTaitan.jpg",
        year: "2013",
        type: "Supporting Character",
        voiceActorId: 1
      },
      {
        character: "Kuroo Tetsurou",
        characterId: 9,
        anime: "Haikyuu!!",
        image: "/carouselImages/SakamotoDays2.png",
        year: "2014",
        type: "Supporting Character",
        voiceActorId: 1
      },
      {
        character: "Battler Ushiromiya",
        characterId: 10,
        anime: "Umineko no Naku Koro ni",
        image: "/carouselImages/ToBeHeroX.jpg",
        year: "2009",
        type: "Main Character",
        voiceActorId: 1
      },
      {
        character: "Kazuma Yagami",
        characterId: 11,
        anime: "Kaze no Stigma",
        image: "/carouselImages/DeathNote.jpg",
        year: "2007",
        type: "Main Character",
        voiceActorId: 1
      },
      {
        character: "Hosaka",
        characterId: 12,
        anime: "Minami-ke",
        image: "/carouselImages/DemonSlayer.jpg",
        year: "2007",
        type: "Supporting Character",
        voiceActorId: 1
      }
    ]
  })

  // AniList GraphQL query for fetching anime voice actors
  const ANILIST_QUERY = `
    query GetAnimeVoiceActors($id: Int!) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        characters(role: MAIN, sort: [ROLE, RELEVANCE, ID]) {
          edges {
            node {
              id
              name {
                full
                native
              }
              image {
                large
                medium
              }
            }
            voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
              id
              name {
                full
                native
              }
              image {
                large
                medium
              }
              dateOfBirth {
                year
                month
                day
              }
              description
            }
          }
        }
      }
    }
  `

  // Function to convert MAL ID to AniList ID
  const convertMalToAniListId = async (malId) => {
    try {
      const query = `
        query GetAniListId($malId: Int!) {
          Media(idMal: $malId, type: ANIME) {
            id
          }
        }
      `
      
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: { malId: parseInt(malId) }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to convert MAL ID to AniList ID')
      }
      
      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'MAL ID conversion failed')
      }
      
      return data.data?.Media?.id
    } catch (error) {
      console.error('Error converting MAL ID to AniList ID:', error)
      return null
    }
  }

  // Function to fetch voice actor data from AniList API
  const fetchActorData = async (animeId) => {
    try {
      setLoading(true)
      setError(null)
      
      let anilistId = animeId
      
      // Check if we need to convert MAL ID to AniList ID
      // If the ID is from MAL (typically larger numbers), convert it
      if (parseInt(animeId) > 50000) {
        anilistId = await convertMalToAniListId(animeId)
        if (!anilistId) {
          throw new Error('Could not convert MAL ID to AniList ID')
        }
      }
      
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: ANILIST_QUERY,
          variables: { id: parseInt(anilistId) }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch anime data from AniList')
      }
      
      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL query failed')
      }
      
      const media = data.data?.Media
      if (!media) {
        throw new Error('Anime not found')
      }
      
      // Transform the data to match our component structure
      const voiceActors = []
      const roles = []
      
      media.characters.edges.forEach(edge => {
        const character = edge.node
        const voiceActor = edge.voiceActors[0] // Get the first (main) Japanese voice actor
        
        if (voiceActor) {
          // Add to voice actors list if not already present
          if (!voiceActors.find(va => va.id === voiceActor.id)) {
            const birthday = voiceActor.dateOfBirth
            const birthdayString = birthday && birthday.year 
              ? `${birthday.month || 1}/${birthday.day || 1}/${birthday.year}`
              : null
            
            voiceActors.push({
              id: voiceActor.id,
              name: voiceActor.name.full,
              image: voiceActor.image.large || voiceActor.image.medium || '/carouselImages/DeathNote.jpg',
              birthday: birthdayString ? new Date(birthdayString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown',
              birthplace: 'Japan',
              about: voiceActor.description || `${voiceActor.name.full} is a talented Japanese voice actor known for their distinctive voice and memorable performances in various anime series and films.`
            })
          }
          
          // Add role information
          roles.push({
            character: character.name.full,
            characterId: character.id,
            anime: media.title.romaji || media.title.english,
            image: character.image.large || character.image.medium || '/carouselImages/onePiece.jpg',
            year: 'Unknown', // AniList doesn't provide this in character context
            type: 'Main Character',
            voiceActorId: voiceActor.id
          })
        }
      })
      
      // Use the first voice actor as the main actor, or create a combined view
      const mainActor = voiceActors[0] || {
        name: 'Multiple Voice Actors',
        image: '/carouselImages/DeathNote.jpg',
        birthday: 'Various',
        birthplace: 'Japan',
        about: `Voice actors for ${media.title.romaji || media.title.english}`
      }
      
      const transformedData = {
        ...mainActor,
        roles: roles,
        allVoiceActors: voiceActors
      }
      
      setActorData(transformedData)
    } catch (err) {
      console.error('Error fetching voice actor data:', err)
      setError(err.message)
      setActorData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (animeId) {
      fetchActorData(animeId)
    } else {
      setActorData(defaultData)
      setLoading(false)
    }
  }, [animeId])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader text="Loading Voice Actor" size="text-2xl" />
      </div>
    )
  }

  if (error && !actorData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-xl text-red-600 mb-4'>Error loading voice actor data</p>
          <p className='text-gray-600'>{error}</p>
        </div>
      </div>
    )
  }

  // Pagination logic
  const totalRoles = actorData?.roles?.length || 0
  const totalPages = Math.ceil(totalRoles / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRoles = actorData?.roles?.slice(startIndex, endIndex) || []

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null

    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)
    const adjustedStartPage = Math.max(1, endPage - 4)

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDark 
              ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-purple-400' 
              : 'border-gray-300 bg-white text-gray-700 hover:bg-purple-50 hover:border-purple-300'
          }`}
        >
          Previous
        </button>
        
        {Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => {
          const page = adjustedStartPage + i
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg border transition-colors font-bold ${
                currentPage === page
                  ? 'bg-teal-500 text-white border-teal-500'
                  : isDark
                    ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-purple-400'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-purple-50 hover:border-purple-300'
              }`}
            >
              {page}
            </button>
          )
        })}
        
        {endPage < totalPages && (
          <>
            <span className={`px-2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>...</span>
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark 
                  ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-purple-400' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-purple-50 hover:border-purple-300'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDark 
              ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-purple-400' 
              : 'border-gray-300 bg-white text-gray-700 hover:bg-purple-50 hover:border-purple-300'
          }`}
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen px-6 mt-5 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header Section */}
      <div className='container mx-auto py-8'>
        <div className={`rounded-lg p-8 shadow-sm border mb-8 transition-colors ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className='flex flex-col md:flex-row gap-8'>
            {/* Voice Actor Image */}
            <div className='w-48 h-64 rounded-xl shadow-lg overflow-hidden flex-shrink-0 mx-auto md:mx-0'>
              <Image
                src={actorData?.image || '/carouselImages/DeathNote.jpg'}
                alt={actorData?.name || 'Voice Actor'}
                width={192}
                height={256}
                className='object-cover w-full h-full'
              />
            </div>

            {/* Voice Actor Info */}
            <div className='flex-1'>
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {actorData?.name || 'Loading...'}
              </h1>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                <div className={`flex items-center gap-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Calendar className='w-5 h-5 text-blue-500' />
                  <span className='font-medium'>Birthday:</span>
                  <span>{actorData?.birthday || 'Unknown'}</span>
                </div>
                <div className={`flex items-center gap-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <User className='w-5 h-5 text-green-500' />
                  <span className='font-medium'>Birthplace:</span>
                  <span>{actorData?.birthplace || 'Unknown'}</span>
                </div>
              </div>
              
              <div className='mb-6'>
                <h3 className={`font-bold text-xl mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>About</h3>
                <p className={`leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {actorData?.about || 'No information available.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Voice Acting Roles */}
        <div className={`rounded-lg p-8 shadow-sm border transition-colors ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className='flex justify-between items-center mb-8'>
            <h3 className={`font-bold text-2xl flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Mic className='w-6 h-6 text-purple-500' />
              Voice Acting Roles
            </h3>
            <span className={`${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {totalRoles} total roles
            </span>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {currentRoles.map((role, index) => (
              <Link 
                key={`${role.characterId}-${role.voiceActorId}-${index}`} 
                href={`/character/${role.characterId}`}
                className={`rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className='aspect-[3/4] rounded-lg overflow-hidden mb-3'>
                  <Image
                    src={role.image}
                    alt={role.anime}
                    width={200}
                    height={267}
                    className='object-cover w-full h-full'
                  />
                </div>
                <h4 className={`font-semibold text-lg mb-2 line-clamp-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{role.anime}</h4>
                <div className={`text-sm space-y-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <p><span className='font-medium'>Character:</span> {role.character}</p>
                  <p><span className='font-medium'>Year:</span> {role.year}</p>
                  <p><span className='font-medium'>Role:</span> {role.type}</p>
                </div>
              </Link>
            ))}
          </div>
          
          {currentRoles.length === 0 && (
            <div className={`text-center py-12 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Mic className='w-16 h-16 mx-auto mb-4 opacity-50' />
              <p className='text-xl'>No voice acting roles found</p>
            </div>
          )}
          
          {renderPagination()}
        </div>
      </div>
    </div>
  )
}

const VoiceActor = () => {
  return (
    <Suspense fallback={<Loader />}>
      <VoiceActorContent />
    </Suspense>
  )
}

export default VoiceActor