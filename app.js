'use strict';

require('express');

const config = require('./src/config');
const app = require('./src/createApp');

if (require.main === module) {
  app.listen(config.port, () => {
    console.log('\n─────────────────────────────────────────');
    console.log('  Tabi Reviews levantado');
    console.log(`  Formulario  → http://localhost:${config.port}`);
    console.log(`  Admin       → http://localhost:${config.port}/admin`);
    console.log('─────────────────────────────────────────\n');
  });
}

module.exports = app;
