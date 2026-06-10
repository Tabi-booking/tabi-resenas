'use strict';

const { getDatabase } = require('./connection');

const TABLE_MISSING_HINT =
  'Table "resenas" not found. Create it in the Supabase SQL Editor (see DEPLOY.md or supabase/schema.sql).';

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const message = String(error.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('could not find the table')
  );
}

async function runMigrations() {
  const db = getDatabase();
  const { error } = await db.from('resenas').select('id').limit(1);

  if (error && isMissingTableError(error)) {
    throw new Error(TABLE_MISSING_HINT);
  }

  if (error) {
    throw error;
  }
}

module.exports = { runMigrations };
