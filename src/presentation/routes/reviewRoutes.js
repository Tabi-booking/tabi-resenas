'use strict';

const express = require('express');
const reviewController = require('../controllers/reviewController');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

router.post('/', reviewController.createReview);
router.get('/', requireAdmin, reviewController.listReviews);
router.delete('/:id', requireAdmin, reviewController.deleteReview);

module.exports = router;
