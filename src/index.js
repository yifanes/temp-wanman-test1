'use strict';

/**
 * wanman — autonomous multi-agent task orchestration framework.
 *
 * Re-exports all public modules so consumers can import from a single
 * entry point:
 *
 *   const { helloWorld, createTask, createTaskQueue, registerAgent } = require('temp-wanman-test1');
 *
 * @module temp-wanman-test1
 */

const { createTask, listTasks, completeTask, _reset: _resetTaskRunner } = require('./taskRunner');
const { createTaskQueue, PRIORITY_MIN, PRIORITY_MAX, PRIORITY_DEFAULT } = require('./taskQueue');
const {
  registerAgent,
  getAgent,
  listAgents,
  updateStatus,
  unregisterAgent,
  dispatch,
  _reset: _resetAgentRegistry,
} = require('./agentRegistry');
const { createEventBus } = require('./eventBus');

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

module.exports = {
  // Core greeting (backward compat)
  helloWorld,

  // taskRunner
  createTask,
  listTasks,
  completeTask,
  _resetTaskRunner,

  // taskQueue
  createTaskQueue,
  PRIORITY_MIN,
  PRIORITY_MAX,
  PRIORITY_DEFAULT,

  // agentRegistry
  registerAgent,
  getAgent,
  listAgents,
  updateStatus,
  unregisterAgent,
  dispatch,
  _resetAgentRegistry,

  // eventBus
  createEventBus,
};
