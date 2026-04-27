'use strict';

const { createTaskQueue, PRIORITY_MIN, PRIORITY_MAX, PRIORITY_DEFAULT } = require('../src/taskQueue');

describe('taskQueue', () => {
  let queue;

  beforeEach(() => {
    queue = createTaskQueue();
  });

  // ── Constants ─────────────────────────────────────────────────

  describe('exported constants', () => {
    it('exports PRIORITY_MIN, PRIORITY_MAX, PRIORITY_DEFAULT', () => {
      expect(PRIORITY_MIN).toBe(1);
      expect(PRIORITY_MAX).toBe(10);
      expect(PRIORITY_DEFAULT).toBe(5);
    });
  });

  // ── enqueue ───────────────────────────────────────────────────

  describe('enqueue', () => {
    it('adds an item with default priority', () => {
      const result = queue.enqueue('task-a');
      expect(result).toEqual({ item: 'task-a', priority: PRIORITY_DEFAULT });
      expect(queue.size()).toBe(1);
    });

    it('adds an item with explicit priority', () => {
      const result = queue.enqueue('urgent', 1);
      expect(result).toEqual({ item: 'urgent', priority: 1 });
    });

    it('accepts objects as items', () => {
      const obj = { id: 1, title: 'do something' };
      const result = queue.enqueue(obj, 3);
      expect(result.item).toBe(obj);
      expect(result.priority).toBe(3);
    });

    it('accepts numbers and booleans as items', () => {
      queue.enqueue(42, 2);
      queue.enqueue(false, 3);
      expect(queue.size()).toBe(2);
    });

    it('accepts empty string as item', () => {
      queue.enqueue('', 5);
      expect(queue.size()).toBe(1);
    });

    it('accepts 0 as item', () => {
      queue.enqueue(0, 5);
      expect(queue.size()).toBe(1);
      expect(queue.peek().item).toBe(0);
    });

    it('throws if item is null', () => {
      expect(() => queue.enqueue(null)).toThrow(TypeError);
      expect(() => queue.enqueue(null)).toThrow('item must not be null or undefined');
    });

    it('throws if item is undefined', () => {
      expect(() => queue.enqueue(undefined)).toThrow(TypeError);
    });

    it('throws if priority is not an integer', () => {
      expect(() => queue.enqueue('x', 2.5)).toThrow(TypeError);
      expect(() => queue.enqueue('x', 'high')).toThrow(TypeError);
    });

    it('throws if priority is below PRIORITY_MIN', () => {
      expect(() => queue.enqueue('x', 0)).toThrow(TypeError);
    });

    it('throws if priority is above PRIORITY_MAX', () => {
      expect(() => queue.enqueue('x', 11)).toThrow(TypeError);
    });
  });

  // ── dequeue ───────────────────────────────────────────────────

  describe('dequeue', () => {
    it('returns the highest-priority item', () => {
      queue.enqueue('low', 10);
      queue.enqueue('high', 1);
      queue.enqueue('mid', 5);

      const result = queue.dequeue();
      expect(result).toEqual({ item: 'high', priority: 1 });
      expect(queue.size()).toBe(2);
    });

    it('preserves FIFO order among equal priorities', () => {
      queue.enqueue('first', 3);
      queue.enqueue('second', 3);
      queue.enqueue('third', 3);

      expect(queue.dequeue().item).toBe('first');
      expect(queue.dequeue().item).toBe('second');
      expect(queue.dequeue().item).toBe('third');
    });

    it('drains the queue completely', () => {
      queue.enqueue('a', 2);
      queue.enqueue('b', 1);
      queue.dequeue();
      queue.dequeue();
      expect(queue.size()).toBe(0);
    });

    it('throws when queue is empty', () => {
      expect(() => queue.dequeue()).toThrow(RangeError);
      expect(() => queue.dequeue()).toThrow('queue is empty');
    });

    it('handles single-element dequeue', () => {
      queue.enqueue('only', 5);
      expect(queue.dequeue()).toEqual({ item: 'only', priority: 5 });
      expect(queue.size()).toBe(0);
    });

    it('correctly reorders after multiple enqueue/dequeue cycles', () => {
      queue.enqueue('a', 5);
      queue.enqueue('b', 2);
      queue.enqueue('c', 8);
      expect(queue.dequeue().item).toBe('b');

      queue.enqueue('d', 1);
      expect(queue.dequeue().item).toBe('d');
      expect(queue.dequeue().item).toBe('a');
      expect(queue.dequeue().item).toBe('c');
    });
  });

  // ── peek ──────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns null for an empty queue', () => {
      expect(queue.peek()).toBeNull();
    });

    it('returns the highest-priority item without removing it', () => {
      queue.enqueue('low', 7);
      queue.enqueue('high', 2);

      expect(queue.peek()).toEqual({ item: 'high', priority: 2 });
      expect(queue.size()).toBe(2); // not removed
    });

    it('still returns correct item after a dequeue', () => {
      queue.enqueue('a', 1);
      queue.enqueue('b', 3);
      queue.dequeue(); // removes 'a'
      expect(queue.peek()).toEqual({ item: 'b', priority: 3 });
    });
  });

  // ── size ──────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for a new queue', () => {
      expect(queue.size()).toBe(0);
    });

    it('tracks enqueue and dequeue', () => {
      queue.enqueue('a');
      queue.enqueue('b');
      expect(queue.size()).toBe(2);
      queue.dequeue();
      expect(queue.size()).toBe(1);
    });
  });

  // ── clear ─────────────────────────────────────────────────────

  describe('clear', () => {
    it('empties the queue', () => {
      queue.enqueue('a');
      queue.enqueue('b');
      queue.clear();
      expect(queue.size()).toBe(0);
      expect(queue.peek()).toBeNull();
    });
  });

  // ── toArray ───────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      expect(queue.toArray()).toEqual([]);
    });

    it('returns items sorted by priority then insertion order', () => {
      queue.enqueue('c', 5);
      queue.enqueue('a', 1);
      queue.enqueue('b', 5);
      queue.enqueue('d', 3);

      expect(queue.toArray()).toEqual([
        { item: 'a', priority: 1 },
        { item: 'd', priority: 3 },
        { item: 'c', priority: 5 },
        { item: 'b', priority: 5 },
      ]);
    });

    it('does not mutate the queue', () => {
      queue.enqueue('x', 2);
      queue.toArray();
      expect(queue.size()).toBe(1);
    });
  });

  // ── _reset ────────────────────────────────────────────────────

  describe('_reset', () => {
    it('clears all state', () => {
      queue.enqueue('a');
      queue.enqueue('b');
      queue._reset();
      expect(queue.size()).toBe(0);
      expect(queue.peek()).toBeNull();
    });
  });

  // ── Multiple independent queues ───────────────────────────────

  describe('independent instances', () => {
    it('two queues do not share state', () => {
      const q1 = createTaskQueue();
      const q2 = createTaskQueue();

      q1.enqueue('a', 1);
      q2.enqueue('b', 2);

      expect(q1.size()).toBe(1);
      expect(q2.size()).toBe(1);
      expect(q1.peek().item).toBe('a');
      expect(q2.peek().item).toBe('b');
    });
  });

  // ── Large-scale ordering ──────────────────────────────────────

  describe('stress / ordering', () => {
    it('correctly orders 100 items across all priority levels', () => {
      for (let i = 100; i > 0; i--) {
        const priority = ((i - 1) % 10) + 1;
        queue.enqueue(`task-${i}`, priority);
      }

      let lastPriority = 0;
      while (queue.size() > 0) {
        const { priority } = queue.dequeue();
        expect(priority).toBeGreaterThanOrEqual(lastPriority);
        lastPriority = priority;
      }
    });
  });
});
