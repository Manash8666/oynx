import { describe, it, expect } from 'vitest';
import { P2PNode } from '../../src/core/mesh/p2p-node.js';
import { randomBytes } from 'crypto';

describe('P2P Local Brain & Team Memory Mesh (Unique to Onyx)', () => {
  it('should discover peers matching workspace fingerprint and reject foreign repositories', () => {
    const origin = 'https://github.com/myorg/onyx-app.git';
    const commit = 'c5dbabc1234567890';

    const nodeA = new P2PNode(origin, commit);
    const nodeB = new P2PNode(origin, commit);
    const foreignNode = new P2PNode('https://github.com/other/other-app.git', '999999999');

    // Node A discovers Node B (same repo) -> accepted
    const acceptedB = nodeA.getDiscovery().registerPeer(nodeB.getIdentity());
    expect(acceptedB).toBe(true);

    // Node A discovers foreignNode (different repo) -> rejected
    const acceptedForeign = nodeA.getDiscovery().registerPeer(foreignNode.getIdentity());
    expect(acceptedForeign).toBe(false);
  });

  it('should negotiate encrypted channel and share resolved bug fix recipe across machines', () => {
    const origin = 'https://github.com/myorg/onyx-app.git';
    const commit = 'c5dbabc1234567890';
    const sharedSessionKey = randomBytes(32);

    const nodeA = new P2PNode(origin, commit, sharedSessionKey);
    const nodeB = new P2PNode(origin, commit, sharedSessionKey);

    // Node B solves a compiler error and shares it to mesh
    const errorSig = 'TS2304: Cannot find name UndefinedError';
    const patchDiff = '--- a/src/bad.ts\n+++ b/src/bad.ts\n- throw new UndefinedError();\n+ throw new Error("resolved");';
    nodeB.shareResolution(errorSig, patchDiff);

    // Node B transmits encrypted payload to Node A
    nodeB.transmitEncryptedPayload(nodeA);

    // Node A queries team memory and retrieves resolution instantly without LLM
    const resolved = nodeA.queryTeamMemory(errorSig);
    expect(resolved).toBeDefined();
    expect(resolved?.patchDiff).toContain('throw new Error("resolved")');
    expect(resolved?.solvedByPeerId).toBe(nodeB.peerId);
  });
});
