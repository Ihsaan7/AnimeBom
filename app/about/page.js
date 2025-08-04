'use client';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const About = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`w-full min-h-screen -mt-2 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
        <div className=' w-[80%] mx-auto pt-15 h-fit'>
            <div className={`w-full h-fit mb-10 p-4 py-10 border rounded-lg shadow-md transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-gray-200'
            }`}>
                <h1 className='text-4xl font-bold text-cyan-700 py-4'>Project Overview</h1>
                <p className={`text-lg ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>Animadom is a comprehensive anime discovery platform that helps users explore, track, and learn about their
favorite anime series and characters. Built with modern web technologies, it provides a seamless experience for
anime enthusiasts to discover new content and manage their watchlists.</p>
            </div>
          <div className={`w-full p-6 mb-10 border rounded-lg shadow-md transition-colors ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-gray-200'
          }`}>
  <h2 className={`text-3xl font-bold mb-8 ${
    isDark ? 'text-teal-400' : 'text-teal-800'
  }`}>APIs and Data Sources</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Card 1 - Jikan API */}
    <div className={`border p-6 rounded-xl shadow hover:shadow-lg transition flex gap-4 items-start ${
      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className={`w-30 h-20 flex items-center justify-center rounded-md font-bold text-xl ${
        isDark ? 'bg-gray-600 text-teal-400' : 'bg-[#e0f1ef] text-teal-800'
      }`}>
        <p className='text-4xl'>J</p>
      </div>
      <div>
        <a
          href="https://jikan.moe/"
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold hover:underline flex items-center gap-1 ${
            isDark ? 'text-teal-400' : 'text-teal-800'
          }`}
        >
          Jikan API <span>↗</span>
        </a>
        <p className={`mt-1 text-sm ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          The unofficial MyAnimeList API providing comprehensive anime and manga data.
        </p>
      </div>
    </div>

    {/* Card 2 - AniList API */}
    <div className={`border p-6 rounded-xl shadow hover:shadow-lg transition flex gap-4 items-start ${
      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className={`w-30 h-20 flex items-center justify-center rounded-md font-bold text-xl ${
        isDark ? 'bg-gray-600 text-teal-400' : 'bg-[#e0f1ef] text-teal-800'
      }`}>
        <p className='text-4xl'>AL</p>
      </div>
      <div>
        <a
          href="https://anilist.co"
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold hover:underline flex items-center gap-1 ${
            isDark ? 'text-teal-400' : 'text-teal-800'
          }`}
        >
          AniList API <span>↗</span>
        </a>
        <p className={`mt-1 text-sm ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          GraphQL API for anime and manga data with rich features.
        </p>
      </div>
    </div>

    {/* Card 3 - Kitsu API */}
    <div className={`border p-6 rounded-xl shadow hover:shadow-lg transition flex gap-4 items-start ${
      isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className={`w-30 h-20 flex items-center justify-center rounded-md font-bold text-xl ${
        isDark ? 'bg-gray-600 text-teal-400' : 'bg-[#e0f1ef] text-teal-800'
      }`}>
         <p className='text-4xl'>K</p>
      </div>
      <div>
        <a
          href="https://kitsu.docs.apiary.io"
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold hover:underline flex items-center gap-1 ${
            isDark ? 'text-teal-400' : 'text-teal-800'
          }`}
        >
          Kitsu API <span>↗</span>
        </a>
        <p className={`mt-1 text-sm ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Modern JSON API for anime and manga data with extensive features.
        </p>
      </div>
    </div>
  </div>
</div>

      <div className={`w-full mb-10 p-4 border rounded-lg shadow-md transition-colors ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-gray-200'
      }`}>
  <h2 className={`text-3xl font-bold mb-8 ${
    isDark ? 'text-teal-400' : 'text-teal-800'
  }`}>Technologies Used</h2>
  
  <div className=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
    {[
      { name: 'Next.js', img: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg' },
      { name: 'React', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg' },
      { name: 'Tailwind CSS', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg' },
      { name: 'Supabase', img: 'https://avatars.githubusercontent.com/u/54469796?s=200&v=4' },
      { name: 'Framer Motion', img: 'https://user-images.githubusercontent.com/38039349/60953119-d3c6f300-a2fc-11e9-9596-4978e5d52180.png' },
      { name: 'React Icons', img: 'https://raw.githubusercontent.com/react-icons/react-icons/master/react-icons.svg' },
      { name: 'Radix UI', img: 'https://avatars.githubusercontent.com/u/75042455?s=200&v=4' },
      { name: 'Lucide React', img: 'https://lucide.dev/logo.dark.svg' },
      { name: 'JavaScript', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png' }
    ].map((tech, idx) => (
      <div key={idx} className={`border rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col items-center justify-center ${
        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
      }`}>
        <img src={tech.img} alt={tech.name} className="w-12 h-12 mb-3 object-contain" />
        <h4 className={`text-center text-[16px] font-medium ${
          isDark ? 'text-teal-400' : 'text-teal-800'
        }`}>{tech.name}</h4>
      </div>
    ))}
  </div>
</div>

            <div className={`w-full p-4 border rounded-lg shadow-md transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-gray-200'
            }`}>
  <h2 className={`text-3xl font-bold mb-10 text-center ${
    isDark ? 'text-teal-400' : 'text-teal-800'
  }`}>About the Creator</h2>

  <div className={`max-w-3xl mx-auto p-8 rounded-xl shadow-md text-center transition-colors ${
    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
  }`}>
    {/* Avatar Placeholder */}
    <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-teal-600 overflow-hidden">
      {/* Replace the below div with an <img src="..." /> when you have the image */}
      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xl text-gray-600">
        <img src="./footerLogo.png" alt="Your Name" className="w-full h-full object-cover" />

      </div>
    </div>

    <h3 className={`text-2xl font-semibold ${
      isDark ? 'text-teal-400' : 'text-teal-800'
    }`}>Ihsaan Ullah</h3>

    <p className={`mt-4 text-[15px] leading-relaxed ${
      isDark ? 'text-gray-300' : 'text-gray-600'
    }`}>
      A Next.js developer currently expanding into backend development to become a full-stack engineer. With a strong foundation in UI/UX design and a creative approach to problem-solving, I enjoy building applications that combine functionality with thoughtful user experiences. This anime discovery platform reflects my passion for both web development and Japanese animation culture.
    </p>

    <a
      href="https://github.com/Ihsaan7"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 border mt-6 px-4 py-2 rounded-md shadow-sm transition ${
        isDark ? 'border-gray-600 hover:bg-gray-600 text-gray-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
      }`}
    >
      <svg
        className="w-5 h-5 fill-current"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 1.8.7 1.8.6 1.4 2.3 1 2.8.8.1-.5.3-.9.6-1.1-2.5-.3-5.2-1.2-5.2-5.5 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.8 1.1 2.9 0 4.3-2.6 5.2-5.1 5.5.3.3.6.8.6 1.6v2.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.9C23.5 5.6 18.4.5 12 .5z"
        />
      </svg>
      GitHub
    </a>
  </div>
</div>

        </div>
    </div>
  )
}

export default About