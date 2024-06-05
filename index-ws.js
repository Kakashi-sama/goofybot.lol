const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
let clientNumber = 0;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

const wss = new WebSocket.Server({ server: server });

wss.on('connection', function connection(ws) {
    const thisClientNumber = ++clientNumber;
    ws.send(`Welcome to the chat! You are User number is ${thisClientNumber}`);

    ws.on('message', function incoming(message) {
        console.log(`Client ${thisClientNumber}: ${message}`);
        // Broadcast the received message to all connected clients
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`User ${thisClientNumber}: ${message}`);
            }
        });
    });

    ws.on('close', () => {
        console.log(`Client ${thisClientNumber} has disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
