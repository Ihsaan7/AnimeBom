import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import './Loader.css';

export default function Loader({ text = "Loading...", size = "text-2xl", className = "" }) {
  const { isDark } = useTheme();
  
  // Always use full screen unless specific height is provided
  const hasCustomHeight = className.includes('h-');
  const baseClasses = "loader flex justify-center items-center";
  const heightClass = hasCustomHeight ? "" : "min-h-screen w-full";
  const backgroundClass = isDark ? "bg-gray-900" : "bg-white";
  const containerClass = `${baseClasses} ${heightClass} ${backgroundClass} ${className}`;
    
  return (
    <div className={containerClass}>
      <div 
        data-glitch={text} 
        className={`glitch ${size}`}
        style={{ color: isDark ? '#ffffff' : '#000000' }}
      >
        {text}
      </div>
    </div>
  );
}
