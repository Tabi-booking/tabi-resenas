'use strict';

const reviewRepository = require('../infrastructure/database/reviewRepository');
const { validateReviewInput, normalizeReviewInput } = require('../domain/reviewValidator');

async function createReview(payload) {
  const errors = validateReviewInput(payload);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const data = normalizeReviewInput(payload);
  const { id } = await reviewRepository.createReview(data);
  return { ok: true, id };
}

async function listReviews() {
  return reviewRepository.findAllReviews();
}

async function deleteReview(id) {
  if (!Number.isInteger(Number(id))) {
    return { ok: false, error: 'ID inválido.' };
  }

  await reviewRepository.deleteReviewById(Number(id));
  return { ok: true };
}

module.exports = { createReview, listReviews, deleteReview };
