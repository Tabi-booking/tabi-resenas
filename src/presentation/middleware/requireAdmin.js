'use strict';

const { getSession } = require('../../infrastructure/auth/session');

function requireAdmin(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }

  req.adminUser = session.user;
  next();
}

function requireAdminPage(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.redirect('/admin/login');
  }

  req.adminUser = session.user;
  next();
}

function redirectIfAuthenticated(req, res, next) {
  const session = getSession(req);
  if (session) {
    return res.redirect('/admin');
  }

  next();
}

module.exports = {
  requireAdmin,
  requireAdminPage,
  redirectIfAuthenticated,
};
