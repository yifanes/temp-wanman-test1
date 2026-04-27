'use strict';

/**
 * Returns a greeting string.
 *
 * @param {string} [name] - Optional name to greet. Defaults to "World".
 * @returns {string} A greeting message.
 */
function helloWorld(name) {
  const who = name || 'World';
  return `Hello, ${who}!`;
}

module.exports = { helloWorld };
