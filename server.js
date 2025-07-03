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
    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
            return;
        }

        if (data.type === 'join') {
            const { username, host, password, role } = data;

            if (role === 'host') {
                // Host creates the room with password and players list
                rooms[username] = {
                    password,
                    players: [username], // Host is the first player
                };
                ws.roomHost = username;
            } else {
                // Client wants to join a host’s room
                const room = rooms[host];
                if (!room) {
                    return ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }));
                }
                if (room.password !== password) {
                    return ws.send(JSON.stringify({ type: 'error', message: 'Incorrect password' }));
                }
                if (!room.players.includes(username)) {
                    room.players.push(username);
                }
                ws.roomHost = host;
            }

            // Send updated player list to everyone in the room
            const room = rooms[ws.roomHost];
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client.roomHost === ws.roomHost) {
                    client.send(
                        JSON.stringify({
                            type: 'updatePlayers',
                            players: room.players,
                        })
                    );
                }
            });
        }
    });

    ws.on('close', () => {
        // Optional: remove player from rooms on disconnect
        if (!ws.roomHost) return;
        const room = rooms[ws.roomHost];
        if (!room) return;

        // Remove player by ws.username if you track it, or skip if not stored.
        // You can implement cleanup if you store username on ws.
    });
});


// Start the HTTP/WebSocket server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
