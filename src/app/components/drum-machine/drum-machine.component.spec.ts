import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DrumMachineComponent } from './drum-machine.component';
import { DrumMachineService } from '../../services/drum-machine.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

function makeServiceStub() {
  return {
    loadInstruments: vi.fn().mockResolvedValue(undefined),
    loadSequence: vi.fn().mockResolvedValue(undefined),
    rows: signal([]),
    tempo: signal(120),
    currentBeat: signal(0),
    getGridLength: vi.fn().mockReturnValue(16),
    play: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn(),
    setTempo: vi.fn(),
    beatDelay: vi.fn().mockReturnValue(250),
  };
}

describe('DrumMachineComponent', () => {
  let stub: ReturnType<typeof makeServiceStub>;

  beforeEach(async () => {
    stub = makeServiceStub();
    await TestBed.configureTestingModule({
      imports: [DrumMachineComponent, NoopAnimationsModule],
      providers: [{ provide: DrumMachineService, useValue: stub }],
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(DrumMachineComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows spinner while loading', () => {
    const fixture = TestBed.createComponent(DrumMachineComponent);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('hides spinner after init completes', async () => {
    const fixture = TestBed.createComponent(DrumMachineComponent);
    fixture.detectChanges();
    // Flush microtask queue: ngOnInit is async and calls two awaited stubs
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeNull();
  });

  it('play() delegates to service and sets isPlaying', async () => {
    const fixture = TestBed.createComponent(DrumMachineComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.play();
    expect(stub.play).toHaveBeenCalled();
    expect(fixture.componentInstance['isPlaying']).toBe(true);
  });

  it('double-play lock: calling play() twice only starts once', async () => {
    const fixture = TestBed.createComponent(DrumMachineComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.play();
    fixture.componentInstance.play();
    expect(stub.play).toHaveBeenCalledTimes(1);
  });

  it('stop() delegates to service and clears isPlaying', async () => {
    const fixture = TestBed.createComponent(DrumMachineComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.play();
    fixture.componentInstance.stop();
    expect(stub.stop).toHaveBeenCalled();
    expect(fixture.componentInstance['isPlaying']).toBe(false);
  });

  it('reset() delegates to service', async () => {
    const fixture = TestBed.createComponent(DrumMachineComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.reset();
    expect(stub.reset).toHaveBeenCalled();
  });

  it('updateTempo() delegates to service', async () => {
    const fixture = TestBed.createComponent(DrumMachineComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.updateTempo(140);
    expect(stub.setTempo).toHaveBeenCalledWith(140);
  });
});
