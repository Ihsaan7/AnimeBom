import React from 'react';

const GlitchLoader = ({ text = "Loading", size = "text-3xl" }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <style jsx>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
          10% {
            transform: translate(-2px, 2px);
            filter: hue-rotate(90deg);
          }
          20% {
            transform: translate(-8px, 0px);
            filter: hue-rotate(180deg);
          }
          30% {
            transform: translate(8px, -2px);
            filter: hue-rotate(270deg);
          }
          40% {
            transform: translate(-2px, 8px);
            filter: hue-rotate(360deg);
          }
          50% {
            transform: translate(2px, -8px);
            filter: hue-rotate(90deg);
          }
          60% {
            transform: translate(-8px, 2px);
            filter: hue-rotate(180deg);
          }
          70% {
            transform: translate(8px, 8px);
            filter: hue-rotate(270deg);
          }
          80% {
            transform: translate(-2px, -2px);
            filter: hue-rotate(360deg);
          }
          90% {
            transform: translate(2px, 2px);
            filter: hue-rotate(90deg);
          }
          100% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
        }
        
        @keyframes glitch-shadow {
          0% {
            transform: translate(0);
          }
          10% {
            transform: translate(2px, -2px);
          }
          20% {
            transform: translate(8px, 0px);
          }
          30% {
            transform: translate(-8px, 2px);
          }
          40% {
            transform: translate(2px, -8px);
          }
          50% {
            transform: translate(-2px, 8px);
          }
          60% {
            transform: translate(8px, -2px);
          }
          70% {
            transform: translate(-8px, -8px);
          }
          80% {
            transform: translate(2px, 2px);
          }
          90% {
            transform: translate(-2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
        
        @keyframes glitch-text {
          0% {
            opacity: 1;
          }
          10% {
            opacity: 0.8;
          }
          20% {
            opacity: 0.9;
          }
          30% {
            opacity: 0.7;
          }
          40% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          60% {
            opacity: 0.9;
          }
          70% {
            opacity: 0.8;
          }
          80% {
            opacity: 1;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
        
        .glitch-container {
          position: relative;
          display: inline-block;
        }
        
        .glitch-text {
          position: relative;
          font-weight: bold;
          color: #fff;
          letter-spacing: 3px;
          animation: glitch 0.3s infinite linear alternate-reverse;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          animation: glitch-shadow 0.3s infinite linear alternate-reverse;
          color: #ff0040;
          z-index: -1;
        }
        
        .glitch-text::after {
          animation: glitch-text 0.3s infinite linear alternate-reverse;
          color: #00ff40;
          z-index: -2;
        }
        
        .dots {
          display: inline-block;
          animation: glitch-text 1s infinite;
        }
        
        .dots::after {
          content: '';
          animation: dots 1.5s infinite;
        }
        
        @keyframes dots {
          0%, 20% {
            content: '';
          }
          40% {
            content: '.';
          }
          60% {
            content: '..';
          }
          80%, 100% {
            content: '...';
          }
        }
      `}</style>
      
      <div className="glitch-container">
        <div 
          className={`glitch-text ${size}`}
          data-text={text}
        >
          {text}
          <span className="dots"></span>
        </div>
      </div>
    </div>
  );
};

export default GlitchLoader;