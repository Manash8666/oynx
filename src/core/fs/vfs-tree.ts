import { createHash } from 'crypto';
import type { SelectedResourceHandle, VfsNode } from './types.js';

export class VfsTree {
  private root: VfsNode;

  constructor(rootPath = '/') {
    this.root = {
      name: 'root',
      path: rootPath,
      isDirectory: true,
      size: 0,
      children: new Map(),
    };
  }

  public getRoot(): VfsNode {
    return this.root;
  }

  public addResource(handle: SelectedResourceHandle, content?: string | Buffer): VfsNode {
    const parts = handle.path.replace(/\\/g, '/').split('/').filter(Boolean);
    let current = this.root;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current.children) current.children = new Map();

      let child = current.children.get(part);
      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          isDirectory: true,
          size: 0,
          children: new Map(),
        };
        current.children.set(part, child);
      }
      current = child;
    }

    if (!current.children) current.children = new Map();

    const hash = content
      ? createHash('md5').update(content).digest('hex')
      : undefined;

    const fileNode: VfsNode = {
      name: handle.name,
      path: handle.path,
      isDirectory: handle.isDirectory,
      size: handle.size,
      kind: handle.kind,
      mimeType: handle.mimeType,
      hash,
    };

    current.children.set(handle.name, fileNode);
    return fileNode;
  }

  public findNode(path: string): VfsNode | undefined {
    const normalized = path.replace(/\\/g, '/');
    const parts = normalized.split('/').filter(Boolean);
    let current = this.root;

    for (const part of parts) {
      if (!current.children) return undefined;
      const child = current.children.get(part);
      if (!child) return undefined;
      current = child;
    }
    return current;
  }
}
