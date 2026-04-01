import type { Grammar } from '../grammar/types';
export function grammarToString(grammar: Grammar): string {
  if (!grammar || grammar.productions.length === 0) {
    return '(empty grammar)';
  }
  return grammar.productions
    .map(rule => {
      const bodyStr = rule.isEpsilon
        ? 'ε'
        : rule.body.map(sym => sym.value).join(' ');
      return `${rule.head} → ${bodyStr}`;
    })
    .join('\n');
}
export function productionToString(
  head: string,
  body: Array<{ value: string }>,
  isEpsilon: boolean,
): string {
  if (isEpsilon) {
    return `${head} → ε`;
  }
  const bodyStr = body.map(sym => sym.value).join(' ');
  return `${head} → ${bodyStr}`;
}

