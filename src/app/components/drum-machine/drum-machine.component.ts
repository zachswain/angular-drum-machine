import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DrumMachineService } from '../../services/drum-machine.service';

@Component({
  selector: 'app-drum-machine',
  imports: [MatButtonModule, MatSliderModule, MatProgressSpinnerModule],
  templateUrl: './drum-machine.component.html',
  styleUrl: './drum-machine.component.scss',
})
export class DrumMachineComponent implements OnInit {
  protected readonly loading = signal(true);
  protected isPlaying = false;

  protected readonly machine: DrumMachineService;

  constructor(machine: DrumMachineService) {
    this.machine = machine;
  }

  async ngOnInit(): Promise<void> {
    await this.machine.loadInstruments();
    await this.machine.loadSequence();
    this.loading.set(false);
  }

  play(): void {
    if (!this.isPlaying) {
      this.machine.play();
      this.isPlaying = true;
    }
  }

  stop(): void {
    this.isPlaying = false;
    this.machine.stop();
  }

  reset(): void {
    this.isPlaying = false;
    this.machine.reset();
  }

  updateTempo(value: number): void {
    this.machine.setTempo(value);
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
