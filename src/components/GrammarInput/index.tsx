import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, AlertCircle, Play, RotateCcw, BookOpen } from 'lucide-react';
import { useGrammarStore } from '../../store/grammarStore';
import { parseGrammar, PRESET_GRAMMARS } from '../../grammar/parser';
export function GrammarInput() {
  const {
    inputText, inputErrors, cnfDone,
    setInputText, setGrammar, runCNF, runGNF, reset,
  } = useGrammarStore();
  const [showPresets, setShowPresets] = React.useState(false);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    const { grammar, errors } = parseGrammar(text);
    setGrammar(grammar, errors);
  }, [setInputText, setGrammar]);
  const handlePreset = (preset: typeof PRESET_GRAMMARS[0]) => {
    setInputText(preset.input);
    const { grammar, errors } = parseGrammar(preset.input);
    setGrammar(grammar, errors);
    setShowPresets(false);
  };
  useEffect(() => {
    const { grammar, errors } = parseGrammar(inputText);
    setGrammar(grammar, errors);
  }, [inputText, setGrammar]);
  const hasErrors = inputErrors.length > 0;
  const { grammar } = useGrammarStore();
  const canConvert = grammar !== null && !hasErrors;
  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ion-cyan pulse-dot" />
          <span className="font-mono text-xs font-semibold tracking-widest text-ion-cyan text-glow-cyan uppercase">
            Grammar Input
          </span>
        </div>
        <div className="relative">
          <button
            className="btn-ghost flex items-center gap-1.5"
            onClick={() => setShowPresets(v => !v)}
          >
            <BookOpen size={12} />
            Presets
            <ChevronDown size={11} className={`transition-transform ${showPresets ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showPresets && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-50 glass-panel p-2 min-w-[220px] flex flex-col gap-1"
              >
                {PRESET_GRAMMARS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePreset(preset)}
                    className="text-left px-3 py-2.5 rounded-md hover:bg-white/5 transition-colors group"
                  >
                    <div className="font-mono text-xs font-semibold text-ion-cyan/80 group-hover:text-ion-cyan">
                      {preset.name}
                    </div>
                    <div className="font-mono text-xs text-ion-text-dim mt-0.5">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {}
      <div className="relative">
        <textarea
          className={`ion-textarea min-h-[130px] ${hasErrors ? 'error' : ''}`}
          value={inputText}
          onChange={handleChange}
          placeholder={`S → AB | a\nA → a | ε\nB → Ab | b`}
          spellCheck={false}
        />
        {}
        <div className="absolute top-3 right-3 font-mono text-xs text-ion-text-dim opacity-40 select-none pointer-events-none">
          CFG
        </div>
      </div>
      {}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-1.5"
          >
            {inputErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 font-mono text-xs text-red-400">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {}
      {!hasErrors && (
        <div className="font-mono text-xs text-ion-text-dim">
          Format: <span className="text-ion-cyan/60">HEAD → body1 | body2</span> &nbsp;·&nbsp;
          Use <span className="text-ion-cyan/60">ε</span> for epsilon &nbsp;·&nbsp;
          <span className="text-ion-cyan/60">UPPERCASE</span> = non-terminal &nbsp;·&nbsp;
          Adjacent uppercase splits unless declared as a head
        </div>
      )}
      {}
      <div className="flex gap-3 items-center">
        <button
          className="btn-primary flex items-center gap-2 flex-1"
          onClick={runCNF}
          disabled={!canConvert}
        >
          <Zap size={13} />
          Convert to CNF
        </button>
        <button
          className="btn-secondary flex items-center gap-2 flex-1"
          onClick={runGNF}
          disabled={!cnfDone}
        >
          <Play size={13} />
          Convert to GNF
        </button>
        <button
          className="btn-ghost p-2.5"
          onClick={reset}
          title="Reset"
        >
          <RotateCcw size={14} />
        </button>
      </div>
      {}
      {grammar && !hasErrors && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 pt-1 border-t border-ion-border-dim"
        >
          <Stat label="Start" value={grammar.start} color="cyan" />
          <Stat label="Non-terminals" value={grammar.nonTerminals.size.toString()} color="purple" />
          <Stat label="Terminals" value={grammar.terminals.size.toString()} color="green" />
          <Stat label="Productions" value={grammar.productions.length.toString()} color="yellow" />
        </motion.div>
      )}
    </div>
  );
}
function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'text-ion-cyan',
    purple: 'text-ion-purple',
    green: 'text-ion-green',
    yellow: 'text-ion-yellow',
  };
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] text-ion-text-dim uppercase tracking-wider">{label}</span>
      <span className={`font-mono text-sm font-bold ${colorMap[color]}`}>{value}</span>
    </div>
  );
}

