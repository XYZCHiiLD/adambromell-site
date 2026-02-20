'use client';
import { useState, useEffect } from 'react';

export default function ParallaxImage({ images, alt = "Photography by Adam Bromell" }) {
  const [scrollY, setScrollY] = useState(0);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    // Randomly select an image on mount
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setSelectedImage(randomImage);
  }, [images]);

  useEffect(() => {
    // Handle scroll for parallax effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      style={{ 
        width: 'calc(100% + 96px)',
        height: '256px',
        overflow: 'hidden',
        position: 'relative',
        marginLeft: '-48px',
        marginTop: '-96px',
        marginBottom: '48px',
      }}
    >
      <img 
        src={selectedImage} 
        alt={alt}
        style={{
          width: '100%',
          height: 'auto',
          position: 'absolute',
          bottom: '-85px',
          left: 0,
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
}
