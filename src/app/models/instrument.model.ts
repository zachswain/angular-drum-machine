import { Howl } from 'howler';

export class Instrument {
  private readonly audioPlayer: Howl;
  private readonly name: string;
  private readonly description: string;

  constructor(player: Howl, data: { name: string; description?: string }) {
    this.audioPlayer = player;
    this.name = data.name;
    this.description = data.description ?? '';
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  play(): boolean {
    try {
      this.audioPlayer.play();
      return true;
    } catch (e) {
      console.log('Unable to play sound', e);
      return false;
    }
  }
}
