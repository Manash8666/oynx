import { createHash } from 'crypto';
import type { PeerIdentity } from './types.js';

export class LocalPeerDiscovery {
  private workspaceFingerprint: string;
  private knownPeers = new Map<string, PeerIdentity>();

  constructor(repoOriginUrl: string, rootCommitHash: string) {
    this.workspaceFingerprint = createHash('sha256')
      .update(`${repoOriginUrl}:${rootCommitHash}`)
      .digest('hex')
      .substring(0, 16);
  }

  public getWorkspaceFingerprint(): string {
    return this.workspaceFingerprint;
  }

  public registerPeer(peer: PeerIdentity): boolean {
    // Strictly accept only peers matching the same workspace fingerprint
    if (peer.workspaceFingerprint !== this.workspaceFingerprint) {
      return false;
    }
    this.knownPeers.set(peer.peerId, peer);
    return true;
  }

  public getPeers(): PeerIdentity[] {
    return Array.from(this.knownPeers.values());
  }

  public removePeer(peerId: string): void {
    this.knownPeers.delete(peerId);
  }
}
