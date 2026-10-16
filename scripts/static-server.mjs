// 本地静态预览服务器（仅用于开发验证）
// 用法: node scripts/static-server.mjs [port] [dir]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.argv[2] ?? process.env.PORT ?? 4400);
const root = resolve(process.argv[3] ?? 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    const filePath = join(root, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
    let body;
    let target = filePath;

    try {
      const info = await stat(target);
      if (info.isDirectory()) target = join(target, 'index.html');
      body = await readFile(target);
    } catch {
      // 扩展名回退：/docs/quickstart → /docs/quickstart/index.html
      target = join(filePath, 'index.html');
      body = await readFile(target);
    }

    res.writeHead(200, {
      'Content-Type': MIME[extname(target).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`static server → http://127.0.0.1:${port}/ (root: ${root})`);
});
