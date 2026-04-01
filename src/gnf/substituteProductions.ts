import { makeRule, cloneGrammar, ruleToString } from '../grammar/types';
import type { Grammar, Rule, Diff, GrammarSymbol } from '../grammar/types';
export function substituteProductions(
  grammar: Grammar,
  ordering: string[]
): { grammar: Grammar; diffs: Diff[] } {
  const diffs: Diff[] = [];
  let productions = [...grammar.productions];
  for (let i = 0; i < ordering.length; i++) {
    const Ai = ordering[i];
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
      changed = false;
      iterations++;
      const nextProductions: Rule[] = [];
      for (const rule of productions) {
        if (rule.head !== Ai || rule.isEpsilon || rule.body.length === 0) {
          nextProductions.push(rule);
          continue;
        }
        const first = rule.body[0];
        const j = ordering.indexOf(first.value);
        if (first.type === 'non-terminal' && j >= 0 && j < i) {
          const Aj = first.value;
          const ajProductions = productions.filter(
            r => r.head === Aj && !( !r.isEpsilon && r.body.length > 0 && r.body[0].value === Aj )
          );
          if (ajProductions.length === 0) {
            nextProductions.push(rule);
            continue;
          }
          const rest = rule.body.slice(1);
          changed = true;
          for (const ajRule of ajProductions) {
            let newBody: GrammarSymbol[];
            if (ajRule.isEpsilon) {
              newBody = rest.length > 0 ? rest : [];
            } else {
              newBody = [...ajRule.body, ...rest];
            }
            if (newBody.length > 50) continue;
            const newRule = makeRule(Ai, newBody, newBody.length === 0);
            nextProductions.push(newRule);
            diffs.push({
              type: 'add',
              rule: newRule,
              reason: `Substituted ${Aj} (A${j + 1}) into ${Ai} (A${i + 1})`,
            });
          }
          diffs.push({
            type: 'remove',
            rule,
            reason: `Replaced by substitution of ${Aj}`,
          });
        } else {
          nextProductions.push(rule);
        }
      }
      const seen = new Set<string>();
      productions = [];
      for (const r of nextProductions) {
        const key = ruleToString(r);
        if (!seen.has(key)) {
          seen.add(key);
          productions.push(r);
        }
      }
    }
  }
  const diffsMap = new Set(diffs.map(d => d.rule.id));
  for (const rule of productions) {
    if (!diffsMap.has(rule.id)) {
      diffs.push({ type: 'keep', rule, reason: 'Production already in correct form' });
    }
  }
  const after = cloneGrammar(grammar);
  after.productions = productions;
  return { grammar: after, diffs };
}

