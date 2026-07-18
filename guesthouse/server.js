const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'feedback.json');

// Ensure data store exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf8');

function readFeedback() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveFeedback(list) {
  fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf8');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function serveStatic(req, res, urlPath) {
  let rel = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.join(PUBLIC_DIR, path.normalize(rel));
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1e6) { reject(new Error('Payload too large')); req.destroy(); return; }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // POST /api/feedback  -> submit feedback (public)
  if (pathname === '/api/feedback' && req.method === 'POST') {
    try {
      const raw = await getBody(req);
      const data = JSON.parse(raw);
      const name = String(data.name || '').trim().slice(0, 100);
      const email = String(data.email || '').trim().slice(0, 150);
      const message = String(data.message || '').trim().slice(0, 2000);
      const rating = Number(data.rating) || 0;
      if (!name || !message) return sendJSON(res, 400, { error: 'Name and message are required.' });
      const entry = {
        id: crypto.randomUUID(),
        name,
        email: email || null,
        rating: Math.min(5, Math.max(0, rating)),
        message,
        createdAt: new Date().toISOString()
      };
      const list = readFeedback();
      list.push(entry);
      saveFeedback(list);
      return sendJSON(res, 201, { success: true, id: entry.id });
    } catch (e) {
      return sendJSON(res, 400, { error: 'Invalid request.' });
    }
  }

  // GET /api/feedback  -> list feedback (requires ?key=ADMIN_KEY)
  if (pathname === '/api/feedback' && req.method === 'GET') {
    if (url.searchParams.get('key') !== ADMIN_KEY) return sendJSON(res, 401, { error: 'Unauthorized' });
    return sendJSON(res, 200, { feedback: readFeedback() });
  }

  // DELETE /api/feedback/:id  -> delete one (requires ?key=)
  if (pathname.startsWith('/api/feedback/') && req.method === 'DELETE') {
    if (url.searchParams.get('key') !== ADMIN_KEY) return sendJSON(res, 401, { error: 'Unauthorized' });
    const id = pathname.split('/').pop();
    const list = readFeedback().filter(f => f.id !== id);
    saveFeedback(list);
    return sendJSON(res, 200, { success: true });
  }

  if (pathname.startsWith('/api/')) return sendJSON(res, 404, { error: 'Not found' });

  // Static files
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Guesthouse site running at http://localhost:${PORT}`);
  console.log(`Admin feedback view: http://localhost:${PORT}/admin.html?key=${ADMIN_KEY}`);
});
