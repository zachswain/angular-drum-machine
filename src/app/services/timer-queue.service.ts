import { Injectable, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimerQueueService implements OnDestroy {
  private readonly queue: ReturnType<typeof setTimeout>[] = [];

  add(fn: () => void, delay: number): void {
    this.queue.push(setTimeout(fn, delay));
  }

  clear(): void {
    for (const timer of this.queue) {
      clearTimeout(timer);
    }
    this.queue.length = 0;
  }

  ngOnDestroy(): void {
    this.clear();
  }
}
