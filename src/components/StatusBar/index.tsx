import { motion } from 'framer-motion';
import { useGrammarStore } from '../../store/grammarStore';
export function StatusBar() {
  const { cnfDone, gnfDone } = useGrammarStore();
  const stages = [
    { name: 'START', done: true },
    { name: 'E-ELIM', done: cnfDone },
    { name: 'UNIT', done: cnfDone },
    { name: 'USELESS', done: cnfDone },
    { name: 'TERM', done: cnfDone },
    { name: 'BIN', done: cnfDone },
    { name: 'GNF', done: gnfDone },
  ];
  return (
    <div className="glass-panel p-4">
      {}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[var(--ion-cyan)] animate-pulse" />
        <span className="font-mono text-xs font-semibold tracking-widest text-[var(--ion-cyan)] text-glow-cyan uppercase">
          Conversion Progress
        </span>
      </div>
      {}
      <div className="flex items-center gap-2 flex-wrap">
        {stages.map((stage, idx) => (
          <div key={stage.name} className="flex items-center gap-2">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                stage.done
                  ? 'bg-[var(--ion-green)] text-[var(--ion-bg)] glow-green'
                  : 'bg-[rgba(64,224,255,0.1)] text-[var(--ion-cyan)] border border-[var(--ion-cyan)]'
              }`}
              animate={{
                boxShadow: stage.done
                  ? '0 0 16px rgba(80,230,130,0.4)'
                  : 'none',
              }}
            >
              {stage.done ? '✓' : '○'}
            </motion.div>
            <span className="font-mono text-[0.7rem] text-[var(--ion-text-dim)]">
              {stage.name}
            </span>
            {idx < stages.length - 1 && (
              <div className="w-4 h-0.5 bg-[var(--ion-border)] mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

