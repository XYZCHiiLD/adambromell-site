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
          <h1 className="font-bold mb-0">HI, I'M ADAM.</h1>
        </header>

        {/* About - moved up, using same formatting */}
        <section className="mb-12">
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>HERE'S SOME RAPID FIRE TRUTHS ABOUT ME AND THINGS I BELIEVE.</p>
            <div className="flex gap-2">
              <span>—</span>
              <p className="flex-1">DROPPED OUT OF COLLEGE IN 2001 AND LEARNED TO MAKE VIDEO GAMES FROM THE INTERNET BEFORE IT WAS THE DEFAULT.</p>
            </div>
            <div className="flex gap-2">
              <span>—</span>
              <p className="flex-1">CO-FOUNDED <a href="https://www.systemera.net/" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold" style={{ color: '#C5003E' }}>SYSTEM ERA</a>. CREATED <strong>ASTRONEER</strong>.</p>
            </div>
            <div className="flex gap-2">
              <span>—</span>
              <p className="flex-1">I BUILD SANDBOXES THAT TURN STRANGERS INTO FRIENDS AND FEEL THE BEST MOMENTS IN GAMES AREN'T DESIGNED. THEY EMERGE WHEN PEOPLE ALIGN AROUND SHARED GOALS WHILE JUST MESSING AROUND.</p>
            </div>
            <div className="flex gap-2">
              <span>—</span>
              <p className="flex-1">PRODUCT DESIGN & PHOTOGRAPHY INSPIRE ME: CONTRAINTS FOSTER CREATIVITY.</p>
            </div>
            <div className="flex gap-2">
              <span>—</span>
              <p className="flex-1">VALUE IS PERCEIVED, NOT INHERENT.</p>
            </div>
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
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">co-founded in 2014</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1"><a href="https://www.gamedeveloper.com/business/devolver-digital-to-acquire-astroneer-dev-system-era-for-up-to-40m" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#C5003E' }}>acquired by DEVOLVER DIGITAL in 2023</a></p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="subheading">ASTRONEER</p>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">base building survival sandbox</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1"><a href="https://www.gamedeveloper.com/design/what-i-astroneer-i-s-devs-learned-while-leaving-early-access" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#C5003E' }}>pioneering voxel technology</a></p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">14M+ players across all platforms</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">#1 game on STEAM weeks after early access launch</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="subheading">STARSEEKER: ASTRONEER EXPEDITIONS</p>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">massively co-operative expeditions</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">40+ player space station hub</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1"><a href="https://gamerant.com/starseeker-astroneer-expeditions-live-service-fomo-content/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#C5003E' }}>ethical, sustainable "live service"</a></p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">releasing 2026</p>
              </div>
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
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">2011-2016</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">assistant art director, lead artist, artist</p>
              </div>
            </div>

            <div>
              <p className="subheading">POLYCOUNT</p>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">2006-2016</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <div className="flex-1">
                  <p>community & engagement lead</p>
                  <div className="flex gap-2">
                    <span>—</span>
                    <p className="flex-1">10x community growth</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="subheading">RELIC ENTERTAINMENT</p>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">2009-2011</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">artist</p>
              </div>
            </div>

            <div>
              <p className="subheading">THREEWAVE SOFTWARE</p>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">2005-2009</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">artist</p>
              </div>
            </div>

            <div>
              <p className="subheading">Freelance</p>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">2001-2005</p>
              </div>
              <div className="flex gap-2">
                <span>—</span>
                <p className="flex-1">artist</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
