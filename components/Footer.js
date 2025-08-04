import Link from 'next/link';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
// import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

 export default function Footer() {
  const { isDark } = useTheme();
  return (
    <div className={`${isDark ? 'bg-black' : 'bg-white'} transition-colors py-5`}>
      <div className={`w-full border-t-2 mb-3 md:mb-5 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>
      
      {/* Mobile Layout */}
      <div className='block md:hidden px-4 mb-6'>
        <div className='flex flex-col items-center space-y-4'>
          <img 
            src='/footerLogo.png'
            alt='footer logo'
            className='w-8 h-8'
          />
          <div className='flex flex-wrap justify-center gap-4 text-sm'>
            <Link className={`${isDark ? 'text-white hover:text-gray-300' : 'text-teal-500 hover:text-teal-200'} transition-colors duration-300 cursor-pointer`} href="/">Anime</Link>
            <Link className={`${isDark ? 'text-white hover:text-gray-300' : 'text-teal-500 hover:text-teal-200'} transition-colors duration-300 cursor-pointer`} href="/">Community</Link>
            <Link className={`${isDark ? 'text-white hover:text-gray-300' : 'text-teal-500 hover:text-teal-200'} transition-colors duration-300 cursor-pointer`} href="/">About</Link>
          </div>
          <p className={`${isDark ? 'text-white' : 'text-teal-500'} text-xs text-center`}>© 2025 All rights reserved.</p>
        </div>
      </div>

      {/* Tablet and Desktop Layout */}
      <div className='hidden md:flex justify-between items-center px-6 lg:px-10 mb-6 lg:mb-10'>
        <img 
          src='/footerLogo.png'
          alt='footer logo'
          className='w-8 h-8 lg:w-10 lg:h-10 lg:ml-10'
        />
        <div className='flex gap-4 lg:gap-6'>
          <Link className={`${isDark ? 'text-white hover:text-gray-300' : 'text-teal-500 hover:text-teal-200'} transition-colors duration-300 cursor-pointer text-sm lg:text-base`} href="/">Anime</Link>
          <Link className={`${isDark ? 'text-white hover:text-gray-300' : 'text-teal-500 hover:text-teal-200'} transition-colors duration-300 cursor-pointer text-sm lg:text-base`} href="/">Community</Link>
          <Link className={`${isDark ? 'text-white hover:text-gray-300' : 'text-teal-500 hover:text-teal-200'} transition-colors duration-300 cursor-pointer text-sm lg:text-base`} href="/">About</Link>
        </div>
        <p className={`${isDark ? 'text-white' : 'text-teal-500'} text-sm lg:text-base`}>© 2025 All rights reserved.</p>
      </div>
    </div>
    // <footer className="bg-gray-900 text-white">
    //   <div className="max-w-7xl mx-auto px-4 py-12">
    //     {/* Main Footer Content */}
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    //       {/* Company Info */}
    //       <div className="space-y-4">
    //         <h3 className="text-2xl font-bold text-purple-400">AnimaDom</h3>
    //         <p className="text-gray-300 text-sm leading-relaxed">
    //           Your ultimate destination for anime streaming. Discover, watch, and enjoy the best anime series and movies from around the world.
    //         </p>
    //         <div className="flex space-x-4">
    //           <Facebook className="w-5 h-5 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
    //           <Twitter className="w-5 h-5 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
    //           <Instagram className="w-5 h-5 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
    //           <Youtube className="w-5 h-5 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
    //         </div>
    //       </div>

    //       {/* Quick Links */}
    //       <div className="space-y-4">
    //         <h4 className="text-lg font-semibold text-white">Quick Links</h4>
    //         <ul className="space-y-2">
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Home</a></li>
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Browse Anime</a></li>
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Top Rated</a></li>
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Trending</a></li>
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">My List</a></li>
    //         </ul>
    //       </div>

    //       {/* Categories */}
    //       <div className="space-y-4">
    //         <h4 className="text-lg font-semibold text-white">Categories</h4>
    //         <ul className="space-y-2">
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Action</a></li>
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Romance</a></li>
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Comedy</a></li>
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Drama</a></li>
    //           <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">Fantasy</a></li>
    //         </ul>
    //       </div>

    //       {/* Contact Info */}
    //       <div className="space-y-4">
    //         <h4 className="text-lg font-semibold text-white">Contact Us</h4>
    //         <div className="space-y-3">
    //           <div className="flex items-center space-x-3">
    //             <Mail className="w-4 h-4 text-purple-400" />
    //             <span className="text-gray-300 text-sm">support@animadom.com</span>
    //           </div>
    //           <div className="flex items-center space-x-3">
    //             <Phone className="w-4 h-4 text-purple-400" />
    //             <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
    //           </div>
    //           <div className="flex items-center space-x-3">
    //             <MapPin className="w-4 h-4 text-purple-400" />
    //             <span className="text-gray-300 text-sm">123 Anime Street, Tokyo</span>
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Newsletter Signup */}
    //     <div className="border-t border-gray-800 mt-12 pt-8">
    //       <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
    //         <div className="text-center md:text-left">
    //           <h4 className="text-lg font-semibold text-white mb-2">Stay Updated</h4>
    //           <p className="text-gray-300 text-sm">Subscribe to get notified about new anime releases and updates.</p>
    //         </div>
    //         <div className="flex space-x-2">
    //           <input
    //             type="email"
    //             placeholder="Enter your email"
    //             className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-purple-400 w-64"
    //           />
    //           <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
    //             Subscribe
    //           </button>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Bottom Bar */}
    //     <div className="border-t border-gray-800 mt-8 pt-8">
    //       <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
    //         <div className="flex space-x-6 text-sm text-gray-300">
    //           <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
    //           <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
    //           <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
    //           <a href="#" className="hover:text-purple-400 transition-colors">Help Center</a>
    //         </div>
    //         <div className="text-sm text-gray-400">
    //           © 2024 AnimaDom. All rights reserved.
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </footer>
  );
}
