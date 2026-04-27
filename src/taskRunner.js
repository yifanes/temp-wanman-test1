'use strict';

/**
 * Lightweight in-memory task orchestration utilities.
 *
 * Provides createTask, listTasks, and completeTask for managing a simple
 * task queue.  Designed as the first "real" module beyond the hello-world
 * entry point.
 */

/** @type {Array<Object>} In-memory task store */
let tasks = [];

/** Auto-incrementing ID counter */
let nextId = 1;

/**
 * Create a new task.
 *
 * @param {string} title - A short description of the task.
 * @returns {Object} The newly created task object.
 * @throws {TypeError} If title is not a non-empty string.
 */
function createTask(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new TypeError('title must be a non-empty string');
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    status: 'pending',
    createdAt: new Date(),
    completedAt: null,
  };

  tasks.push(task);
  return task;
}

/**
 * List all tasks, optionally filtered by status.
 *
 * @param {string} [status] - Filter by status ('pending' | 'completed').
 * @returns {Array<Object>} Matching tasks (shallow copies).
 */
function listTasks(status) {
  let result = tasks;

  if (status !== undefined) {
    if (status !== 'pending' && status !== 'completed') {
      throw new TypeError('status must be "pending" or "completed"');
    }
    result = tasks.filter((t) => t.status === status);
  }

  // Return shallow copies so callers cannot mutate the store directly
  return result.map((t) => ({ ...t }));
}

/**
 * Mark a task as completed.
 *
 * @param {number} id - The task ID to complete.
 * @returns {Object} The updated task (shallow copy).
 * @throws {TypeError}  If id is not a positive integer.
 * @throws {RangeError} If no task with that id exists.
 * @throws {Error}      If the task is already completed.
 */
function completeTask(id) {
  if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
    throw new TypeError('id must be a positive integer');
  }

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    throw new RangeError(`task ${id} not found`);
  }

  if (task.status === 'completed') {
    throw new Error(`task ${id} is already completed`);
  }

  task.status = 'completed';
  task.completedAt = new Date();

  return { ...task };
}

/**
 * Reset internal state (useful for testing).
 */
function _reset() {
  tasks = [];
  nextId = 1;
}

module.exports = { createTask, listTasks, completeTask, _reset };
