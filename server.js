import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const RESEND_API_KEY = 're_C98VUNKR_2kn8KR1Zhk95dTn6XEg2EiLK';

const server = http.createServer(async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 1. Handle API Request
    if (req.url === '/api/send-email') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    console.log('--- New Contact Form Submission ---');
                    const { name, email, message } = JSON.parse(body);
                    console.log(`From: ${name} (${email})`);

                    const response = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${RESEND_API_KEY}`
                        },
                        body: JSON.stringify({
                            from: 'AI Academy <onboarding@resend.dev>',
                            to: ['sabrinka.k@gmail.com'],
                            subject: `פנייה חדשה מ-${name}`,
                            html: `<div dir="rtl"><h2>פנייה חדשה מאתר אקדמיית AI</h2><p><strong>שם:</strong> ${name}</p><p><strong>מייל:</strong> ${email}</p><p><strong>הודעה:</strong> ${message}</p></div>`
                        })
                    });

                    const data = await response.json();
                    res.writeHead(response.status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                    console.log('Resend Response:', data);
                } catch (error) {
                    console.error('Error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            });
            return;
        }
        return;
    }

    // 2. Serve Static index.html
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // 3. Fallback
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n🚀 האתר שלך רץ בכתובת: http://localhost:${PORT}`);
    console.log(`📧 ה-API של Resend פעיל ומוכן לשליחה ל-sabrinka.k@gmail.com\n`);
    console.log('אל תסגור את החלון הזה כדי שהאתר ימשיך לעבוד.');
});
