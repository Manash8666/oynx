import type { ContextKeyStore } from './context-store.js';

export class WhenExpressionEvaluator {
  private static compiledCache = new Map<string, (ctx: Record<string, unknown>) => boolean>();

  public static evaluate(expression: string | undefined, store: ContextKeyStore): boolean {
    if (!expression || expression.trim() === '' || expression.trim() === 'always' || expression.trim() === 'true') {
      return true;
    }

    const trimmed = expression.trim();
    let fn = this.compiledCache.get(trimmed);

    if (!fn) {
      fn = this.compile(trimmed);
      this.compiledCache.set(trimmed, fn);
    }

    try {
      return fn(store.getSnapshot());
    } catch {
      return false;
    }
  }

  public static calculateSpecificity(expression?: string): number {
    if (!expression || expression === 'always') return 0;
    // Count clauses and operators
    const tokens = expression.split(/(&&|\|\|)/);
    return tokens.length * 10;
  }

  public static compile(expression: string): (ctx: Record<string, unknown>) => boolean {
    // Break into OR groups: A || B
    const orGroups = expression.split(/\s*\|\|\s*/);

    return (ctx: Record<string, unknown>) => {
      // If any OR group passes, whole expression passes
      return orGroups.some((group) => {
        // Break into AND terms: A && B
        const andTerms = group.split(/\s*&&\s*/);
        return andTerms.every((term) => WhenExpressionEvaluator.evaluateTerm(term.trim(), ctx));
      });
    };
  }

  private static evaluateTerm(term: string, ctx: Record<string, unknown>): boolean {
    if (!term) return true;

    // Negation: !term
    if (term.startsWith('!')) {
      return !this.evaluateTerm(term.substring(1).trim(), ctx);
    }

    // Regex match: key =~ /pattern/
    const regexMatch = term.match(/^([a-zA-Z0-9_$.]+)\s*=~\s*\/(.*)\/([a-z]*)$/);
    if (regexMatch) {
      const val = String(ctx[regexMatch[1]] ?? '');
      try {
        const regex = new RegExp(regexMatch[2], regexMatch[3]);
        return regex.test(val);
      } catch {
        return false;
      }
    }

    // Equality: key == 'val' or key == true
    const eqMatch = term.match(/^([a-zA-Z0-9_$.]+)\s*==\s*['"]?([^'"]+)['"]?$/);
    if (eqMatch) {
      const val = ctx[eqMatch[1]];
      const target = eqMatch[2];
      if (target === 'true') return val === true;
      if (target === 'false') return val === false;
      return String(val ?? '') === target;
    }

    // Inequality: key != 'val'
    const neqMatch = term.match(/^([a-zA-Z0-9_$.]+)\s*!=\s*['"]?([^'"]+)['"]?$/);
    if (neqMatch) {
      const val = ctx[neqMatch[1]];
      const target = neqMatch[2];
      if (target === 'true') return val !== true;
      if (target === 'false') return val !== false;
      return String(val ?? '') !== target;
    }

    // In operator: 'val' in key or key in list
    const inMatch = term.match(/^['"]?([^'"]+)['"]?\s+in\s+([a-zA-Z0-9_$.]+)$/);
    if (inMatch) {
      const item = inMatch[1];
      const collection = ctx[inMatch[2]];
      if (Array.isArray(collection)) return collection.includes(item);
      if (typeof collection === 'string') return collection.includes(item);
      return false;
    }

    // Simple Boolean Identifier: e.g. "editorTextFocus"
    return Boolean(ctx[term]);
  }
}
