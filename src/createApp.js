'use strict';

const express = require('express');
const path = require('path');
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
