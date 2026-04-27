'use strict';

const { createTask, listTasks, completeTask, _reset } = require('../src/taskRunner');

beforeEach(() => {
  _reset();
});

// ---------------------------------------------------------------------------
// createTask
// ---------------------------------------------------------------------------
describe('createTask', () => {
  it('creates a task with auto-incremented id', () => {
    const t1 = createTask('First');
    const t2 = createTask('Second');
    expect(t1.id).toBe(1);
    expect(t2.id).toBe(2);
  });

  it('returns the expected shape', () => {
    const t = createTask('Do something');
    expect(t).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: 'Do something',
        status: 'pending',
        createdAt: expect.any(Date),
        completedAt: null,
      }),
    );
  });

  it('trims whitespace from the title', () => {
    const t = createTask('  spaced  ');
    expect(t.title).toBe('spaced');
  });

  it('throws TypeError for non-string title', () => {
    expect(() => createTask(42)).toThrow(TypeError);
    expect(() => createTask(null)).toThrow(TypeError);
    expect(() => createTask(undefined)).toThrow(TypeError);
  });

  it('throws TypeError for empty or whitespace-only title', () => {
    expect(() => createTask('')).toThrow(TypeError);
    expect(() => createTask('   ')).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// listTasks
// ---------------------------------------------------------------------------
describe('listTasks', () => {
  it('returns empty array when no tasks exist', () => {
    expect(listTasks()).toEqual([]);
  });

  it('returns all tasks', () => {
    createTask('A');
    createTask('B');
    expect(listTasks()).toHaveLength(2);
  });

  it('filters by pending status', () => {
    const t = createTask('A');
    createTask('B');
    completeTask(t.id);
    const pending = listTasks('pending');
    expect(pending).toHaveLength(1);
    expect(pending[0].title).toBe('B');
  });

  it('filters by completed status', () => {
    const t = createTask('A');
    createTask('B');
    completeTask(t.id);
    const completed = listTasks('completed');
    expect(completed).toHaveLength(1);
    expect(completed[0].title).toBe('A');
  });

  it('throws TypeError for invalid status filter', () => {
    expect(() => listTasks('invalid')).toThrow(TypeError);
  });

  it('returns shallow copies (no mutation leak)', () => {
    createTask('Immutable');
    const list = listTasks();
    list[0].title = 'CHANGED';
    expect(listTasks()[0].title).toBe('Immutable');
  });
});

// ---------------------------------------------------------------------------
// completeTask
// ---------------------------------------------------------------------------
describe('completeTask', () => {
  it('marks a task as completed with a completedAt date', () => {
    const t = createTask('Finish me');
    const done = completeTask(t.id);
    expect(done.status).toBe('completed');
    expect(done.completedAt).toBeInstanceOf(Date);
  });

  it('throws TypeError for non-integer id', () => {
    expect(() => completeTask('one')).toThrow(TypeError);
    expect(() => completeTask(1.5)).toThrow(TypeError);
    expect(() => completeTask(0)).toThrow(TypeError);
    expect(() => completeTask(-1)).toThrow(TypeError);
  });

  it('throws RangeError for unknown id', () => {
    expect(() => completeTask(999)).toThrow(RangeError);
  });

  it('throws Error when completing an already-completed task', () => {
    const t = createTask('Once');
    completeTask(t.id);
    expect(() => completeTask(t.id)).toThrow(Error);
    expect(() => completeTask(t.id)).toThrow('already completed');
  });

  it('returns a shallow copy (no mutation leak)', () => {
    const t = createTask('Safe');
    const done = completeTask(t.id);
    done.status = 'pending';
    expect(listTasks()[0].status).toBe('completed');
  });
});

// ---------------------------------------------------------------------------
// _reset
// ---------------------------------------------------------------------------
describe('_reset', () => {
  it('clears all tasks and resets id counter', () => {
    createTask('Temp');
    _reset();
    expect(listTasks()).toEqual([]);
    const t = createTask('After reset');
    expect(t.id).toBe(1);
  });
});
