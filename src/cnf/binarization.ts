import { makeRule, cloneGrammar } from '../grammar/types';
import type { Grammar, Rule, Diff } from '../grammar/types';
export function binarization(grammar: Grammar): { grammar: Grammar; diffs: Diff[] } {
  const diffs: Diff[] = [];
  let counter = 1;
  const freshVarMap = new Map<string, string>();
  const finalProductions: Rule[] = [];
  function freshVar(key: string): string {
    if (!freshVarMap.has(key)) {
      freshVarMap.set(key, `X${counter++}`);
    }
    return freshVarMap.get(key)!;
  }
  for (const rule of grammar.productions) {
    if (rule.isEpsilon || rule.body.length <= 2) {
      finalProductions.push(rule);
      diffs.push({ type: 'keep', rule, reason: 'Rule already in CNF form (≤ 2 symbols)' });
      continue;
    }
    diffs.push({ type: 'remove', rule, reason: `Split: ${rule.body.length} symbols → binary chain` });
    let remaining = [...rule.body];
    let currentHead = rule.head;
    while (remaining.length > 2) {
      const first = remaining[0];
      remaining = remaining.slice(1);
      const suffixKey = remaining.map(s => s.value).join('_');
      const xVar = freshVar(suffixKey);
      const leftRule = makeRule(currentHead, [first, { type: 'non-terminal', value: xVar }]);
      finalProductions.push(leftRule);
      diffs.push({
        type: 'add',
        rule: leftRule,
        reason: `Binary split: fresh variable ${xVar} introduced`,
      });
      currentHead = xVar;
    }
    const lastRule = makeRule(currentHead, remaining);
    finalProductions.push(lastRule);
    diffs.push({
      type: 'add',
      rule: lastRule,
      reason: `Binary split: terminal binary rule`,
    });
  }
  const after = cloneGrammar(grammar);
  after.productions = finalProductions;
  for (const xVar of freshVarMap.values()) {
    after.nonTerminals.add(xVar);
  }
  return { grammar: after, diffs };
}

