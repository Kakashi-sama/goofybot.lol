const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;
const db = new sqlite3.Database('./chatData.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error('Failed to connect to the SQLite database:', err.message);
    else console.log('Connected to the SQLite database.');
});

let userCount = 0;  // To keep track of the number of connected users

// Initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

wss.on('connection', function connection(ws) {
    const username = `User ${++userCount}`;
    console.log(`${username} connected`);

    ws.send(JSON.stringify({ type: 'message', text: `Welcome to the chat, ${username}!` }));

    ws.on('message', function incoming(data) {
        const msg = JSON.parse(data);
        if (msg.type === 'message') {
            // Save message to DB
            db.run('INSERT INTO messages (username, message) VALUES (?, ?)', [username, msg.text], err => {
                if (err) console.error('Error inserting message into database:', err.message);
            });

            // Broadcast message to all connected clients
            const broadcastData = JSON.stringify({ type: 'message', text: `${username}: ${msg.text}` });
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastData);
                }
            });
        }
    });

    ws.on('close', () => {
        console.log(`${username} has disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing database connection');
    db.close(() => {
        console.log('Database connection closed');
        process.exit(0);
    });
});
// end 