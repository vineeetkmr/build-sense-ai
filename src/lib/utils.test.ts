import { cn } from '../lib/utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    )).toBe('base-class active');
  });

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('handles empty and undefined values', () => {
    expect(cn('class1', undefined, '', 'class2')).toBe('class1 class2');
  });

  it('handles array inputs', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('handles object inputs', () => {
    expect(cn({ 'class1': true, 'class2': false }, 'class3')).toBe('class1 class3');
  });
});