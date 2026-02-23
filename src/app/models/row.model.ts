import { Beat } from './beat.model';
import { Instrument } from './instrument.model';

export class Row {
  private readonly instrument: Instrument;
  private readonly beats: Beat[] = [];

  constructor(instrument: Instrument, initialBeats: number) {
    this.instrument = instrument;
    this.addBeats(initialBeats);
  }

  getInstrument(): Instrument {
    return this.instrument;
  }

  getBeats(): Beat[] {
    return this.beats;
  }

  addBeats(num: number): void {
    for (let i = 0; i < num; i++) {
      this.beats.push(new Beat());
    }
  }

  reset(): void {
    for (const beat of this.beats) {
      beat.deactivate();
    }
  }

  playSound(index: number): boolean {
    if (this.beats[index].isActive()) {
      return this.instrument.play();
    }
    return false;
  }
}
