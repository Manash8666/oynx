export interface PeerIdentity {
  peerId: string;
  publicKey: string;
  workspaceFingerprint: string;
  address: string;
  lastSeen: number;
}

export interface TeamMemoryResolution {
  errorSignature: string;
  patchDiff: string;
  solvedByPeerId: string;
  timestamp: number;
}

export interface MeshContextPayload {
  type: 'AST_INDEX_HASH' | 'ERROR_RECIPE' | 'ENV_SCHEMA';
  workspaceFingerprint: string;
  data: Record<string, unknown>;
}
