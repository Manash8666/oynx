import { VideoSplitter } from './video-splitter.js';
import { AudioTranscriber } from './audio-transcriber.js';
import { PdfParser } from './pdf-parser.js';
import type {
  MultimodalContextPayload,
  PdfParseResult,
  TranscriptSegment,
  VideoSplitResult,
} from './types.js';

export interface MediaIngestionBundle {
  sourceId?: string;
  videoPath?: string;
  videoDurationSec?: number;
  audioPath?: string;
  pdfPath?: string;
  rawText?: string;
  vocabularyBias?: string[];
}

export class MultimodalOrchestrator {
  private videoSplitter: VideoSplitter;
  private audioTranscriber: AudioTranscriber;
  private pdfParser: PdfParser;

  constructor(options: {
    videoSplitter?: VideoSplitter;
    audioTranscriber?: AudioTranscriber;
    pdfParser?: PdfParser;
  } = {}) {
    this.videoSplitter = options.videoSplitter || new VideoSplitter();
    this.audioTranscriber = options.audioTranscriber || new AudioTranscriber();
    this.pdfParser = options.pdfParser || new PdfParser();
  }

  public async ingest(bundle: MediaIngestionBundle): Promise<MultimodalContextPayload> {
    const sourceId = bundle.sourceId || `ingest-${Date.now()}`;
    const vocabBias = bundle.vocabularyBias || [];

    let videoResult: VideoSplitResult | null = null;
    let videoFrames: MultimodalContextPayload['videoFrames'] = [];
    let transcriptSegments: TranscriptSegment[] = [];
    let fullTranscriptText = '';
    let matchedSymbols: string[] = [];
    const documents: MultimodalContextPayload['documents'] = [];

    try {
      // 1. Process Video if present
      if (bundle.videoPath) {
        videoResult = await this.videoSplitter.split(
          bundle.videoPath,
          bundle.videoDurationSec || 300
        );

        videoFrames = videoResult.keyframes.map((kf) => ({
          timestampMs: kf.timestampMs,
          base64Jpeg: kf.imageBuffer.toString('base64'),
          sceneScore: kf.sceneScore,
        }));

        // If audio track was extracted from video, transcribe it
        if (videoResult.audioBuffer) {
          const audioRes = await this.audioTranscriber.transcribe(videoResult.audioBuffer, {
            vocabularyBias: vocabBias,
          });
          transcriptSegments = audioRes.segments;
          fullTranscriptText = audioRes.fullText;
          matchedSymbols = audioRes.biasedSymbolsFound;
        }
      }

      // 2. Process standalone Audio if provided
      if (bundle.audioPath) {
        const audioRes = await this.audioTranscriber.transcribe(bundle.audioPath, {
          vocabularyBias: vocabBias,
        });
        transcriptSegments = [...transcriptSegments, ...audioRes.segments];
        fullTranscriptText = fullTranscriptText
          ? `${fullTranscriptText} ${audioRes.fullText}`
          : audioRes.fullText;
        for (const sym of audioRes.biasedSymbolsFound) {
          if (!matchedSymbols.includes(sym)) matchedSymbols.push(sym);
        }
      }

      // 3. Process PDF Document if provided
      if (bundle.pdfPath) {
        const pdfRes = await this.pdfParser.parse(bundle.pdfPath);
        documents.push({
          title: 'Architecture & PRD Specification',
          markdownAst: pdfRes.markdownAst,
        });
      }

      // 4. Process Raw Text chunks if provided
      if (bundle.rawText) {
        documents.push({
          title: 'Context Notes & Annotations',
          markdownAst: bundle.rawText,
        });
      }

      // Synthesize clean summary
      const summary = this.buildContextSummary(
        videoFrames.length,
        fullTranscriptText,
        matchedSymbols,
        documents
      );

      return {
        sourceId,
        timestamp: Date.now(),
        videoFrames,
        transcript: {
          text: fullTranscriptText,
          segments: transcriptSegments,
          biasedSymbols: matchedSymbols,
        },
        documents,
        summary,
      };
    } finally {
      // Guaranteed cleanup of temporary files on exit or error
      if (videoResult) {
        await videoResult.cleanup();
      }
    }
  }

  private buildContextSummary(
    frameCount: number,
    transcript: string,
    symbols: string[],
    docs: Array<{ title: string; markdownAst: string }>
  ): string {
    const parts: string[] = [
      `Multimodal Context Ingestion: ${frameCount} keyframe(s) extracted`,
    ];

    if (transcript) {
      parts.push(`Transcription: ${transcript.length} chars`);
    }

    if (symbols.length > 0) {
      parts.push(`Matched AST Symbols: [${symbols.join(', ')}]`);
    }

    if (docs.length > 0) {
      parts.push(`Specifications: ${docs.length} document(s) compiled into Markdown AST`);
    }

    return parts.join(' | ');
  }
}
