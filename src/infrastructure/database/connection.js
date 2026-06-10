'use strict';

const { createClient } = require('@libsql/client');
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
    client = createClient({
      url: config.databaseUrl,
      authToken: config.databaseAuthToken,
    });
  }
  return client;
}

module.exports = { getDatabase };
