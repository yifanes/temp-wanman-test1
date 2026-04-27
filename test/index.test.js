'use strict';

const { helloWorld } = require('../src/index');

describe('helloWorld', () => {
  it('returns "Hello, World!" when called without arguments', () => {
    expect(helloWorld()).toBe('Hello, World!');
  });

  it('returns "Hello, World!" when called with undefined', () => {
    expect(helloWorld(undefined)).toBe('Hello, World!');
  });

  it('returns "Hello, World!" when called with empty string', () => {
    expect(helloWorld('')).toBe('Hello, World!');
  });

  it('greets by name when a name is provided', () => {
    expect(helloWorld('Alice')).toBe('Hello, Alice!');
  });

  it('greets with any string value', () => {
    expect(helloWorld('wanman')).toBe('Hello, wanman!');
  });
});
