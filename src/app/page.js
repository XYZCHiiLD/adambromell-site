export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">adam bromell</h1>
          <p className="text-lg text-gray-700 mb-6">
            Creative Director | CCO & Co-founder, System Era (acquired by Devolver Digital)
          </p>
          <div className="flex gap-6 text-base">
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
          <h2 className="text-2xl font-bold mb-4">about</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>
              I'm Adam Bromell — Creative Director and co-founder of System Era Softworks.
            </p>
            <p>
              3D artist turned creative director. Building games since 2004, directing System Era since 2014.
            </p>
            <p>
              Led creative vision from concept to launch to acquisition by Devolver Digital in 2023.
            </p>
            <p>
              Currently directing Starseeker: Astroneer Expeditions and serving as CCO. Outside of work: photography and design.
            </p>
          </div>
        </section>

        <hr className="border-gray-300 mb-12" />

        {/* System Era */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">system era softworks</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p className="font-medium">Astroneer // sandbox adventure game</p>
            <p>Co-founded 2014<br />Acquired by Devolver Digital, 2023</p>
            <p>
              15M+ players across all platforms since 2016<br />
              #1 game on Steam at early access launch
            </p>
          </div>
        </section>

        <hr className="border-gray-300 mb-12" />

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold mb-4">contact</h2>
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
