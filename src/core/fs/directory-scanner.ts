import { EventEmitter } from 'events';
import { readdir, stat, open } from 'fs/promises';
import { join, extname } from 'path';
import type { FileKind, IngestionProgressEvent, SelectedResourceHandle } from './types.js';

export class DirectoryScanner extends EventEmitter {
  private blacklistedDirs = new Set([
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    '.turbo',
    '.onyx',
  ]);

  private textExtensions = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.scss',
    '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.sh', '.yaml', '.yml',
    '.toml', '.txt', '.svg', '.xml', '.sql', '.env', '.gitignore'
  ]);

  private multimodalExtensions = new Set([
    '.mp4', '.webm', '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.mp3', '.wav'
  ]);

  public detectKind(filePath: string, sizeBytes: number): FileKind {
    const ext = extname(filePath).toLowerCase();
    if (this.multimodalExtensions.has(ext)) {
      return 'MULTIMODAL_MEDIA';
    }
    if (this.textExtensions.has(ext)) {
      return 'READABLE_TEXT';
    }
    return 'BINARY_ASSET';
  }

  public async scanDirectory(
    rootPath: string,
    abortSignal?: AbortSignal
  ): Promise<SelectedResourceHandle[]> {
    const results: SelectedResourceHandle[] = [];
    let filesScanned = 0;
    let bytesProcessed = 0;

    const traverse = async (currentDir: string) => {
      if (abortSignal?.aborted) {
        throw new Error('Directory scan aborted by user');
      }

      let entries;
      try {
        entries = await readdir(currentDir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (abortSignal?.aborted) return;

        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!this.blacklistedDirs.has(entry.name)) {
            await traverse(fullPath);
          }
        } else if (entry.isFile()) {
          try {
            const stats = await stat(fullPath);
            const size = stats.size;
            const kind = this.detectKind(fullPath, size);

            // Skip non-multimodal binaries larger than 10MB
            if (size > 10 * 1024 * 1024 && kind !== 'MULTIMODAL_MEDIA') {
              continue;
            }

            filesScanned++;
            bytesProcessed += size;

            const handle: SelectedResourceHandle = {
              path: fullPath,
              name: entry.name,
              size,
              isDirectory: false,
              kind,
              mimeType: this.guessMimeType(entry.name),
            };

            results.push(handle);

            if (filesScanned % 50 === 0) {
              const progress: IngestionProgressEvent = {
                filesScanned,
                bytesProcessed,
                currentPath: fullPath,
              };
              this.emit('progress', progress);
            }
          } catch {
            // ignore unreadable
          }
        }
      }
    };

    await traverse(rootPath);
    return results;
  }

  private guessMimeType(fileName: string): string {
    const ext = extname(fileName).toLowerCase();
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'text/typescript';
      case '.js':
      case '.jsx':
        return 'text/javascript';
      case '.json':
        return 'application/json';
      case '.pdf':
        return 'application/pdf';
      case '.mp4':
        return 'video/mp4';
      case '.png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
}
