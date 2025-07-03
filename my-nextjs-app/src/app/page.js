'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const [formData, setFormData] = useState({
    host: { name: '', password: '' },
    player: { code: '', name: '', password: '' }
  });
  const [loading, setLoading] = useState({ host: false, player: false });
  const [error, setError] = useState('');
  const router = useRouter();
  const WS_URL = 'ws://localhost:8080';

  const validateForm = (role) => {
    if (role === 'host' && !formData.host.name) {
      setError('Bitte Spielnamen eingeben');
      return false;
    }
    if (role === 'player' && (!formData.player.code || !formData.player.name)) {
      setError('Bitte Code und Spielernamen eingeben');
      return false;
    }
    return true;
  };

  const handleGameAction = (role) => {
    if (!validateForm(role)) return;

    setLoading({ ...loading, [role]: true });
    setError('');
    
    const ws = new WebSocket(WS_URL);
    const payload = role === 'host' ? {
      type: 'join',
      username: formData.host.name,
      password: formData.host.password,
      role
    } : {
      type: 'join',
      host: formData.player.code,
      username: formData.player.name,
      password: formData.player.password,
      role
    };

    ws.onopen = () => ws.send(JSON.stringify(payload));
    
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'error') {
        setError(data.message);
        setLoading({ ...loading, [role]: false });
      }
      if (data.type === 'updatePlayers') {
        router.push(`/waiting_room?code=${formData[role].code || formData.host.name}`);
      }
    };

    ws.onerror = () => {
      setError('Verbindungsfehler zum Server');
      setLoading({ ...loading, [role]: false });
    };

    localStorage.setItem('currentPlayer', formData[role].name);
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Guess ME!</h1>
        
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 text-red-300 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2">
          {/* Host Section */}
          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Spiel erstellen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Spielname*</label>
                <input
                  type="text"
                  value={formData.host.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    host: { ...formData.host, name: e.target.value }
                  })}
                  className="w-full p-2 rounded bg-black/20 border border-white/10"
                  placeholder="Mein tolles Spiel"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Passwort (optional)</label>
                <input
                  type="password"
                  value={formData.host.password}
                  onChange={(e) => setFormData({
                    ...formData,
                    host: { ...formData.host, password: e.target.value }
                  })}
                  className="w-full p-2 rounded bg-black/20 border border-white/10"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={() => handleGameAction('host')}
                disabled={loading.host}
                className={`w-full py-2 px-4 rounded transition-colors ${
                  loading.host 
                    ? 'bg-gray-600 cursor-wait' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading.host ? 'Erstelle Spiel...' : 'Spiel erstellen'}
              </button>
            </div>
          </div>

          {/* Player Section */}
          <div className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Spiel beitreten</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Gamecode*</label>
                <input
                  type="text"
                  value={formData.player.code}
                  onChange={(e) => setFormData({
                    ...formData,
                    player: { ...formData.player, code: e.target.value }
                  })}
                  className="w-full p-2 rounded bg-black/20 border border-white/10"
                  placeholder="ABCD-1234"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Dein Name*</label>
                <input
                  type="text"
                  value={formData.player.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    player: { ...formData.player, name: e.target.value }
                  })}
                  className="w-full p-2 rounded bg-black/20 border border-white/10"
                  placeholder="Spielername"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Passwort</label>
                <input
                  type="password"
                  value={formData.player.password}
                  onChange={(e) => setFormData({
                    ...formData,
                    player: { ...formData.player, password: e.target.value }
                  })}
                  className="w-full p-2 rounded bg-black/20 border border-white/10"
                  placeholder="Raumpasswort"
                />
              </div>
              <button
                onClick={() => handleGameAction('player')}
                disabled={loading.player}
                className={`w-full py-2 px-4 rounded transition-colors ${
                  loading.player
                    ? 'bg-gray-600 cursor-wait'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading.player ? 'Beitrete Spiel...' : 'Spiel beitreten'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
