'use strict';

const { getDatabase } = require('./connection');

async function ensureColumn(db, table, column, definition) {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  if (!result.rows.some((c) => c.name === column)) {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function getColumnType(db, table, column) {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  const match = result.rows.find((c) => c.name === column);
  return match ? String(match.type).toUpperCase() : null;
}

async function migrateMeserosColumnToText(db) {
  const type = await getColumnType(db, 'resenas', 'meseros');
  if (!type || type === 'TEXT') return;

  await db.batch(
    [
      'BEGIN',
      `CREATE TABLE resenas_new (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre       TEXT    NOT NULL,
        correo       TEXT    NOT NULL,
        calificacion INTEGER NOT NULL CHECK(calificacion BETWEEN 1 AND 5),
        comentario   TEXT    NOT NULL,
        meseros      TEXT,
        ocasion      TEXT,
        fecha        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'))
      )`,
      `INSERT INTO resenas_new (id, nombre, correo, calificacion, comentario, meseros, ocasion, fecha)
      SELECT
        id,
        nombre,
        correo,
        calificacion,
        comentario,
        CASE WHEN meseros IS NULL THEN NULL ELSE CAST(meseros AS TEXT) END,
        ocasion,
        fecha
      FROM resenas`,
      'DROP TABLE resenas',
      'ALTER TABLE resenas_new RENAME TO resenas',
      'COMMIT',
    ],
    'write'
  );
}

async function runMigrations() {
  const db = getDatabase();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS resenas (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre       TEXT    NOT NULL,
      correo       TEXT    NOT NULL,
      calificacion INTEGER NOT NULL CHECK(calificacion BETWEEN 1 AND 5),
      comentario   TEXT    NOT NULL,
      meseros      TEXT,
      ocasion      TEXT,
      fecha        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'))
    )
  `);

  await ensureColumn(db, 'resenas', 'meseros', 'TEXT');
  await ensureColumn(db, 'resenas', 'ocasion', 'TEXT');
  await migrateMeserosColumnToText(db);
}

module.exports = { runMigrations };
