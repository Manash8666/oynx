import { readFile } from 'fs/promises';
import type { PdfParseResult, PdfSection, TableStructure } from './types.js';

export class PdfParser {
  public async parse(input: Buffer | string): Promise<PdfParseResult> {
    let rawContent = '';

    if (Buffer.isBuffer(input)) {
      rawContent = this.extractTextFromPdfBuffer(input);
    } else if (typeof input === 'string') {
      try {
        const fileBuf = await readFile(input);
        rawContent = this.extractTextFromPdfBuffer(fileBuf);
      } catch {
        // If string is already raw text or markdown
        rawContent = input;
      }
    }

    // 1. Strip non-semantic vector binary artifacts, control characters and page numbers
    const sanitizedText = this.sanitizePdfText(rawContent);

    // 2. Extract and preserve tables as Markdown tables
    const { cleanedText, tables } = this.extractAndFormatTables(sanitizedText);

    // 3. Structure into Markdown AST sections
    const sections = this.buildSections(cleanedText, tables);

    // 4. Construct unified Markdown AST
    const markdownAst = this.compileToMarkdownAst(sections);

    return {
      markdownAst,
      sections,
      tablesExtracted: tables.length,
      rawTextLength: rawContent.length,
    };
  }

  private extractTextFromPdfBuffer(buffer: Buffer): string {
    const raw = buffer.toString('utf-8');

    // Extract text between PDF stream blocks if standard PDF
    const textChunks: string[] = [];
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(raw)) !== null) {
      const chunk = match[1];
      // Filter out non-ASCII binary streams
      const readable = chunk.replace(/[^\x20-\x7E\r\n\t]/g, ' ');
      if (readable.trim().length > 10) {
        textChunks.push(readable);
      }
    }

    if (textChunks.length > 0) {
      return textChunks.join('\n\n');
    }

    // Fallback: extract printable strings
    return raw.replace(/[^\x20-\x7E\r\n\t]/g, ' ');
  }

  private sanitizePdfText(text: string): string {
    return text
      // Remove page number footers like "Page 1 of 12" or "— 3 —"
      .replace(/Page\s+\d+\s+of\s+\d+/gi, '')
      .replace(/^[—–-]\s*\d+\s*[—–-]$/gm, '')
      // Remove binary/PDF trailer artifacts
      .replace(/(?:xref|trailer|startxref|\/Root|\/Size|\/Info)[\s\S]*$/i, '')
      // Normalize vertical whitespace while preserving horizontal indentation/table columns
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private extractAndFormatTables(text: string): {
    cleanedText: string;
    tables: TableStructure[];
  } {
    const tables: TableStructure[] = [];
    const lines = text.split('\n');
    const resultLines: string[] = [];

    let currentTableRows: string[][] = [];
    let isInsideTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line looks like a tabular row (pipe separated or 3+ tabs/multiple col spaces)
      if (line.includes('|') && line.split('|').length >= 3) {
        const cells = line
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        if (cells.length >= 2) {
          isInsideTable = true;
          // Ignore divider lines like |---|---|
          if (!cells.every((c) => /^[-:]+$/.test(c))) {
            currentTableRows.push(cells);
          }
          continue;
        }
      }

      // Check for whitespace-aligned columns e.g. "Endpoint    Method    Auth"
      const colTokens = line.split(/\s{2,}/).filter(Boolean);
      if (colTokens.length >= 3 && !line.startsWith('#')) {
        isInsideTable = true;
        currentTableRows.push(colTokens);
        continue;
      }

      // End of table block reached
      if (isInsideTable) {
        if (currentTableRows.length >= 2) {
          const headers = currentTableRows[0];
          const rows = currentTableRows.slice(1);
          tables.push({ headers, rows });

          // Format as markdown table
          resultLines.push('');
          resultLines.push(`| ${headers.join(' | ')} |`);
          resultLines.push(`| ${headers.map(() => '---').join(' | ')} |`);
          for (const r of rows) {
            resultLines.push(`| ${r.join(' | ')} |`);
          }
          resultLines.push('');
        }
        currentTableRows = [];
        isInsideTable = false;
      }

      resultLines.push(lines[i]);
    }

    if (currentTableRows.length >= 2) {
      const headers = currentTableRows[0];
      const rows = currentTableRows.slice(1);
      tables.push({ headers, rows });
      resultLines.push('');
      resultLines.push(`| ${headers.join(' | ')} |`);
      resultLines.push(`| ${headers.map(() => '---').join(' | ')} |`);
      for (const r of rows) {
        resultLines.push(`| ${r.join(' | ')} |`);
      }
      resultLines.push('');
    }

    return {
      cleanedText: resultLines.join('\n'),
      tables,
    };
  }

  private buildSections(text: string, tables: TableStructure[]): PdfSection[] {
    const rawSections = text.split(/(?=^#{1,3}\s)/m);
    const sections: PdfSection[] = [];

    let pageNum = 1;
    for (let i = 0; i < rawSections.length; i++) {
      const sec = rawSections[i].trim();
      if (!sec) continue;

      const firstLineEnd = sec.indexOf('\n');
      const firstLine = firstLineEnd !== -1 ? sec.substring(0, firstLineEnd) : sec;
      const title = firstLine.replace(/^#{1,3}\s*/, '').trim() || `Section ${i + 1}`;
      const content = firstLineEnd !== -1 ? sec.substring(firstLineEnd).trim() : '';

      sections.push({
        title,
        content,
        tables: i === 0 ? tables : [],
        pageNumber: pageNum++,
      });
    }

    if (sections.length === 0) {
      sections.push({
        title: 'Document Specification',
        content: text,
        tables,
        pageNumber: 1,
      });
    }

    return sections;
  }

  private compileToMarkdownAst(sections: PdfSection[]): string {
    const blocks: string[] = [];

    for (const sec of sections) {
      blocks.push(`## ${sec.title}`);
      if (sec.content) {
        blocks.push(sec.content);
      }
      blocks.push('');
    }

    return blocks.join('\n\n').trim();
  }
}
