import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Grammar, StepSnapshot } from '../grammar/types';
import { convertToCNF } from '../cnf';
import { convertToGNF } from '../gnf';
import { parseGrammar } from '../grammar/parser';
import { grammarToString } from '../lib/grammarToString';
export type AppMode = 'cnf' | 'gnf';
export type GraphViewMode = 'original' | 'cnf' | 'gnf';
export type AppScreen =
  | 'home'
  | 'workspace'
  | 'steps'
  | 'table'
  | 'graph'
  | 'cnf-final'
  | 'gnf-steps'
  | 'gnf-compare'
  | 'gnf-graph'
  | 'exports'
  | 'history'
  | 'history-detail';
export interface HistoryEntry {
  id: string;
  createdAt: number;
  label: string;
  inputText: string;
  cnfText: string;
  gnfText: string;
  hasGNF: boolean;
  productionCountBefore: number;
  productionCountAfterCNF: number;
  productionCountAfterGNF: number;
}
function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
interface GrammarState {
  inputText: string;
  inputErrors: string[];
  grammar: Grammar | null;
  cnfSteps: StepSnapshot[];
  gnfSteps: StepSnapshot[];
  activeMode: AppMode;
  graphViewMode: GraphViewMode;
  activeStepIndex: number;
  activeGraphStepIndex: number;
  isConverting: boolean;
  cnfDone: boolean;
  gnfDone: boolean;
  highlightedRuleId: string | null;
  highlightedNode: string | null;
  screen: AppScreen;
  sidebarCollapsed: boolean;
  history: HistoryEntry[];
  selectedHistoryId: string | null;
  setInputText: (text: string) => void;
  setGrammar: (g: Grammar | null, errors: string[]) => void;
  runCNF: () => void;
  runGNF: () => void;
  setActiveMode: (mode: AppMode) => void;
  setGraphViewMode: (mode: GraphViewMode) => void;
  setActiveStepIndex: (idx: number) => void;
  setActiveGraphStepIndex: (idx: number) => void;
  setHighlightedRuleId: (id: string | null) => void;
  setHighlightedNode: (node: string | null) => void;
  setScreen: (screen: AppScreen) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  saveHistory: (label?: string) => void;
  loadHistory: (id: string) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  setSelectedHistoryId: (id: string | null) => void;
  reset: () => void;
}
export const useGrammarStore = create<GrammarState>()(
  persist(
    immer((set, get) => ({
      inputText: `S → AB | a\nA → a | ε\nB → Ab | b`,
      inputErrors: [],
      grammar: null,
      cnfSteps: [],
      gnfSteps: [],
      activeMode: 'cnf',
      graphViewMode: 'original',
      activeStepIndex: 0,
      activeGraphStepIndex: 0,
      isConverting: false,
      cnfDone: false,
      gnfDone: false,
      highlightedRuleId: null,
      highlightedNode: null,
      screen: 'home',
      sidebarCollapsed: false,
      history: [],
      selectedHistoryId: null,
      setInputText: (text) => set(state => {
        state.inputText = text;
      }),
      setGrammar: (g, errors) => set(state => {
        state.grammar = g;
        state.inputErrors = errors;
        state.cnfSteps = [];
        state.gnfSteps = [];
        state.cnfDone = false;
        state.gnfDone = false;
        state.activeStepIndex = 0;
        state.activeGraphStepIndex = 0;
        state.activeMode = 'cnf';
      }),
      runCNF: () => {
        const { grammar } = get();
        if (!grammar) return;
        set(state => {
          state.isConverting = true;
        });
        try {
          const steps = convertToCNF(grammar);
          set(state => {
            state.cnfSteps = steps;
            state.cnfDone = true;
            state.gnfSteps = [];
            state.gnfDone = false;
            state.activeMode = 'cnf';
            state.activeStepIndex = 0;
            state.activeGraphStepIndex = 0;
            state.graphViewMode = 'cnf';
            state.isConverting = false;
            state.screen = 'steps';
          });
          get().saveHistory('CNF Conversion');
        } catch (e) {
          set(state => {
            state.isConverting = false;
          });
          console.error('CNF conversion error:', e);
        }
      },
      runGNF: () => {
        const { cnfSteps } = get();
        if (cnfSteps.length === 0) return;
        const cnfGrammar = cnfSteps[cnfSteps.length - 1].after;
        set(state => {
          state.isConverting = true;
        });
        try {
          const steps = convertToGNF(cnfGrammar);
          set(state => {
            state.gnfSteps = steps;
            state.gnfDone = true;
            state.activeMode = 'gnf';
            state.activeStepIndex = 0;
            state.isConverting = false;
            state.screen = 'gnf-steps';
          });
          get().saveHistory('GNF Conversion');
        } catch (e) {
          set(state => {
            state.isConverting = false;
          });
          console.error('GNF conversion error:', e);
        }
      },
      setActiveMode: (mode) => set(state => {
        state.activeMode = mode;
        state.activeStepIndex = 0;
      }),
      setGraphViewMode: (mode) => set(state => {
        state.graphViewMode = mode;
        state.activeGraphStepIndex = 0;
      }),
      setActiveStepIndex: (idx) => set(state => {
        state.activeStepIndex = idx;
      }),
      setActiveGraphStepIndex: (idx) => set(state => {
        state.activeGraphStepIndex = idx;
      }),
      setHighlightedRuleId: (id) => set(state => {
        state.highlightedRuleId = id;
      }),
      setHighlightedNode: (node) => set(state => {
        state.highlightedNode = node;
      }),
      setScreen: (screen) => set(state => {
        state.screen = screen;
      }),
      setSidebarCollapsed: (collapsed) => set(state => {
        state.sidebarCollapsed = collapsed;
      }),
      toggleSidebar: () => set(state => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      }),
      saveHistory: (label) => {
        const { inputText, grammar, cnfDone, gnfDone, cnfSteps, gnfSteps, history } = get();
        if (!grammar || !cnfDone) return;
        const cnfGrammar = cnfSteps[cnfSteps.length - 1]?.after;
        const gnfGrammar = gnfDone ? gnfSteps[gnfSteps.length - 1]?.after : null;
        if (!cnfGrammar) return;
        const entry: HistoryEntry = {
          id: makeId(),
          createdAt: Date.now(),
          label: label || (gnfDone ? 'GNF Conversion' : 'CNF Conversion'),
          inputText,
          cnfText: grammarToString(cnfGrammar),
          gnfText: gnfGrammar ? grammarToString(gnfGrammar) : '',
          hasGNF: Boolean(gnfGrammar),
          productionCountBefore: grammar.productions.length,
          productionCountAfterCNF: cnfGrammar.productions.length,
          productionCountAfterGNF: gnfGrammar ? gnfGrammar.productions.length : 0,
        };
        const latest = history[0];
        const shouldReplaceLatest =
          latest &&
          latest.inputText === entry.inputText &&
          latest.productionCountAfterCNF === entry.productionCountAfterCNF &&
          latest.hasGNF !== entry.hasGNF;
        set(state => {
          if (shouldReplaceLatest) {
            state.history[0] = entry;
          } else {
            state.history.unshift(entry);
          }
          if (state.history.length > 120) {
            state.history = state.history.slice(0, 120);
          }
        });
      },
      loadHistory: (id) => {
        const entry = get().history.find(item => item.id === id);
        if (!entry) return;
        const { grammar, errors } = parseGrammar(entry.inputText);
        if (!grammar || errors.length > 0) {
          set(state => {
            state.inputText = entry.inputText;
            state.grammar = null;
            state.inputErrors = errors;
            state.screen = 'history';
          });
          return;
        }
        set(state => {
          state.inputText = entry.inputText;
          state.selectedHistoryId = id;
          state.screen = 'history-detail';
          state.grammar = grammar;
          state.inputErrors = [];
          state.cnfSteps = [];
          state.gnfSteps = [];
          state.cnfDone = false;
          state.gnfDone = false;
          state.activeStepIndex = 0;
        });
        get().runCNF();
        if (entry.hasGNF) {
          get().runGNF();
        }
      },
      deleteHistory: (id) => set(state => {
        state.history = state.history.filter(item => item.id !== id);
        if (state.selectedHistoryId === id) {
          state.selectedHistoryId = null;
          state.screen = 'history';
        }
      }),
      clearHistory: () => set(state => {
        state.history = [];
        state.selectedHistoryId = null;
      }),
      setSelectedHistoryId: (id) => set(state => {
        state.selectedHistoryId = id;
      }),
      reset: () => set(state => {
        state.cnfSteps = [];
        state.gnfSteps = [];
        state.cnfDone = false;
        state.gnfDone = false;
        state.activeStepIndex = 0;
        state.activeGraphStepIndex = 0;
        state.grammar = null;
        state.inputErrors = [];
        state.highlightedRuleId = null;
        state.highlightedNode = null;
        state.screen = 'workspace';
      }),
    })),
    {
      name: 'grammar-archivist-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inputText: state.inputText,
        history: state.history,
      }),
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as Partial<GrammarState>;
        return {
          ...currentState,
          inputText: typedPersisted.inputText ?? currentState.inputText,
          history: typedPersisted.history ?? currentState.history,
        } as GrammarState;
      },
    },
  )
);

