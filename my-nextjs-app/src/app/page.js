import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Guess ME!</h1>
        
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Admin Section */}
          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Erstellen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Name</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-black/20 border border-white/10"
                  placeholder="Spielname eingeben"
                />
              </div>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                Spiel erstellen
              </button>
            </div>
          </div>

          {/* Player Section */}
          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Beitreten</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Gamecode</label>
                <input
                  type="text"
                  className="w-full p-2 rounded bg-black/20 border border-white/10"
                  placeholder="Code eingeben"
                />
              </div>
              <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded transition-colors">
                Spiel beitreten
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
