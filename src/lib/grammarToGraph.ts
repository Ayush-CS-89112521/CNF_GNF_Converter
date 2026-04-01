import type { Grammar } from '../grammar/types';
export type NodeRole = 'start' | 'nonTerm' | 'terminal' | 'newVar';
export interface VisNode {
  id: string;
  label: string;
  role: NodeRole;
  color: {
    background: string;
    border: string;
  };
  font: {
    color: string;
    face: string;
    size: number;
  };
  shape?: string;
  title?: string;
  borderWidth?: number;
}
export interface VisEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  arrows?: string;
  color?: {
    color: string;
    highlight: string;
  };
  font?: {
    color: string;
    face: string;
    size: number;
  };
}
export function grammarToGraph(grammar: Grammar, startSymbol: string) {
  const nodes: VisNode[] = [];
  const edges: VisEdge[] = [];
  const nodeSet = new Set<string>();
  let edgeId = 0;
  function addNode(id: string, label: string, role: NodeRole) {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      const colors = NODE_COLORS[role];
      nodes.push({
        id,
        label,
        role,
        color: {
          background: colors.background,
          border: colors.border,
        },
        font: {
          color: colors.font,
          face: 'JetBrains Mono',
          size: role === 'terminal' ? 11 : 13,
        },
        shape: role === 'terminal' ? 'diamond' : role === 'start' ? 'box' : 'circle',
        title: `${role.charAt(0).toUpperCase() + role.slice(1)}: ${label}`,
        borderWidth: role === 'start' ? 3 : 2,
        ...(role === 'newVar'
          ? { shape: 'box', shapeProperties: { borderDashes: [4, 3] } }
          : {}),
      });
    }
  }
  for (const nt of Array.from(grammar.nonTerminals).sort()) {
    const role: NodeRole = nt === startSymbol
      ? 'start'
      : nt.startsWith('T') || nt.startsWith('X') || nt.startsWith('Z')
      ? 'newVar'
      : 'nonTerm';
    addNode(nt, nt, role);
  }
  for (const t of Array.from(grammar.terminals).sort()) {
    addNode(`t_${t}`, t, 'terminal');
  }
  for (const rule of grammar.productions) {
    const headRole: NodeRole = rule.head === startSymbol
      ? 'start'
      : rule.head.startsWith('T') || rule.head.startsWith('X') || rule.head.startsWith('Z')
      ? 'newVar'
      : 'nonTerm';
    addNode(rule.head, rule.head, headRole);
    if (rule.isEpsilon) {
      const epsilonId = `eps_${rule.head}`;
      addNode(epsilonId, 'ε', 'terminal');
      edges.push({
        id: `edge_${edgeId++}`,
        from: rule.head,
        to: epsilonId,
        label: 'ε',
        arrows: 'to',
        color: {
          color: 'rgba(90, 100, 120, 0.45)',
          highlight: '#4a8fff',
        },
        font: {
          color: '#505050',
          face: 'JetBrains Mono',
          size: 10,
        },
      });
      continue;
    }
    if (!rule.body || rule.body.length === 0) {
      continue;
    }
    const bodyStr = rule.body.map(s => s.value).join(' ');
    for (const sym of rule.body) {
      const targetId = sym.type === 'terminal' ? `t_${sym.value}` : sym.value;
      const targetRole: NodeRole = sym.type === 'terminal'
        ? 'terminal'
        : sym.value.startsWith('T') || sym.value.startsWith('X') || sym.value.startsWith('Z')
        ? 'newVar'
        : 'nonTerm';
      addNode(targetId, sym.value, targetRole);
      edges.push({
        id: `edge_${edgeId++}`,
        from: rule.head,
        to: targetId,
        label: bodyStr,
        arrows: 'to',
        color: {
          color: 'rgba(90, 100, 120, 0.45)',
          highlight: '#4a8fff',
        },
        font: {
          color: '#505050',
          face: 'JetBrains Mono',
          size: 10,
        },
      });
    }
  }
  return { nodes, edges };
}
export const NODE_COLORS: Record<NodeRole, { background: string; border: string; font: string }> = {
  start: { background: '#1e1e1e', border: '#f0f0f0', font: '#f0f0f0' },
  nonTerm: { background: '#0c1a2e', border: '#4a8fff', font: '#4a8fff' },
  terminal: { background: '#0a1f12', border: '#3dbb6e', font: '#3dbb6e' },
  newVar: { background: '#1f0e0e', border: '#e05252', font: '#e05252' },
};
export const VIS_OPTIONS = {
  physics: {
    enabled: true,
    stabilization: { iterations: 150 },
    barnesHut: {
      gravitationalConstant: -3000,
      springLength: 120,
      springConstant: 0.04,
    },
  },
  edges: {
    color: { color: 'rgba(90, 100, 120, 0.45)', highlight: '#4a8fff' },
    font: { color: '#505050', size: 11, face: 'JetBrains Mono' },
    arrows: { to: { enabled: true, scaleFactor: 0.6 } },
    smooth: { enabled: true, type: 'dynamic', roundness: 0.35 },
    width: 1.2,
  },
  nodes: {
    shape: 'circle',
    size: 22,
    borderWidth: 2,
    font: { size: 13, face: 'JetBrains Mono' },
    shadow: { enabled: false },
  },
  interaction: {
    hover: true,
    tooltipDelay: 100,
    navigationButtons: false,
    keyboard: false,
  },
  layout: {
    improvedLayout: true,
  },
};
interface Dataset<T extends { id: string }> {
  get: (id: string) => T | undefined;
  update: (item: Partial<T> & { id: string }) => void;
  remove: (id: string) => void;
}
interface NodeDatasetItem {
  id: string;
  color?: {
    background?: string;
    border?: string;
  };
}
interface EdgeDatasetItem {
  id: string;
  color?: {
    color?: string;
  };
}
export function animateNodeAddition(nodeId: string, nodesDataset: Dataset<NodeDatasetItem> | null) {
  if (!nodesDataset) return;
  const node = nodesDataset.get(nodeId);
  if (!node) return;
  const originalColor = node.color?.border || '#4a8fff';
  nodesDataset.update({
    id: nodeId,
    color: { ...node.color, border: '#3dbb6e' },
  });
  setTimeout(() => {
    nodesDataset.update({
      id: nodeId,
      color: { ...node.color, border: originalColor },
    });
  }, 600);
}
export function animateNodeRemoval(
  nodeId: string,
  nodesDataset: Dataset<NodeDatasetItem> | null,
  onComplete?: () => void,
) {
  if (!nodesDataset) return;
  const node = nodesDataset.get(nodeId);
  if (!node) return;
  nodesDataset.update({
    id: nodeId,
    color: { ...node.color, border: '#e05252' },
  });
  setTimeout(() => {
    nodesDataset.remove(nodeId);
    onComplete?.();
  }, 600);
}
export function animateEdgeAddition(edgeId: string, edgesDataset: Dataset<EdgeDatasetItem> | null) {
  if (!edgesDataset) return;
  const edge = edgesDataset.get(edgeId);
  if (!edge) return;
  const originalColor = edge.color?.color || 'rgba(90, 100, 120, 0.45)';
  edgesDataset.update({
    id: edgeId,
    color: { ...edge.color, color: '#3dbb6e' },
  });
  setTimeout(() => {
    edgesDataset.update({
      id: edgeId,
      color: { ...edge.color, color: originalColor },
    });
  }, 600);
}

