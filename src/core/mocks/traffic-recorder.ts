import type { RecordedNetworkCall } from './types.js';

export class TrafficRecorder {
  private buffer: RecordedNetworkCall[] = [];
  private staticAssetExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.css', '.js', '.woff', '.woff2', '.ttf', '.ico'
  ]);

  public recordCall(call: RecordedNetworkCall): boolean {
    const urlObj = new URL(call.url, 'http://localhost');
    const pathname = urlObj.pathname.toLowerCase();

    // Filter out static assets
    for (const ext of this.staticAssetExtensions) {
      if (pathname.endsWith(ext)) {
        return false;
      }
    }

    this.buffer.push(call);
    return true;
  }

  public getCalls(): RecordedNetworkCall[] {
    return [...this.buffer];
  }

  public clear(): void {
    this.buffer = [];
  }
}
