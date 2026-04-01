import { makeRule, cloneGrammar } from '../grammar/types';
import type { Grammar, Rule, Diff, GrammarSymbol } from '../grammar/types';
export function terminalReplacement(grammar: Grammar): { grammar: Grammar; diffs: Diff[] } {
  const diffs: Diff[] = [];
  const terminalVarMap = new Map<string, string>();
  const newRules: Rule[] = [];
  const updatedProductions: Rule[] = [];
  for (const rule of grammar.productions) {
    if (rule.isEpsilon) {
      updatedProductions.push(rule);
      diffs.push({ type: 'keep', rule, reason: 'ε-rule not modified' });
      continue;
    }
    if (rule.body.length === 1) {
      updatedProductions.push(rule);
      diffs.push({ type: 'keep', rule, reason: 'Single-symbol rule not modified' });
      continue;
    }
    const newBody: GrammarSymbol[] = [];
    let modified = false;
    for (const sym of rule.body) {
      if (sym.type === 'terminal') {
        if (!terminalVarMap.has(sym.value)) {
          terminalVarMap.set(sym.value, `T${sym.value.toUpperCase()}`);
        }
        const varName = terminalVarMap.get(sym.value)!;
        newBody.push({ type: 'non-terminal', value: varName });
        modified = true;
      } else {
        newBody.push(sym);
      }
    }
    const newRule = makeRule(rule.head, newBody);
    updatedProductions.push(newRule);
    if (modified) {
      diffs.push({
        type: 'add',
        rule: newRule,
        reason: `Terminals replaced with fresh variables`,
      });
      diffs.push({
        type: 'remove',
        rule,
        reason: `Original rule with mixed terminals replaced`,
      });
    } else {
      diffs.push({ type: 'keep', rule: newRule, reason: 'No terminals to replace' });
    }
  }
  for (const [terminal, varName] of terminalVarMap) {
    const termRule = makeRule(varName, [{ type: 'terminal', value: terminal }]);
    newRules.push(termRule);
    diffs.push({
      type: 'add',
      rule: termRule,
      reason: `New terminal variable: ${varName} → ${terminal}`,
    });
  }
  const after = cloneGrammar(grammar);
  after.productions = [...updatedProductions, ...newRules];
  for (const varName of terminalVarMap.values()) {
    after.nonTerminals.add(varName);
  }
  return { grammar: after, diffs };
}

