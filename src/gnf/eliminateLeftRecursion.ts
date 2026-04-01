import { makeRule, cloneGrammar, ruleToString } from '../grammar/types';
import type { Grammar, Rule, Diff, GrammarSymbol } from '../grammar/types';
export function eliminateLeftRecursion(
  grammar: Grammar,
  ordering: string[]
): { grammar: Grammar; diffs: Diff[]; newVars: string[] } {
  const diffs: Diff[] = [];
  const newVars: string[] = [];
  let productions = [...grammar.productions];
  let zCounter = 1;
  for (const Ai of ordering) {
    const leftRec = productions.filter(r =>
      r.head === Ai && !r.isEpsilon && r.body.length > 0 && r.body[0].value === Ai
    );
    if (leftRec.length === 0) {
      productions.filter(r => r.head === Ai).forEach(r =>
        diffs.push({ type: 'keep', rule: r, reason: `${Ai}: no left recursion` })
      );
      continue;
    }
    const nonLeftRec = productions.filter(r =>
      r.head === Ai && !(r.body.length > 0 && r.body[0].value === Ai)
    );
    const Zi = `Z${zCounter++}`;
    newVars.push(Zi);
    const newProductions: Rule[] = [];
    for (const betaRule of nonLeftRec) {
      const betaZiBody: GrammarSymbol[] = betaRule.isEpsilon
        ? [{ type: 'non-terminal', value: Zi }]
        : [...betaRule.body, { type: 'non-terminal', value: Zi }];
      const betaZiRule = makeRule(Ai, betaZiBody);
      newProductions.push(betaZiRule);
      diffs.push({
        type: 'add',
        rule: betaZiRule,
        reason: `${Ai}: replaced non-left rule with ${Ai} → β${Zi}`,
      });
      diffs.push({
        type: 'remove',
        rule: betaRule,
        reason: `${Ai}: original β rule removed during left-recursion elimination`,
      });
    }
    for (const lrRule of leftRec) {
      const alpha = lrRule.body.slice(1);
      diffs.push({ type: 'remove', rule: lrRule, reason: `${Ai}: left-recursive rule eliminated` });
      const ziRule = makeRule(Zi, alpha.length > 0 ? alpha : [], alpha.length === 0);
      newProductions.push(ziRule);
      diffs.push({
        type: 'add',
        rule: ziRule,
        reason: `New: ${Zi} → α (from left recursion elimination)`,
      });
      if (alpha.length > 0) {
        const ziZiRule = makeRule(Zi, [...alpha, { type: 'non-terminal', value: Zi }]);
        newProductions.push(ziZiRule);
        diffs.push({
          type: 'add',
          rule: ziZiRule,
          reason: `New: ${Zi} → α${Zi}`,
        });
      }
    }
    productions = [
      ...productions.filter(r => r.head !== Ai),
      ...newProductions,
    ];
    const seen = new Set<string>();
    productions = productions.filter(r => {
      const key = ruleToString(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const after = cloneGrammar(grammar);
  after.productions = productions;
  for (const v of newVars) after.nonTerminals.add(v);
  return { grammar: after, diffs, newVars };
}

