'use client';

import Image from '@/components/general/ImgWithLoader';
import '@/styles/lightGuide.scss';

export default function LightGuide() {
  return (
    <div className="light-guide">
      <h3 className="light-guide-title">Plant Light Requirements Guide</h3>
      <div className="light-guide-image-wrapper">
        <Image 
          src="/lightGuide.png" 
          alt="Light Requirements Guide for Plants" 
          width={800}
          height={400}
          className="light-guide-image"
          priority={false}
        />
      </div>
      <p className="light-guide-description">
        Understanding light requirements helps your plant thrive. Place your plant according to its specific light needs for optimal growth.
      </p>
    </div>
  );
}
