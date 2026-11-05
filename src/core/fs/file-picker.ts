import type { SelectedResourceHandle } from './types.js';

export class FilePicker {
  public static async pickDirectory(): Promise<SelectedResourceHandle[]> {
    // If in browser with File System Access API
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<unknown> }).showDirectoryPicker();
        return [{
          path: (dirHandle as { name: string }).name,
          name: (dirHandle as { name: string }).name,
          size: 0,
          isDirectory: true,
          kind: 'READABLE_TEXT',
          mimeType: 'inode/directory',
        }];
      } catch {
        return [];
      }
    }

    // Default return empty in node/headless environment
    return [];
  }

  public static async pickFiles(multiple = true): Promise<SelectedResourceHandle[]> {
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      try {
        const fileHandles = await (window as unknown as { showOpenFilePicker: (opt: { multiple: boolean }) => Promise<unknown[]> }).showOpenFilePicker({ multiple });
        return fileHandles.map((h) => ({
          path: (h as { name: string }).name,
          name: (h as { name: string }).name,
          size: 0,
          isDirectory: false,
          kind: 'READABLE_TEXT',
          mimeType: 'text/plain',
        }));
      } catch {
        return [];
      }
    }
    return [];
  }
}
