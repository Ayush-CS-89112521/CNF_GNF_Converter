import { v4 as uuidv4 } from 'uuid';
export type SymbolType = 'terminal' | 'non-terminal' | 'epsilon';
export interface GrammarSymbol {
  type: SymbolType;
  value: string;
}
export interface Rule {
  id: string;
  head: string;
  body: GrammarSymbol[];
  isEpsilon: boolean;
}
export function makeRule(head: string, body: GrammarSymbol[], isEpsilon = false): Rule {
  return { id: uuidv4(), head, body, isEpsilon };
}
export function ruleToString(rule: Rule): string {
  if (rule.isEpsilon) return `${rule.head} -> epsilon`;
  return `${rule.head} -> ${rule.body.map(s => s.value).join(' ')}`;
}
export interface Grammar {
  start: string;
  terminals: Set<string>;
  nonTerminals: Set<string>;
  productions: Rule[];
}
export function cloneGrammar(g: Grammar): Grammar {
  return {
    start: g.start,
    terminals: new Set(g.terminals),
    nonTerminals: new Set(g.nonTerminals),
    productions: g.productions.map(r => ({ ...r, body: [...r.body] })),
  };
}
export type DiffType = 'add' | 'remove' | 'keep';
export interface Diff {
  type: DiffType;
  rule: Rule;
  reason: string;
}
export type StepName = 'original' | 'epsilon-elimination' | 'unit-removal' | 'useless-removal' | 'terminal-replacement' | 'binarization' | 'gnf-order' | 'gnf-substitute' | 'gnf-left-recursion' | 'gnf-back-substitute';
export const STEP_LABELS: Record<StepName, { short: string; long: string; color: string }> = {
  'original': { short: 'START', long: 'Original CFG', color: '#40E0FF' },
  'epsilon-elimination': { short: 'E-ELIM', long: 'Epsilon Elimination', color: '#c078ff' },
  'unit-removal': { short: 'UNIT', long: 'Unit Production Removal', color: '#c078ff' },
  'useless-removal': { short: 'USELESS', long: 'Useless Symbol Removal', color: '#c078ff' },
  'terminal-replacement': { short: 'TERM', long: 'Terminal Replacement', color: '#ffc43d' },
  'binarization': { short: 'BIN', long: 'Binarization (CNF)', color: '#50e682' },
  'gnf-order': { short: 'ORDER', long: 'Variable Ordering', color: '#40E0FF' },
  'gnf-substitute': { short: 'SUBST', long: 'Production Substitution', color: '#c078ff' },
  'gnf-left-recursion': { short: 'LEFT-REC', long: 'Left Recursion Elimination', color: '#ffc43d' },
  'gnf-back-substitute': { short: 'BACK-SUB', long: 'Back-Substitution (GNF)', color: '#50e682' },
};
export interface StepSnapshot {
  name: StepName;
  description: string;
  before: Grammar;
  after: Grammar;
  changes: Diff[];
}
export type NodeRole = 'start' | 'nonTerm' | 'terminal' | 'newVar';
export interface GraphNode {
  id: string;
  label: string;
  role: NodeRole;
}
export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  id: string;
}
export interface GrammarGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

