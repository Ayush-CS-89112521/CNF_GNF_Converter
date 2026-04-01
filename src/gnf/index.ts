import { cloneGrammar } from '../grammar/types';
import type { Grammar, StepSnapshot } from '../grammar/types';
import { orderVariables } from './orderVariables';
import { substituteProductions } from './substituteProductions';
import { eliminateLeftRecursion } from './eliminateLeftRecursion';
import { backSubstitute } from './backSubstitute';
export function convertToGNF(cnfGrammar: Grammar): StepSnapshot[] {
  const snapshots: StepSnapshot[] = [];
  let current = cloneGrammar(cnfGrammar);
  let ordering: string[] = [];
  let newVars: string[] = [];
  {
    const before = cloneGrammar(current);
    const result = orderVariables(current);
    current = result.grammar;
    ordering = result.ordering;
    snapshots.push({
      name: 'gnf-order',
      description:
        `Impose a linear ordering A₁ < A₂ < … < Aₙ on all non-terminals. The start symbol becomes A₁. This ordering guides the substitution and left-recursion elimination steps. Current order: ${result.ordering.join(' < ')}.`,
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  {
    const before = cloneGrammar(current);
    const result = substituteProductions(current, ordering);
    current = result.grammar;
    snapshots.push({
      name: 'gnf-substitute',
      description:
        'For each rule Aᵢ → Aⱼγ where j < i, substitute all productions of Aⱼ into the rule. After this step, each Aᵢ only derives strings starting with Aᵢ itself or higher-index variables.',
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  {
    const before = cloneGrammar(current);
    const result = eliminateLeftRecursion(current, ordering);
    current = result.grammar;
    newVars = result.newVars;
    snapshots.push({
      name: 'gnf-left-recursion',
      description:
        `Eliminate all direct left-recursive rules Aᵢ → Aᵢα by introducing new variables Zᵢ. Replace Aᵢ → Aᵢα with Zᵢ → α | αZᵢ, and add Aᵢ → β | βZᵢ for each non-left-recursive rule.${newVars.length > 0 ? ` New variables introduced: ${newVars.join(', ')}.` : ' No left recursion found.'}`,
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  {
    const before = cloneGrammar(current);
    const result = backSubstitute(current);
    current = result.grammar;
    snapshots.push({
      name: 'gnf-back-substitute',
      description:
        'Back-substitute all remaining rules that start with a non-terminal by replacing that non-terminal with its complete set of productions. After this step, every production starts with a terminal symbol — achieving Greibach Normal Form.',
      before,
      after: cloneGrammar(current),
      changes: result.diffs,
    });
  }
  return snapshots;
}

