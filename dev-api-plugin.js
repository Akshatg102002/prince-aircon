import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Vite dev-server plugin that runs the Vercel-style serverless functions in the
 * `api/` folder as local middleware.
 *
 * In production these files are executed by Vercel's Node runtime. The Vite dev
 * server does not know about them, so a `fetch('/api/site-data')` during
 * `npm run dev` would otherwise fall through to the SPA/static handler and
 * return HTML or the raw function source (which begins with `import supabase`),
 * making `res.json()` fail with "Unexpected token 'i', "import sup"...".
 *
 * This plugin intercepts `/api/*` requests, dynamically imports the matching
 * `api/<name>.js` file, and invokes its default export with a minimal
 * Vercel-compatible (req, res) shim.
 *
 * @returns {import('vite').Plugin}
 */
export function devApiPlugin() {
  const apiDir = path.resolve(process.cwd(), 'api');

  return {
    name: 'dev-api-plugin',
    apply: 'serve', // dev only; production uses Vercel's runtime
    configureServer(server) {
      // Make the same env values that vercel.json provides in production
      // available to the functions during local dev, without overwriting
      // anything already set (e.g. a real .env or shell export).
      loadVercelEnv();

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        const pathname = req.url.split('?')[0];
        const name = pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
        const filePath = path.join(apiDir, `${name}.js`);

        if (!name || !filePath.startsWith(apiDir) || !existsSync(filePath)) {
          return sendJson(res, 404, { error: `No API route for ${pathname}` });
        }

        try {
          // Cache-bust so edits to api/*.js are picked up without restarting.
          const mod = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`);
          const handler = mod.default;
          if (typeof handler !== 'function') {
            return sendJson(res, 500, { error: `${name} has no default export handler` });
          }

          req.body = await readBody(req);
          await handler(req, decorateResponse(res));
        } catch (err) {
          server.config.logger.error(`[dev-api] ${name}: ${err?.stack || err}`);
          if (!res.writableEnded) {
            sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
          }
        }
      });
    },
  };
}

// Populate process.env from vercel.json's `env` block for local dev, without
// clobbering values already present in the environment.
function loadVercelEnv() {
  try {
    const configPath = path.resolve(process.cwd(), 'vercel.json');
    if (!existsSync(configPath)) return;
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    for (const [key, value] of Object.entries(config.env || {})) {
      if (process.env[key] === undefined) process.env[key] = String(value);
    }
  } catch {
    // Non-fatal: functions will surface their own config errors.
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
    req.on('error', () => resolve(undefined));
  });
}

// Add the Vercel/Express-style helpers the handlers rely on.
function decorateResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
    return res;
  };
  return res;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
