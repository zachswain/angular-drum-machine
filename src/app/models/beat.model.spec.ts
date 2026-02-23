import { describe, it, expect } from 'vitest';
import { Beat } from './beat.model';

describe('Beat', () => {
  it('isActive() returns false on construction', () => {
    const beat = new Beat();
    expect(beat.isActive()).toBe(false);
  });

  it('activate() sets isActive() to true', () => {
    const beat = new Beat();
    beat.activate();
    expect(beat.isActive()).toBe(true);
  });

  it('deactivate() after activate sets isActive() to false', () => {
    const beat = new Beat();
    beat.activate();
    beat.deactivate();
    expect(beat.isActive()).toBe(false);
  });

  it('toggle() on inactive beat makes it active', () => {
    const beat = new Beat();
    beat.toggle();
    expect(beat.isActive()).toBe(true);
  });

  it('toggle() on active beat makes it inactive', () => {
    const beat = new Beat();
    beat.activate();
    beat.toggle();
    expect(beat.isActive()).toBe(false);
  });
});
