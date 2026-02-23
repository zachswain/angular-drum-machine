import { describe, it, expect, beforeEach } from 'vitest';
import { Row } from './row.model';
import { Instrument } from './instrument.model';

function makeMockInstrument(playReturnValue = true): Instrument {
  return {
    getName: () => 'Test',
    getDescription: () => '',
    play: () => playReturnValue,
  } as unknown as Instrument;
}

describe('Row', () => {
  it('is defined', () => {
    const row = new Row(makeMockInstrument(), 4);
    expect(row).toBeDefined();
  });

  it('has the correct number of beats after construction', () => {
    const row = new Row(makeMockInstrument(), 16);
    expect(row.getBeats().length).toBe(16);
  });

  it('addBeats() appends beats to the row', () => {
    const row = new Row(makeMockInstrument(), 4);
    row.addBeats(4);
    expect(row.getBeats().length).toBe(8);
  });

  it('reset() deactivates all beats', () => {
    const row = new Row(makeMockInstrument(), 4);
    row.getBeats()[0].activate();
    row.getBeats()[2].activate();
    row.reset();
    expect(row.getBeats().every(b => !b.isActive())).toBe(true);
  });

  it('playSound() calls instrument.play() when beat is active', () => {
    const row = new Row(makeMockInstrument(true), 4);
    row.getBeats()[1].activate();
    expect(row.playSound(1)).toBe(true);
  });

  it('playSound() does not call instrument.play() when beat is inactive', () => {
    const row = new Row(makeMockInstrument(true), 4);
    expect(row.playSound(0)).toBe(false);
  });
});
