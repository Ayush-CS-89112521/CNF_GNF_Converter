import { makeRule, cloneGrammar, ruleToString } from '../grammar/types';
import type { Grammar, Rule, Diff } from '../grammar/types';
export function removeEpsilon(grammar: Grammar): { grammar: Grammar; diffs: Diff[] } {
  const nullable = computeNullable(grammar);
  const newProductions: Rule[] = [];
  const diffs: Diff[] = [];
  for (const rule of grammar.productions) {
    if (rule.isEpsilon) {
      if (rule.head !== grammar.start) {
        diffs.push({ type: 'remove', rule, reason: `ε-production removed (${rule.head} is nullable)` });
        continue;
      } else {
        newProductions.push(rule);
        diffs.push({ type: 'keep', rule, reason: 'Start symbol ε-production kept' });
        continue;
      }
    }
    const nullablePositions: number[] = [];
    for (let i = 0; i < rule.body.length; i++) {
      if (nullable.has(rule.body[i].value)) nullablePositions.push(i);
    }
    const subsets = powerSet(nullablePositions);
    for (const subset of subsets) {
      const newBody = rule.body.filter((_, i) => !subset.includes(i));
      if (newBody.length === 0) continue;
      const newRule = makeRule(rule.head, newBody);
      const isOriginal = subset.length === 0;
      if (isOriginal) {
        diffs.push({ type: 'keep', rule: newRule, reason: 'Original production kept' });
      } else {
        const omitted = subset.map(i => rule.body[i].value).join(', ');
        diffs.push({
          type: 'add',
          rule: newRule,
          reason: `Derived by omitting nullable: ${omitted}`,
        });
      }
      newProductions.push(newRule);
    }
  }
  const seen = new Set<string>();
  const dedupedProductions: Rule[] = [];
  const dedupedDiffs: Diff[] = [];
  for (let i = 0; i < newProductions.length; i++) {
    const key = ruleToString(newProductions[i]);
    if (!seen.has(key)) {
      seen.add(key);
      dedupedProductions.push(newProductions[i]);
      dedupedDiffs.push(diffs[i]);
    }
  }
  const after = cloneGrammar(grammar);
  after.productions = dedupedProductions;
  return { grammar: after, diffs: dedupedDiffs };
}
function computeNullable(grammar: Grammar): Set<string> {
  const nullable = new Set<string>();
  for (const rule of grammar.productions) {
    if (rule.isEpsilon) nullable.add(rule.head);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of grammar.productions) {
      if (!nullable.has(rule.head) && rule.body.every(s => nullable.has(s.value))) {
        nullable.add(rule.head);
        changed = true;
      }
    }
  }
  return nullable;
}
function powerSet(arr: number[]): number[][] {
  const result: number[][] = [[]];
  for (const item of arr) {
    const newSets = result.map(s => [...s, item]);
    result.push(...newSets);
  }
  return result;
}

