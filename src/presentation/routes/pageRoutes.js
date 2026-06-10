'use strict';

const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const {
  requireAdminPage,
  redirectIfAuthenticated,
} = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/', reviewController.renderForm);
router.get('/admin/login', redirectIfAuthenticated, authController.renderLogin);
router.get('/admin', requireAdminPage, reviewController.renderAdmin);

module.exports = router;
