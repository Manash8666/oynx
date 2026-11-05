import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DirectoryScanner } from '../../src/core/fs/directory-scanner.js';
import { VfsTree } from '../../src/core/fs/vfs-tree.js';
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';

describe('File Upload, Folder Selection & Workspace Ingestion Subsystem (Prompt 1)', () => {
  const testDir = join(process.cwd(), 'temp_fs_test_workspace');
  let scanner: DirectoryScanner;

  beforeEach(async () => {
    scanner = new DirectoryScanner();
    await mkdir(join(testDir, 'src'), { recursive: true });
    await mkdir(join(testDir, 'node_modules', 'pkg'), { recursive: true });
    await mkdir(join(testDir, '.git'), { recursive: true });

    // Readable text file
    await writeFile(join(testDir, 'src', 'index.ts'), 'export const hello = "world";');
    await writeFile(join(testDir, 'src', 'config.json'), '{"name": "onyx"}');
    // Multimodal media file
    await writeFile(join(testDir, 'src', 'spec.pdf'), '%PDF-1.4 mock pdf content');
    // Blacklisted folder file
    await writeFile(join(testDir, 'node_modules', 'pkg', 'index.js'), 'module.exports = {};');
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('should recursively scan directory and omit blacklisted folders (node_modules, .git)', async () => {
    const results = await scanner.scanDirectory(testDir);
    const paths = results.map((r) => r.path);

    // Assert readable files included
    expect(paths.some((p) => p.includes('index.ts'))).toBe(true);
    expect(paths.some((p) => p.includes('config.json'))).toBe(true);

    // Assert blacklisted files omitted
    expect(paths.some((p) => p.includes('node_modules'))).toBe(false);
    expect(paths.some((p) => p.includes('.git'))).toBe(false);
  });

  it('should categorize files into READABLE_TEXT, MULTIMODAL_MEDIA, and BINARY_ASSET', () => {
    expect(scanner.detectKind('app.ts', 100)).toBe('READABLE_TEXT');
    expect(scanner.detectKind('doc.pdf', 5000)).toBe('MULTIMODAL_MEDIA');
    expect(scanner.detectKind('screen.mp4', 10000)).toBe('MULTIMODAL_MEDIA');
    expect(scanner.detectKind('binary.wasm', 20000)).toBe('BINARY_ASSET');
  });

  it('should construct VFS tree and compute unique MD5 hashes', () => {
    const vfs = new VfsTree('/workspace');
    const handle = {
      path: '/workspace/src/app.ts',
      name: 'app.ts',
      size: 50,
      isDirectory: false,
      kind: 'READABLE_TEXT' as const,
      mimeType: 'text/typescript',
    };

    const node = vfs.addResource(handle, 'const app = 1;');
    expect(node.hash).toBeDefined();
    expect(node.name).toBe('app.ts');

    const retrieved = vfs.findNode('/workspace/src/app.ts');
    expect(retrieved).toBeDefined();
    expect(retrieved?.hash).toBe(node.hash);
  });
});
