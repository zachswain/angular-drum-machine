import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { DrumMachineService } from './services/drum-machine.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('App', () => {
  const stubService = {
    loadInstruments: vi.fn().mockResolvedValue(undefined),
    loadSequence: vi.fn().mockResolvedValue(undefined),
    rows: signal([]),
    tempo: signal(120),
    currentBeat: signal(0),
    getGridLength: () => 16,
    play: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn(),
    setTempo: vi.fn(),
    beatDelay: vi.fn().mockReturnValue(250),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: DrumMachineService, useValue: stubService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
