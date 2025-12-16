const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 8080;

const MIME = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function sendFile(res, filePath) {
    const ext = path.extname(filePath);
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(DIST, reqPath);

    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
            sendFile(res, filePath);
            return;
        }

        // SPA fallback to index.html
        const index = path.join(DIST, 'index.html');
        fs.readFile(index, (readErr, data) => {
            if (readErr) {
                res.writeHead(500);
                res.end('Server error');
                return;
            }
            res.writeHead(200, {
                "Content-Type": "text/html",
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            });;
            res.end(data);
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

