import { motion } from 'framer-motion';
import { useGrammarStore } from '../../store/grammarStore';
export function GrammarTable() {
  const {
    grammar,
    cnfSteps,
    gnfSteps,
    activeMode,
    activeStepIndex,
    highlightedRuleId,
    setHighlightedRuleId,
  } = useGrammarStore();
  const displayedGrammar =
    activeMode === 'gnf'
      ? (gnfSteps[activeStepIndex]?.after || gnfSteps[gnfSteps.length - 1]?.after || grammar)
      : (cnfSteps[activeStepIndex]?.after || cnfSteps[cnfSteps.length - 1]?.after || grammar);
  if (!displayedGrammar || displayedGrammar.productions.length === 0) {
    return (
      <div className="glass-panel p-6 text-center text-[var(--ion-text-dim)]">
        <p className="font-mono text-sm">No grammar loaded</p>
      </div>
    );
  }
  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      {}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--ion-purple)] pulse-dot" />
        <span className="font-mono text-xs font-semibold tracking-widest text-[var(--ion-purple)] text-glow-purple uppercase">
          Grammar Rules ({displayedGrammar.productions.length})
        </span>
      </div>
      {}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {displayedGrammar.productions.map((rule, idx) => (
          <motion.div
            key={rule.id}
            className={`p-3 rounded-lg cursor-pointer transition-all hover-lift font-mono text-sm ${
              highlightedRuleId === rule.id
                ? 'bg-[rgba(192,120,255,0.15)] border border-[var(--ion-purple)]'
                : 'border border-[var(--ion-border)] hover:border-[var(--ion-purple)] hover:bg-[rgba(192,120,255,0.05)]'
            }`}
            onMouseEnter={() => setHighlightedRuleId(rule.id)}
            onMouseLeave={() => setHighlightedRuleId(null)}
            whileHover={{ x: 2 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[var(--ion-text-dim)] flex-shrink-0 w-6">
                {idx + 1}
              </span>
              <code className="text-[var(--ion-cyan)] flex-shrink-0">
                {rule.head}
              </code>
              <span className="text-[var(--ion-text-dim)]">→</span>
              <code className="text-[var(--ion-green)] break-words">
                {rule.isEpsilon ? 'ε' : rule.body.map(s => s.value).join(' ')}
              </code>
            </div>
          </motion.div>
        ))}
      </div>
      {}
      <div className="pt-3 border-t border-[var(--ion-border)] grid grid-cols-2 gap-2 text-[0.7rem] font-mono">
        <div>
          <span className="text-[var(--ion-text-dim)]">Non-Terminals:</span>
          <span className="text-[var(--ion-cyan)] ml-1 font-bold">
            {displayedGrammar.nonTerminals.size}
          </span>
        </div>
        <div>
          <span className="text-[var(--ion-text-dim)]">Terminals:</span>
          <span className="text-[var(--ion-green)] ml-1 font-bold">
            {displayedGrammar.terminals.size}
          </span>
        </div>
      </div>
    </div>
  );
}

