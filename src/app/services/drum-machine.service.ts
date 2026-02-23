import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Howl } from 'howler';

import { KitData } from '../models/kit.interface';
import { SequenceData } from '../models/sequence.interface';
import { Instrument } from '../models/instrument.model';
import { Row } from '../models/row.model';
import { TimerQueueService } from './timer-queue.service';

@Injectable({ providedIn: 'root' })
export class DrumMachineService {
  private readonly _rows = signal<Row[]>([]);
  private readonly _tempo = signal(120);
  private readonly _currentBeat = signal(0);
  private readonly _gridLength = signal(16);
  private _playing = false;

  readonly rows = this._rows.asReadonly();
  readonly tempo = this._tempo.asReadonly();
  readonly currentBeat = this._currentBeat.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly timers: TimerQueueService,
  ) {}

  getGridLength(): number {
    return this._gridLength();
  }

  async loadInstruments(instrumentFile = 'assets/data/kit-1.json'): Promise<void> {
    const data = await firstValueFrom(this.http.get<KitData>(instrumentFile));
    const newRows: Row[] = [];
    for (let i = 0; i < 4; i++) {
      const item = data.instruments[i];
      const player = new Howl({ src: [`assets/audio/${encodeURIComponent(item.file)}`] });
      const instrument = new Instrument(player, item);
      newRows.push(new Row(instrument, this._gridLength()));
    }
    this._rows.set(newRows);
  }

  async loadSequence(sequenceFile = 'assets/data/seq-1.json'): Promise<void> {
    this.reset();
    const data = await firstValueFrom(this.http.get<SequenceData>(sequenceFile));
    const gridLength = parseInt(data.gridLength, 10);
    this._gridLength.set(gridLength);
    this.setTempo(data.tempo);

    const rows = this._rows();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < gridLength; j++) {
        if (data.rows[i][j] === '1') {
          rows[i].getBeats()[j].activate();
        } else {
          rows[i].getBeats()[j].deactivate();
        }
      }
    }
  }

  setTempo(newTempo: number): void {
    this._tempo.set(newTempo);
  }

  play(): void {
    this._playing = true;
    this.timers.add(this.playBeat(), this.beatDelay());
  }

  stop(): void {
    this._playing = false;
    this.timers.clear();
  }

  reset(): void {
    this.stop();
    this._currentBeat.set(0);
    for (const row of this._rows()) {
      row.reset();
    }
  }

  beatDelay(): number {
    return (1000 / (this._tempo() * 2)) * 60;
  }

  private playBeat(): () => void {
    return () => {
      if (this._currentBeat() >= this._gridLength()) {
        this._currentBeat.set(0);
      }
      const beat = this._currentBeat();
      for (const row of this._rows()) {
        row.playSound(beat);
      }
      this._currentBeat.update(b => b + 1);
      if (this._playing) {
        this.timers.add(this.playBeat(), this.beatDelay());
      }
    };
  }
}
