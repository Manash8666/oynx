import { EventEmitter } from 'events';
import { LocalPeerDiscovery } from './discovery.js';
import { CryptoVault } from './crypto-vault.js';
import { ProtocolSync } from './protocol-sync.js';
import type { PeerIdentity, TeamMemoryResolution } from './types.js';

export class P2PNode extends EventEmitter {
  public readonly peerId: string;
  private discovery: LocalPeerDiscovery;
  private vault: CryptoVault;
  private sync: ProtocolSync;

  constructor(repoOrigin: string, rootCommit: string, sharedKey?: Buffer) {
    super();
    this.peerId = `peer_${Math.random().toString(36).substring(2, 9)}`;
    this.discovery = new LocalPeerDiscovery(repoOrigin, rootCommit);
    this.vault = new CryptoVault(sharedKey);
    this.sync = new ProtocolSync();
  }

  public getDiscovery(): LocalPeerDiscovery {
    return this.discovery;
  }

  public getSync(): ProtocolSync {
    return this.sync;
  }

  public getVault(): CryptoVault {
    return this.vault;
  }

  public getIdentity(): PeerIdentity {
    return {
      peerId: this.peerId,
      publicKey: this.vault.getKey().toString('hex'),
      workspaceFingerprint: this.discovery.getWorkspaceFingerprint(),
      address: '127.0.0.1:9090',
      lastSeen: Date.now(),
    };
  }

  public queryTeamMemory(errorSignature: string): TeamMemoryResolution | undefined {
    return this.sync.queryResolution(errorSignature);
  }

  public shareResolution(errorSignature: string, patchDiff: string): void {
    this.sync.recordResolution({
      errorSignature,
      patchDiff,
      solvedByPeerId: this.peerId,
      timestamp: Date.now(),
    });
  }

  public transmitEncryptedPayload(targetNode: P2PNode): void {
    const rawPayload = JSON.stringify(
      this.sync.createSyncPayload(this.discovery.getWorkspaceFingerprint())
    );
    // Encrypt over wire
    const encrypted = this.vault.encrypt(rawPayload);

    // Target decrypts with matching shared session key
    const decrypted = targetNode.getVault().decrypt(encrypted);
    targetNode.getSync().applySyncPayload(JSON.parse(decrypted));
  }
}
