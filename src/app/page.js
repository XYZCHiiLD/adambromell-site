'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [bgColor, setBgColor] = useState('');

  useEffect(() => {
    // Cloud Dancer background
    setBgColor('#F0EEE4'); // Pantone Cloud Dancer 11-4201 TCX
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div 
        className="max-w-3xl mx-auto px-12 py-16 md:py-24 min-h-screen"
        style={{
          position: 'relative',
          backgroundColor: '#F0EEE4',
        }}
      >
        
        {/* Header */}
        <header className="mb-4">
          <h1 className="font-bold mb-0">adam bromell</h1>
        </header>

        {/* Tagline */}
        <section className="mb-12">
          <p className="text-gray-800 leading-relaxed mb-4" style={{ fontSize: '18px' }}>
            EXPLORING HOW A SANDBOX CAN TURN <strong>STRANGERS</strong> INTO <strong>FRIENDS</strong>, STUDYING <strong>G-SHOCK CONSTRAINTS</strong>, AND PURSUING <strong>LIGHT</strong> THROUGH A <strong>LENS</strong>.
          </p>
          <div className="flex gap-6">
            <p>
              bluesky: <a 
                href="https://bsky.app/profile/adambromell.info" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#C5003E' }}
              >
                adambromell.info
              </a>
            </p>
            <p>
              threads: <a 
                href="https://www.threads.net/@adambromell" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#C5003E' }}
              >
                @adambromell
              </a>
            </p>
            <p>
              instagram (photography): <a 
                href="https://www.instagram.com/yeti.snaps/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#C5003E' }}
              >
                @yeti.snaps
              </a>
            </p>
          </div>
        </section>

        <hr className="mb-12" style={{ borderColor: '#000', borderWidth: '0.5px' }} />

        {/* About */}
        <section className="mb-12">
          <h2 className="font-bold mb-4">about</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>HEY, I'M ADAM.</p>
            <p>IN 2001, I DROPPED OUT OF COLLEGE TO MAKE GAMES AS A 3D ARTIST. AFTER A DECADE IN AAA, I LEFT IN 2014 TO CO-FOUND <a href="https://www.systemera.net/" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold" style={{ color: '#C5003E' }}>SYSTEM ERA</a> AS THE CREATOR OF <strong>ASTRONEER</strong>. WE WERE ACQUIRED BY <strong>DEVOLVER DIGITAL</strong> IN 2023.</p>
            <p>TODAY, I SERVE AS CCO OF <strong>SYSTEM ERA</strong> AND CREATIVE DIRECTOR FOR THE STUDIO'S MOST AMBITIOUS GAME YET.</p>
            <p>OUTSIDE OF MY PROFESSIONAL WORK, I'M CURIOUS ABOUT PRODUCT DESIGN AND PHOTOGRAPHY.</p>
          </div>
        </section>

        <hr className="mb-12" style={{ borderColor: '#000', borderWidth: '0.5px' }} />

        {/* System Era */}
        <section className="mb-12">
          <h2 className="font-bold mb-4">system era</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <div>
              <p className="subheading">COMPANY</p>
              <p>co-founded in 2014</p>
              <p><a href="https://www.gamedeveloper.com/business/devolver-digital-to-acquire-astroneer-dev-system-era-for-up-to-40m" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#C5003E' }}>acquired by DEVOLVER DIGITAL in 2023</a></p>
            </div>
            
            <div className="mt-6">
              <p className="subheading">ASTRONEER</p>
              <p>base building survival sandbox</p>
              <p><a href="https://www.gamedeveloper.com/design/what-i-astroneer-i-s-devs-learned-while-leaving-early-access" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#C5003E' }}>pioneering voxel technology</a></p>
              <p>14M+ players across all platforms</p>
              <p>#1 game on STEAM weeks after early access launch</p>
            </div>

            <div className="mt-6">
              <p className="subheading">STARSEEKER: ASTRONEER EXPEDITIONS</p>
              <p>massively co-operative expeditions</p>
              <p>40+ player space station hub</p>
              <p><a href="https://gamerant.com/starseeker-astroneer-expeditions-live-service-fomo-content/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#C5003E' }}>ethical, sustainable "live service"</a></p>
              <p>releasing 2026</p>
            </div>
          </div>
        </section>

        <hr className="mb-12" style={{ borderColor: '#000', borderWidth: '0.5px' }} />

        {/* Additional History */}
        <section className="mb-12">
          <h2 className="font-bold mb-4">additional history</h2>
          <div className="space-y-6 text-gray-800 leading-relaxed">
            
            <div>
              <p className="subheading">UBISOFT</p>
              <p>2011-2016</p>
              <p>assistant art director, lead artist, artist</p>
            </div>

            <div>
              <p className="subheading">POLYCOUNT</p>
              <p>2006-2016</p>
              <p>community & engagement lead<br />10x community growth</p>
            </div>

            <div>
              <p className="subheading">RELIC ENTERTAINMENT</p>
              <p>2009-2011</p>
              <p>artist</p>
            </div>

            <div>
              <p className="subheading">THREEWAVE SOFTWARE</p>
              <p>2005-2009</p>
              <p>artist</p>
            </div>

            <div>
              <p className="subheading">Freelance</p>
              <p>2001-2005</p>
              <p>artist</p>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
