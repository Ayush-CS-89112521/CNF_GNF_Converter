import { cloneGrammar, makeRule } from '../grammar/types';
import type { Grammar, StepSnapshot } from '../grammar/types';
import { removeEpsilon } from './removeEpsilon';
import { removeUnit } from './removeUnit';
import { removeUseless } from './removeUseless';
import { terminalReplacement } from './terminalReplacement';
import { binarization } from './binarization';
export function convertToCNF(grammar: Grammar): StepSnapshot[] {
  const snapshots: StepSnapshot[] = [];
  snapshots.push({
    name: 'original',
    description: 'The input Context-Free Grammar before any transformations.',
    before: cloneGrammar(grammar),
    after: cloneGrammar(grammar),
    changes: grammar.productions.map(r => ({ type: 'keep', rule: r, reason: 'Original production' })),
  });
  let current = augmentStartSymbol(cloneGrammar(grammar));
  {
    const before = cloneGrammar(current);
    const result = removeEpsilon(current);
    current = result.grammar;
    snapshots.push({
      name: 'epsilon-elimination',
      description:
        'Find all nullable variables (those that can derive ε), then generate ε-free alternatives for each production. ε-productions are removed (except start symbol if needed).',
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  {
    const before = cloneGrammar(current);
    const result = removeUnit(current);
    current = result.grammar;
    snapshots.push({
      name: 'unit-removal',
      description:
        'A unit production is A → B where B is a single non-terminal. Build the unit closure for each variable and replace unit chains with direct productions. Unit rules are then removed.',
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  {
    const before = cloneGrammar(current);
    const result = removeUseless(current);
    current = result.grammar;
    snapshots.push({
      name: 'useless-removal',
      description:
        'Remove non-generating symbols (cannot derive any terminal string) and unreachable symbols (not accessible from the start symbol). This keeps only "useful" symbols.',
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  {
    const before = cloneGrammar(current);
    const result = terminalReplacement(current);
    current = result.grammar;
    snapshots.push({
      name: 'terminal-replacement',
      description:
        'For rules with 2+ body symbols, replace each terminal a with a fresh variable T_a and add new rules T_a → a. Single-symbol rules are unchanged.',
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  {
    const before = cloneGrammar(current);
    const result = binarization(current);
    current = result.grammar;
    snapshots.push({
      name: 'binarization',
      description:
        'Split any rule A → B₁ B₂ … Bₙ (n ≥ 3) into a chain of binary rules using fresh variables. After this step, every production is either A → BC or A → a — exactly Chomsky Normal Form.',
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  return snapshots;
}
function augmentStartSymbol(grammar: Grammar): Grammar {
  const startInRhs = grammar.productions.some(rule =>
    rule.body.some(sym => sym.type === 'non-terminal' && sym.value === grammar.start)
  );
  const nullableStart = isNullableStart(grammar);
  if (!startInRhs && !nullableStart) {
    return grammar;
  }
  let freshStart = 'S0';
  while (grammar.nonTerminals.has(freshStart)) {
    freshStart = `${freshStart}0`;
  }
  const augmented = cloneGrammar(grammar);
  augmented.start = freshStart;
  augmented.nonTerminals.add(freshStart);
  augmented.productions = [
    makeRule(freshStart, [{ type: 'non-terminal', value: grammar.start }]),
    ...(nullableStart ? [makeRule(freshStart, [], true)] : []),
    ...augmented.productions,
  ];
  return augmented;
}
function isNullableStart(grammar: Grammar): boolean {
  const nullable = new Set<string>();
  for (const rule of grammar.productions) {
    if (rule.isEpsilon) nullable.add(rule.head);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of grammar.productions) {
      if (nullable.has(rule.head)) continue;
      if (rule.body.length > 0 && rule.body.every(sym => sym.type === 'non-terminal' && nullable.has(sym.value))) {
        nullable.add(rule.head);
        changed = true;
      }
    }
  }
  return nullable.has(grammar.start);
}

