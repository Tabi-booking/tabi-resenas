'use strict';

const { getDatabase } = require('./connection');

async function createReview({ nombre, correo, calificacion, comentario, meseros, ocasion }) {
  const db = getDatabase();
  const { data, error } = await db
    .from('resenas')
    .insert({ nombre, correo, calificacion, comentario, meseros, ocasion })
    .select('id')
    .single();

  if (error) throw error;
  return { id: Number(data.id) };
}

function parseReviewRow(row) {
  let ocasion = [];
  if (row.ocasion != null) {
    if (Array.isArray(row.ocasion)) {
      ocasion = row.ocasion;
    } else if (typeof row.ocasion === 'string') {
      try {
        const parsed = JSON.parse(row.ocasion);
        ocasion = Array.isArray(parsed) ? parsed : [];
      } catch {
        ocasion = [];
      }
    }
  }
  return { ...row, ocasion };
}

async function findAllReviews() {
  const db = getDatabase();
  const { data, error } = await db
    .from('resenas')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) throw error;
  return (data || []).map(parseReviewRow);
}

async function deleteReviewById(id) {
  const db = getDatabase();
  const { error } = await db.from('resenas').delete().eq('id', id);

  if (error) throw error;
}

module.exports = { createReview, findAllReviews, deleteReviewById };
