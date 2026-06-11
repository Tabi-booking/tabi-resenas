'use strict';

const { getDatabase } = require('./connection');

async function createReview({ nombre, correo, meseros }) {
  const db = getDatabase();
  const { data, error } = await db
    .from('resenas')
    .insert({ nombre, correo, meseros })
    .select('id')
    .single();

  if (error) throw error;
  return { id: Number(data.id) };
}

async function findAllReviews() {
  const db = getDatabase();
  const { data, error } = await db
    .from('resenas')
    .select('id, nombre, correo, meseros, fecha')
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function deleteReviewById(id) {
  const db = getDatabase();
  const { error } = await db.from('resenas').delete().eq('id', id);

  if (error) throw error;
}

module.exports = { createReview, findAllReviews, deleteReviewById };
