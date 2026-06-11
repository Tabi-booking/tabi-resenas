'use strict';

const { getDatabase } = require('./connection');

function isNotNullConstraintError(error) {
  return error?.code === '23502';
}

async function insertReview(db, row) {
  return db.from('resenas').insert(row).select('id').single();
}

async function createReview({ nombre, correo, meseros }) {
  const db = getDatabase();
  const row = { nombre, correo, meseros };

  let { data, error } = await insertReview(db, row);

  if (isNotNullConstraintError(error)) {
    ({ data, error } = await insertReview(db, {
      ...row,
      calificacion: 5,
      comentario: '',
    }));
  }

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
