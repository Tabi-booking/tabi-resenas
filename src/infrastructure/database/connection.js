'use strict';

const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

let client;

function getDatabase() {
  const configErrors = config.getConfigErrors();
  if (configErrors.length > 0) {
    throw new Error(
      `Database unavailable: missing ${configErrors.join(', ')}`
    );
  }

  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

module.exports = { getDatabase };
