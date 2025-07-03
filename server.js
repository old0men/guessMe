const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 8080;
const VALID_HOST = 'localhost';
const VALID_PASSWORD = 'secret123';

app.use(express.static(path.join(__dirname, 'public'))); // Serves index.html and game.html

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket authentication
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'auth') {
                const { host, password } = data;
                if (host === VALID_HOST && password === VALID_PASSWORD) {
                    ws.send(JSON.stringify({ type: 'auth', success: true }));
                } else {
                    ws.send(JSON.stringify({ type: 'auth', success: false, message: 'Invalid credentials.' }));
                }
            }
        } catch {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format.' }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
