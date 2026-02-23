import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TimerQueueService } from './timer-queue.service';

describe('TimerQueueService', () => {
  let service: TimerQueueService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerQueueService);
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('add() schedules a function that runs after the delay', () => {
    const fn = vi.fn();
    service.add(fn, 100);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('supports multiple scheduled timers', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    service.add(fn1, 50);
    service.add(fn2, 150);
    vi.advanceTimersByTime(60);
    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn2).toHaveBeenCalledOnce();
  });

  it('clear() on an empty queue does not throw', () => {
    expect(() => service.clear()).not.toThrow();
  });

  it('clear() cancels pending timers', () => {
    const fn = vi.fn();
    service.add(fn, 200);
    service.clear();
    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
  });
});
