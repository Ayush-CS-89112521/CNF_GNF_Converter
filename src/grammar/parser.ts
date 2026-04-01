import { z } from 'zod';
import { makeRule } from './types';
import type { Grammar, GrammarSymbol, Rule } from './types';
const EPS_SYMBOLS = new Set(['ε', 'eps', 'epsilon']);
export interface ParseResult {
  grammar: Grammar | null;
  errors: string[];
}
export function parseGrammar(input: string): ParseResult {
  const errors: string[] = [];
  const lines = input
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('//') && !l.startsWith('#'));
  if (lines.length === 0) {
    return { grammar: null, errors: ['Input is empty.'] };
  }
  const productions: Rule[] = [];
  const parsedLines: Array<{ lineNo: number; original: string; head: string; rhsRaw: string }> = [];
  let startSymbol: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const normalized = line.replace(/→/g, '->');
    const arrowIdx = normalized.indexOf('->');
    if (arrowIdx === -1) {
      errors.push(`Line ${i + 1}: Missing arrow (→ or ->) in "${line}"`);
      continue;
    }
    const head = normalized.slice(0, arrowIdx).trim();
    const rhsRaw = normalized.slice(arrowIdx + 2).trim();
    if (!head || head.length === 0) {
      errors.push(`Line ${i + 1}: Empty left-hand side in "${line}"`);
      continue;
    }
    if (!/^[A-Z][A-Z0-9'_]*$/.test(head)) {
      errors.push(`Line ${i + 1}: Left-hand side "${head}" must be a non-terminal (uppercase letter sequence)`);
      continue;
    }
    if (startSymbol === null) startSymbol = head;
    parsedLines.push({ lineNo: i + 1, original: line, head, rhsRaw });
  }
  if (errors.length > 0) {
    return { grammar: null, errors };
  }
  const knownNonTerminals = new Set<string>(parsedLines.map(p => p.head));
  for (const parsed of parsedLines) {
    const alternatives = parsed.rhsRaw.split('|').map(s => s.trim());
    for (const alt of alternatives) {
      if (alt.length === 0) {
        errors.push(`Line ${parsed.lineNo}: Empty alternative in "${parsed.original}"`);
        continue;
      }
      if (EPS_SYMBOLS.has(alt)) {
        productions.push(makeRule(parsed.head, [], true));
        continue;
      }
      const symbols = tokenizeRhs(alt, knownNonTerminals);
      if (symbols === null) {
        errors.push(`Line ${parsed.lineNo}: Could not parse "${alt}" in "${parsed.original}"`);
        continue;
      }
      productions.push(makeRule(parsed.head, symbols, false));
    }
  }
  if (errors.length > 0 && productions.length === 0) {
    return { grammar: null, errors };
  }
  if (!startSymbol) {
    return { grammar: null, errors: ['Could not determine start symbol.'] };
  }
  const nonTerminals = new Set<string>();
  const terminals = new Set<string>();
  for (const rule of productions) {
    nonTerminals.add(rule.head);
  }
  for (const rule of productions) {
    for (const sym of rule.body) {
      if (sym.type === 'non-terminal') nonTerminals.add(sym.value);
      else if (sym.type === 'terminal') terminals.add(sym.value);
    }
  }
  return {
    grammar: { start: startSymbol, terminals, nonTerminals, productions },
    errors,
  };
}
function tokenizeRhs(rhs: string, knownNonTerminals: Set<string>): GrammarSymbol[] | null {
  const symbols: GrammarSymbol[] = [];
  const orderedKnownNonTerminals = [...knownNonTerminals].sort((a, b) => b.length - a.length);
  let i = 0;
  while (i < rhs.length) {
    if (rhs[i] === ' ' || rhs[i] === '\t') { i++; continue; }
    if (/[A-Z]/.test(rhs[i])) {
      let matchedKnown: string | null = null;
      for (const nt of orderedKnownNonTerminals) {
        if (rhs.startsWith(nt, i)) {
          matchedKnown = nt;
          break;
        }
      }
      if (matchedKnown) {
        symbols.push({ type: 'non-terminal', value: matchedKnown });
        i += matchedKnown.length;
        continue;
      }
      let j = i + 1;
      while (j < rhs.length && /[A-Z0-9'_]/.test(rhs[j])) j++;
      const run = rhs.slice(i, j);
      if (!/^[A-Z]+$/.test(run)) {
        return null;
      }
      for (const ch of run) {
        symbols.push({ type: 'non-terminal', value: ch });
      }
      i = j;
      continue;
    }
    if (!/[A-Z\s]/.test(rhs[i])) {
      symbols.push({ type: 'terminal', value: rhs[i] });
      i++;
      continue;
    }
    return null;
  }
  return symbols;
}
export const GrammarInputSchema = z.string().min(1, 'Grammar cannot be empty');
export const PRESET_GRAMMARS: { name: string; input: string; description: string }[] = [
  {
    name: 'Simple with ε',
    description: 'Classic example with epsilon production',
    input: `S → AB | a
A → a | ε
B → Ab | b`,
  },
  {
    name: 'Balanced Parentheses',
    description: 'Grammar for balanced bracket strings',
    input: `S → SS | AB | ε
A → a
B → b`,
  },
  {
    name: 'Unit Productions',
    description: 'Demonstrates unit production removal',
    input: `S → A | b
A → B | a
B → S | c`,
  },
  {
    name: 'Long Rules',
    description: 'Needs binarization (rules with 3+ symbols)',
    input: `S → ABC | a
A → a
B → b
C → c`,
  },
  {
    name: 'Arithmetic Expressions',
    description: 'Simplified expression grammar',
    input: `S → SA | SB | a | b
A → a
B → b`,
  },
];

