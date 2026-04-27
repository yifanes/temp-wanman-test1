'use strict';

/**
 * Agent registry — registration, lookup, and role-based dispatch.
 *
 * Each agent has a name (unique), role, and status.  The registry
 * supports registering agents, looking them up by name, querying by
 * role, updating status, unregistering, and dispatching to an agent
 * by role (round-robin among active agents with that role).
 */

/** @type {Map<string, Object>} name → agent */
let agents = new Map();

/** @type {Map<string, number>} role → last-dispatched index (for round-robin) */
let dispatchCounters = new Map();

const VALID_STATUSES = ['active', 'idle', 'offline'];

/**
 * Register a new agent.
 *
 * @param {{ name: string, role: string, status?: string }} opts
 * @returns {Object} The registered agent record.
 * @throws {TypeError} If name or role are invalid.
 * @throws {Error}     If an agent with the same name already exists.
 */
function registerAgent({ name, role, status } = {}) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new TypeError('name must be a non-empty string');
  }
  if (typeof role !== 'string' || role.trim().length === 0) {
    throw new TypeError('role must be a non-empty string');
  }

  const trimmedName = name.trim();
  const trimmedRole = role.trim();

  if (agents.has(trimmedName)) {
    throw new Error(`agent "${trimmedName}" is already registered`);
  }

  const agentStatus = status !== undefined ? status : 'active';
  if (!VALID_STATUSES.includes(agentStatus)) {
    throw new TypeError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const agent = {
    name: trimmedName,
    role: trimmedRole,
    status: agentStatus,
    registeredAt: new Date(),
  };

  agents.set(trimmedName, agent);
  return { ...agent };
}

/**
 * Look up an agent by exact name.
 *
 * @param {string} name
 * @returns {Object|null} A shallow copy of the agent, or null if not found.
 */
function getAgent(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new TypeError('name must be a non-empty string');
  }
  const agent = agents.get(name.trim());
  return agent ? { ...agent } : null;
}

/**
 * List agents, optionally filtered by role and/or status.
 *
 * @param {{ role?: string, status?: string }} [filters]
 * @returns {Array<Object>} Shallow copies of matching agents.
 */
function listAgents(filters = {}) {
  let result = Array.from(agents.values());

  if (filters.role !== undefined) {
    if (typeof filters.role !== 'string' || filters.role.trim().length === 0) {
      throw new TypeError('role filter must be a non-empty string');
    }
    const r = filters.role.trim();
    result = result.filter((a) => a.role === r);
  }

  if (filters.status !== undefined) {
    if (!VALID_STATUSES.includes(filters.status)) {
      throw new TypeError(`status filter must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    result = result.filter((a) => a.status === filters.status);
  }

  return result.map((a) => ({ ...a }));
}

/**
 * Update an agent's status.
 *
 * @param {string} name
 * @param {string} newStatus
 * @returns {Object} Updated agent (shallow copy).
 * @throws {TypeError}  If arguments are invalid.
 * @throws {RangeError} If the agent does not exist.
 */
function updateStatus(name, newStatus) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new TypeError('name must be a non-empty string');
  }
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new TypeError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const agent = agents.get(name.trim());
  if (!agent) {
    throw new RangeError(`agent "${name.trim()}" not found`);
  }

  agent.status = newStatus;
  return { ...agent };
}

/**
 * Unregister an agent by name.
 *
 * @param {string} name
 * @returns {boolean} True if the agent was removed, false if it did not exist.
 */
function unregisterAgent(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new TypeError('name must be a non-empty string');
  }
  return agents.delete(name.trim());
}

/**
 * Dispatch to an active agent with the given role (round-robin).
 *
 * Only agents with status "active" are eligible for dispatch.
 *
 * @param {string} role
 * @returns {Object} The selected agent (shallow copy).
 * @throws {TypeError}  If role is invalid.
 * @throws {RangeError} If no active agent with that role exists.
 */
function dispatch(role) {
  if (typeof role !== 'string' || role.trim().length === 0) {
    throw new TypeError('role must be a non-empty string');
  }

  const trimmedRole = role.trim();
  const eligible = Array.from(agents.values()).filter(
    (a) => a.role === trimmedRole && a.status === 'active',
  );

  if (eligible.length === 0) {
    throw new RangeError(`no active agent with role "${trimmedRole}"`);
  }

  const counter = dispatchCounters.get(trimmedRole) || 0;
  const index = counter % eligible.length;
  dispatchCounters.set(trimmedRole, counter + 1);

  return { ...eligible[index] };
}

/**
 * Reset internal state (useful for testing).
 */
function _reset() {
  agents = new Map();
  dispatchCounters = new Map();
}

module.exports = {
  registerAgent,
  getAgent,
  listAgents,
  updateStatus,
  unregisterAgent,
  dispatch,
  _reset,
};
