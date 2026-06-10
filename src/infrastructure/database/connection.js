'use strict';

const { createClient } = require('@libsql/client');
const config = require('../../config');

let client;

function getDatabase() {
  if (!client) {
    client = createClient({
      url: config.databaseUrl,
      authToken: config.databaseAuthToken,
    });
  }
  return client;
}

module.exports = { getDatabase };
