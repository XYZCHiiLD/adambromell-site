'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [colors, setColors] = useState([]);

  useEffect(() => {
    // Color palette
    const palette = [
      '#1F3B73', // Deep Blue
      '#C5003E', // Ribbon Red
      '#B5CE00', // Piquant Green
      '#E8D7B0', // Flax
      '#D89B6A', // Sandstorm
      '#94C5CC', // Allure
    ];
    
    // Shuffle and pick first 4 colors
    const shuffled = [...palette].sort(() => Math.random() - 0.5);
    setColors(shuffled.slice(0, 4));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        
        {/* Header */}
        <header className="mb-4">
          <h1 className="font-bold mb-0 pt-12 pb-1 pl-4" style={{ backgroundColor: colors[0] || 'transparent' }}>adam bromell</h1>
        </header>

        {/* Tagline */}
        <section className="mb-12">
          <p className="text-gray-800 leading-relaxed mb-4">Wondering how a sandbox can turn strangers into best friends, studying G-Shock constraints, and pursuing light through a lens.</p>
          <div className="flex gap-6">
            <p>
              bluesky: <a 
                href="https://bsky.app/profile/adambromell.info" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                adambromell.info
              </a>
            </p>
            <p>
              threads: <a 
                href="https://www.threads.net/@adambromell" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @adambromell
              </a>
            </p>
            <p>
              instagram (photography): <a 
                href="https://www.instagram.com/yeti.snaps/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @yeti.snaps
              </a>
            </p>
          </div>
        </section>

        <hr className="rule-section mb-12" />

        {/* About */}
        <section className="mb-12">
          <h2 className="font-bold mb-4 pt-8 pb-1 pl-4" style={{ backgroundColor: colors[1] || 'transparent' }}>about</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>Hey, I'm Adam.</p>
            <p>In 2001, I dropped out of college to make games as a 3D artist. After a decade in AAA, I left in 2014 to co-found <a href="https://www.systemera.net/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">System Era</a> as the creator of Astroneer. We were acquired by Devolver Digital in 2023.</p>
            <p>Today, I serve as CCO of System Era and Creative Director for the studio's most ambitious game yet.</p>
            <p>Outside of my professional work, I'm curious about product design and photography.</p>
          </div>
        </section>

        <hr className="rule-section mb-12" />

        {/* System Era */}
        <section className="mb-12">
          <h2 className="font-bold mb-4 pt-8 pb-1 pl-4" style={{ backgroundColor: colors[2] || 'transparent' }}>system era</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <div>
              <p className="subheading">Company</p>
              <p>co-founded in 2014</p>
              <p><a href="https://www.gamedeveloper.com/business/devolver-digital-to-acquire-astroneer-dev-system-era-for-up-to-40m" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">acquired by Devolver Digital in 2023</a></p>
            </div>
            
            <div className="mt-6">
              <p className="subheading">Astroneer</p>
              <p>base building survival sandbox</p>
              <p><a href="https://www.gamedeveloper.com/design/what-i-astroneer-i-s-devs-learned-while-leaving-early-access" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">pioneering voxel technology</a></p>
              <p>14M+ players across all platforms</p>
              <p>#1 game on Steam weeks after early access launch</p>
            </div>

            <div className="mt-6">
              <p className="subheading">Starseeker: Astroneer Expeditions</p>
              <p>massively co-operative expeditions</p>
              <p>40+ player space station hub</p>
              <p><a href="https://gamerant.com/starseeker-astroneer-expeditions-live-service-fomo-content/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ethical, sustainable "live service"</a></p>
              <p>releasing 2026</p>
            </div>
          </div>
        </section>

        <hr className="rule-section mb-12" />

        {/* Additional History */}
        <section className="mb-12">
          <h2 className="font-bold mb-4 pt-8 pb-1 pl-4" style={{ backgroundColor: colors[3] || 'transparent' }}>additional history</h2>
          <div className="space-y-6 text-gray-800 leading-relaxed">
            
            <div>
              <p className="subheading">Ubisoft</p>
              <p>2011-2016</p>
              <p>assistant art director, lead artist, artist</p>
            </div>

            <div>
              <p className="subheading">Polycount</p>
              <p>2006-2016</p>
              <p>community & engagement lead<br />10x community growth</p>
            </div>

            <div>
              <p className="subheading">Relic Entertainment</p>
              <p>2009-2011</p>
              <p>artist</p>
            </div>

            <div>
              <p className="subheading">Threewave Software</p>
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
