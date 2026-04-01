import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Minus, Plus, RotateCcw } from 'lucide-react';
import { useGrammarStore } from '../../store/grammarStore';
import { grammarToGraph, VIS_OPTIONS } from '../../lib/grammarToGraph';
export function GrammarGraphPanel() {
  const {
    grammar,
    cnfSteps,
    gnfSteps,
    graphViewMode,
    activeStepIndex,
    setGraphViewMode,
  } = useGrammarStore();
  type VisNetworkApi = {
    destroy: () => void;
    stabilize: (iterations?: number) => void;
    once: (event: string, callback: (params?: unknown) => void) => void;
    fit: (options?: unknown) => void;
    setOptions: (options: unknown) => void;
    moveTo: (options: unknown) => void;
    getScale: () => number;
  };
  const canvasRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const currentGrammar = useMemo(() => {
    if (graphViewMode === 'cnf' && cnfSteps.length > 0) {
      return cnfSteps[activeStepIndex]?.after || cnfSteps[cnfSteps.length - 1]?.after || grammar;
    }
    if (graphViewMode === 'gnf' && gnfSteps.length > 0) {
      return gnfSteps[gnfSteps.length - 1]?.after || grammar;
    }
    return grammar;
  }, [activeStepIndex, cnfSteps, gnfSteps, grammar, graphViewMode]);
  useEffect(() => {
    if (!currentGrammar) return;
    const initializeGraph = async () => {
      setIsLoading(true);
      setGraphError(null);
      try {
        const { Network } = await import('vis-network/esnext');
        const { DataSet } = await import('vis-data/esnext');
        if (!canvasRef.current) {
          setIsLoading(false);
          return;
        }
        const existingNetwork = networkRef.current as VisNetworkApi | null;
        if (existingNetwork) {
          existingNetwork.destroy();
          networkRef.current = null;
        }
        const { nodes, edges } = grammarToGraph(currentGrammar, currentGrammar.start);
        const nodesDataset = new DataSet(nodes);
        const edgesDataset = new DataSet(edges);
        const network = new Network(canvasRef.current, { nodes: nodesDataset, edges: edgesDataset }, {
          ...VIS_OPTIONS,
          physics: {
            ...VIS_OPTIONS.physics,
            enabled: physicsEnabled,
          },
          layout: {
            ...VIS_OPTIONS.layout,
            randomSeed: activeStepIndex + 11,
          },
        });
        networkRef.current = network;
        network.stabilize(140);
        network.once('stabilizationIterationsDone', () => {
          if (!physicsEnabled) {
            network.setOptions({ physics: false });
          }
          network.fit({ animation: { duration: 450, easingFunction: 'easeInOutQuad' } });
        });
      } catch (error) {
        console.error('Failed to load vis-network:', error);
        setGraphError('Failed to render graph.');
      } finally {
        setIsLoading(false);
      }
    };
    initializeGraph();
    return () => {
      const network = networkRef.current as VisNetworkApi | null;
      if (network) {
        network.destroy();
        networkRef.current = null;
      }
    };
  }, [activeStepIndex, currentGrammar, physicsEnabled]);
  const getNetwork = (): VisNetworkApi | null => networkRef.current as VisNetworkApi | null;
  const zoomIn = () => {
    const network = getNetwork();
    if (!network) return;
    network.moveTo({ scale: (network.getScale?.() || 1) * 1.12 });
  };
  const zoomOut = () => {
    const network = getNetwork();
    if (!network) return;
    network.moveTo({ scale: (network.getScale?.() || 1) * 0.88 });
  };
  const fit = () => {
    const network = getNetwork();
    if (!network) return;
    network.fit({ animation: { duration: 350 } });
  };
  const exportImage = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'grammar-graph.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  const togglePhysics = () => {
    const next = !physicsEnabled;
    setPhysicsEnabled(next);
    const network = getNetwork();
    if (network) {
      network.setOptions({ physics: { ...VIS_OPTIONS.physics, enabled: next } });
    }
  };
  return (
    <div className="graph-layout">
      <div className="graph-main panel">
        <div className="panel-row">
          <div className="toggle-set">
            <button
              className={`btn-secondary small ${graphViewMode === 'original' ? 'active' : ''}`}
              onClick={() => setGraphViewMode('original')}
            >
              View Graph
            </button>
            <button
              className={`btn-secondary small ${graphViewMode === 'cnf' ? 'active' : ''}`}
              onClick={() => setGraphViewMode('cnf')}
              disabled={cnfSteps.length === 0}
            >
              CNF Code
            </button>
            <button
              className={`btn-secondary small ${graphViewMode === 'gnf' ? 'active' : ''}`}
              onClick={() => setGraphViewMode('gnf')}
              disabled={gnfSteps.length === 0}
            >
              GNF Code
            </button>
          </div>
          {graphViewMode === 'cnf' && cnfSteps.length > 0 && (
            <input
              type="range"
              min={0}
              max={cnfSteps.length - 1}
              value={activeStepIndex}
              onChange={event => useGrammarStore.setState({ activeStepIndex: Number(event.target.value) })}
              className="step-slider"
              aria-label="CNF graph step"
            />
          )}
          {graphViewMode === 'gnf' && gnfSteps.length > 0 && (
            <input
              type="range"
              min={0}
              max={gnfSteps.length - 1}
              value={activeStepIndex}
              onChange={event => useGrammarStore.setState({ activeStepIndex: Number(event.target.value) })}
              className="step-slider"
              aria-label="GNF graph step"
            />
          )}
        </div>
        <div className="graph-canvas-wrap">
          <div ref={canvasRef} className="graph-canvas" />
          <div className="legend-box">
            <p>Symbol Legend</p>
            <span><i className="swatch nt" /> Non-Terminal (NT)</span>
            <span><i className="swatch t" /> Terminal (T)</span>
            <span><i className="swatch fresh" /> Fresh Var (X)</span>
          </div>
          {isLoading && <div className="canvas-overlay">Rendering graph…</div>}
          {!currentGrammar && <div className="canvas-overlay">No grammar loaded.</div>}
          {graphError && <div className="canvas-overlay error">{graphError}</div>}
        </div>
        <div className="graph-controls">
          <div className="zoom-set">
            <button className="icon-btn" onClick={zoomIn} title="Zoom in"><Plus size={14} /></button>
            <button className="icon-btn" onClick={zoomOut} title="Zoom out"><Minus size={14} /></button>
            <button className="icon-btn" onClick={fit} title="Fit"><RotateCcw size={14} /></button>
          </div>
          <div className="panel-actions">
            <button className="btn-secondary small" onClick={togglePhysics}>Toggle Physics</button>
            <button className="btn-secondary small" onClick={exportImage}><Download size={14} /> Export Image</button>
          </div>
        </div>
      </div>
      <aside className="graph-side">
        <div className="panel">
          <p className="eyebrow">Active Grammar</p>
          <div className="mono-lines">
            {(currentGrammar?.productions || []).slice(0, 8).map(rule => (
              <p key={rule.id}>{rule.head} → {rule.isEpsilon ? 'ε' : rule.body.map(sym => sym.value).join(' ')}</p>
            ))}
          </div>
          <div className="progress-line">
            <span style={{ width: '52%' }} />
          </div>
          <small>Complexity O(n³)</small>
        </div>
        <div className="panel">
          <p className="eyebrow">Node Details</p>
          <p className="hero-desc compact">
            This graph represents production dependencies and transition closures for the active grammar.
          </p>
        </div>
      </aside>
    </div>
  );
}

