const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;

let userCount = 0;  

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

wss.on('connection', function connection(ws) {
    const username = `User ${++userCount}`;
    console.log(`${username} connected`);

    ws.on('message', function incoming(message) {
        // Broadcast message to all connected clients
        const broadcastData = JSON.stringify({ type: 'message', text: `${username}: ${message}` });
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
            }
        });
        // Echo back the sent message to the sender
        ws.send(broadcastData);
    });

    ws.on('close', () => {
        console.log(`${username} has disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

