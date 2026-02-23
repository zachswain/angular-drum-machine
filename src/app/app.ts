import { Component } from '@angular/core';
import { DrumMachineComponent } from './components/drum-machine/drum-machine.component';

@Component({
  selector: 'app-root',
  imports: [DrumMachineComponent],
  template: '<app-drum-machine />',
  styles: [],
})
export class App {}
