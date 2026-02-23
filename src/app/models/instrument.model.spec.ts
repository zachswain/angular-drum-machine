import { describe, it, expect, vi } from 'vitest';
import { Howl } from 'howler';
import { Instrument } from './instrument.model';

describe('Instrument', () => {
  function makeMockHowl(): Howl {
    return { play: vi.fn().mockReturnValue(1) } as unknown as Howl;
  }

  it('getName() returns the instrument name', () => {
    const inst = new Instrument(makeMockHowl(), { name: 'Kick', description: 'bass drum' });
    expect(inst.getName()).toBe('Kick');
  });

  it('getDescription() returns the instrument description', () => {
    const inst = new Instrument(makeMockHowl(), { name: 'Hi-Hat', description: 'closed' });
    expect(inst.getDescription()).toBe('closed');
  });

  it('getDescription() returns empty string when no description provided', () => {
    const inst = new Instrument(makeMockHowl(), { name: 'Kick' });
    expect(inst.getDescription()).toBe('');
  });

  it('play() returns true when Howl plays successfully', () => {
    const inst = new Instrument(makeMockHowl(), { name: 'Kick' });
    expect(inst.play()).toBe(true);
  });

  it('play() returns false when Howl throws', () => {
    const throwingHowl = { play: vi.fn().mockImplementation(() => { throw new Error('audio error'); }) } as unknown as Howl;
    const inst = new Instrument(throwingHowl, { name: 'Kick' });
    expect(inst.play()).toBe(false);
  });
});
