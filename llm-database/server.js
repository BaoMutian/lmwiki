const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'llm_database.jsonl');
const ENV_FILE = path.join(__dirname, '.env');

// 加载 .env 文件
function loadEnv() {
    if (fs.existsSync(ENV_FILE)) {
        const content = fs.readFileSync(ENV_FILE, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                process.env[match[1].trim()] = match[2].trim();
            }
        });
    }
}
loadEnv();

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.jsonl': 'application/jsonl'
};

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '');
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API routes
    if (req.url === '/api/models' && req.method === 'GET') {
        // Get all models
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const models = data.split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(models));
        return;
    }

    if (req.url === '/api/models' && req.method === 'POST') {
        // Save all models (replace entire file)
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const models = JSON.parse(body);
                const jsonl = models.map(m => JSON.stringify(m)).join('\n');
                fs.writeFileSync(DATA_FILE, jsonl);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, count: models.length }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (req.url === '/api/export' && req.method === 'GET') {
        // Export as JSONL file
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        res.writeHead(200, {
            'Content-Type': 'application/jsonl',
            'Content-Disposition': `attachment; filename="llm_database_${new Date().toISOString().slice(0, 10)}.jsonl"`
        });
        res.end(data);
        return;
    }

    // 翻译 API
    if (req.url === '/api/translate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { text, model } = JSON.parse(body);
                const apiKey = process.env.OPENROUTER_API_KEY;
                
                if (!apiKey) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '未配置 OPENROUTER_API_KEY' }));
                    return;
                }

                const requestData = JSON.stringify({
                    model: model || 'google/gemini-2.0-flash-001',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的翻译助手。请将用户提供的英文文本翻译成简体中文。只输出翻译结果，不要添加任何解释或额外内容。'
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ]
                });

                const options = {
                    hostname: 'openrouter.ai',
                    path: '/api/v1/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'LLM Database'
                    }
                };

                const apiReq = https.request(options, (apiRes) => {
                    let data = '';
                    apiRes.on('data', chunk => data += chunk);
                    apiRes.on('end', () => {
                        try {
                            const result = JSON.parse(data);
                            if (result.error) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: result.error.message || '翻译失败' }));
                            } else {
                                const translation = result.choices?.[0]?.message?.content || '';
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ translation }));
                            }
                        } catch (e) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: '解析响应失败' }));
                        }
                    });
                });

                apiReq.on('error', (e) => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                });

                apiReq.write(requestData);
                apiReq.end();
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Static file serving
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 LLM Database Server running at http://localhost:${PORT}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
});
