import { open, rename, unlink, stat } from 'fs/promises';
import { dirname, join, basename } from 'path';
import { randomUUID } from 'crypto';

export class AtomicWriter {
  public static async writeAtomic(
    targetPath: string,
    content: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<void> {
    const dir = dirname(targetPath);
    const base = basename(targetPath);
    const tmpPath = join(dir, `.${base}.${randomUUID()}.tmp`);

    let existingMode: number | undefined;
    try {
      const stats = await stat(targetPath);
      existingMode = stats.mode;
    } catch {
      // File doesn't exist yet
    }

    let fileHandle;
    try {
      fileHandle = await open(tmpPath, 'w', existingMode ?? 0o666);
      await fileHandle.writeFile(content, encoding);
      await fileHandle.sync(); // fsync physical storage
      await fileHandle.close();
      fileHandle = undefined;

      // Atomic rename
      await rename(tmpPath, targetPath);
    } catch (err: unknown) {
      if (fileHandle) {
        try {
          await fileHandle.close();
        } catch {
          // ignore
        }
      }
      try {
        await unlink(tmpPath);
      } catch {
        // ignore
      }
      throw err;
    }
  }
}
