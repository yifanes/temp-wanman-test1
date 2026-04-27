'use strict';

const {
  registerAgent,
  getAgent,
  listAgents,
  updateStatus,
  unregisterAgent,
  dispatch,
  _reset,
} = require('../src/agentRegistry');

beforeEach(() => {
  _reset();
});

// ---------------------------------------------------------------------------
// registerAgent
// ---------------------------------------------------------------------------
describe('registerAgent', () => {
  it('registers an agent with default active status', () => {
    const a = registerAgent({ name: 'alice', role: 'dev' });
    expect(a).toEqual(
      expect.objectContaining({
        name: 'alice',
        role: 'dev',
        status: 'active',
        registeredAt: expect.any(Date),
      }),
    );
  });

  it('accepts explicit status', () => {
    const a = registerAgent({ name: 'bob', role: 'qa', status: 'idle' });
    expect(a.status).toBe('idle');
  });

  it('accepts offline status', () => {
    const a = registerAgent({ name: 'carl', role: 'ops', status: 'offline' });
    expect(a.status).toBe('offline');
  });

  it('trims name and role', () => {
    const a = registerAgent({ name: '  trimmed  ', role: '  lead  ' });
    expect(a.name).toBe('trimmed');
    expect(a.role).toBe('lead');
  });

  it('throws TypeError for missing/empty name', () => {
    expect(() => registerAgent({ name: '', role: 'dev' })).toThrow(TypeError);
    expect(() => registerAgent({ name: '   ', role: 'dev' })).toThrow(TypeError);
    expect(() => registerAgent({ name: 42, role: 'dev' })).toThrow(TypeError);
    expect(() => registerAgent({ role: 'dev' })).toThrow(TypeError);
    expect(() => registerAgent({})).toThrow(TypeError);
    expect(() => registerAgent()).toThrow(TypeError);
  });

  it('throws TypeError for missing/empty role', () => {
    expect(() => registerAgent({ name: 'x', role: '' })).toThrow(TypeError);
    expect(() => registerAgent({ name: 'x', role: '   ' })).toThrow(TypeError);
    expect(() => registerAgent({ name: 'x', role: 123 })).toThrow(TypeError);
    expect(() => registerAgent({ name: 'x' })).toThrow(TypeError);
  });

  it('throws TypeError for invalid status', () => {
    expect(() =>
      registerAgent({ name: 'x', role: 'dev', status: 'unknown' }),
    ).toThrow(TypeError);
  });

  it('throws Error for duplicate name', () => {
    registerAgent({ name: 'dup', role: 'dev' });
    expect(() => registerAgent({ name: 'dup', role: 'ops' })).toThrow(Error);
    expect(() => registerAgent({ name: 'dup', role: 'ops' })).toThrow(
      'already registered',
    );
  });

  it('returns a shallow copy (no mutation leak)', () => {
    const a = registerAgent({ name: 'safe', role: 'dev' });
    a.name = 'CHANGED';
    expect(getAgent('safe').name).toBe('safe');
  });
});

// ---------------------------------------------------------------------------
// getAgent
// ---------------------------------------------------------------------------
describe('getAgent', () => {
  it('returns agent by name', () => {
    registerAgent({ name: 'finder', role: 'dev' });
    const a = getAgent('finder');
    expect(a).not.toBeNull();
    expect(a.name).toBe('finder');
  });

  it('returns null for unknown name', () => {
    expect(getAgent('ghost')).toBeNull();
  });

  it('trims the lookup name', () => {
    registerAgent({ name: 'trim-me', role: 'dev' });
    expect(getAgent('  trim-me  ')).not.toBeNull();
  });

  it('throws TypeError for invalid name', () => {
    expect(() => getAgent('')).toThrow(TypeError);
    expect(() => getAgent('   ')).toThrow(TypeError);
    expect(() => getAgent(42)).toThrow(TypeError);
    expect(() => getAgent(null)).toThrow(TypeError);
  });

  it('returns a shallow copy (no mutation leak)', () => {
    registerAgent({ name: 'immutable', role: 'dev' });
    const a = getAgent('immutable');
    a.role = 'CHANGED';
    expect(getAgent('immutable').role).toBe('dev');
  });
});

