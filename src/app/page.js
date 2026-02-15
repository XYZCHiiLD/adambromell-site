export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        
        {/* Header */}
        <header className="mb-12">
          <h1 className="font-bold mb-4">adam bromell</h1>
          <p className="mb-6">
            Creative Director | CCO & Co-founder, System Era
          </p>
          <div className="flex gap-6">
            <a 
              href="https://www.threads.net/@adambromell" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              threads: @adambromell
            </a>
            <a 
              href="https://bsky.app/profile/adambromell.info" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              bluesky: adambromell.info
            </a>
          </div>
        </header>

        <hr className="border-gray-300 mb-12" />

        {/* About */}
        <section className="mb-12">
          <h2 className="font-bold mb-4">about</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              As CCO and co-founder of <a href="https://www.systemera.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">System Era Softworks</a>, I've led the studio's creative vision from inception through to our 2023 acquisition by Devolver Digital. I first began building games as a 3D artist in 2001, and have spent the last decade as Creative Director for System Era's most ambitious projects.
            </p>
            <p>
              Outside of work, I have a passion for photography and product design.
            </p>
          </div>
        </section>

        <hr className="border-gray-300 mb-12" />

        {/* System Era */}
        <section className="mb-12">
          <h2 className="font-bold mb-4">system era softworks</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>co-founded 2014</p>
            <p><a href="https://www.gamedeveloper.com/business/devolver-digital-to-acquire-astroneer-dev-system-era-for-up-to-40m" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">acquired by Devolver Digital, 2023</a></p>
            
            <div className="mt-6">
              <p className="subheading">Astroneer</p>
              <p>base building survival sandbox</p>
              <p><a href="https://www.gamedeveloper.com/design/what-i-astroneer-i-s-devs-learned-while-leaving-early-access" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ambitious voxel technology</a></p>
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

        <hr className="border-gray-300 mb-12" />

        {/* Additional History */}
        <section className="mb-12">
          <h2 className="font-bold mb-4">additional history</h2>
          <div className="space-y-6 text-gray-800 leading-relaxed">
            
            <div>
              <p className="subheading">Ubisoft</p>
              <p>2011-2016</p>
              <p>assistant art director, lead artist, artist</p>
            </div>

            <div>
              <p className="subheading">Polycount</p>
              <p>2006-2016</p>
              <p>community & team manager<br />~10x community growth</p>
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

        <hr className="border-gray-300 mb-12" />

        {/* Contact */}
        <section>
          <h2 className="font-bold mb-4">contact</h2>
          <a 
            href="https://www.threads.net/@adambromell" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            dm on threads
          </a>
        </section>

      </div>
    </main>
  )
}
