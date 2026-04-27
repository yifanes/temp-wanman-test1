'use strict';

/**
 * Priority-based task queue for ordered execution.
 *
 * Tasks are enqueued with an optional priority (lower number = higher
 * priority, default 5).  Dequeue always returns the highest-priority
 * (lowest number) task, with FIFO ordering among equal priorities.
 *
 * Integrates with taskRunner by accepting task objects or plain
 * descriptions and exposing a standard queue interface.
 */

const PRIORITY_MIN = 1;
const PRIORITY_MAX = 10;
const PRIORITY_DEFAULT = 5;

/**
 * Create a new TaskQueue instance.
 *
 * @returns {Object} Queue instance with enqueue, dequeue, peek, size, clear, toArray, _reset.
 */
function createTaskQueue() {
  /** @type {Array<{ item: *, priority: number, seq: number }>} Min-heap */
  let heap = [];

  /** Monotonic sequence counter for FIFO among equal priorities */
  let seq = 0;

  // ── Heap helpers ────────────────────────────────────────────────

  function parent(i) {
    return Math.floor((i - 1) / 2);
  }
  function left(i) {
    return 2 * i + 1;
  }
  function right(i) {
    return 2 * i + 2;
  }

  function swap(i, j) {
    const tmp = heap[i];
    heap[i] = heap[j];
    heap[j] = tmp;
  }

  /** Compare two entries: lower priority wins; ties broken by insertion order */
  function higher(a, b) {
    if (a.priority !== b.priority) return a.priority < b.priority;
    return a.seq < b.seq;
  }

  function bubbleUp(i) {
    while (i > 0 && higher(heap[i], heap[parent(i)])) {
      swap(i, parent(i));
      i = parent(i);
    }
  }

  function bubbleDown(i) {
    const n = heap.length;
    while (true) {
      let best = i;
      const l = left(i);
      const r = right(i);
      if (l < n && higher(heap[l], heap[best])) best = l;
      if (r < n && higher(heap[r], heap[best])) best = r;
      if (best === i) break;
      swap(i, best);
      i = best;
    }
  }

  // ── Public API ──────────────────────────────────────────────────

  /**
   * Add an item to the queue with an optional priority.
   *
   * @param {*} item - The item to enqueue (must not be null/undefined).
   * @param {number} [priority=5] - Priority 1 (highest) to 10 (lowest).
   * @returns {{ item: *, priority: number }} The enqueued entry.
   * @throws {TypeError} If item is null/undefined or priority is invalid.
   */
  function enqueue(item, priority) {
    if (item === null || item === undefined) {
      throw new TypeError('item must not be null or undefined');
    }

    const p = priority !== undefined ? priority : PRIORITY_DEFAULT;

    if (typeof p !== 'number' || !Number.isInteger(p) || p < PRIORITY_MIN || p > PRIORITY_MAX) {
      throw new TypeError(`priority must be an integer between ${PRIORITY_MIN} and ${PRIORITY_MAX}`);
    }

    const entry = { item, priority: p, seq: seq++ };
    heap.push(entry);
    bubbleUp(heap.length - 1);

    return { item: entry.item, priority: entry.priority };
  }

  /**
   * Remove and return the highest-priority item.
   *
   * @returns {{ item: *, priority: number }} The dequeued entry.
   * @throws {RangeError} If the queue is empty.
   */
  function dequeue() {
    if (heap.length === 0) {
      throw new RangeError('queue is empty');
    }

    const top = heap[0];
    const last = heap.pop();

    if (heap.length > 0) {
      heap[0] = last;
      bubbleDown(0);
    }

    return { item: top.item, priority: top.priority };
  }

  /**
   * Return the highest-priority item without removing it.
   *
   * @returns {{ item: *, priority: number }|null} The front entry, or null if empty.
   */
  function peek() {
    if (heap.length === 0) return null;
    return { item: heap[0].item, priority: heap[0].priority };
  }

  /**
   * Return the number of items in the queue.
   *
   * @returns {number}
   */
  function size() {
    return heap.length;
  }

  /**
   * Remove all items from the queue.
   */
  function clear() {
    heap = [];
    seq = 0;
  }

  /**
   * Return a sorted snapshot of the queue (highest priority first).
   *
   * @returns {Array<{ item: *, priority: number }>}
   */
  function toArray() {
    return [...heap]
      .sort((a, b) => a.priority - b.priority || a.seq - b.seq)
      .map((e) => ({ item: e.item, priority: e.priority }));
  }

  /**
   * Reset internal state (alias for clear, matches other modules' convention).
   */
  function _reset() {
    clear();
  }

  return { enqueue, dequeue, peek, size, clear, toArray, _reset };
}

module.exports = { createTaskQueue, PRIORITY_MIN, PRIORITY_MAX, PRIORITY_DEFAULT };
