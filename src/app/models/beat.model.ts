export class Beat {
  private active = false;

  isActive(): boolean {
    return this.active;
  }

  activate(): void {
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }

  toggle(): void {
    this.active = !this.active;
  }
}
