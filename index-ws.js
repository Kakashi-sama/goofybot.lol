const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const dbFile = 'userDatabase.db';
const db = new sqlite3.Database(dbFile);

// Initialize the database
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, connected_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        let msg = JSON.parse(message);
        if (msg.type === 'register') {
            db.run("INSERT INTO users (username) VALUES (?)", msg.username, function (err) {
                if (err) {
                    return console.log(err.message);
                }
                // Send a welcome message to the user
                ws.send(JSON.stringify({type: 'welcome', text: `Welcome to the chat, ${msg.username}!`}));
                // Broadcast new user connection
                wss.clients.forEach(function each(client) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({type: 'info', text: `${msg.username} has joined the chat!`}));
                    }
                });
            });
        } else if (msg.type === 'message') {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({type: 'message', text: `${msg.username}: ${msg.text}`}));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client has disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
