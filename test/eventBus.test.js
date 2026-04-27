'use strict';

const { createEventBus } = require('../src/eventBus');

describe('createEventBus', () => {
  let bus;

  beforeEach(() => {
    bus = createEventBus();
  });

  // ── on / emit ────────────────────────────────────────────────────────────────

  describe('on + emit', () => {
    test('registers a listener and calls it on emit', () => {
      const fn = jest.fn();
      bus.on('task:created', fn);
      bus.emit('task:created', { id: 1 });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith({ id: 1 });
    });

    test('calls multiple listeners registered for the same event', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      bus.on('evt', fn1);
      bus.on('evt', fn2);
      bus.emit('evt', 42);
      expect(fn1).toHaveBeenCalledWith(42);
      expect(fn2).toHaveBeenCalledWith(42);
    });

    test('returns an unsubscribe function', () => {
      const fn = jest.fn();
      const unsub = bus.on('evt', fn);
      unsub();
      bus.emit('evt');
      expect(fn).not.toHaveBeenCalled();
    });

    test('emits multiple args to listener', () => {
      const fn = jest.fn();
      bus.on('evt', fn);
      bus.emit('evt', 1, 2, 3);
      expect(fn).toHaveBeenCalledWith(1, 2, 3);
    });

    test('returns number of listeners invoked', () => {
      bus.on('evt', jest.fn());
      bus.on('evt', jest.fn());
      const count = bus.emit('evt');
      expect(count).toBe(2);
    });

    test('returns 0 when no listeners exist for event', () => {
      expect(bus.emit('unknown')).toBe(0);
    });

    test('throws TypeError for non-string event in on()', () => {
      expect(() => bus.on(42, jest.fn())).toThrow(TypeError);
    });

    test('throws TypeError for empty-string event in on()', () => {
      expect(() => bus.on('  ', jest.fn())).toThrow(TypeError);
    });

    test('throws TypeError for non-function listener in on()', () => {
      expect(() => bus.on('evt', 'not-a-fn')).toThrow(TypeError);
    });

    test('throws TypeError for non-string event in emit()', () => {
      expect(() => bus.emit(null)).toThrow(TypeError);
    });

    test('throws TypeError for empty-string event in emit()', () => {
      expect(() => bus.emit('  ')).toThrow(TypeError);
    });
  });

  // ── off ──────────────────────────────────────────────────────────────────────

  describe('off', () => {
    test('removes a specific listener', () => {
      const fn = jest.fn();
      bus.on('evt', fn);
      bus.off('evt', fn);
      bus.emit('evt');
      expect(fn).not.toHaveBeenCalled();
    });

    test('returns true when listener was removed', () => {
      const fn = jest.fn();
      bus.on('evt', fn);
      expect(bus.off('evt', fn)).toBe(true);
    });

    test('returns false when listener was not registered for that event', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      bus.on('evt', fn1);
      // fn2 was never registered — idx will be -1
      expect(bus.off('evt', fn2)).toBe(false);
    });

    test('returns false when event has no listeners at all', () => {
      expect(bus.off('noexist', jest.fn())).toBe(false);
    });

    test('cleans up empty listener arrays after last listener removed', () => {
      const fn = jest.fn();
      bus.on('evt', fn);
      bus.off('evt', fn);
      expect(bus.listenerCount('evt')).toBe(0);
    });

    test('does not clean up array when other listeners remain after removal', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      bus.on('evt', fn1);
      bus.on('evt', fn2);
      bus.off('evt', fn1);
      // fn2 is still registered
      expect(bus.listenerCount('evt')).toBe(1);
      bus.emit('evt');
      expect(fn2).toHaveBeenCalledTimes(1);
      expect(fn1).not.toHaveBeenCalled();
    });

    test('throws TypeError for non-string event in off()', () => {
      expect(() => bus.off(null, jest.fn())).toThrow(TypeError);
    });

    test('throws TypeError for empty-string event in off()', () => {
      expect(() => bus.off('', jest.fn())).toThrow(TypeError);
    });

    test('throws TypeError for non-function listener in off()', () => {
      expect(() => bus.off('evt', 123)).toThrow(TypeError);
    });
  });

  // ── once ─────────────────────────────────────────────────────────────────────

  describe('once', () => {
    test('calls the listener exactly once', () => {
      const fn = jest.fn();
      bus.once('evt', fn);
      bus.emit('evt');
      bus.emit('evt');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('passes arguments to the one-time listener', () => {
      const fn = jest.fn();
      bus.once('evt', fn);
      bus.emit('evt', 'hello', 99);
      expect(fn).toHaveBeenCalledWith('hello', 99);
    });

    test('returns an unsubscribe function that prevents firing', () => {
      const fn = jest.fn();
      const unsub = bus.once('evt', fn);
      unsub();
      bus.emit('evt');
      expect(fn).not.toHaveBeenCalled();
    });

    test('throws TypeError for non-string event in once()', () => {
      expect(() => bus.once(0, jest.fn())).toThrow(TypeError);
    });

    test('throws TypeError for non-function listener in once()', () => {
      expect(() => bus.once('evt', null)).toThrow(TypeError);
    });
  });

  // ── listenerCount ────────────────────────────────────────────────────────────

  describe('listenerCount', () => {
    test('returns 0 for unregistered event', () => {
      expect(bus.listenerCount('nope')).toBe(0);
    });

    test('returns count for a specific event', () => {
      bus.on('a', jest.fn());
      bus.on('a', jest.fn());
      expect(bus.listenerCount('a')).toBe(2);
    });

    test('returns total count across all events when called without args', () => {
      bus.on('a', jest.fn());
      bus.on('b', jest.fn());
      bus.on('b', jest.fn());
      expect(bus.listenerCount()).toBe(3);
    });

    test('returns 0 total when no listeners exist', () => {
      expect(bus.listenerCount()).toBe(0);
    });

    test('throws TypeError for empty-string event', () => {
      expect(() => bus.listenerCount('')).toThrow(TypeError);
    });
  });

  // ── removeAllListeners ───────────────────────────────────────────────────────

  describe('removeAllListeners', () => {
    test('removes all listeners for a specific event', () => {
      bus.on('a', jest.fn());
      bus.on('a', jest.fn());
      bus.on('b', jest.fn());
      bus.removeAllListeners('a');
      expect(bus.listenerCount('a')).toBe(0);
      expect(bus.listenerCount('b')).toBe(1);
    });

    test('removes all listeners across all events when called without args', () => {
      bus.on('a', jest.fn());
      bus.on('b', jest.fn());
      bus.removeAllListeners();
      expect(bus.listenerCount()).toBe(0);
    });

    test('throws TypeError for empty-string event', () => {
      expect(() => bus.removeAllListeners(' ')).toThrow(TypeError);
    });
  });
});
