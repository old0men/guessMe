const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 8080;
const rooms = {}; // { hostId: { password, players: [] } }

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle WebSocket connections
wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        let data;
        try {
            data = JSON.parse(msg);
        } catch {
            return ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        }

        if (data.type === 'join') {
            const { username, host, password, role } = data;

            if (role === 'host') {
                rooms[username] = { password, players: [username] };
                ws.roomHost = username;
            } else {
                const room = rooms[host];
                if (room && room.password === password) {
                    room.players.push(username);
                    ws.roomHost = host;
                } else {
                    return ws.send(JSON.stringify({ type: 'error', message: 'Invalid host or password' }));
                }
            }

            // Broadcast updated player list
            const room = rooms[ws.roomHost];
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && client.roomHost === ws.roomHost) {
                    client.send(JSON.stringify({
                        type: 'updatePlayers',
                        players: room.players
                    }));
                }
            });
        }
    });
});

// Start the HTTP/WebSocket server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
