import type { GhostTextProposal } from '../../core/completion/types.js';

export class GhostTextController {
  private activeProposal: GhostTextProposal | null = null;
  private acceptedWords = 0;

  public setProposal(proposal: GhostTextProposal | null): void {
    this.activeProposal = proposal;
    this.acceptedWords = 0;
  }

  public getActiveProposal(): GhostTextProposal | null {
    return this.activeProposal;
  }

  public getVisibleGhostText(): string {
    if (!this.activeProposal) return '';
    const words = this.activeProposal.completionText.split(/(\s+)/);
    return words.slice(this.acceptedWords).join('');
  }

  public handleKeyDown(event: {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
  }): { handled: boolean; acceptedText?: string } {
    if (!this.activeProposal) return { handled: false };

    // Tab: accept full suggestion
    if (event.key === 'Tab') {
      const fullText = this.activeProposal.completionText;
      this.activeProposal = null;
      return { handled: true, acceptedText: fullText };
    }

    // Cmd+Right or Ctrl+Right: accept word-by-word
    if (event.key === 'ArrowRight' && (event.ctrlKey || event.metaKey)) {
      const words = this.activeProposal.completionText.split(/(\s+)/);
      if (this.acceptedWords < words.length) {
        const nextWord = words[this.acceptedWords];
        this.acceptedWords++;
        if (this.acceptedWords >= words.length) {
          this.activeProposal = null;
        }
        return { handled: true, acceptedText: nextWord };
      }
    }

    // Esc: dismiss
    if (event.key === 'Escape') {
      this.activeProposal = null;
      return { handled: true };
    }

    return { handled: false };
  }
}
