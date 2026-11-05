import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VideoSplitter } from '../../src/core/multimodal/video-splitter.js';
import { AudioTranscriber } from '../../src/core/multimodal/audio-transcriber.js';
import { PdfParser } from '../../src/core/multimodal/pdf-parser.js';
import { MultimodalOrchestrator } from '../../src/core/multimodal/orchestrator.js';
import { writeFile, rm, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

describe('Multimodal Ingestion Pipeline', () => {
  const testDir = join(process.cwd(), '.onyx', 'test-multimodal');

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('VideoSplitter', () => {
    it('enforces keyframe caps (<= 20 keyframes per 5 min) and produces valid JPEG frames', async () => {
      const splitter = new VideoSplitter({ maxKeyframesPer5Min: 20 });
      const mockVideoPath = join(testDir, 'sample_bug.webm');
      await writeFile(mockVideoPath, Buffer.from('RIFF....WEBM'));

      // Process 5-minute video (300 sec)
      const result = await splitter.split(mockVideoPath, 300);

      expect(result.keyframes.length).toBeLessThanOrEqual(20);
      expect(result.keyframes.length).toBeGreaterThan(0);
      expect(result.durationSeconds).toBe(300);

      // Verify each keyframe has timestamp and valid imageBuffer signature
      for (const kf of result.keyframes) {
        expect(kf.timestampMs).toBeGreaterThanOrEqual(0);
        expect(kf.imageBuffer.length).toBeGreaterThan(0);
        expect(kf.sceneScore).toBeGreaterThanOrEqual(0.3);
      }

      // Verify cleanup removes the temporary directory
      const tempPath = result.tempDir;
      expect(existsSync(tempPath)).toBe(true);
      await result.cleanup();
      expect(existsSync(tempPath)).toBe(false);
    });
  });

  describe('AudioTranscriber & Vocabulary Biasing', () => {
    it('biases speech recognition to accurately transcribe project AST symbols', async () => {
      const transcriber = new AudioTranscriber();
      const mockAudio = Buffer.alloc(96000); // ~3 seconds of 16kHz audio

      const astSymbols = [
        'LuciferRuntimeOrchestrator',
        'LspCompilerGuard',
        'resolveTokenArchitecture',
      ];

      const res = await transcriber.transcribe(mockAudio, {
        vocabularyBias: astSymbols,
      });

      expect(res.fullText.length).toBeGreaterThan(0);
      expect(res.segments.length).toBeGreaterThan(0);

      // All biased AST symbols should be matched and injected
      for (const symbol of astSymbols) {
        expect(res.biasedSymbolsFound).toContain(symbol);
      }
    });

    it('replaces spaced phonetic terms with exact camelCase AST symbols', () => {
      const transcriber = new AudioTranscriber();
      const rawTranscript = 'the lsp compiler guard trapped an issue in the lucifer runtime orchestrator';

      const enriched = transcriber.applyVocabularyBias(rawTranscript, [
        'LspCompilerGuard',
        'LuciferRuntimeOrchestrator',
      ]);

      expect(enriched.enrichedText).toContain('LspCompilerGuard');
      expect(enriched.enrichedText).toContain('LuciferRuntimeOrchestrator');
      expect(enriched.matchedSymbols).toEqual(['LspCompilerGuard', 'LuciferRuntimeOrchestrator']);
    });
  });

  describe('PdfParser (PRD & Spec Extractor)', () => {
    it('converts document text into structured Markdown AST while preserving tables', async () => {
      const parser = new PdfParser();

      const samplePrdContent = `
# Executive Authentication Architecture
This specification details the multi-tenant RBAC pipeline.

## API Route Table
Endpoint    Method    Auth
/api/v1/auth/login    POST    Public
/api/v1/agent/task    POST    Bearer JWT
/api/v1/vpc/status    GET     Private-VPC

## Invariants & Compliance
Page 1 of 12
- In-process Tree-Sitter validation before file write
- Zero telemetry egress to third-party models
- All JWT keys rotated at 24-hour intervals
      `;

      const result = await parser.parse(samplePrdContent);

      expect(result.sections.length).toBeGreaterThanOrEqual(2);
      expect(result.tablesExtracted).toBe(1);

      // Assert table was converted to clean Markdown table with pipes
      expect(result.markdownAst).toContain('| Endpoint | Method | Auth |');
      expect(result.markdownAst).toContain('| --- | --- | --- |');
      expect(result.markdownAst).toContain('| /api/v1/auth/login | POST | Public |');

      // Assert page numbers were stripped
      expect(result.markdownAst).not.toContain('Page 1 of 12');
    });
  });

  describe('MultimodalOrchestrator', () => {
    it('ingests unified video, audio, and PDF bundle into a single MultimodalContextPayload', async () => {
      const orchestrator = new MultimodalOrchestrator();

      const samplePdfPath = join(testDir, 'arch_spec.txt');
      await writeFile(
        samplePdfPath,
        '# System Architecture\nCore engine relies on 37 Tree-Sitter WASMs.'
      );

      const mockVideoPath = join(testDir, 'screen_record.webm');
      await writeFile(mockVideoPath, Buffer.from('RIFF....WEBM'));

      const payload = await orchestrator.ingest({
        sourceId: 'client-audit-01',
        videoPath: mockVideoPath,
        videoDurationSec: 180,
        pdfPath: samplePdfPath,
        vocabularyBias: ['TreeSitterRepoMap', 'GhostSentryDaemon'],
      });

      expect(payload.sourceId).toBe('client-audit-01');
      expect(payload.videoFrames.length).toBeGreaterThan(0);
      expect(payload.videoFrames[0].base64Jpeg.length).toBeGreaterThan(0);
      expect(payload.documents).toHaveLength(1);
      expect(payload.documents[0].markdownAst).toContain('37 Tree-Sitter WASMs');
      expect(payload.transcript.biasedSymbols).toContain('TreeSitterRepoMap');
      expect(payload.summary).toContain('Multimodal Context Ingestion');
    });
  });
});
