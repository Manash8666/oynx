export class AnsiCleaner {
  // Comprehensive ANSI escape code regex including color, cursor movement, modes, and OSC strings
  private static readonly ANSI_REGEX = new RegExp(
    [
      '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
      '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
    ].join('|'),
    'g'
  );

  private static readonly OSC_REGEX = /\x1B\][^\x07\x1B]*[\x07\x1B\\]/g;

  public static clean(text: string): string {
    if (!text) return '';
    return text
      .replace(this.OSC_REGEX, '')
      .replace(this.ANSI_REGEX, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');
  }

  public static splitLinesAndClean(text: string): { cleanLines: string[]; cleanText: string } {
    const cleanText = this.clean(text);
    const cleanLines = cleanText.split('\n');
    return { cleanLines, cleanText };
  }
}
