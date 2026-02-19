// Simple sync server for OpenClaw Dashboard
// Stores data in a JSON file, serves it over HTTP
// Both laptop and monitor browsers connect to this
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'sync-data.json');
const PORT = 3456;

// Initialize data file if missing
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '{}');
}

const server = http.createServer((req, res) => {
    // CORS headers — allow any browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/data') {
        // Return current data
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{}');
        }
        return;
    }

    if (req.method === 'POST' && req.url === '/data') {
        // Save data
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                JSON.parse(body); // validate
                fs.writeFileSync(DATA_FILE, body);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('{"ok":true}');
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end('{"error":"Invalid JSON"}');
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Dashboard sync server running on http://0.0.0.0:${PORT}`);
});
