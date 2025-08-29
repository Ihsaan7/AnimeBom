// This file is now Header.js (JS, not JSX)
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdHome, MdCalendarToday, MdInfoOutline, MdMenu, MdClose } from "react-icons/md";
import { FiBox, FiSearch, FiSun, FiMoon, FiUser, FiLogOut } from "react-icons/fi";
import { GiBroadsword } from "react-icons/gi";
import { useTheme } from "@/contexts/ThemeContext";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, loading } = useSupabaseAuth();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowUserDropdown(false);
    router.push('/auth');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to get a random anime and redirect to its details page
  const handleRandomAnime = async () => {
    try {
      // Generate a random anime ID (AniList has anime IDs from 1 to around 150000+)
      const randomId = Math.floor(Math.random() * 50000) + 1;
      
      // Check if the anime exists by making a simple query
      const query = `
        query GetAnime($id: Int!) {
          Media(id: $id, type: ANIME) {
            id
            title {
              romaji
              english
            }
          }
        }
      `;
      
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: { id: randomId }
        })
      });
      
      const data = await response.json();
      
      if (data.data?.Media) {
         // If anime exists, redirect to its details page
         router.push(`/watchNow?id=${randomId}`);
       } else {
         // If anime doesn't exist, try again with a different ID
         handleRandomAnime();
       }
     } catch (error) {
       console.error('Error fetching random anime:', error);
       // Fallback to a known anime ID
       router.push('/watchNow?id=21');
     }
  };

  return (
    <header className={`fixed top-0 w-full z-50 shadow-md border-b transition-colors ${
      isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#eee]'
    }`}>
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
        {/* Logo */}
        <div className={`flex items-center font-bold text-lg sm:text-xl gap-2 ${
          isDark ? 'text-white' : 'text-black'
        }`}>
          <svg width="24" height="24" className="sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'white' : 'black'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
          <span className="hidden sm:block">アニマドム</span>
          <span className="sm:hidden">アニマ</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-6 flex-1 ml-4 lg:ml-8">
          <Link href="/" className={`flex items-center gap-1 text-sm hover:text-cyan-700 transition-colors no-underline ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            <MdHome size={18} /> Home
          </Link>
          <Link href="/upcoming" className={`flex items-center gap-1 text-sm hover:text-cyan-700 transition-colors no-underline ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            <MdCalendarToday size={18} /> Upcoming
          </Link>
          <Link href='/collection' className={`flex items-center gap-1 text-sm hover:text-cyan-700 transition-colors no-underline ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            <FiBox size={18} /> Collections
          </Link>
          <Link href="/topCharacter" className={`flex items-center gap-1 text-sm hover:text-cyan-700 transition-colors no-underline ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            <GiBroadsword size={18} /> Characters
          </Link>
          <Link href="/about" className={`flex items-center gap-1 text-sm hover:text-cyan-700 transition-colors no-underline ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            <MdInfoOutline size={18} /> About
          </Link>
        </div>

        {/* Desktop Right Side Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Random Anime Button */}
          <button 
            onClick={handleRandomAnime}
            className={`px-2 lg:px-3 text-xs lg:text-sm py-1 border rounded-md font-medium hover:bg-teal-500 hover:text-white duration-200 hover:cursor-pointer transition-colors ${
              isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
            }`}
          >
            <span className="hidden lg:inline">Random Anime</span>
            <span className="lg:hidden">Random</span>
          </button>
          
          {/* Search Bar */}
          <div className="flex items-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }
              }}
              className={`mr-2 transition-all duration-200 ${isSearchOpen ? 'opacity-100 w-48 lg:w-64' : 'opacity-0 w-0 overflow-hidden'}`}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime..."
                className={`w-full px-3 py-1 text-sm border rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'
                }`}
                onBlur={() => {
                  if (!searchQuery.trim()) {
                    setIsSearchOpen(false);
                  }
                }}
              />
            </form>
            {/* Search Icon */}
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) {
                  // Focus the input after state update
                  setTimeout(() => {
                    const input = document.querySelector('input[placeholder="Search anime..."]');
                    if (input) input.focus();
                  }, 100);
                }
              }}
              className={`bg-transparent border-none p-1 hover:text-cyan-700 transition-colors ${
                isDark ? 'text-white' : 'text-black'
              }`}
            >
              <FiSearch size={16} className="lg:w-[18px] lg:h-[18px]" />
            </button>
          </div>
          
          {/* Theme Toggle Icon */}
          <button 
            onClick={toggleTheme}
            className={`bg-transparent border-none p-1 hover:text-cyan-700 transition-colors ${
              isDark ? 'text-white' : 'text-black'
            }`}
          >
            {isDark ? (
              <FiSun size={16} className="lg:w-[18px] lg:h-[18px]" />
            ) : (
              <FiMoon size={16} className="lg:w-[18px] lg:h-[18px]" />
            )}
          </button>
          {/* Authentication Section */}
          {loading ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-cyan-700 border-t-transparent"></div>
          ) : user ? (
            /* User Dropdown */
             <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isDark ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-black'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-cyan-100'
                }`}>
                  <FiUser size={16} className={isDark ? 'text-white' : 'text-cyan-700'} />
                </div>
                <span className="hidden lg:block text-sm font-medium">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                </span>
              </button>
              
              {showUserDropdown && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="py-1">
                    <div className={`px-4 py-2 text-sm border-b ${
                      isDark ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
                    }`}>
                      {user.email}
                    </div>
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-opacity-50 transition-colors no-underline ${
                        isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <FiUser size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-opacity-50 transition-colors ${
                        isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FiLogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Get Started Button */
            <Link 
              href="/auth" 
              className="bg-cyan-700 text-white border-none text-xs lg:text-sm rounded-md px-3 lg:px-5 py-1 font-semibold hover:bg-cyan-800 transition-colors no-underline inline-block"
            >
              <span className="hidden lg:inline">Get Started</span>
              <span className="lg:hidden">Start</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`md:hidden bg-transparent border-none p-2 hover:text-cyan-700 transition-colors ${
            isDark ? 'text-white' : 'text-black'
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="relative w-6 h-6">
            <MdMenu size={24} className={`absolute inset-0 transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <MdClose size={24} className={`absolute inset-0 transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-40 flex flex-col transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
          {/* Mobile Header with Logo and Close */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? 'bg-gray-700' : 'bg-cyan-100'
              }`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'white' : '#0891b2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <path d="M16 3v4"/>
                  <path d="M8 3v4"/>
                </svg>
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>アニマドム</h2>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Anime Discovery Platform</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 hover:text-gray-700 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <MdClose size={24} />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                  setIsMobileMenuOpen(false);
                  setSearchQuery('');
                }
              }}
              className="w-full"
            >
              <div className="relative">
                 <input
                   type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anime..."
                  className={`w-full px-4 py-3 pl-12 border-0 rounded-full text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-colors ${
                    isDark ? 'bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700' : 'bg-purple-100 text-black focus:bg-white'
                  }`}
                />
                <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
              </div>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 py-2 space-y-1">
            <Link 
              href="/" 
              className={`flex items-center gap-3 hover:text-cyan-700 transition-colors no-underline py-3 px-2 rounded-lg ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MdHome size={22} /> 
              <span className="font-medium">Home</span>
            </Link>
            <Link 
              href="/upcoming" 
              className={`flex items-center gap-3 hover:text-cyan-700 transition-colors no-underline py-3 px-2 rounded-lg ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MdCalendarToday size={22} /> 
              <span className="font-medium">Upcoming</span>
            </Link>
            <Link 
              href='/collection' 
              className={`flex items-center gap-3 hover:text-cyan-700 transition-colors no-underline py-3 px-2 rounded-lg ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiBox size={22} /> 
              <span className="font-medium">Collections</span>
            </Link>
            <Link 
              href="/topCharacter" 
              className={`flex items-center gap-3 hover:text-cyan-700 transition-colors no-underline py-3 px-2 rounded-lg ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <GiBroadsword size={22} /> 
              <span className="font-medium">Top Characters</span>
            </Link>
            <Link 
              href="/about" 
              className={`flex items-center gap-3 hover:text-cyan-700 transition-colors no-underline py-3 px-2 rounded-lg ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MdInfoOutline size={22} /> 
              <span className="font-medium">About</span>
            </Link>
          </div>

          {/* Bottom Actions */}
          <div className={`p-4 space-y-3 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button 
              onClick={() => {
                handleRandomAnime();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 border rounded-lg font-medium transition-colors text-center ${
                isDark ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 bg-white text-black hover:bg-gray-50'
              }`}
            >
              Random Anime
            </button>
            
            <button 
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between rounded-full p-3 transition-colors ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${
                  isDark ? 'bg-gray-600' : 'bg-cyan-500'
                }`}></div>
                {isDark ? (
                  <FiMoon size={20} className="text-gray-400" />
                ) : (
                  <FiSun size={20} className="text-gray-600" />
                )}
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
            </button>
            
            {/* Authentication Section - Mobile */}
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-cyan-700 border-t-transparent"></div>
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className={`px-4 py-2 rounded-md ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-gray-700' : 'bg-cyan-100'
                    }`}>
                      <FiUser size={16} className={isDark ? 'text-white' : 'text-cyan-700'} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-xs opacity-75">{user.email}</div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors no-underline ${
                    isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiUser size={16} />
                  Dashboard
                </Link>
                <button
                   onClick={() => {
                     handleLogout();
                     setIsMobileMenuOpen(false);
                   }}
                  className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-left transition-colors ${
                    isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiLogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/auth"
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors no-underline text-center block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>


    </header>
  );
}