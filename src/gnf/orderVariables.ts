import { cloneGrammar } from '../grammar/types';
import type { Grammar, Diff } from '../grammar/types';
export function orderVariables(grammar: Grammar): { grammar: Grammar; diffs: Diff[]; ordering: string[] } {
  const ordering: string[] = [grammar.start];
  const rest = [...grammar.nonTerminals]
    .filter(v => v !== grammar.start)
    .sort();
  ordering.push(...rest);
  const diffs: Diff[] = grammar.productions.map(r => ({
    type: 'keep' as const,
    rule: r,
    reason: `Assigned to ordering position A${ordering.indexOf(r.head) + 1}`,
  }));
  return { grammar: cloneGrammar(grammar), diffs, ordering };
}

