export interface VideoKeyframe {
  frameIndex: number;
  timestampMs: number;
  imageBuffer: Buffer;
  filePath?: string;
  sceneScore: number;
}

export interface VideoSplitResult {
  keyframes: VideoKeyframe[];
  audioTrackPath?: string;
  audioBuffer?: Buffer;
  durationSeconds: number;
  tempDir: string;
  cleanup: () => Promise<void>;
}

export interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  matchedSymbols?: string[];
}

export interface AudioTranscriptionResult {
  fullText: string;
  segments: TranscriptSegment[];
  biasedSymbolsFound: string[];
}

export interface AudioTranscriberOptions {
  model?: 'local-whisper' | 'cloud-whisper' | 'openai';
  vocabularyBias?: string[];
  language?: string;
}

export interface TableStructure {
  headers: string[];
  rows: string[][];
}

export interface PdfSection {
  title: string;
  content: string;
  tables: TableStructure[];
  pageNumber: number;
}

export interface PdfParseResult {
  markdownAst: string;
  sections: PdfSection[];
  tablesExtracted: number;
  rawTextLength: number;
}

export interface MultimodalContextPayload {
  sourceId: string;
  timestamp: number;
  videoFrames: Array<{
    timestampMs: number;
    base64Jpeg: string;
    sceneScore: number;
  }>;
  transcript: {
    text: string;
    segments: TranscriptSegment[];
    biasedSymbols: string[];
  };
  documents: Array<{
    title: string;
    markdownAst: string;
  }>;
  summary: string;
}
