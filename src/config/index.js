'use strict';

const path = require('path');

const DEFAULT_GOOGLE_REVIEW_URL =
  'https://www.google.com/search?q=rooftop+la+rock#lrd=0x8e4429004e2f33f3:0xab95840a8dc78b93,1,,,,';

const isProduction = process.env.NODE_ENV === 'production';

function requireInProduction(name, value) {
  if (isProduction && !value) {
    throw new Error(`Environment variable ${name} is required in production`);
  }
  return value;
}

function envOrDev(name, devDefault) {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (isProduction) {
    throw new Error(`Environment variable ${name} is required in production`);
  }
  return devDefault;
}

function buildGoogleReviewUrl() {
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }

  return process.env.GOOGLE_REVIEW_URL?.trim() || DEFAULT_GOOGLE_REVIEW_URL;
}

function getDatabaseUrl() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const localFile = `file:${path.join(__dirname, '../../resenas.db')}`;

  if (isProduction) {
    return requireInProduction('TURSO_DATABASE_URL', tursoUrl || databaseUrl);
  }

  return tursoUrl || databaseUrl || localFile;
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  googlePlaceId: process.env.GOOGLE_PLACE_ID?.trim() || '',
  googleReviewUrl: buildGoogleReviewUrl(),
  databaseUrl: getDatabaseUrl(),
  databaseAuthToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
  adminUser: envOrDev('ADMIN_USER', 'adminlarock'),
  adminPassword: envOrDev('ADMIN_PASSWORD', 'LaRock2026.'),
  sessionSecret: envOrDev('SESSION_SECRET', 'tabi-admin-dev-secret-change-me'),
  brand: {
    name: 'Tabi',
    tagline: 'Tu próxima mesa, a solo un clic.',
    identity: 'Reservar nunca fue tan delicioso.',
    venue: 'La Rock',
    landingContactUrl: 'https://www.tabiapp.tech/',
  },
};
