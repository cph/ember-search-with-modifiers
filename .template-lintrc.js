'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'attribute-indentation': false,
    'block-indentation': false,
    'no-invalid-interactive': false,  // TODO: For accessibility purposes, address in separate PR
    'simple-unless': { whitelist: [ 'eq', 'or' ], maxHelpers: 1 }
  }
};
