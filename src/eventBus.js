'use strict';

/**
 * Lightweight pub/sub event bus for task lifecycle hooks.
 *
 * Provides a simple event emitter that modules can use to react to
 * task lifecycle events (task:created, task:assigned, task:completed, etc.).
 *
 * @module eventBus
 */

/**
 * Create a new EventBus instance.
 *
 * @returns {Object} An eventBus with on, off, once, emit, listenerCount, and removeAllListeners methods.
 */
function createEventBus() {
  /** @type {Map<string, Array<Function>>} */
  const listeners = new Map();

  /**
   * Register a listener for an event.
   *
   * @param {string} event - The event name (e.g. 'task:created').
   * @param {Function} fn - The callback to invoke when the event fires.
   * @returns {Function} An unsubscribe function that removes this listener.
   * @throws {TypeError} If event is not a non-empty string or fn is not a function.
   */
  function on(event, fn) {
    _validateArgs(event, fn);

    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event).push(fn);

    // Return unsubscribe function
    return () => off(event, fn);
  }

  /**
   * Remove a specific listener for an event.
   *
   * @param {string} event - The event name.
   * @param {Function} fn - The callback to remove.
   * @returns {boolean} True if the listener was found and removed.
   * @throws {TypeError} If event is not a non-empty string or fn is not a function.
   */
  function off(event, fn) {
    _validateArgs(event, fn);

    const fns = listeners.get(event);
    if (!fns) return false;

    const idx = fns.indexOf(fn);
    if (idx === -1) return false;

    fns.splice(idx, 1);

    // Clean up empty arrays
    if (fns.length === 0) {
      listeners.delete(event);
    }

    return true;
  }

  /**
   * Register a one-time listener that auto-removes after first invocation.
   *
   * @param {string} event - The event name.
   * @param {Function} fn - The callback to invoke once.
   * @returns {Function} An unsubscribe function.
   * @throws {TypeError} If event is not a non-empty string or fn is not a function.
   */
  function once(event, fn) {
    _validateArgs(event, fn);

    function wrapper(...args) {
      off(event, wrapper);
      fn(...args);
    }
    // Store reference to original for off() lookup
    wrapper._original = fn;

    return on(event, wrapper);
  }

  /**
   * Emit an event, calling all registered listeners with the provided arguments.
   *
   * @param {string} event - The event name to emit.
   * @param {...*} args - Arguments passed to each listener.
   * @returns {number} The number of listeners that were invoked.
   * @throws {TypeError} If event is not a non-empty string.
   */
  function emit(event, ...args) {
    if (typeof event !== 'string' || event.trim().length === 0) {
      throw new TypeError('event must be a non-empty string');
    }

    const fns = listeners.get(event);
    if (!fns || fns.length === 0) return 0;

    // Copy to avoid mutation during iteration (once() removes listeners)
    const snapshot = [...fns];
    for (const fn of snapshot) {
      fn(...args);
    }

    return snapshot.length;
  }

  /**
   * Get the number of listeners for an event, or total across all events.
   *
   * @param {string} [event] - Optional event name. If omitted, returns total count.
   * @returns {number} The listener count.
   */
  function listenerCount(event) {
    if (event !== undefined) {
      if (typeof event !== 'string' || event.trim().length === 0) {
        throw new TypeError('event must be a non-empty string');
      }
      const fns = listeners.get(event);
      return fns ? fns.length : 0;
    }

    let total = 0;
    for (const fns of listeners.values()) {
      total += fns.length;
    }
    return total;
  }

  /**
   * Remove all listeners, optionally scoped to a single event.
   *
   * @param {string} [event] - If provided, only remove listeners for this event.
   */
  function removeAllListeners(event) {
    if (event !== undefined) {
      if (typeof event !== 'string' || event.trim().length === 0) {
        throw new TypeError('event must be a non-empty string');
      }
      listeners.delete(event);
    } else {
      listeners.clear();
    }
  }

  /**
   * Validate that event is a non-empty string and fn is a function.
   * @private
   */
  function _validateArgs(event, fn) {
    if (typeof event !== 'string' || event.trim().length === 0) {
      throw new TypeError('event must be a non-empty string');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('listener must be a function');
    }
  }

  return {
    on,
    off,
    once,
    emit,
    listenerCount,
    removeAllListeners,
  };
}

module.exports = { createEventBus };
