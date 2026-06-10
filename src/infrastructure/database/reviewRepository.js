'use strict';

const { getDatabase } = require('./connection');

async function createReview({ nombre, correo, calificacion, comentario, meseros, ocasion }) {
  const db = getDatabase();
  const result = await db.execute({
    sql: `
      INSERT INTO resenas (nombre, correo, calificacion, comentario, meseros, ocasion)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [nombre, correo, calificacion, comentario, meseros, JSON.stringify(ocasion)],
  });
  return { id: Number(result.lastInsertRowid) };
}

function parseReviewRow(row) {
  let ocasion = [];
  if (row.ocasion) {
    try {
      const parsed = JSON.parse(row.ocasion);
      ocasion = Array.isArray(parsed) ? parsed : [];
    } catch {
      ocasion = [];
    }
  }
  return { ...row, ocasion };
}

async function findAllReviews() {
  const db = getDatabase();
  const result = await db.execute('SELECT * FROM resenas ORDER BY fecha DESC');
  return result.rows.map(parseReviewRow);
}

async function deleteReviewById(id) {
  const db = getDatabase();
  await db.execute({
    sql: 'DELETE FROM resenas WHERE id = ?',
    args: [id],
  });
}

module.exports = { createReview, findAllReviews, deleteReviewById };
