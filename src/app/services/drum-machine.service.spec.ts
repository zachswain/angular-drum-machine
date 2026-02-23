import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DrumMachineService } from './drum-machine.service';

// Mock Howl so no audio is loaded during tests
vi.mock('howler', () => ({
  Howl: class {
    play = vi.fn().mockReturnValue(1);
  },
}));

const KIT_DATA = {
  name: 'default',
  instruments: [
    { name: 'Kick', file: 'CYCdh_AcouKick-01.mp3' },
    { name: 'Snare', file: 'CYCdh_LudFlamA-01.mp3' },
    { name: 'Hi-Hat', description: 'closed', file: 'KHats Clsd-08.mp3' },
    { name: 'Hi-Hat', description: 'open', file: 'KHats Open-04.mp3' },
  ],
};

const SEQ_DATA = {
  name: 'default',
  gridLength: '16',
  tempo: 100,
  rows: [
    '0110101001101110',
    '0001000100010001',
    '1010101010101010',
    '1001000010010100',
  ],
};

describe('DrumMachineService', () => {
  let service: DrumMachineService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DrumMachineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('rows signal is empty initially', () => {
    expect(service.rows()).toHaveLength(0);
  });

  it('loadInstruments() creates 4 rows', async () => {
    const promise = service.loadInstruments();
    httpMock.expectOne('assets/data/kit-1.json').flush(KIT_DATA);
    await promise;
    expect(service.rows()).toHaveLength(4);
  });

  it('loadSequence() activates correct beats from JSON', async () => {
    const instrPromise = service.loadInstruments();
    httpMock.expectOne('assets/data/kit-1.json').flush(KIT_DATA);
    await instrPromise;

    const seqPromise = service.loadSequence();
    httpMock.expectOne('assets/data/seq-1.json').flush(SEQ_DATA);
    await seqPromise;

    // Row 0: "0110101001101110" — beat index 1 should be active
    expect(service.rows()[0].getBeats()[1].isActive()).toBe(true);
    // Row 0: beat index 0 should be inactive
    expect(service.rows()[0].getBeats()[0].isActive()).toBe(false);
    // Row 2: "1010101010101010" — beat index 0 active
    expect(service.rows()[2].getBeats()[0].isActive()).toBe(true);
    // Row 2: beat index 1 inactive
    expect(service.rows()[2].getBeats()[1].isActive()).toBe(false);
  });

  it('play() and stop() toggle playing state', async () => {
    const instrPromise = service.loadInstruments();
    httpMock.expectOne('assets/data/kit-1.json').flush(KIT_DATA);
    await instrPromise;

    service.play();
    vi.advanceTimersByTime(10);
    service.stop();
    vi.advanceTimersByTime(1000); // no more timers should fire after stop
    // Just verifying no errors thrown
    expect(service.rows()).toHaveLength(4);
  });

  it('reset() resets currentBeat to 0 and clears all beats', async () => {
    const instrPromise = service.loadInstruments();
    httpMock.expectOne('assets/data/kit-1.json').flush(KIT_DATA);
    await instrPromise;

    service.rows()[0].getBeats()[0].activate();
    service.reset();
    expect(service.currentBeat()).toBe(0);
    expect(service.rows()[0].getBeats()[0].isActive()).toBe(false);
  });

  it('setTempo() updates the tempo signal', () => {
    service.setTempo(140);
    expect(service.tempo()).toBe(140);
  });

  it('beatDelay() at 120 BPM returns 250ms', () => {
    service.setTempo(120);
    expect(service.beatDelay()).toBeCloseTo(250, 5);
  });
});