// ---------------------------------------------------------------------------
// listAgents
// ---------------------------------------------------------------------------
describe('listAgents', () => {
  it('returns empty array when no agents exist', () => {
    expect(listAgents()).toEqual([]);
  });

  it('returns all agents', () => {
    registerAgent({ name: 'a', role: 'dev' });
    registerAgent({ name: 'b', role: 'ops' });
    expect(listAgents()).toHaveLength(2);
  });

  it('filters by role', () => {
    registerAgent({ name: 'a', role: 'dev' });
    registerAgent({ name: 'b', role: 'ops' });
    registerAgent({ name: 'c', role: 'dev' });
    const devs = listAgents({ role: 'dev' });
    expect(devs).toHaveLength(2);
    expect(devs.every((a) => a.role === 'dev')).toBe(true);
  });

  it('filters by status', () => {
    registerAgent({ name: 'a', role: 'dev', status: 'active' });
    registerAgent({ name: 'b', role: 'dev', status: 'idle' });
    const idle = listAgents({ status: 'idle' });
    expect(idle).toHaveLength(1);
    expect(idle[0].name).toBe('b');
  });

  it('filters by both role and status', () => {
    registerAgent({ name: 'a', role: 'dev', status: 'active' });
    registerAgent({ name: 'b', role: 'dev', status: 'idle' });
    registerAgent({ name: 'c', role: 'ops', status: 'active' });
    const result = listAgents({ role: 'dev', status: 'active' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('a');
  });

  it('throws TypeError for invalid role filter', () => {
    expect(() => listAgents({ role: '' })).toThrow(TypeError);
    expect(() => listAgents({ role: '   ' })).toThrow(TypeError);
    expect(() => listAgents({ role: 123 })).toThrow(TypeError);
  });

  it('throws TypeError for invalid status filter', () => {
    expect(() => listAgents({ status: 'bad' })).toThrow(TypeError);
  });

  it('returns shallow copies', () => {
    registerAgent({ name: 'safe', role: 'dev' });
    const list = listAgents();
    list[0].name = 'CHANGED';
    expect(listAgents()[0].name).toBe('safe');
  });
});

// ---------------------------------------------------------------------------
// updateStatus
// ---------------------------------------------------------------------------
describe('updateStatus', () => {
  it('updates status and returns updated agent', () => {
    registerAgent({ name: 'updatable', role: 'dev' });
    const updated = updateStatus('updatable', 'idle');
    expect(updated.status).toBe('idle');
    expect(getAgent('updatable').status).toBe('idle');
  });

  it('throws TypeError for invalid name', () => {
    expect(() => updateStatus('', 'active')).toThrow(TypeError);
    expect(() => updateStatus(42, 'active')).toThrow(TypeError);
  });

  it('throws TypeError for invalid status', () => {
    registerAgent({ name: 'x', role: 'dev' });
    expect(() => updateStatus('x', 'bad')).toThrow(TypeError);
  });

  it('throws RangeError for unknown agent', () => {
    expect(() => updateStatus('ghost', 'active')).toThrow(RangeError);
  });

  it('returns a shallow copy', () => {
    registerAgent({ name: 'copy', role: 'dev' });
    const u = updateStatus('copy', 'idle');
    u.status = 'offline';
    expect(getAgent('copy').status).toBe('idle');
  });
});

// ---------------------------------------------------------------------------
// unregisterAgent
// ---------------------------------------------------------------------------
describe('unregisterAgent', () => {
  it('removes an existing agent and returns true', () => {
    registerAgent({ name: 'removable', role: 'dev' });
    expect(unregisterAgent('removable')).toBe(true);
    expect(getAgent('removable')).toBeNull();
  });

  it('returns false for non-existent agent', () => {
    expect(unregisterAgent('nobody')).toBe(false);
  });

  it('trims the name', () => {
    registerAgent({ name: 'trim', role: 'dev' });
    expect(unregisterAgent('  trim  ')).toBe(true);
  });

  it('throws TypeError for invalid name', () => {
    expect(() => unregisterAgent('')).toThrow(TypeError);
    expect(() => unregisterAgent('   ')).toThrow(TypeError);
    expect(() => unregisterAgent(null)).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// dispatch
// ---------------------------------------------------------------------------
describe('dispatch', () => {
  it('dispatches to the only active agent', () => {
    registerAgent({ name: 'solo', role: 'dev' });
    const d = dispatch('dev');
    expect(d.name).toBe('solo');
  });

  it('round-robins among active agents', () => {
    registerAgent({ name: 'a', role: 'dev' });
    registerAgent({ name: 'b', role: 'dev' });
    registerAgent({ name: 'c', role: 'dev' });

    const first = dispatch('dev');
    const second = dispatch('dev');
    const third = dispatch('dev');
    const fourth = dispatch('dev');

    expect(first.name).toBe('a');
    expect(second.name).toBe('b');
    expect(third.name).toBe('c');
    expect(fourth.name).toBe('a'); // wraps around
  });

  it('skips non-active agents', () => {
    registerAgent({ name: 'active1', role: 'dev' });
    registerAgent({ name: 'idle1', role: 'dev', status: 'idle' });
    registerAgent({ name: 'active2', role: 'dev' });

    const d1 = dispatch('dev');
    const d2 = dispatch('dev');
    const d3 = dispatch('dev');

    expect(d1.name).toBe('active1');
    expect(d2.name).toBe('active2');
    expect(d3.name).toBe('active1'); // wraps
  });

  it('throws TypeError for invalid role', () => {
    expect(() => dispatch('')).toThrow(TypeError);
    expect(() => dispatch('   ')).toThrow(TypeError);
    expect(() => dispatch(42)).toThrow(TypeError);
  });

  it('throws RangeError when no active agents with that role', () => {
    expect(() => dispatch('nonexistent')).toThrow(RangeError);
  });

  it('throws RangeError when agents exist but are not active', () => {
    registerAgent({ name: 'x', role: 'dev', status: 'offline' });
    expect(() => dispatch('dev')).toThrow(RangeError);
  });

  it('returns a shallow copy', () => {
    registerAgent({ name: 'disp', role: 'dev' });
    const d = dispatch('dev');
    d.name = 'CHANGED';
    expect(getAgent('disp').name).toBe('disp');
  });
});

// ---------------------------------------------------------------------------
// _reset
// ---------------------------------------------------------------------------
describe('_reset', () => {
  it('clears all agents and dispatch counters', () => {
    registerAgent({ name: 'temp', role: 'dev' });
    dispatch('dev');
    _reset();
    expect(listAgents()).toEqual([]);
  });

  it('allows re-registration after reset', () => {
    registerAgent({ name: 'reusable', role: 'dev' });
    _reset();
    const a = registerAgent({ name: 'reusable', role: 'ops' });
    expect(a.role).toBe('ops');
  });
});
