export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        
        {/* Header */}
        <header className="mb-12">
          <h1 className="font-bold mb-4">adam bromell</h1>
          <div className="flex gap-6">
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
              email: <a 
                href="mailto:adambromell@proton.me"
                className="text-blue-600 hover:underline"
              >
                adambromell@proton.me
              </a>
            </p>
          </div>
        </header>

        <hr className="border-gray-300 mb-12" />

        {/* About */}
        <section className="mb-12">
          <h2 className="font-bold mb-4">about</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>Creative Director.</p>
            <p>Co-founder & CCO of <a href="https://www.systemera.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">System Era Softworks</a>.</p>
            <p>
              In 2001, I dropped out of college to make games. I spent a decade as an artist in AAA before leaving that space in 2014 to build my own studio, System Era Softworks. I have since then spent my time leading the vision for our projects and navigating our 2023 acquisition by Devolver Digital. Today, I'm the Chief Creative Officer for the company and Creative Director for the studios most ambitious games yet.
            </p>
            <p>
              Outside of my professional work, I indulge in a passion for photography and product design.
            </p>
          </div>
        </section>

        <hr className="border-gray-300 mb-12" />

        {/* System Era */}
        <section className="mb-12">
          <h2 className="font-bold mb-4">system era softworks</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <div>
              <p className="subheading">Company</p>
              <p>co-founded 2014</p>
              <p><a href="https://www.gamedeveloper.com/business/devolver-digital-to-acquire-astroneer-dev-system-era-for-up-to-40m" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">acquired by Devolver Digital, 2023</a></p>
            </div>
            
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

      </div>
    </main>
  )
}
