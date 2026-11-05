import { EventEmitter } from 'events';
import type { TimelineTurn } from './types.js';

export class TimelineUiState extends EventEmitter {
  private turns: TimelineTurn[] = [];
  private activeTurnIndex = -1;

  public addTurn(turn: TimelineTurn): void {
    this.turns.push(turn);
    this.activeTurnIndex = this.turns.length - 1;
    this.emit('turnAdded', turn);
    this.emit('stateChanged', this.getSnapshot());
  }

  public updateTurnStatus(turnId: string, status: TimelineTurn['status']): void {
    const turn = this.turns.find((t) => t.turnId === turnId);
    if (turn) {
      turn.status = status;
      this.emit('turnUpdated', turn);
      this.emit('stateChanged', this.getSnapshot());
    }
  }

  public scrubTo(index: number): TimelineTurn | undefined {
    if (index >= 0 && index < this.turns.length) {
      this.activeTurnIndex = index;
      const turn = this.turns[index];
      this.emit('scrubbed', { index, turn });
      this.emit('stateChanged', this.getSnapshot());
      return turn;
    }
    return undefined;
  }

  public getSnapshot() {
    return {
      turns: [...this.turns],
      activeTurnIndex: this.activeTurnIndex,
      activeTurn: this.turns[this.activeTurnIndex],
    };
  }

  public clear(): void {
    this.turns = [];
    this.activeTurnIndex = -1;
  }
}
