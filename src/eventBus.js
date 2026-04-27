'use strict';

/**
 * EventBus — lightweight pub/sub event system for task lifecycle hooks.
 *
 * Supports subscribing to named events (e.g. "task:created", "task:assigned",
 * "task:completed"), emitting events with payloads, one-time listeners,
 * unsubscribing, and wildcard ("*") listeners that receive every event.
 *
 * Factory function `createEventBus()` returns an isolated bus instance so
 * multiple subsystems can maintain separate event channels.
 *
 * @module eventBus
 */

/**
 * Create a new, isolated EventBus instance.
 *
 * @returns {Object} An event bus with on, once, off, emit, listenerCount, clear, and _reset methods.
 */
function createEventBus() {
  /** @type {Map<string, Array<{ fn: Function, once: boolean }>>} */
  let listeners = new Map();

  /**
   * Validate that an event name is a non-empty string.
   * @param {string} event
   * @throws {TypeError}
   */
  function _validateEvent(event) {
    if (typeof event !== 'string' || event.trim().length === 0) {
      throw new TypeError('event must be a non-empty string');
    }
  }

  /**
   * Validate that a callback is a function.
   * @param {Function} fn
   * @throws {TypeError}
   */
  function _validateFn(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('listener must be a function');
    }
  }

  /**
   * Subscribe to an event.
   *
   * Use the special event name `"*"` to listen to every emitted event.
   * Wildcard listeners receive `(eventName, ...args)`.
   *
   * @param {string} event - Event name (e.g. "task:created") or "*" for all.
   * @param {Function} fn  - Callback invoked when the event fires.
   * @returns {Function} An unsubscribe function for convenience.
   * @throws {TypeError} If event or fn are invalid.
   */
  function on(event, fn) {
    _validateEvent(event);
    _validateFn(fn);

    const trimmed = event.trim();
    if (!listeners.has(trimmed)) {
      listeners.set(trimmed, []);
    }
    listeners.get(trimmed).push({ fn, once: false });

    return () => off(trimmed, fn);
  }

  /**
   * Subscribe to an event for a single firing only.
   *
   * After the first emit the listener is automatically removed.
   *
   * @param {string} event - Event name or "*".
   * @param {Function} fn  - Callback invoked once.
   * @returns {Function} An unsubscribe function.
   * @throws {TypeError} If event or fn are invalid.
   */
  function once(event, fn) {
    _validateEvent(event);
    _validateFn(fn);

    const trimmed = event.trim();
    if (!listeners.has(trimmed)) {
      listeners.set(trimmed, []);
    }
    listeners.get(trimmed).push({ fn, once: true });

    return () => off(trimmed, fn);
  }

  /**
   * Unsubscribe a specific listener from an event.
   *
   * @param {string} event - Event name.
   * @param {Function} fn  - The exact function reference passed to `on` or `once`.
   * @returns {boolean} True if the listener was found and removed.
   * @throws {TypeError} If event or fn are invalid.
   */
  function off(event, fn) {
    _validateEvent(event);
    _validateFn(fn);

    const trimmed = event.trim();
    const arr = listeners.get(trimmed);
    if (!arr) return false;

    const idx = arr.findIndex((entry) => entry.fn === fn);
    if (idx === -1) return false;

    arr.splice(idx, 1);
    if (arr.length === 0) {
      listeners.delete(trimmed);
    }
    return true;
  }

  /**
   * Emit an event, invoking all matching listeners synchronously.
   *
   * Listeners for the exact event name fire first, then wildcard ("*")
   * listeners receive `(eventName, ...args)`.
   *
   * @param {string} event - Event name to emit.
   * @param {...*} args    - Payload arguments forwarded to listeners.
   * @returns {number} The number of listeners that were invoked.
   * @throws {TypeError} If event is invalid.
   */
  function emit(event, ...args) {
    _validateEvent(event);

    const trimmed = event.trim();
    let invoked = 0;

    // Fire exact-match listeners
    const exact = listeners.get(trimmed);
    if (exact) {
      // Iterate over a copy so once-removals don't skip entries
      const snapshot = [...exact];
      for (const entry of snapshot) {
        entry.fn(...args);
        invoked++;
        if (entry.once) {
          const i = exact.indexOf(entry);
          if (i !== -1) exact.splice(i, 1);
        }
      }
      if (exact.length === 0) {
        listeners.delete(trimmed);
      }
    }

    // Fire wildcard listeners (skip if the event itself is "*")
    if (trimmed !== '*') {
      const wildcards = listeners.get('*');
      if (wildcards) {
        const snapshot = [...wildcards];
        for (const entry of snapshot) {
          entry.fn(trimmed, ...args);
          invoked++;
          if (entry.once) {
            const i = wildcards.indexOf(entry);
            if (i !== -1) wildcards.splice(i, 1);
          }
        }
        if (wildcards.length === 0) {
          listeners.delete('*');
        }
      }
    }

    return invoked;
  }

  /**
   * Return the number of listeners for a given event (or all events).
   *
   * @param {string} [event] - If provided, count only listeners for this event.
   * @returns {number}
   */
  function listenerCount(event) {
    if (event !== undefined) {
      _validateEvent(event);
      const trimmed = event.trim();
      const arr = listeners.get(trimmed);
      return arr ? arr.length : 0;
    }
    let total = 0;
    for (const arr of listeners.values()) {
      total += arr.length;
    }
    return total;
  }

  /**
   * Remove all listeners for a specific event, or all listeners entirely.
   *
   * @param {string} [event] - If provided, clear only that event's listeners.
   */
  function clear(event) {
    if (event !== undefined) {
      _validateEvent(event);
      listeners.delete(event.trim());
    } else {
      listeners = new Map();
    }
  }

  /**
   * Reset internal state (alias for clear — useful for testing).
   */
  function _reset() {
    listeners = new Map();
  }

  return {
    on,
    once,
    off,
    emit,
    listenerCount,
    clear,
    _reset,
  };
}

module.exports = { createEventBus };
