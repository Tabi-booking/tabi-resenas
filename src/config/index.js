'use strict';

const path = require('path');

const DEFAULT_GOOGLE_REVIEW_URL =
  'https://www.google.com/search?q=rooftop+la+rock#lrd=0x8e4429004e2f33f3:0xab95840a8dc78b93,1,,,,';

const isProduction = process.env.NODE_ENV === 'production';
const MIN_SESSION_SECRET_LENGTH = 32;

function readEnv(name) {
  return process.env[name]?.trim() || '';
}

function buildGoogleReviewUrl() {
  const placeId = readEnv('GOOGLE_PLACE_ID');
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }

  return readEnv('GOOGLE_REVIEW_URL') || DEFAULT_GOOGLE_REVIEW_URL;
}

function resolveDatabaseUrl() {
  const tursoUrl = readEnv('TURSO_DATABASE_URL');
  const databaseUrl = readEnv('DATABASE_URL');
  const localFile = `file:${path.join(__dirname, '../../resenas.db')}`;

  if (isProduction) {
    return tursoUrl || databaseUrl || '';
  }

  return tursoUrl || databaseUrl || localFile;
}

function isRemoteDatabaseUrl(url) {
  return (
    url.startsWith('libsql://') ||
    url.startsWith('https://') ||
    url.startsWith('http://')
  );
}

function getConfigErrors() {
  if (!isProduction) {
    return [];
  }

  const errors = [];
  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    errors.push('TURSO_DATABASE_URL');
  } else if (isRemoteDatabaseUrl(databaseUrl) && !readEnv('TURSO_AUTH_TOKEN')) {
    errors.push('TURSO_AUTH_TOKEN');
  }

  if (!readEnv('ADMIN_USER')) {
    errors.push('ADMIN_USER');
  }

  if (!readEnv('ADMIN_PASSWORD')) {
    errors.push('ADMIN_PASSWORD');
  }

  const sessionSecret = readEnv('SESSION_SECRET');
  if (!sessionSecret) {
    errors.push('SESSION_SECRET');
  } else if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    errors.push(`SESSION_SECRET (minimum ${MIN_SESSION_SECRET_LENGTH} characters)`);
  }

  return errors;
}

const databaseUrl = resolveDatabaseUrl();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  googlePlaceId: readEnv('GOOGLE_PLACE_ID'),
  googleReviewUrl: buildGoogleReviewUrl(),
  databaseUrl,
  databaseAuthToken: readEnv('TURSO_AUTH_TOKEN') || undefined,
  adminUser: readEnv('ADMIN_USER') || 'adminlarock',
  adminPassword: readEnv('ADMIN_PASSWORD') || 'LaRock2026.',
  sessionSecret: readEnv('SESSION_SECRET') || 'tabi-admin-dev-secret-change-me',
  brand: {
    name: 'Tabi',
    tagline: 'Tu próxima mesa, a solo un clic.',
    identity: 'Reservar nunca fue tan delicioso.',
    venue: 'La Rock',
    landingContactUrl: 'https://www.tabiapp.tech/',
  },
  isConfigured: () => getConfigErrors().length === 0,
  getConfigErrors,
};
