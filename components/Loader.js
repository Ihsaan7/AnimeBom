import React from 'react';
import './Loader.css';

export default function Loader({ text = "Loading...", size = "text-2xl", className = "" }) {
  const containerClass = className.includes('h-') 
    ? `loader flex justify-center items-center ${className}`
    : `loader flex justify-center items-center h-screen ${className}`;
    
  return (
    <div className={containerClass}>
      <div data-glitch={text} className={`glitch ${size}`}>{text}</div>
    </div>
  );
}
