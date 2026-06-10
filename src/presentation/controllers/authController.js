'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../../config');
const {
  validateCredentials,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} = require('../../infrastructure/auth/session');

const templatesDir = path.join(__dirname, '../templates');

function loadTemplate(name, vars = {}) {
  let html = fs.readFileSync(path.join(templatesDir, name), 'utf8');
  Object.entries(vars).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return html;
}

function renderLogin(_req, res) {
  res.send(
    loadTemplate('login.html', {
      landingContactUrl: config.brand.landingContactUrl,
    })
  );
}

function login(req, res) {
  const username = String(req.body?.username ?? '').trim();
  const password = String(req.body?.password ?? '').trim();

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'Usuario y contraseña son obligatorios' });
  }

  if (!validateCredentials(username, password)) {
    return res.status(401).json({
      ok: false,
      error: 'Usuario o contraseña incorrectos. Revisa ambos campos e inténtalo de nuevo.',
    });
  }

  const token = createSessionToken(username);
  setSessionCookie(res, token);

  return res.json({ ok: true });
}

function logout(_req, res) {
  clearSessionCookie(res);
  return res.json({ ok: true });
}

module.exports = {
  renderLogin,
  login,
  logout,
};
