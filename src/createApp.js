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

const migrationPromise = runMigrations();

app.use(async (req, res, next) => {
  try {
    await migrationPromise;
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
  res.status(500).json({ ok: false, error: 'Error interno del servidor' });
});

module.exports = app;
