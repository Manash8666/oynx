import { EventEmitter } from 'events';
import type { MeshContextPayload, TeamMemoryResolution } from './types.js';

export class ProtocolSync extends EventEmitter {
  private memoryResolutions = new Map<string, TeamMemoryResolution>(); // errorSignature -> resolution
  private astIndexHashes = new Map<string, string>(); // filePath -> hash

  public recordResolution(resolution: TeamMemoryResolution): void {
    this.memoryResolutions.set(resolution.errorSignature, resolution);
    this.emit('resolutionAdded', resolution);
  }

  public queryResolution(errorSignature: string): TeamMemoryResolution | undefined {
    return this.memoryResolutions.get(errorSignature);
  }

  public updateAstHash(filePath: string, hash: string): void {
    this.astIndexHashes.set(filePath, hash);
  }

  public getAstHash(filePath: string): string | undefined {
    return this.astIndexHashes.get(filePath);
  }

  public createSyncPayload(workspaceFingerprint: string): MeshContextPayload {
    const resolutions: Record<string, unknown> = {};
    for (const [k, v] of this.memoryResolutions.entries()) {
      resolutions[k] = v;
    }
    return {
      type: 'ERROR_RECIPE',
      workspaceFingerprint,
      data: resolutions,
    };
  }

  public applySyncPayload(payload: MeshContextPayload): void {
    if (payload.type === 'ERROR_RECIPE') {
      for (const [k, v] of Object.entries(payload.data)) {
        this.memoryResolutions.set(k, v as TeamMemoryResolution);
      }
    }
  }
}
