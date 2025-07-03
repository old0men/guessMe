'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function WaitingRoom() {
  const [players, setPlayers] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [currentUser, setCurrentUser] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameCode = searchParams.get('code');
  const API_URL = 'http://localhost:8080/api';
  const WS_URL = 'ws://localhost:8080';

  // Spielername aus LocalStorage oder Session
  useEffect(() => {
    const storedUser = localStorage.getItem('currentPlayer') || 'Gast';
    setCurrentUser(storedUser);
  }, []);

  // API-Abfrage für Rauminfos
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await fetch(`${API_URL}/rooms/${gameCode}`);
        if (!res.ok) throw new Error('Raum nicht gefunden');
        const data = await res.json();
        setRoomInfo(data);
        setPlayers(data.players);
      } catch (error) {
        console.error('API Fehler:', error);
        router.push('/?error=room_not_found');
      }
    };

    if (gameCode) fetchRoomData();
  }, [gameCode]);

  // WebSocket für Echtzeit-Updates
  useEffect(() => {
    let ws;
    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnectionStatus('Connected');
        ws.send(JSON.stringify({
          type: 'subscribe',
          room: gameCode
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'updatePlayers') {
          setPlayers(data.players);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('Disconnected - Retrying...');
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setConnectionStatus('Connection Error');
      };
    };

    connect();

    return () => {
      ws?.close();
    };
  }, [gameCode]);

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
  };

  const leaveGame = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-2xl mx-auto">
        <div className="p-6 bg-white/5 rounded-xl border-2 border-white/20 shadow-xl">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Waiting Room</h1>
              <div className="badge badge-accent">{players.length} Spieler</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm opacity-75 mb-1">Game Code</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-mono bg-black/20 px-4 py-2 rounded">
                  {gameCode}
                </div>
                <button 
                  onClick={copyGameCode}
                  className="btn btn-sm btn-ghost"
                  title="Kopieren"
                >
                  ⎘
                </button>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`text-sm mb-6 ${
            connectionStatus.includes('Connected') ? 'text-green-400' : 'text-yellow-400'
          }`}>
            Status: {connectionStatus}
          </div>

          {/* Player List */}
          <div className="space-y-3 mb-8">
            {players.map((player, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  player === currentUser
                    ? 'bg-accent/20 border-accent'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                      {player[0].toUpperCase()}
                    </div>
                  </div>
                  <span className="text-lg">
                    {player}
                    {player === currentUser && (
                      <span className="ml-2 text-sm text-accent">(Du)</span>
                    )}
                  </span>
                </div>
                <div className="badge badge-outline">Ready</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={leaveGame}
              className="btn btn-outline btn-error flex-1"
            >
              Spiel verlassen
            </button>
            <button
              className="btn btn-primary flex-1"
              disabled={players.length < 2}
            >
              Spiel starten {players.length < 2 && '(min. 2 Spieler)'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
