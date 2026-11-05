export type FileKind = 'READABLE_TEXT' | 'BINARY_ASSET' | 'MULTIMODAL_MEDIA';

export interface VfsNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  kind?: FileKind;
  mimeType?: string;
  hash?: string;
  children?: Map<string, VfsNode>;
}

export interface IngestionProgressEvent {
  filesScanned: number;
  bytesProcessed: number;
  currentPath: string;
}

export interface SelectedResourceHandle {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  kind: FileKind;
  mimeType: string;
}
