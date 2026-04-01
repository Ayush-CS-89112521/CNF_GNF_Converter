import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Sparkles, Code2 } from 'lucide-react';
import grammerInputImg from '../../../Images/grammer_input.png';
import graphVizImg from '../../../Images/graph visualization.png';
import stepViewImg from '../../../Images/step_view.png';
import outputFormatImg from '../../../Images/output_format.png';
import codeEditorImg from '../../../Images/code_editor_interface.png';
import serverComputingImg from '../../../Images/server_computing_infrasture.png';
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: '0px 0px -100px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 100, scale: 0.95 }}
      transition={{ duration: 0.8, delay, type: 'spring', stiffness: 100, damping: 25 }}
    >
      {children}
    </motion.div>
  );
};
export function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'precision-infrastructure', 'cnf', 'gnf'];
      let currentSection = 'home';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            currentSection = sectionId;
          }
        }
      }
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
      });
      const activeLink = document.querySelector(`a[href="#${currentSection}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="luminous-page">
      {}
      <nav className="luminous-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">CNF & GNF Converter</span>
          </div>
          <div className="nav-links">
            <a href="#home" className="nav-link active">Home</a>
            <a href="#precision-infrastructure" className="nav-link">Conversion Pipeline</a>
            <a href="#cnf" className="nav-link">CNF</a>
            <a href="#gnf" className="nav-link">GNF</a>
          </div>
          <button className="nav-cta-btn" onClick={() => navigate('/tool')}>
            Launch Tool
          </button>
        </div>
      </nav>
      <main className="luminous-main">
        {}
        <section id="home" className="hero-section">
          <div className="hero-grid-bg"></div>
          <div className="hero-gradient"></div>
          <ScrollReveal>
            <div className="hero-content">
              <div className="version-badge">
                <Sparkles size={16} />
                <span>Grammar Conversion Engine v1.0</span>
              </div>
              <h1 className="hero-title">
                Convert Context-Free Grammars to <span className="hero-gradient-text">CNF & GNF</span>
              </h1>
              <p className="hero-subtitle">
                Automatically transform your context-free grammars into Chomsky Normal Form and Greibach Normal Form. A powerful tool for formal language analysis and automated parsing.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => navigate('/tool')}>
                  Start Converting
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </ScrollReveal>
          {}
          <ScrollReveal delay={0.2}>
            <div className="hero-image-container">
              <img src={codeEditorImg} alt="Code Editor Interface" style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid rgba(133, 173, 255, 0.2)' }} />
            </div>
          </ScrollReveal>
        </section>
        {}
        <section id="precision-infrastructure" className="bento-section">
          <ScrollReveal>
            <div className="bento-header">
              <h2>Conversion Pipeline</h2>
              <p>A complete workflow for transforming context-free grammars through input, visualization, step-by-step analysis, and formatted output.</p>
            </div>
          </ScrollReveal>
          <div className="bento-grid">
            {}
            <ScrollReveal delay={0.1}>
              <div className="bento-item">
                <div className="bento-label">01 / INPUT</div>
                <h3>Grammar Input</h3>
                <p>Direct ingestion of CFGs, EBNF, and custom grammar formats with real-time linting.</p>
                <img src={grammerInputImg} alt="Grammar Input Interface" style={{ width: '100%', borderRadius: '0.75rem', marginTop: '1rem' }} />
              </div>
            </ScrollReveal>
            {}
            <ScrollReveal delay={0.15}>
              <div className="bento-item">
                <div className="bento-label">02 / VISUALIZE</div>
                <h3>Visual Graph</h3>
                <p>Interactive state-machine mapping of your language rules.</p>
                <img src={graphVizImg} alt="Graph View" style={{ width: '100%', borderRadius: '0.75rem', marginTop: '1rem' }} />
              </div>
            </ScrollReveal>
            {}
            <ScrollReveal delay={0.2}>
              <div className="bento-item">
                <div className="bento-label">03 / ANALYSIS</div>
                <h3>Step Analysis</h3>
                <p>Trace the normalization process through every transformation stage.</p>
                <img src={stepViewImg} alt="Step View" style={{ width: '100%', borderRadius: '0.75rem', marginTop: '1rem' }} />
              </div>
            </ScrollReveal>
            {}
            <ScrollReveal delay={0.25}>
              <div className="bento-item">
                <div className="bento-label">04 / EXPORT</div>
                <h3>Final Normalized Output</h3>
                <p>Production-ready grammars optimized for LLVM or custom parser generators.</p>
                <img src={outputFormatImg} alt="Output Format" style={{ width: '100%', borderRadius: '0.75rem', marginTop: '1rem' }} />
              </div>
            </ScrollReveal>
          </div>
        </section>
        {}
        <section id="cnf" className="cnf-section">
          <ScrollReveal>
            <div className="cnf-grid">
              {}
              <div className="cnf-content">
                <h2>Chomsky Normal Form <span className="cnf-highlight">(CNF)</span></h2>
                <p className="cnf-intro">
                  A Context-Free Grammar is in CNF if all its production rules are of the form A → BC or A → a. This binary branching structure is fundamental for the CYK parsing algorithm.
                </p>
                <div className="cnf-rules">
                  <div className="rule-box">
                    <div className="rule-notation">A → BC</div>
                    <div className="rule-desc">Non-terminal transition</div>
                  </div>
                  <div className="rule-box">
                    <div className="rule-notation">A → a</div>
                    <div className="rule-desc">Terminal transition</div>
                  </div>
                </div>
                <div className="cnf-benefits">
                  <h4>Key Advantages</h4>
                  <ul className="cnf-list">
                    <li>Enables efficient CYK parsing algorithm with O(n³) complexity</li>
                    <li>Simplifies grammar analysis and transformation</li>
                    <li>Guarantees uniform derivation structure</li>
                    <li>Essential for automated syntax analysis and parsing</li>
                  </ul>
                </div>
                <div className="cnf-transform">
                  <h4>Transformation Process</h4>
                  <p className="cnf-small-text">Convert any Context-Free Grammar into CNF through systematic elimination of epsilon productions, unit productions, and useless symbols. Our tool automates this entire pipeline while preserving the language semantics.</p>
                </div>
              </div>
              {}
              <div className="cnf-diagram">
                <h3>CYK Parsing Grid</h3>
                <div className="cyk-grid">
                  <div className="grid-cell primary">S</div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell muted">A</div>
                  <div className="grid-cell primary">B</div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell muted">C</div>
                  <div className="grid-cell muted">D</div>
                  <div className="grid-cell primary">A</div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell secondary">a</div>
                  <div className="grid-cell secondary">b</div>
                  <div className="grid-cell secondary">a</div>
                  <div className="grid-cell secondary">a</div>
                </div>
                <p className="grid-desc">Dynamic Programming matrix for O(n³) string recognition.</p>
              </div>
            </div>
          </ScrollReveal>
          {}
          <ScrollReveal delay={0.2}>
            <div className="code-block">
              <div className="code-header">
                <div className="code-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="code-filename">transformation.py</span>
              </div>
              <pre><code>{`# Convert CFG to Chomsky Normal Form
def to_cnf(grammar):
    grammar = remove_epsilon(grammar)
    grammar = remove_unit_productions(grammar)
    for rule in grammar.rules:
        if len(rule.body) > 2:
            # Binary split long productions
            grammar.split_production(rule)
        elif is_mixed(rule.body):
            # Encapsulate terminals
            grammar.isolate_terminals(rule)
    return grammar`}</code></pre>
            </div>
          </ScrollReveal>
        </section>
        {}
        <section id="gnf" className="gnf-section">
          <ScrollReveal>
            <div className="gnf-grid">
              {}
              <div className="gnf-cards">
                <div className="gnf-card">
                  <Zap size={32} className="gnf-icon" />
                  <h3>Deterministic Parsing</h3>
                  <p>GNF ensures that every step of derivation consumes exactly one terminal. This property allows for a more direct mapping to Pushdown Automata (PDA) and avoids left-recursion issues.</p>
                </div>
                <div className="gnf-card">
                  <Code2 size={32} className="gnf-icon-primary" />
                  <h3>Formal Constraint</h3>
                  <div className="constraint-box">
                    <code>A → aα</code>
                    <small>where a ∈ Σ and α ∈ V*</small>
                  </div>
                </div>
              </div>
              {}
              <div className="gnf-content">
                <span className="gnf-section-label">SECTION 02</span>
                <h2>Greibach Normal <span className="gnf-highlight">Form</span></h2>
                <p>
                  Named after Sheila Greibach, this form is pivotal in the construction of LL(1) parsers. Every derivation leads with a terminal, essentially creating a 'lookahead' window that eliminates the ambiguity found in deeper nested non-terminal structures.
                </p>
                <img src={serverComputingImg} alt="Server/Computing Infrastructure" style={{ width: '100%', borderRadius: '0.75rem', marginTop: '1.5rem', border: '1px solid rgba(133, 173, 255, 0.2)' }} />
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
      {}
      <footer className="luminous-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h3>CNF & GNF Converter</h3>
            <p>Simplify grammar transformation with automatic conversion to Chomsky Normal Form and Greibach Normal Form. Essential for compiler development and formal language research.</p>
          </div>
          <div className="footer-col">
            <h4>Learning Resources</h4>
            <ul>
              <li><a href="https://en.wikipedia.org/wiki/Chomsky_normal_form" target="_blank" rel="noopener noreferrer">Chomsky Normal Form</a></li>
              <li><a href="https://en.wikipedia.org/wiki/Greibach_normal_form" target="_blank" rel="noopener noreferrer">Greibach Normal Form</a></li>
              <li><a href="https://en.wikipedia.org/wiki/Context-free_grammar" target="_blank" rel="noopener noreferrer">Context-Free Grammars</a></li>
              <li><a href="https://en.wikipedia.org/wiki/Formal_language" target="_blank" rel="noopener noreferrer">Formal Language Theory</a></li>
            </ul>
          </div>
          <div className="footer-col footer-social">
            <h4>Creator</h4>
            <div className="social-links">
              <a href="https://github.com/Ayush-CS-89112521" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub Profile">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/ayush-54b931381/" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn Profile">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

