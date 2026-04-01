import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useGrammarStore } from '../../store/grammarStore';
import { STEP_LABELS, type StepSnapshot } from '../../grammar/types';
import { grammarToString } from '../../lib/grammarToString';
export function StepViewer() {
  const { cnfSteps, gnfSteps, activeMode, activeStepIndex, setActiveStepIndex } = useGrammarStore();
  const steps = activeMode === 'gnf' ? gnfSteps : cnfSteps;
  if (!steps || steps.length === 0) {
    return (
      <div className="glass-panel p-6 text-center text-[var(--ion-text-dim)]">
        <p className="font-mono text-sm">
          {activeMode === 'gnf'
            ? 'Run GNF conversion to see transformation steps'
            : 'Run CNF conversion to see transformation steps'}
        </p>
      </div>
    );
  }
  return (
    <div className="glass-panel p-5 flex flex-col gap-2">
      {}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-[var(--ion-cyan)] pulse-dot" />
        <span className="font-mono text-xs font-semibold tracking-widest text-[var(--ion-cyan)] text-glow-cyan uppercase">
          Transformation Steps
        </span>
      </div>
      {}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        <AnimatePresence>
          {steps.map((step, idx) => (
            <motion.div
              key={`${step.name}-${idx}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <StepCard
                step={step}
                isActive={idx === activeStepIndex}
                onClick={() => setActiveStepIndex(idx)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
interface StepCardProps {
  step: StepSnapshot;
  isActive: boolean;
  onClick: () => void;
}
function StepCard({ step, isActive, onClick }: StepCardProps) {
  const label = STEP_LABELS[step.name];
  if (!label) return null;
  const beforeStr = grammarToString(step.before);
  const afterStr = grammarToString(step.after);
  return (
    <motion.div
      className={`border rounded-lg transition-all cursor-pointer ${
        isActive
          ? 'border-[var(--ion-cyan)] bg-[rgba(64,224,255,0.08)]'
          : 'border-[var(--ion-border)] hover:border-[var(--ion-cyan)] hover:bg-[rgba(64,224,255,0.04)]'
      }`}
      onClick={onClick}
    >
      {}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="badge badge-info text-xs">{label.short}</span>
          <div>
            <p className="font-mono text-xs font-semibold text-[var(--ion-text)]">
              {label.long}
            </p>
            <p className="font-mono text-[0.65rem] text-[var(--ion-text-dim)] mt-0.5">
              {step.description.slice(0, 60)}...
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[var(--ion-cyan)]" />
        </motion.div>
      </div>
      {}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[var(--ion-border)] px-3 pb-3"
          >
            <div className="pt-3 space-y-2">
              {}
              <div>
                <p className="font-mono text-[0.65rem] text-[var(--ion-cyan)] font-semibold mb-1 uppercase">
                  Before
                </p>
                <div className="bg-[rgba(0,0,0,0.3)] border border-[var(--ion-border-dim)] rounded p-2">
                  <pre className="font-mono text-[0.7rem] text-[var(--ion-text-dim)] whitespace-pre-wrap break-words">
                    {beforeStr}
                  </pre>
                </div>
              </div>
              {}
              <div>
                <p className="font-mono text-[0.65rem] text-[var(--ion-green)] font-semibold mb-1 uppercase">
                  After
                </p>
                <div className="bg-[rgba(0,0,0,0.3)] border border-[var(--ion-border-dim)] rounded p-2">
                  <pre className="font-mono text-[0.7rem] text-[var(--ion-text-dim)] whitespace-pre-wrap break-words">
                    {afterStr}
                  </pre>
                </div>
              </div>
              {}
              <div>
                <p className="font-mono text-[0.65rem] text-[var(--ion-yellow)] font-semibold mb-1 uppercase">
                  Changes ({step.changes.length})
                </p>
                <div className="space-y-1">
                  {step.changes.slice(0, 5).map((change, i: number) => (
                    <div
                      key={i}
                      className={`text-[0.65rem] font-mono px-2 py-1 rounded ${
                        change.type === 'add'
                          ? 'badge badge-added'
                          : change.type === 'remove'
                          ? 'badge badge-removed'
                          : 'text-[var(--ion-text-dim)]'
                      }`}
                    >
                      {change.type.toUpperCase()} {change.rule.head}
                    </div>
                  ))}
                  {step.changes.length > 5 && (
                    <p className="text-[0.65rem] text-[var(--ion-text-dim)] italic">
                      +{step.changes.length - 5} more changes
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

