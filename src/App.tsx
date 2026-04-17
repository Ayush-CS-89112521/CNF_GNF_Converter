import { useEffect, useMemo, useRef, type ComponentType } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileStack,
  FolderArchive,
  Grid3x3,
  History,
  LayoutDashboard,
  Menu,
  Network,
  Play,
  Table2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { GrammarGraphPanel } from './components/GrammarGraphPanel';
import { useGrammarStore, type AppScreen } from './store/grammarStore';
import { parseGrammar } from './grammar/parser';
import { STEP_LABELS, type Grammar, type Rule } from './grammar/types';
import { grammarToString } from './lib/grammarToString';
import { downloadGrammarPdf, downloadComparisonPdf } from './lib/exportToPdf';
import './App.css';
interface NavItem {
  id: AppScreen;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}
interface NavSection {
  label: string;
  items: NavItem[];
}
const navSections: NavSection[] = [
  {
    label: 'Workspace',
    items: [{ id: 'workspace', label: 'Workspace', icon: LayoutDashboard }]
  },
  {
    label: 'CNF Pipeline',
    items: [
      { id: 'steps', label: 'Step Analysis', icon: FileStack },
      { id: 'table', label: 'Grammar Table', icon: Table2 },
      { id: 'graph', label: 'Dependency Graph', icon: Network },
      { id: 'cnf-final', label: 'Final CNF', icon: Grid3x3 },
    ]
  },
  {
    label: 'GNF Pipeline',
    items: [
      { id: 'gnf-steps', label: 'Step Analysis', icon: FileStack },
      { id: 'gnf-compare', label: 'Transformation', icon: ArrowRight },
      { id: 'gnf-graph', label: 'GNF Graph', icon: Network },
    ]
  },
  {
    label: 'Export & Archive',
    items: [
      { id: 'exports', label: 'Export Center', icon: Download },
      { id: 'history', label: 'Archive', icon: FolderArchive },
    ]
  },
];
function App() {
  const {
    inputText,
    inputErrors,
    grammar,
    cnfSteps,
    gnfSteps,
    cnfDone,
    gnfDone,
    activeMode,
    activeStepIndex,
    screen,
    history,
    selectedHistoryId,
    isConverting,
    setInputText,
    setGrammar,
    runCNF,
    runGNF,
    reset,
    setScreen,
    setActiveStepIndex,
    setActiveMode,
    deleteHistory,
    loadHistory,
    setSelectedHistoryId,
    clearHistory,
    sidebarCollapsed,
    toggleSidebar,
  } = useGrammarStore();
  const didInitRef = useRef(false);
  const safeCNFIndex = Math.max(0, Math.min(activeStepIndex, Math.max(cnfSteps.length - 1, 0)));
  const safeGNFIndex = Math.max(0, Math.min(activeStepIndex, Math.max(gnfSteps.length - 1, 0)));
  const currentStep = activeMode === 'gnf' ? gnfSteps[safeGNFIndex] : cnfSteps[safeCNFIndex];
  const displayedGrammar =
    activeMode === 'gnf'
      ? (gnfSteps[safeGNFIndex]?.after || gnfSteps[gnfSteps.length - 1]?.after || grammar)
      : (cnfSteps[safeCNFIndex]?.after || cnfSteps[cnfSteps.length - 1]?.after || grammar);
  const cnfFinal = cnfSteps[cnfSteps.length - 1]?.after || null;
  const gnfFinal = gnfSteps[gnfSteps.length - 1]?.after || null;
  const selectedHistory = useMemo(
    () => history.find(item => item.id === selectedHistoryId) || null,
    [history, selectedHistoryId],
  );
  useEffect(() => {
    if (didInitRef.current) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const grammarParam = params.get('grammar');
    if (grammarParam) {
      try {
        const decoded = atob(grammarParam);
        setInputText(decoded);
        const { grammar, errors } = parseGrammar(decoded);
        setGrammar(grammar, errors);
      } catch (e) {
        console.error('Failed to parse shared grammar:', e);
      }
      didInitRef.current = true;
      return;
    }
    const { grammar: parsedGrammar, errors } = parseGrammar(inputText);
    setGrammar(parsedGrammar, errors);
    didInitRef.current = true;
    if (!screen || screen === 'home') {
      setScreen('workspace');
    }
  }, [inputText, setInputText, setGrammar, screen, setScreen]);
  const handleInputChange = (value: string) => {
    setInputText(value);
    const { grammar: parsedGrammar, errors } = parseGrammar(value);
    setGrammar(parsedGrammar, errors);
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.txt')) {
      alert('Only .txt files');
      event.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//') && !l.startsWith('#'));
      const startSymbols = new Set<string>();
      for (const line of lines) {
        const arrowIdx = line.indexOf('->') !== -1 ? line.indexOf('->') : line.indexOf('→');
        if (arrowIdx !== -1) {
          const head = line.slice(0, arrowIdx).trim();
          if (/^[A-Z][A-Z0-9'_]*$/.test(head)) {
            startSymbols.add(head);
          }
        }
      }
      
      if (startSymbols.size > 1) {
        alert('Single grammar only');
        event.target.value = '';
        return;
      }
      
      handleInputChange(content);
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);
  };
  const freshVariableCount = (g: Grammar | null): number => {
    if (!g) return 0;
    return Array.from(g.nonTerminals).filter(nt => /^([TXZ]_?\w*|[TXZ]\d+)/.test(nt)).length;
  };
  const setCnfStep = (idx: number) => {
    setActiveMode('cnf');
    setActiveStepIndex(idx);
  };
  const setGnfStep = (idx: number) => {
    setActiveMode('gnf');
    setActiveStepIndex(idx);
  };
  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = screen === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setScreen(item.id)}
        className={`rail-link ${active ? 'active' : ''}`}
      >
        <Icon size={15} />
        <span>{item.label}</span>
      </button>
    );
  };
  const renderGrammarRow = (rule: Rule, idx: number, withState = false) => {
    const stateType = withState
      ? rule.isEpsilon
        ? 'removed'
        : rule.body.some(sym => sym.type === 'terminal')
          ? 'added'
          : 'kept'
      : null;
    return (
      <div key={rule.id} className={`matrix-row ${stateType ? `state-${stateType}` : ''}`}>
        <span className="row-index">{String(idx + 1).padStart(2, '0')}</span>
        <span className="sym-nt">{rule.head}</span>
        <span className="sym-arrow">→</span>
        <span className="rule-body">
          {rule.isEpsilon ? (
            <span className="sym-eps">ε</span>
          ) : (
            rule.body.map((sym, i) => (
              <span
                key={`${rule.id}-${i}`}
                className={
                  sym.type === 'terminal'
                    ? 'sym-t'
                    : /^([TXZ]_?\w*|[TXZ]\d+)/.test(sym.value)
                      ? 'sym-fresh'
                      : 'sym-nt'
                }
              >
                {sym.value}
              </span>
            ))
          )}
        </span>
        {withState && <span className={`state-pill ${stateType}`}>{stateType?.toUpperCase()}</span>}
      </div>
    );
  };
  const renderScreen = () => {
    if (screen === 'workspace') {
      return (
        <section className="screen-workspace">
          <div className="workspace-grid">
            <div className="panel">
              <p className="eyebrow">Input Stream</p>
              <h2 className="section-title">Grammar Input</h2>
              <div className="input-guide">
                <p><strong>UPLOAD RULE:</strong> One grammar per .txt file only</p>
                <p><strong>✓ Epsilon:</strong> ε, eps, or epsilon</p>
                <p><strong>✗ NOT allowed:</strong> Multiple grammars in one file</p>
              </div>
              <div className="textarea-wrapper">
                <textarea
                  value={inputText}
                  onChange={e => handleInputChange(e.target.value)}
                  className={`editor-area ${inputErrors.length > 0 ? 'error' : ''}`}
                  spellCheck={false}
                  placeholder="S → AB | a\nA → a | ε\nB → Ab | b"
                />
                <label className="file-upload-btn">
                  <Upload size={16} />
                  <span>Upload .txt</span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              {inputErrors.length > 0 && (
                <div className="error-stack">
                  {inputErrors.slice(0, 3).map(err => (
                    <p key={err}>{err}</p>
                  ))}
                </div>
              )}
              <div className="panel-actions vertical">
                <button className="btn-primary" onClick={runCNF} disabled={!grammar || inputErrors.length > 0 || isConverting}>
                  {isConverting ? 'Converting...' : 'Convert to CNF'}
                </button>
                <button className="btn-secondary" onClick={runGNF} disabled={!cnfDone || isConverting}>
                  Convert to GNF
                </button>
              </div>
            </div>
            <div className="panel">
              <p className="eyebrow">Process Monitor</p>
              <h2 className="section-title">Transformation Steps</h2>
              {cnfDone ? (
                <>
                  <div className="step-strip">
                    {cnfSteps.map((step, idx) => (
                      <button
                        key={`${step.name}-${idx}`}
                        className={`step-chip ${safeCNFIndex === idx && activeMode === 'cnf' ? 'active' : ''}`}
                        onClick={() => setCnfStep(idx)}
                      >
                        {String(idx + 1).padStart(2, '0')}. {STEP_LABELS[step.name].short}
                      </button>
                    ))}
                  </div>
                  <div className="matrix-card">
                    <div className="matrix-head">
                      <span>Variable</span>
                      <span>Production</span>
                      <span>Type</span>
                    </div>
                    <div className="matrix-list">
                      {(cnfSteps[safeCNFIndex]?.after?.productions || []).map(rule => (
                        <div key={rule.id} className="matrix-row compact">
                          <span className="sym-nt boxed">{rule.head}</span>
                          <span className="rule-body">
                            {rule.isEpsilon
                              ? 'ε'
                              : rule.body.map(sym => sym.value).join(' ')}
                          </span>
                          <span className="type-badge">
                            {rule.body.length === 1 && rule.body[0]?.type === 'terminal'
                              ? 'TERMINAL'
                              : 'NON-TERMINAL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-card">Run CNF conversion to generate transformation matrix.</div>
              )}
            </div>
          </div>
        </section>
      );
    }
    if (screen === 'steps') {
      const step = currentStep;
      const steps = cnfSteps; // Force CNF steps only
      if (!step || steps.length === 0) {
        return <div className="empty-card">Run CNF conversion to see transformation steps.</div>;
      }
      const beforeCount = step.before.productions.length;
      const afterCount = step.after.productions.length;
      const removed = step.changes.filter(c => c.type === 'remove');
      const added = step.changes.filter(c => c.type === 'add');
      return (
        <section className="screen-steps">
          <div className="stage-line">
            {steps.map((item, idx) => (
              <button
                key={`${item.name}-${idx}`}
                className={`stage-node ${idx === activeStepIndex ? 'active' : ''}`}
                onClick={() => setCnfStep(idx)}
              >
                <span className="dot" />
                <span>{STEP_LABELS[item.name].short}</span>
              </button>
            ))}
          </div>
          <div className="steps-grid">
            <div className="hero-column">
              <h1 className="hero-title">{STEP_LABELS[step.name].long}</h1>
              <p className="hero-desc">{step.description}</p>
              <div className="metrics-pair">
                <div>
                  <p className="eyebrow">Before</p>
                  <strong>{String(beforeCount).padStart(2, '0')}</strong>
                </div>
                <div>
                  <p className="eyebrow">After</p>
                  <strong className="sym-nt">{String(afterCount).padStart(2, '0')}</strong>
                </div>
              </div>
              <div className="panel-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setCnfStep(Math.max(0, activeStepIndex - 1))}
                  disabled={activeStepIndex === 0}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setCnfStep(Math.min(cnfSteps.length - 1, activeStepIndex + 1))}
                  disabled={activeStepIndex >= steps.length - 1}
                >
                  Next Step
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <div className="matrix-card large">
              <div className="matrix-head">
                <span>Formal Transformation Matrix</span>
                <span>{added.length} Added • {removed.length} Removed</span>
              </div>
              <div className="matrix-list">
                {step.after.productions.slice(0, 8).map((rule, idx) => renderGrammarRow(rule, idx, true))}
              </div>
            </div>
          </div>
        </section>
      );
    }
    if (screen === 'table') {
      if (!displayedGrammar) {
        return <div className="empty-card">No grammar loaded.</div>;
      }
      return (
        <section className="screen-table">
          <div className="panel">
            <h2 className="section-title">Grammar Production Matrix</h2>
            <div className="matrix-card">
              <div className="matrix-head">
                <span>#</span>
                <span>Rule</span>
                <span>Status</span>
              </div>
              <div className="matrix-list">
                {displayedGrammar.productions.map((rule, idx) => renderGrammarRow(rule, idx, true))}
              </div>
            </div>
          </div>
        </section>
      );
    }
    if (screen === 'graph') {
      return (
        <section className="screen-graph">
          <div className="panel">
            <h1 className="hero-title">Grammar Graph Visualization</h1>
            <p className="hero-desc">Visualizing production relationships and non-terminal dependency trees.</p>
            <GrammarGraphPanel />
          </div>
        </section>
      );
    }
    if (screen === 'cnf-final') {
      if (!grammar || !cnfFinal) {
        return <div className="empty-card">Run CNF conversion to view final comparison.</div>;
      }
      return (
        <section className="screen-final">
          <h1 className="hero-title">Transformation Complete.</h1>
          <p className="hero-desc">The Context-Free Grammar has been reduced to Chomsky Normal Form.</p>
          <div className="summary-row">
            <div className="metric-card">
              <p className="eyebrow">Total Rules</p>
              <strong>{String(grammar.productions.length).padStart(2, '0')} → {String(cnfFinal.productions.length).padStart(2, '0')}</strong>
            </div>
            <div className="metric-card">
              <p className="eyebrow">Fresh Variables</p>
              <strong className="sym-fresh">∑ {String(freshVariableCount(cnfFinal)).padStart(2, '0')}</strong>
            </div>
            <div className="metric-card">
              <p className="eyebrow">Pipeline</p>
              <strong className="sym-t">CNF Stable</strong>
            </div>
          </div>
          <div className="compare-grid">
            <div className="matrix-card large">
              <div className="matrix-head"><span>Original Grammar (CFG)</span></div>
              <pre className="grammar-pre">{grammarToString(grammar)}</pre>
            </div>
            <div className="matrix-card large">
              <div className="matrix-head"><span>Final CNF (Binarized)</span></div>
              <pre className="grammar-pre">{grammarToString(cnfFinal)}</pre>
            </div>
          </div>
        </section>
      );
    }
    if (screen === 'gnf-steps') {
      const step = currentStep;
      const steps = gnfSteps; // Force GNF steps only
      if (!step || steps.length === 0) {
        return <div className="empty-card">Run GNF conversion to see transformation steps.</div>;
      }
      const beforeCount = step.before.productions.length;
      const afterCount = step.after.productions.length;
      const removed = step.changes.filter(c => c.type === 'remove');
      const added = step.changes.filter(c => c.type === 'add');
      return (
        <section className="screen-steps">
          <div className="stage-line">
            {steps.map((item, idx) => (
              <button
                key={`${item.name}-${idx}`}
                className={`stage-node ${idx === activeStepIndex ? 'active' : ''}`}
                onClick={() => setGnfStep(idx)}
              >
                <span className="dot" />
                <span>{STEP_LABELS[item.name].short}</span>
              </button>
            ))}
          </div>
          <div className="steps-grid">
            <div className="hero-column">
              <h1 className="hero-title">{STEP_LABELS[step.name].long}</h1>
              <p className="hero-desc">{step.description}</p>
              <div className="metrics-pair">
                <div>
                  <p className="eyebrow">Before</p>
                  <strong>{String(beforeCount).padStart(2, '0')}</strong>
                </div>
                <div>
                  <p className="eyebrow">After</p>
                  <strong className="sym-nt">{String(afterCount).padStart(2, '0')}</strong>
                </div>
              </div>
              <div className="panel-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setGnfStep(Math.max(0, activeStepIndex - 1))}
                  disabled={activeStepIndex === 0}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setGnfStep(Math.min(gnfSteps.length - 1, activeStepIndex + 1))}
                  disabled={activeStepIndex >= steps.length - 1}
                >
                  Next Step
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <div className="matrix-card large">
              <div className="matrix-head">
                <span>Formal Transformation Matrix</span>
                <span>{added.length} Added • {removed.length} Removed</span>
              </div>
              <div className="matrix-list">
                {step.after.productions.slice(0, 8).map((rule, idx) => renderGrammarRow(rule, idx, true))}
              </div>
            </div>
          </div>
        </section>
      );
    }
    if (screen === 'gnf-compare') {
      if (!grammar || !gnfFinal) {
        return <div className="empty-card">Run full GNF conversion to compare outputs.</div>;
      }
      return (
        <section className="screen-gnf-compare">
          <h1 className="hero-title">Greibach Comparison</h1>
          <p className="hero-desc">Side-by-side comparison of original CFG and final terminal-first GNF output.</p>
          <div className="compare-grid">
            <div className="matrix-card large">
              <div className="matrix-head"><span>Original Grammar (CFG)</span></div>
              <pre className="grammar-pre">{grammarToString(grammar)}</pre>
            </div>
            <div className="matrix-card large">
              <div className="matrix-head"><span>Final GNF (Terminal-First)</span></div>
              <pre className="grammar-pre">{grammarToString(gnfFinal)}</pre>
            </div>
          </div>
          <div className="summary-row">
            <div className="metric-card">
              <p className="eyebrow">Total Rules</p>
              <strong>{String(grammar.productions.length).padStart(2, '0')} → {String(gnfFinal.productions.length).padStart(2, '0')}</strong>
            </div>
            <div className="metric-card">
              <p className="eyebrow">Z Variables</p>
              <strong className="sym-fresh">{freshVariableCount(gnfFinal)}</strong>
            </div>
            <div className="metric-card">
              <p className="eyebrow">Terminal Prefix</p>
              <strong className="sym-t">100%</strong>
            </div>
          </div>
        </section>
      );
    }
    if (screen === 'gnf-graph') {
      if (!gnfDone || !gnfFinal) {
        return <div className="empty-card">Run GNF conversion to visualize the final grammar graph.</div>;
      }
      return (
        <section className="screen-gnf-graph">
          <div className="panel">
            <h1 className="hero-title">GNF Grammar Graph</h1>
            <p className="hero-desc">Visual representation of terminal-first production dependencies in Greibach Normal Form.</p>
            <GrammarGraphPanel />
          </div>
        </section>
      );
    }
    if (screen === 'exports') {
      const cnfFinal = cnfSteps.length > 0 ? cnfSteps[cnfSteps.length - 1]?.after : null;
      const gnfFinal = gnfSteps.length > 0 ? gnfSteps[gnfSteps.length - 1]?.after : null;
      return (
        <section className="screen-exports">
          <div className="panel">
            <h1 className="hero-title">Export Center</h1>
            <p className="hero-desc">Download grammar transformations in multiple formats for documentation and sharing.</p>
            <div className="export-grid">
              {grammar && (
                <div className="export-card cfg-card">
                  <div className="export-card-header">
                    <h3>Original Grammar</h3>
                    <span className="format-badge cfg">CFG</span>
                  </div>
                  <p className="export-desc">Context-Free Grammar in its original form. No transformations applied.</p>
                  <div className="export-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const text = grammarToString(grammar);
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'grammar-original.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={14} /> Plain Text
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const json = JSON.stringify(grammar, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'grammar-original.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={14} /> JSON
                    </button>
                    <button
                      className="btn-secondary primary"
                      onClick={() => {
                        downloadGrammarPdf(grammar, 'grammar-original.pdf', {
                          title: 'Original Grammar',
                          glyph: 'CFG',
                          ruleStats: {
                            startSymbol: grammar.start,
                            nonTerminals: grammar.nonTerminals.size,
                            terminals: grammar.terminals.size,
                          },
                        });
                      }}
                    >
                      <Download size={14} /> PDF Report
                    </button>
                  </div>
                </div>
              )}
              {cnfFinal && (
                <div className="export-card cnf-card">
                  <div className="export-card-header">
                    <h3>CNF Output</h3>
                    <span className="format-badge cnf">CNF</span>
                  </div>
                  <p className="export-desc">Chomsky Normal Form with epsilon elimination, unit production removal, and terminal replacement.</p>
                  <div className="export-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const text = grammarToString(cnfFinal);
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'grammar-cnf.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={14} /> Plain Text
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const json = JSON.stringify(cnfFinal, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'grammar-cnf.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={14} /> JSON
                    </button>
                    <button
                      className="btn-secondary primary"
                      onClick={() => {
                        downloadGrammarPdf(cnfFinal, 'grammar-cnf.pdf', {
                          title: 'Chomsky Normal Form',
                          glyph: 'CNF',
                          ruleStats: {
                            startSymbol: cnfFinal.start,
                            nonTerminals: cnfFinal.nonTerminals.size,
                            terminals: cnfFinal.terminals.size,
                          },
                        });
                      }}
                    >
                      <Download size={14} /> PDF Report
                    </button>
                    <button
                      className="btn-secondary compare"
                      onClick={() => {
                        if (grammar) {
                          downloadComparisonPdf(grammar, cnfFinal, 'CFG -> CNF Conversion', 'comparison-cnf.pdf');
                        }
                      }}
                      disabled={!grammar}
                    >
                      <Download size={14} /> Compare
                    </button>
                  </div>
                </div>
              )}
              {gnfFinal && (
                <div className="export-card gnf-card">
                  <div className="export-card-header">
                    <h3>GNF Output</h3>
                    <span className="format-badge gnf">GNF</span>
                  </div>
                  <p className="export-desc">Greibach Normal Form with left recursion elimination and variable ordering optimizations.</p>
                  <div className="export-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const text = grammarToString(gnfFinal);
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'grammar-gnf.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={14} /> Plain Text
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const json = JSON.stringify(gnfFinal, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'grammar-gnf.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={14} /> JSON
                    </button>
                    <button
                      className="btn-secondary primary"
                      onClick={() => {
                        downloadGrammarPdf(gnfFinal, 'grammar-gnf.pdf', {
                          title: 'Greibach Normal Form',
                          glyph: 'GNF',
                          ruleStats: {
                            startSymbol: gnfFinal.start,
                            nonTerminals: gnfFinal.nonTerminals.size,
                            terminals: gnfFinal.terminals.size,
                          },
                        });
                      }}
                    >
                      <Download size={14} /> PDF Report
                    </button>
                    <button
                      className="btn-secondary compare"
                      onClick={() => {
                        if (grammar) {
                          downloadComparisonPdf(grammar, gnfFinal, 'CFG -> GNF Conversion', 'comparison-gnf.pdf');
                        }
                      }}
                      disabled={!grammar}
                    >
                      <Download size={14} /> Compare
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }
    if (screen === 'history') {
      return (
        <section className="screen-history">
          <div className="panel">
            <div className="panel-row">
              <div>
                <h1 className="hero-title">Transformation History</h1>
                <p className="hero-desc">A permanent ledger of formal grammar conversions.</p>
              </div>
              <div className="panel-actions">
                <button className="btn-secondary" onClick={clearHistory} disabled={history.length === 0}>
                  <Trash2 size={14} />
                  Clear
                </button>
              </div>
            </div>
            <div className="matrix-card">
              <div className="matrix-head">
                <span>Timestamp</span>
                <span>Snapshot</span>
                <span>Actions</span>
              </div>
              <div className="matrix-list">
                {history.length === 0 && <div className="empty-card">No saved transformations yet.</div>}
                {history.map(entry => (
                  <div key={entry.id} className="matrix-row compact">
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    <span className="history-snippet">{entry.inputText.split('\n')[0]}</span>
                    <span className="history-actions">
                      <button
                        className="text-btn"
                        onClick={() => {
                          setSelectedHistoryId(entry.id);
                          setScreen('history-detail');
                        }}
                      >
                        View
                      </button>
                      <button className="text-btn" onClick={() => loadHistory(entry.id)}>Restore</button>
                      <button className="text-btn danger" onClick={() => deleteHistory(entry.id)}>Delete</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    }
    if (screen === 'history-detail') {
      if (!selectedHistory) {
        return <div className="empty-card">No history snapshot selected.</div>;
      }
      return (
        <section className="screen-history-detail">
          <div className="panel-row">
            <h1 className="hero-title">History Snapshot</h1>
            <button className="btn-secondary" onClick={() => setScreen('history')}>
              <ArrowLeft size={14} />
              Back to Archive
            </button>
          </div>
          <div className="summary-row">
            <div className="metric-card">
              <p className="eyebrow">Created</p>
              <strong>{new Date(selectedHistory.createdAt).toLocaleString()}</strong>
            </div>
            <div className="metric-card">
              <p className="eyebrow">CNF Rules</p>
              <strong>{selectedHistory.productionCountAfterCNF}</strong>
            </div>
            <div className="metric-card">
              <p className="eyebrow">GNF Rules</p>
              <strong>{selectedHistory.hasGNF ? selectedHistory.productionCountAfterGNF : 'N/A'}</strong>
            </div>
          </div>
          <div className="compare-grid">
            <div className="matrix-card large">
              <div className="matrix-head"><span>Input Grammar</span></div>
              <pre className="grammar-pre">{selectedHistory.inputText}</pre>
            </div>
            <div className="matrix-card large">
              <div className="matrix-head"><span>CNF Output</span></div>
              <pre className="grammar-pre">{selectedHistory.cnfText}</pre>
            </div>
          </div>
          {selectedHistory.hasGNF && (
            <div className="matrix-card large mt-4">
              <div className="matrix-head"><span>GNF Output</span></div>
              <pre className="grammar-pre">{selectedHistory.gnfText}</pre>
            </div>
          )}
        </section>
      );
    }
    return <div className="empty-card">Select a screen from the left navigation.</div>;
  };
  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand">GRAMMAR ARCHIVIST</span>
          <span className="brand-sub">Formal Grammar System</span>
        </div>
        <nav className="top-links">
          <button className={`top-link ${screen === 'workspace' ? 'active' : ''}`} onClick={() => setScreen('workspace')}>Workspace</button>
          <button className={`top-link ${screen === 'cnf-final' ? 'active' : ''}`} onClick={() => setScreen('cnf-final')}>CNF Output</button>
          <button className={`top-link ${screen === 'gnf-compare' ? 'active' : ''}`} onClick={() => setScreen('gnf-compare')}>GNF Output</button>
          <button className={`top-link ${screen === 'history' ? 'active' : ''}`} onClick={() => setScreen('history')}>Archive</button>
        </nav>
      </header>
      <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <aside className={`rail ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="rail-toggle">
            <button 
              className="toggle-btn" 
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
              {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
          </div>
          <div className="rail-sections">
            {navSections.map((section) => (
              <div key={section.label} className="rail-section">
                <p className="eyebrow">{section.label}</p>
                <div className="rail-links">
                  {section.items.map(renderNavItem)}
                </div>
              </div>
            ))}
          </div>
          <div className="rail-bottom">
            <button className="btn-primary full" onClick={runCNF} disabled={!grammar || inputErrors.length > 0 || isConverting}>
              <Play size={14} />
              <span>Transform</span>
            </button>
            <button className="btn-secondary full" onClick={reset}>
              <span>Reset Session</span>
            </button>
            <button className="btn-secondary full" onClick={() => setScreen('history')}>
              <History size={14} />
              <span>Open Archive</span>
            </button>
          </div>
        </aside>
        <main className="content">{renderScreen()}</main>
      </div>
    </div>
  );
}
export default App;

