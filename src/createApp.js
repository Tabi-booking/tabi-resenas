'use strict';

const express = require('express');
const path = require('path');
const config = require('./config');
const { runMigrations } = require('./infrastructure/database/migrations');
const reviewRoutes = require('./presentation/routes/reviewRoutes');
const pageRoutes = require('./presentation/routes/pageRoutes');
const authRoutes = require('./presentation/routes/authRoutes');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

function renderConfigError(req, res, missingVars) {
  const detail = `Missing or invalid environment variables: ${missingVars.join(', ')}.`;
  const hint =
    'Configure them in Vercel → Settings → Environment Variables. See DEPLOY.md for details.';

  if (req.path.startsWith('/api')) {
    return res.status(503).json({
      ok: false,
      error: 'Service temporarily unavailable',
      detail,
      missing: missingVars,
    });
  }

  return res.status(503).type('html').send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tabi Reviews — Configuración pendiente</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1rem; color: #1a1a1a; }
    h1 { font-size: 1.25rem; }
    code { background: #f4f4f4; padding: 0.1rem 0.35rem; border-radius: 0.25rem; }
    ul { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Configuración pendiente</h1>
  <p>La aplicación no puede iniciarse porque faltan variables de entorno obligatorias:</p>
  <ul>${missingVars.map((name) => `<li><code>${name}</code></li>`).join('')}</ul>
  <p>${hint}</p>
</body>
</html>`);
}

app.use((req, res, next) => {
  const missingVars = config.getConfigErrors();
  if (missingVars.length > 0) {
    return renderConfigError(req, res, missingVars);
  }
  next();
});

let migrationPromise;

function ensureMigrations() {
  if (!migrationPromise) {
    migrationPromise = runMigrations();
  }
  return migrationPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureMigrations();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/resenas', reviewRoutes);
app.use('/', pageRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;

  if (_req.path.startsWith('/api')) {
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }

  res.status(500).type('html').send('<!DOCTYPE html><html lang="es"><body><h1>Error interno del servidor</h1></body></html>');
});

module.exports = app;
