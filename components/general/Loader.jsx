import React from 'react';
import '@/styles/loader.scss';

const Loader = ({ fullscreen = false }) => {
  return (
    <div className={`loader-container ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="loader">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation={6} result="blur" />
              <feColorMatrix 
                in="blur" 
                mode="matrix" 
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" 
                result="goo" 
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default Loader;
