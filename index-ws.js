const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database('./userData.db'); // Persistent DB

// Setup the database
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS visitors (id INTEGER PRIMARY KEY, count INTEGER, time TEXT DEFAULT (datetime('now','localtime')))");
});

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    const numClients = wss.clients.size;
    console.log('Clients connected', numClients);
    broadcast(`Current visitors: ${numClients}`);

    ws.send('Welcome to the server');

    db.run("INSERT INTO visitors (count) VALUES (?)", numClients);

    ws.on('message', function incoming(message) {
        broadcast(message);
    });

    ws.on('close', () => {
        console.log('A client has disconnected');
    });
});

function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received.');
    wss.clients.forEach(client => client.close());
    server.close(() => {
        shutdownDB();
    });
});

function shutdownDB() {
    console.log('Shutting down the database.');
    db.each("SELECT count, time FROM visitors", (err, row) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Visitor count: ${row.count} at ${row.time}`);
        }
    }, () => {
        db.close(() => {
            console.log('Database connection successfully closed.');
        });
    });
}
