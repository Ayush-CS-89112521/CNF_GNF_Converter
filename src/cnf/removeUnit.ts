import { makeRule, cloneGrammar, ruleToString } from '../grammar/types';
import type { Grammar, Rule, Diff } from '../grammar/types';
export function removeUnit(grammar: Grammar): { grammar: Grammar; diffs: Diff[] } {
  const candidateProductions: Rule[] = [];
  const candidateDiffs: Diff[] = [];
  for (const nt of grammar.nonTerminals) {
    const closure = unitClosure(nt, grammar);
    for (const closeVar of closure) {
      for (const rule of grammar.productions) {
        if (rule.head !== closeVar) continue;
        if (isUnit(rule)) continue;
        const derived: Rule = makeRule(nt, rule.body, rule.isEpsilon);
        candidateProductions.push(derived);
        if (closeVar === nt) {
          candidateDiffs.push({ type: 'keep', rule: derived, reason: 'Original non-unit production kept' });
        } else {
          candidateDiffs.push({
            type: 'add',
            rule: derived,
            reason: `Derived via unit closure: ${nt} ⇒* ${closeVar}`,
          });
        }
      }
    }
  }
  const seen = new Set<string>();
  const deduped: Rule[] = [];
  const dedupedDiffs: Diff[] = [];
  for (let i = 0; i < candidateProductions.length; i++) {
    const key = ruleToString(candidateProductions[i]);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(candidateProductions[i]);
      dedupedDiffs.push(candidateDiffs[i]);
    }
  }
  const withoutUnits = deduped.filter(rule => !isUnit(rule));
  const removedDiffs: Diff[] = [];
  for (const rule of grammar.productions) {
    if (isUnit(rule)) {
      removedDiffs.push({ type: 'remove', rule, reason: 'Unit production removed' });
    }
  }
  const rebuiltNonTerminals = new Set<string>([grammar.start]);
  const rebuiltTerminals = new Set<string>();
  for (const rule of withoutUnits) {
    rebuiltNonTerminals.add(rule.head);
    for (const sym of rule.body) {
      if (sym.type === 'non-terminal') rebuiltNonTerminals.add(sym.value);
      if (sym.type === 'terminal') rebuiltTerminals.add(sym.value);
    }
  }
  const after = cloneGrammar(grammar);
  after.productions = withoutUnits;
  after.nonTerminals = rebuiltNonTerminals;
  after.terminals = rebuiltTerminals;
  return { grammar: after, diffs: [...dedupedDiffs, ...removedDiffs] };
}
function isUnit(rule: Rule): boolean {
  return !rule.isEpsilon && rule.body.length === 1 && rule.body[0].type === 'non-terminal';
}
function unitClosure(start: string, grammar: Grammar): Set<string> {
  const visited = new Set<string>([start]);
  const queue: string[] = [start];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const rule of grammar.productions) {
      if (rule.head === current && isUnit(rule)) {
        const target = rule.body[0].value;
        if (!visited.has(target)) {
          visited.add(target);
          queue.push(target);
        }
      }
    }
  }
  return visited;
}

