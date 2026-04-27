'use strict';

/**
 * Orchestrator — top-level function that wires agentRegistry, taskQueue,
 * and taskRunner together into a single coordinated run.
 *
 * Accepts a config object describing agents and tasks, executes the tasks
 * by dispatching them to registered agents via the priority queue, and
 * returns a run summary.
 *
 * @module orchestrator
 */

const { registerAgent, dispatch, _reset: _resetAgentRegistry } = require('./agentRegistry');
const { createTaskQueue } = require('./taskQueue');
const { createTask, completeTask, listTasks, _reset: _resetTaskRunner } = require('./taskRunner');

/**
 * Orchestrate a run.
 *
 * @param {Object} config
 * @param {Array<{ name: string, role: string, status?: string }>} config.agents
 *   Agents to register for this run.
 * @param {Array<{ title: string, role: string, priority?: number }>} config.tasks
 *   Tasks to process. Each task is assigned to an agent with the matching role.
 * @param {boolean} [config.resetBefore=true]
 *   Whether to reset internal state before the run (useful for isolation).
 * @returns {{ completed: number, failed: number, total: number, results: Array<Object> }}
 *   A summary of the run.
 * @throws {TypeError} If config is missing or malformed.
 */
function orchestrate(config) {
  // ── Validate config ──────────────────────────────────────────────
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('config must be a non-null object');
  }

  if (!Array.isArray(config.agents) || config.agents.length === 0) {
    throw new TypeError('config.agents must be a non-empty array');
  }

  if (!Array.isArray(config.tasks)) {
    throw new TypeError('config.tasks must be an array');
  }

  const resetBefore = config.resetBefore !== undefined ? config.resetBefore : true;

  // ── Reset state if requested ─────────────────────────────────────
  if (resetBefore) {
    _resetAgentRegistry();
    _resetTaskRunner();
  }

  // ── Register agents ──────────────────────────────────────────────
  const registeredAgents = [];
  for (const agentDef of config.agents) {
    const agent = registerAgent(agentDef);
    registeredAgents.push(agent);
  }

  // ── Build priority queue of tasks ────────────────────────────────
  const queue = createTaskQueue();

  for (const taskDef of config.tasks) {
    if (!taskDef || typeof taskDef !== 'object') {
      throw new TypeError('each task must be a non-null object');
    }
    if (typeof taskDef.title !== 'string' || taskDef.title.trim().length === 0) {
      throw new TypeError('each task must have a non-empty title');
    }
    if (typeof taskDef.role !== 'string' || taskDef.role.trim().length === 0) {
      throw new TypeError('each task must have a non-empty role');
    }

    queue.enqueue(taskDef, taskDef.priority);
  }

  // ── Process tasks ────────────────────────────────────────────────
  const results = [];
  let completed = 0;
  let failed = 0;
  const total = queue.size();

  while (queue.size() > 0) {
    const { item: taskDef } = queue.dequeue();

    // Create the task in taskRunner
    const task = createTask(taskDef.title);

    // Dispatch to an agent with the matching role
    let agent = null;
    let error = null;

    try {
      agent = dispatch(taskDef.role);
    } catch (err) {
      error = err;
    }

    if (agent && !error) {
      try {
        const completedTask = completeTask(task.id);
        completed++;
        results.push({
          taskId: task.id,
          title: task.title,
          status: 'completed',
          assignedTo: agent.name,
          role: taskDef.role,
          error: null,
        });
      } catch (err) {
        failed++;
        results.push({
          taskId: task.id,
          title: task.title,
          status: 'failed',
          assignedTo: agent.name,
          role: taskDef.role,
          error: err.message,
        });
      }
    } else {
      failed++;
      results.push({
        taskId: task.id,
        title: task.title,
        status: 'failed',
        assignedTo: null,
        role: taskDef.role,
        error: error ? error.message : 'no agent available',
      });
    }
  }

  return {
    total,
    completed,
    failed,
    agents: registeredAgents.length,
    results,
  };
}

/**
 * Reset all internal state across all sub-modules (testing convenience).
 */
function _reset() {
  _resetAgentRegistry();
  _resetTaskRunner();
}

module.exports = { orchestrate, _reset };
