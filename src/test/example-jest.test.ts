import { describe, it, expect } from '@jest/globals';

describe('example', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should handle basic math', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string operations', () => {
    expect('hello world').toContain('world');
  });
});