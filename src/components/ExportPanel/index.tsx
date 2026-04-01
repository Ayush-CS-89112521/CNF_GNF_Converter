import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Share2 } from 'lucide-react';
import { useGrammarStore } from '../../store/grammarStore';
import { grammarToString } from '../../lib/grammarToString';
export function ExportPanel() {
  const { grammar, cnfSteps, gnfSteps } = useGrammarStore();
  const [copied, setCopied] = React.useState<string | null>(null);
  if (!grammar) {
    return (
      <div className="glass-panel p-6 text-center text-[var(--ion-text-dim)]">
        <p className="font-mono text-sm">No grammar to export</p>
      </div>
    );
  }
  const grammarText = grammarToString(grammar);
  const cnfData = cnfSteps.length > 0 ? grammarToString(cnfSteps[cnfSteps.length - 1].after) : '';
  const gnfData = gnfSteps.length > 0 ? grammarToString(gnfSteps[gnfSteps.length - 1].after) : '';
  const handleCopy = (type: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };
  const handleDownload = (filename: string, content: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const handleShareURL = () => {
    const encoded = btoa(grammarText);
    const url = `${window.location.origin}?grammar=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopied('url');
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      {}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--ion-green)] pulse-dot" />
        <span className="font-mono text-xs font-semibold tracking-widest text-[var(--ion-green)] text-glow-green uppercase">
          Export & Share
        </span>
      </div>
      {}
      <div className="space-y-3">
        {}
        <ExportItem
          label="Original Grammar"
          onCopy={() => handleCopy('original', grammarText)}
          onDownload={() => handleDownload('grammar.txt', grammarText)}
          copied={copied === 'original'}
        />
        {}
        {cnfData && (
          <ExportItem
            label="CNF Grammar"
            onCopy={() => handleCopy('cnf', cnfData)}
            onDownload={() => handleDownload('grammar-cnf.txt', cnfData)}
            copied={copied === 'cnf'}
          />
        )}
        {}
        {gnfData && (
          <ExportItem
            label="GNF Grammar"
            onCopy={() => handleCopy('gnf', gnfData)}
            onDownload={() => handleDownload('grammar-gnf.txt', gnfData)}
            copied={copied === 'gnf'}
          />
        )}
      </div>
      {}
      <div className="pt-3 border-t border-[var(--ion-border)]">
        <button
          onClick={handleShareURL}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-mono text-xs font-semibold text-white bg-gradient-to-r from-[var(--ion-green)] to-[var(--ion-cyan)] hover:from-[var(--ion-cyan)] hover:to-[var(--ion-green)] transition-all border border-[var(--ion-green)]"
        >
          <Share2 size={12} />
          {copied === 'url' ? 'Copied!' : 'Copy Share URL'}
        </button>
      </div>
    </div>
  );
}
interface ExportItemProps {
  label: string;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}
function ExportItem({ label, onCopy, onDownload, copied }: ExportItemProps) {
  return (
    <motion.div className="flex gap-2 items-stretch">
      <button
        onClick={onCopy}
        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-mono font-semibold text-[var(--ion-cyan)] bg-[rgba(64,224,255,0.08)] border border-[rgba(64,224,255,0.2)] hover:border-[var(--ion-cyan)] transition-all"
        title={`Copy ${label}`}
      >
        <Copy size={11} />
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <button
        onClick={onDownload}
        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-mono font-semibold text-[var(--ion-green)] bg-[rgba(80,230,130,0.08)] border border-[rgba(80,230,130,0.2)] hover:border-[var(--ion-green)] transition-all"
        title={`Download ${label}`}
      >
        <Download size={11} />
        Download
      </button>
    </motion.div>
  );
}

