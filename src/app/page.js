'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [bgColor, setBgColor] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Cloud Dancer background
    setBgColor('#F0EEE4'); // Pantone Cloud Dancer 11-4201 TCX
  }, []);

  useEffect(() => {
    // Handle scroll for parallax effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        {/* Parallax Image */}
        <div 
          style={{ 
            width: 'calc(100% + 96px)',
            height: '256px',
            overflow: 'hidden',
            position: 'relative',
            marginLeft: '-48px',
            marginTop: '-64px',
            marginBottom: '48px',
          }}
        >
          <img 
            src="/photo-1.jpg" 
            alt="Mountain landscape with elk"
            style={{
              width: '100%',
              height: 'auto',
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateY(${scrollY * 0.5}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          />
        </div>
        
        {/* Header */}
        <header className="mb-4">
          <h1 className="font-bold mb-0">HI, I'M ADAM.</h1>
        </header>

        {/* About - moved up, using same formatting */}
        <section className="mb-12">
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p className="font-bold">HERE'S SOME RAPID FIRE TRUTHS ABOUT ME AND THINGS I BELIEVE.</p>
            <p>DROPPED OUT OF COLLEGE IN 2001 AND LEARNED TO MAKE VIDEO GAMES FROM THE INTERNET BEFORE IT WAS THE DEFAULT.</p>
            <p>CO-FOUNDED <a href="https://www.systemera.net/" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold" style={{ color: '#C5003E' }}>SYSTEM ERA</a>. CREATED <strong>ASTRONEER</strong>.</p>
            <p>I BUILD SANDBOXES THAT TURN STRANGERS INTO FRIENDS AND FEEL THE BEST MOMENTS IN GAMES AREN'T DESIGNED. THEY EMERGE WHEN PEOPLE ALIGN AROUND SHARED GOALS WHILE JUST MESSING AROUND.</p>
            <p>PRODUCT DESIGN & PHOTOGRAPHY INSPIRE ME: CONTRAINTS FOSTER CREATIVITY.</p>
            <p>VALUE IS PERCEIVED, NOT INHERENT.</p>
          </div>

          {/* Social links */}
          <div className="flex gap-6 mt-4">
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
