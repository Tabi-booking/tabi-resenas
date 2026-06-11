'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../../config');
const reviewService = require('../../application/reviewService');

const templatesDir = path.join(__dirname, '../templates');

function loadTemplate(name, vars = {}) {
  let html = fs.readFileSync(path.join(templatesDir, name), 'utf8');
  Object.entries(vars).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return html;
}

async function createReview(req, res) {
  try {
    const result = await reviewService.createReview(req.body);

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('createReview controller error:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}

async function listReviews(_req, res) {
  const reviews = await reviewService.listReviews();
  res.json(reviews);
}

async function deleteReview(req, res) {
  const result = await reviewService.deleteReview(req.params.id);

  if (!result.ok) {
    return res.status(400).json(result);
  }

  res.json(result);
}

function renderForm(_req, res) {
  res.send(
    loadTemplate('form.html', {
      googleReviewUrl: config.googleReviewUrl,
      googleReviewUrlJson: JSON.stringify(config.googleReviewUrl),
      venue: config.brand.venue,
      tagline: config.brand.tagline,
      landingContactUrl: config.brand.landingContactUrl,
    })
  );
}

function renderAdmin(_req, res) {
  res.send(
    loadTemplate('admin.html', {
      landingContactUrl: config.brand.landingContactUrl,
    })
  );
}

module.exports = {
  createReview,
  listReviews,
  deleteReview,
  renderForm,
  renderAdmin,
};
