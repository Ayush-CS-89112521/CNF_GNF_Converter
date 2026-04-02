# TAFL Project: CNF & GNF Converter

> A comprehensive web-based tool for converting Context-Free Grammars (CFG) to Chomsky Normal Form (CNF) and Greibach Normal Form (GNF) with interactive visualization, step-by-step analysis, and educational insights.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.2.4-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Algorithms & Concepts](#algorithms--concepts)
- [API Reference](#api-reference)
- [Contributing](#contributing)

---

## 🎯 Overview

The **TAFL Project: CNF & GNF Converter** is an interactive educational tool designed to help students and professionals understand formal language theory. It provides a complete pipeline for:

1. **Parsing** Context-Free Grammars from natural text input
2. **Converting to CNF** through a series of transformations (epsilon elimination, unit removal, etc.)
3. **Converting to GNF** through advanced techniques (left-recursion elimination, back-substitution)
4. **Visualizing** grammar rules as interactive dependency graphs
5. **Exporting** results in multiple formats (PDF, text)
6. **Analyzing** each transformation step with detailed explanations

### Why This Tool?

- **Educational**: Learn formal language transformations step-by-step
- **Visual**: See grammar transformations as interactive graphs
- **Interactive**: Test custom grammars and see real-time results
- **Exportable**: Save your work in multiple formats
- **Archivable**: Keep history of all conversions

---

## ✨ Features

### Core Functionality

#### 1. **Grammar Parsing & Validation**
- Parse context-free grammars in standard notation (e.g., `S → aB | ε`)
- Real-time syntax validation with detailed error messages
- Support for epsilon (ε) productions, terminals, and non-terminals
- Automatic identification of start symbol

#### 2. **CNF Pipeline** (5 Transformation Steps)
- **Step 1: Epsilon Elimination** - Remove ε productions while preserving language
- **Step 2: Unit Production Removal** - Eliminate A → B rules
- **Step 3: Useless Symbol Removal** - Delete unreachable and non-productive symbols
- **Step 4: Terminal Replacement** - Separate terminals into their own productions (A → a becomes A → X, X → a)
- **Step 5: Binarization** - Convert all productions to form A → BC or A → a

#### 3. **GNF Pipeline** (4 Advanced Steps)
- **Step 1: Variable Ordering** - Impose linear ordering on non-terminals
- **Step 2: Production Substitution** - Iteratively substitute productions to remove left recursion
- **Step 3: Left Recursion Elimination** - Replace left-recursive productions with iterative forms
- **Step 4: Back-Substitution** - Convert to final GNF form (A → aα where a is terminal, α is non-terminals)

#### 4. **Interactive Visualization**
- **Dependency Graphs**: Visualize grammar as directed acyclic graphs
- **Physics-based Layout**: Automatic node positioning using vis-network
- **Color-coded Nodes**: Start symbol, terminals, non-terminals, and new variables
- **Interactive Exploration**: Zoom, pan, and inspect rules in graph view

#### 5. **Step-by-Step Analysis**
- **Before/After Comparison**: See transformation changes for each step
- **Detailed Diffs**: Understand which rules were added, removed, or kept
- **Explanations**: Each step includes mathematical reasoning
- **Scrubbing**: Navigate through transformation history

#### 6. **Export & Archive**
- **PDF Export**: Professional documents with readable formatting
- **Format Selection**: Choose CFG, CNF, or GNF format
- **Comparison Export**: Side-by-side before/after PDFs
- **History Storage**: Archive all conversions with metadata
- **Batch Operations**: Export multiple grammars

#### 7. **History & Archive**
- Persistent storage of all completed conversions
- Quick access to previous work
- Metadata tracking (timestamps, rule counts)
- Delete or clear history as needed

---

## 🛠 Technology Stack

### Frontend Framework
- **React 19.2.4** - Modern UI library with hooks
- **TypeScript 5.9.3** - Type-safe development
- **Vite 8.0.1** - Lightning-fast build tool and dev server

### Styling & UI
- **Tailwind CSS 3.4.19** - Utility-first styling framework
- **PostCSS** - CSS processing with autoprefixer
- **Custom CSS** - Enhanced theming and animations
- **Lucide React 1.7.0** - Beautiful, consistent icons
- **Framer Motion 12.38.0** - Smooth animations and transitions

### State Management
- **Zustand 5.0.12** - Lightweight, scalable state store
- **Immer 11.1.4** - Immutable state updates
- **LocalStorage Persistence** - Browser storage for history

### Visualization
- **vis-network 10.0.4** - Interactive graph visualization
- **vis-data 8.0.3** - Data management for graphs

### File Export
- **jsPDF 4.2.1** - PDF generation in the browser
- **html2canvas** - Canvas-based rendering for PDFs

### Utilities
- **Zod 4.3.6** - Runtime schema validation
- **UUID 13.0.0** - Unique identifier generation
- **Class Variance Authority 0.7.1** - Component variants
- **clsx 2.1.1** - Conditional CSS class management

---

## 🏗 Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (React Components: Input, Table, Graph, Export, History)  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              State Management (Zustand)                      │
│    • Grammar State    • Conversion Pipelines                │
│    • UI State         • History Management                  │
│    • Navigation       • Screen Routing                      │
└────────────────────┬────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
┌─────▼────┐  ┌──────▼─────┐  ┌────▼──────┐
│  Grammar  │  │  CNF Conv. │  │ GNF Conv. │
│  Parser   │  │  Pipeline  │  │ Pipeline  │
└──────────┘  └────────────┘  └───────────┘
      │              │              │
      └──────────────┼──────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼───┐  ┌────▼───┐  ┌───▼────┐
    │ Export │  │Visualize│  │ Utils  │
    │ (PDF)  │  │ (Graph) │  │(String)│
    └────────┘  └────────┘  └────────┘
```

### Data Flow

```
Input Grammar Text
    ↓
Grammar Parser (Tokenize → AST → Grammar Object)
    ↓
Run CNF Pipeline (5 sequential transformations)
    ↓ (StepSnapshot[] with before/after diffs)
Run GNF Pipeline (4 sequential transformations)
    ↓ (StepSnapshot[] with before/after diffs)
Store Snapshots in State
    ↓
User Navigation (Select Steps, Export, Archive)
    ↓
Visualization & Export Engines
```

---

## 📁 Directory Structure

```
src/
├── App.tsx                 # Main application shell, navigation, routing
├── App.css                 # Global application styling (1600+ lines)
├── index.css               # Global styles, CSS variables, theme
├── main.tsx                # Entry point, React root
│
├── components/             # React UI components
│   ├── GrammarInput/       # Input form for grammar specification
│   ├── GrammarTable/       # Table display of grammar rules
│   ├── GrammarGraphPanel/  # Graph visualization using vis-network
│   ├── StepViewer/         # Step-by-step transformation viewer
│   ├── ExportPanel/        # Export and download functionality
│   └── StatusBar/          # Real-time error/status display
│
├── grammar/                # Core grammar data types & parsing
│   ├── parser.ts           # Tokenizer + Parser (CFG → Grammar object)
│   └── types.ts            # TypeScript interfaces (Grammar, Rule, etc.)
│
├── cnf/                    # Chomsky Normal Form conversion pipeline
│   ├── index.ts            # CNF orchestrator (runs 5 steps)
│   ├── removeEpsilon.ts    # Eliminate ε productions
│   ├── removeUnit.ts       # Eliminate unit productions (A → B)
│   ├── removeUseless.ts    # Remove unreachable/non-productive symbols
│   ├── terminalReplacement.ts # Separate terminals
│   └── binarization.ts     # Convert to binary form (A → BC or A → a)
│
├── gnf/                    # Greibach Normal Form conversion pipeline
│   ├── index.ts            # GNF orchestrator (runs 4 steps)
│   ├── orderVariables.ts   # Impose linear variable ordering
│   ├── substituteProductions.ts # Substitute productions
│   ├── eliminateLeftRecursion.ts # Remove left recursion
│   └── backSubstitute.ts   # Final GNF conversion
│
├── lib/                    # Utility libraries
│   ├── exportToPdf.ts      # PDF generation using jsPDF
│   ├── grammarToGraph.ts   # Convert Grammar to vis-network format
│   └── grammarToString.ts  # Format Grammar for display
│
└── store/                  # State management (Zustand)
    └── grammarStore.ts     # Central store with all app state & actions
```

### Key Files Explained

| File | Purpose | LOC |
|------|---------|-----|
| `src/App.tsx` | Main component with screen routing and layout | ~900 |
| `src/store/grammarStore.ts` | Zustand store with all state logic | ~450 |
| `src/grammar/parser.ts` | Grammar parsing (tokenizer + parser) | ~300 |
| `src/cnf/index.ts` | CNF transformation orchestrator | ~150 |
| `src/gnf/index.ts` | GNF transformation orchestrator | ~120 |
| `src/App.css` | UI styling and layout | ~1600 |
| `src/lib/exportToPdf.ts` | PDF export functionality | ~270 |

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18+ (includes npm)
- **Git**

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/Ayush-CS-89112521/CNF_GNF_Converter.git
cd CNF_GNF_Converter

# Install dependencies
npm install
```

### Development

```bash
# Start development server (with HMR)
npm run dev

# Output:
# > VITE v8.0.3 ready in 572ms
# > ➜  Local:   http://localhost:5173
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
# Type check & build for production
npm run build

# Output:
# > vite build
# > ✓ 2028 modules transformed
# > dist/index.html                 0.46 kB │ gzip: 0.30 kB
# > dist/assets/index.js            650.73 kB │ gzip: 156.24 kB

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint

# Check TypeScript types
npx tsc --noEmit
```

---

## 📖 Usage Guide

### Basic Workflow

#### 1. **Input a Grammar**
On the **Workspace** screen, enter a context-free grammar using standard notation:

```
S → aSb | ε
A → bA | a
```

- Rules are separated by newlines
- Each rule: `NonTerminal → Body | Body2 | ...`
- Use `ε` or `epsilon` for epsilon productions
- Terminals are lowercase/symbols; non-terminals are uppercase

#### 2. **Run CNF Conversion**
Click **"Convert to CNF"** to:
- Validate the grammar
- Execute 5 transformation steps
- Generate step snapshots with before/after comparisons

#### 3. **Explore Step Analysis**
In **Step Analysis** screen:
- Navigate through each transformation step
- View production changes (additions, removals)
- See detailed explanations for each change

#### 4. **View Transformations**
- **Grammar Table**: See all rules at the current step
- **Dependency Graph**: Visualize grammar as a node-link diagram
- **Final CNF**: Review the complete normalized grammar

#### 5. **Convert to GNF** (Optional)
Once CNF is complete:
- Click **"Convert to GNF"**
- Execute 4 GNF-specific transformations
- Explore variable ordering, substitution, left-recursion elimination

#### 6. **Export Results**
In **Export Center**:
- Select format (CFG, CNF, GNF)
- Choose export type (Grammar, Comparison)
- Download as PDF or copy to clipboard

#### 7. **Archive & History**
In **Archive**:
- View all previous conversions
- Click to reload and explore
- Delete individual entries or clear entire history

### Example: Convert Simple Grammar to CNF

**Input Grammar:**
```
S → aAS | a
A → bS | b
```

**After CNF Conversion:**
```
S → X₁A₂ | a
S → X₁E₂ | a
A → X₂S | b
X₁ → a
X₂ → b
A₂ → SX₁
E₂ → AS
```

**Why the Changes?**
- Introduced new non-terminals (X₁, X₂, A₂, E₂) for terminal replacement
- Converted A → bS into A → X₂S with X₂ → b
- Binarized longer productions (S → aAS becomes S → X₁A₂, A₂ → SX₁)

---

## 🔬 Algorithms & Concepts

### CNF (Chomsky Normal Form)

**Definition**: Every production is of the form:
- `A → BC` (two non-terminals)
- `A → a` (single terminal)
- `S → ε` (only for empty language, optional)

**Why CNF?**
- Simplifies parsing algorithms (CYK, Earley)
- Enables efficient bottom-up parsing
- Useful for proving language properties

**Transformation Pipeline (5 Steps)**:

```
Original Grammar
    ↓
1. Epsilon Elimination
   Remove A → ε productions (except S → ε if needed)
    ↓
2. Unit Production Removal
   Remove A → B productions
    ↓
3. Useless Symbol Removal
   Delete unreachable/non-productive symbols
    ↓
4. Terminal Replacement
   Separate terminals: A → a becomes A → X, X → a
    ↓
5. Binarization
   Break long productions: A → BCD becomes A → BX, X → CD
    ↓
CNF Grammar (guaranteed form: A → BC or A → a)
```

### GNF (Greibach Normal Form)

**Definition**: Every production is of the form:
- `A → aB₁B₂...Bₖ` (terminal followed by zero or more non-terminals)

**Why GNF?**
- Enables top-down parsing without backtracking
- Every derivation consumes exactly one terminal
- Useful for pushdown automata conversion

**Transformation Pipeline (4 Steps)**:

```
CNF Grammar
    ↓
1. Variable Ordering
   Order non-terminals A₁ < A₂ < ... < Aₙ (S = A₁)
    ↓
2. Production Substitution
   Eliminate cross-variable productions (A₁ → A₂...)
    ↓
3. Left Recursion Elimination
   Remove A → A... patterns using auxiliary variables
    ↓
4. Back-Substitution
   Final conversion to GNF form (A → aα)
    ↓
GNF Grammar (guaranteed form: A → aα)
```

### Key Algorithms Implemented

#### **Epsilon-Closure Computation**
```
nullable(A) = true if A can derive ε
For each rule A → X₁X₂...Xₖ:
  If all Xᵢ are nullable, then A is nullable
```

#### **Left-Recursion Elimination**
```
For each pair (A, B) where A < B:
  Substitute all B → ... productions into A → B... rules
For each A with direct left recursion (A → Aα | β):
  Create new variable Aₙ
  Replace with: A → βAₙ | β
               Aₙ → αAₙ | ε
```

#### **Reachability Analysis**
```
reachable(A) = true if there's a derivation S ⟹* wAv
productive(A) = true if there's a derivation A ⟹* w
useless(A) = not productive OR not reachable
```

---

## � Detailed CNF Transformation Steps

### Step 1: Epsilon Elimination

**Problem**: Epsilon productions (A → ε) complicate parsing algorithms because they allow rules to derive empty strings, making it harder to predict what should come next in parsers.

**Algorithm**:
1. Compute the **nullable set** — all non-terminals that can derive ε
2. For each rule A → X₁X₂...Xₖ where all Xᵢ can be nullable:
   - Generate all possible combinations of removing nullable variables
   - Add these new productions to the grammar
3. Remove all ε-productions (keeping S → ε only if needed for empty language)

**Example**:

**Before:**
```
S → aA | ε
A → b | ε
```

**Nullable Set**: {S, A} (both can derive ε)

**Generated Alternatives**:
- S → a**A** becomes S → a**A** | a (remove A)
- A → **b** (no nullable symbols — keep as is)

**After:**
```
S → aA | a
A → b
```

**Why**: Now all productions are ε-free (except S → ε if input language is empty), making the grammar easier for deterministic parsers.

---

### Step 2: Unit Production Removal

**Problem**: Unit productions (A → B where B is a single non-terminal) create chains like A → B → C → ... that are redundant — we can derive the same strings by replacing A directly with C's productions.

**Algorithm**:
1. Compute **unit closure** for each variable using BFS/Floyd-Warshall:
   - unit_closure(A) = {B | A ⟹* B via unit productions}
2. For each variable A and each B in unit_closure(A):
   - For each non-unit production B → γ:
     - Add rule A → γ
3. Remove all unit productions (A → B rules)

**Example**:

**Before:**
```
S → A
A → B
B → a | b
```

**Unit Closures**:
- unit_closure(S) = {S, A, B}
- unit_closure(A) = {A, B}
- unit_closure(B) = {B}

**Replacement**:
- S can reach production B → a and B → b, so add S → a | b
- A can reach production B → a and B → b, so add A → a | b

**After:**
```
S → a | b
A → a | b
B → a | b
```

**Why**: Eliminates intermediary non-terminals, reducing grammar complexity.

---

### Step 3: Useless Symbol Removal

**Problem**: Some symbols are unreachable from the start symbol S (impossible to use in any derivation) or non-productive (can't derive any terminal string). These add clutter without contributing to language generation.

**Algorithm** (Two-Phase):

**Phase 1 — Find Productive Symbols**:
- Mark all terminals as productive
- Iterate: If all RHS symbols of rule A → X₁...Xₖ are productive, mark A as productive
- Continue until no new symbols marked

**Phase 2 — Find Reachable Symbols**:
- Mark S as reachable
- Iterate: If A is reachable and A → X₁X₂...Xₖ, mark all Xᵢ as reachable
- Continue until no new symbols marked

**Remove**: Any symbol not both productive AND reachable

**Example**:

**Before:**
```
S → aA | b
A → aB | a
B → a
C → d
```

**Phase 1 — Productive**: S ✓, A ✓, B ✓, C ✓ (all can derive terminals)

**Phase 2 — Reachable**: S ✓, A ✓ (from S → aA), B ✓ (from A → aB), C ✗ (unreachable)

**After** (remove C):
```
S → aA | b
A → aB | a
B → a
```

**Why**: Ensures every symbol contributes to the language; improves parsing efficiency and grammar clarity.

---

### Step 4: Terminal Replacement

**Problem**: CNF requires rules to be either:
- A → BC (two non-terminals)
- A → a (single terminal)

But we have rules like A → aB (mix of terminal and non-terminal). We need to separate them.

**Algorithm**:
1. For each rule A → X₁X₂...Xₖ where k ≥ 2 and some Xᵢ are terminals:
   - For each terminal 'a' in the rule:
     - Create fresh variable T_a
     - Add rule T_a → a
     - Replace 'a' with T_a in the original rule
2. Keep single-symbol rules unchanged

**Example**:

**Before:**
```
S → aA | a
A → bB | b
B → cC | c
```

**Terminal Replacements**:
- Create: T_a → a, T_b → b, T_c → c
- S → aA becomes S → T_a A
- A → bB becomes A → T_b B
- etc.

**After**:
```
S → T_a A | a
A → T_b B | b
B → T_c C | c
T_a → a
T_b → b
T_c → c
```

**Why**: Prepare grammar for binarization by ensuring multi-symbol rules contain only non-terminals.

---

### Step 5: Binarization

**Problem**: CNF requires productions with exactly 2 or 1 symbols on RHS. But after terminal replacement, we may have rules like A → BCDE (4 non-terminals). We must break these into binary chains.

**Algorithm**:
1. For each rule A → X₁X₂...Xₙ where n ≥ 3:
   - Create fresh variables Y₁, Y₂, ..., Yₙ₋₂
   - Replace with chain:
     - A → X₁Y₁
     - Y₁ → X₂Y₂
     - Y₂ → X₃Y₃
     - ...
     - Yₙ₋₂ → Xₙ₋₁Xₙ

**Example**:

**Before**:
```
S → ABCD
A → aB
```

**Binarization of S → ABCD**:
- Create Y₁, Y₂
- Replace with:
  - S → AY₁
  - Y₁ → BY₂
  - Y₂ → CD

**After**:
```
S → AY₁
A → aB
Y₁ → BY₂
Y₂ → CD
```

**All rules now have ✓ CNF form (A → BC or A → a)**

**Why**: This is the final step that guarantees CNF — every production has at most 2 symbols.

---

## 🔄 Detailed GNF Transformation Steps

### Step 1: Variable Ordering

**Problem**: GNF requires productions to start with terminals. But some productions have non-terminal prefixes like A → B... To eliminate left-recursion predictably, we need a linear ordering of variables.

**Algorithm**:
1. Compute Strongly Connected Components (SCCs) of non-terminals:
   - A and B are in same SCC if A ⟹* B and B ⟹* A (reachable in both directions)
2. **Topological sort** SCCs by reverse-postorder
3. Within each SCC, impose arbitrary ordering
4. Assign A₁ = start symbol, A₂, A₃, ...

**Example**:

**Before**:
```
S → aA | B
A → bS | a
B → cA | c
```

**Dependency Graph**: S → B, S → A, A → S, B → A (forms SCC: {S, A})

**Topological Order**: {S, A} comes before {B}

**Final Ordering**: S = A₁, A = A₂, B = A₃

**Why**: Ensures that when we eliminate left recursion, we do it in a way that prevents new left recursion from being introduced.

---

### Step 2: Production Substitution

**Problem**: Before eliminating left recursion, we need all rules of Aᵢ to start with either:
- A terminal 'a' (good for GNF)
- A variable Aⱼ where j > i (we'll handle this in left-recursion step)

Currently some may have Aⱼ where j < i (earlier variables), creating mutual dependencies.

**Algorithm**:
For i = 1 to n:
- For each rule Aᵢ → Aⱼ γ where j < i:
  - For each rule Aⱼ → δ:
    - Add rule Aᵢ → δ γ
  - Remove the rule Aᵢ → Aⱼ γ

**Example**:

**Before** (after ordering: S = A₁, A = A₂, B = A₃):
```
A₁ (S) → aA₂ | A₃c
A₂ (A) → bA₁ | a
A₃ (B) → cA₂ | c
```

**Substitution**:
- A₁ → A₃c: Substitute A₃ → cA₂ | c
  - Add: A₁ → cA₂c | cc
  - Remove: A₁ → A₃c
- A₂ → bA₁: Already has j=1, i=2, so j < i — this is left recursion (handle in next step)
- A₃ → cA₂: j=2, i=3, so j < i — needs substitution?

**After** (carefully applied):
```
A₁ → aA₂ | cA₂c | cc
A₂ → bA₁ | a
A₃ → cA₂ | c
```

**Why**: Ensures a clear dependency structure before left-recursion elimination.

---

### Step 3: Left Recursion Elimination

**Problem**: Productions like A → Aα (starting with the same variable) prevent top-down parsing. We must eliminate them while preserving language.

**Algorithm**:
For each variable Aᵢ:
- Separate productions into two groups:
  - **Left-recursive**: Aᵢ → Aᵢ α₁ | Aᵢ α₂ | ... | Aᵢ αₖ
  - **Non-left-recursive**: Aᵢ → β₁ | β₂ | ... | βₘ
- Introduce new variable Zᵢ
- Replace with:
  - Aᵢ → β₁ | β₁Zᵢ | β₂ | β₂Zᵢ | ... | βₘ | βₘZᵢ
  - Zᵢ → α₁ | α₁Zᵢ | α₂ | α₂Zᵢ | ... | αₖ | αₖZᵢ
- Repeat until all direct left recursion eliminated

**Intuition**: A → Aα | β is equivalent to A → β | βα*. We express this with auxiliary variable Z:
- A produces β, then optionally chains more repetitions (Z)
- Z produces α, then optionally chains more repetitions (Z)

**Example**:

**Before**:
```
A → Aa | b
```

**Separation**:
- Left-recursive: A → Aa (α = a)
- Non-left-recursive: A → b (β = b)

**Elimination**:
- Introduce: Z_A
- Replace with:
  - A → b | bZ_A
  - Z_A → a | aZ_A

**Derivation Check**:
- Old: A ⟹ b, A ⟹ Aa ⟹ ba, A ⟹ Aa ⟹ Aaa ⟹ baa, ... (derives b, ba, baa, ...)
- New: A ⟹ b (same), A ⟹ bZ_A ⟹ ba (same), A ⟹ bZ_A ⟹ baZ_A ⟹ baa (same), ... ✓

**Why**: Removes left recursion, enabling top-down (LL) parsing.

---

### Step 4: Back-Substitution

**Problem**: After steps 1-3, we have productions like:
- Aᵢ → a... (starts with terminal ✓)
- Aᵢ → Aⱼ... where j > i (starts with non-terminal ✗)
- Zᵢ → a... (starts with terminal ✓)
- Zᵢ → Aⱼ... (starts with non-terminal ✗)

The second and fourth types need **back-substitution** to convert non-terminal prefixes to terminals.

**Algorithm**:
- While there exist productions Aᵢ → Aⱼ γ or Zᵢ → Aⱼ γ:
  - For each such production:
    - For each rule Aⱼ → δ:
      - Add rule (same variable) → δ γ
    - Remove the production starting with Aⱼ

**Example**:

**Before**:
```
A₁ → aA₂ | cA₃
A₂ → b
A₃ → dA₂ | e
```

**Back-substitution**:
- A₁ → cA₃: Substitute A₃ → dA₂ | e
  - Add: A₁ → cdA₂ | ce
  - Remove: A₁ → cA₃
- A₃ → dA₂: Substitute A₂ → b
  - Add: A₃ → db
  - Remove: A₃ → dA₂

**After**:
```
A₁ → aA₂ | cdA₂ | ce
A₂ → b
A₃ → db | e
```

**All rules now start with terminals ✓ (GNF form: A → aα)**

**Why**: Final transformation to achieve Greibach Normal Form — enables predictable top-down parsing.

---

## 📖 Complete Example: CFG → CNF → GNF

**Input Grammar (CFG)**:
```
S → aSb | ε
A → b
```

**CNF Conversion**:

1. **Epsilon Elimination**:
   - Nullable: {S}
   - S → aSb becomes S → aSb | ab (remove S from second position)
   ```
   S → aSb | ab
   A → b
   ```

2. **Unit Removal** (none needed):
   ```
   S → aSb | ab
   A → b
   ```

3. **Useless Removal** (A is unused):
   ```
   S → aSb | ab
   ```

4. **Terminal Replacement**:
   - Create T_a → a, T_b → b
   ```
   S → T_a S T_b | T_a T_b
   T_a → a
   T_b → b
   ```

5. **Binarization**:
   - S → T_a S T_b (3 symbols): Create X₁
     - S → T_a X₁
     - X₁ → S T_b
   ```
   S → T_a X₁ | T_a T_b
   X₁ → S T_b
   T_a → a
   T_b → b
   ```

**GNF Conversion** (from CNF above):

1. **Variable Ordering**: S = A₁, T_a = A₂, T_b = A₃, X₁ = A₄
   
2. **Production Substitution** (rearrange):
   - All start with appropriate order
   
3. **Left Recursion Elimination** (X₁ → S T_b, S → T_a X₁ — cycles exist):
   - S → T_a X₁: j < i, so substitute T_a → a
     - Add: S → aX₁
   - X₁ → S T_b: Substitute S → aX₁ | T_a T_b
     - Add: X₁ → aX₁T_b | T_a T_b T_b
   - Remove X₁ → S T_b (left recursion pair)
   
   Result: No direct left recursion (aX₁T_b is left recursion!)
   - X₁ → aX₁T_b is left-recursive (α = T_b, β = T_a T_b T_b)
   - Introduce Z_X₁
   - X₁ → T_a T_b T_b | T_a T_b T_b Z_X₁
   - Z_X₁ → T_b | T_b Z_X₁

4. **Back-Substitution**:
   - Replace terminal variables with actual terminals
   - S → aX₁ (keep)
   - T_a → a (already terminal prefix) ✓
   - T_b → b (already terminal prefix) ✓
   - X₁ → T_a... becomes X₁ → aT_b T_b | aT_b T_b Z_X₁ (substitute T_a → a)
   - Z_X₁ → T_b becomes Z_X₁ → b (substitute T_b → b)

**Final GNF**:
```
S → aX₁
X₁ → aT_b T_b | aT_b T_b Z_X₁
T_a → a
T_b → b
Z_X₁ → b | bZ_X₁
```

✓ **All productions start with terminals** (Greibach Normal Form)

---

## �🔌 API Reference

### State Store (Zustand)

#### Core State

```typescript
// Grammar & Conversion
grammar: Grammar | null;
inputText: string;
inputErrors: string[];
cnfSteps: StepSnapshot[];
gnfSteps: StepSnapshot[];
cnfDone: boolean;
gnfDone: boolean;

// UI & Navigation
screen: AppScreen; // workspace | steps | table | graph | ...
activeMode: AppMode; // cnf | gnf
activeStepIndex: number;
isConverting: boolean;
sidebarCollapsed: boolean;

// History
history: HistoryEntry[];
selectedHistoryId: string | null;
```

#### Core Actions

```typescript
// Input & Grammar
setInputText(text: string): void;
setGrammar(grammar: Grammar | null): void;
runCNF(): void;               // Execute CNF pipeline
runGNF(): void;               // Execute GNF pipeline
reset(): void;                // Clear all

// Navigation & UI
setScreen(screen: AppScreen): void;
setActiveStepIndex(index: number): void;
setActiveMode(mode: AppMode): void;
toggleSidebar(): void;

// History
loadHistory(id: string): void;
deleteHistory(id: string): void;
clearHistory(): void;
setSelectedHistoryId(id: string | null): void;
```

### Grammar Parser

```typescript
function parseGrammar(text: string): {
  grammar: Grammar | null;
  errors: string[];
}
```

**Input Format:**
```
NonTerminal → Term1 | Term2 | ...
A → aB | b | ε
```

**Returns:**
```typescript
{
  grammar: {
    start: string;              // Start symbol
    terminals: Set<string>;     // Terminal symbols
    nonTerminals: Set<string>;  // Non-terminal symbols
    productions: Rule[];        // Grammar rules
  },
  errors: []                    // Parse errors (if any)
}
```

### Export Functions

```typescript
// Export to PDF
function downloadGrammarPdf(
  grammar: Grammar,
  format: 'cfg' | 'cnf' | 'gnf',
  filename?: string
): void;

function downloadComparisonPdf(
  beforeGrammar: Grammar,
  afterGrammar: Grammar,
  beforeLabel: string,
  afterLabel: string,
  filename?: string
): void;
```

### Visualization

```typescript
// Convert grammar to graph format
function grammarToGraph(grammar: Grammar): GrammarGraph {
  nodes: GraphNode[];  // {id, label, role}
  edges: GraphEdge[];  // {from, to, label, id}
}
```

---

## 🎨 UI/UX Features

### Design System

**Color Palette (Ion Frost Theme):**
- Background: `#0e0e0e` (almost black)
- Primary: `#4a8fff` (blue)
- Success: `#3dbb6e` (green)
- Warning: `#ffc43d` (yellow)
- Borders: `#1e1e1e` - `#2a2a2a` (dim gray)

**Typography:**
- Headers: JetBrains Mono (monospace)
- Body: Inter (sans-serif)
- Code: JetBrains Mono

**Components:**
- Collapsible sidebar (280px expanded, 60px collapsed)
- Fixed topbar (68px height)
- Smooth transitions (350ms)
- Custom scrollbars
- Card-based layouts with gradient borders

### Screens (11 Total)

1. **Workspace** - Input & control
2. **Step Analysis** - Step-by-step transformation viewer
3. **Grammar Table** - Rule display with syntax highlighting
4. **Dependency Graph** - Interactive vis-network visualization
5. **CNF Final** - Complete normalized grammar
6. **Variable Ordering** - GNF variable ordering visualization
7. **Transformation** - Before/after comparison
8. **GNF Graph** - GNF visualization
9. **Export Center** - PDF/text export options
10. **Archive** - History management
11. **History Detail** - Individual entry inspection

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Setup for Contributors

```bash
#Clone your fork
git clone https://github.com/YOUR-USERNAME/TAFL_Project_CNF_and_GNF_Converter.git
cd TAFL_Project_CNF_and_GNF_Converter

# Create feature branch
git checkout -b feature/your-feature-name

# Install & develop
npm install
npm run dev
```

### Development Workflow

1. Create a feature branch (`git checkout -b feature/feature-name`)
2. Make changes in TypeScript with strict types
3. Test thoroughly (manual testing in dev server)
4. Ensure no linting errors (`npm run lint`)
5. Commit with clear messages (`git commit -am 'feat: add feature'`)
6. Push to your fork (`git push origin feature/feature-name`)
7. Create Pull Request with description

### Code Quality Standards

- **TypeScript**: Strict mode, no `any` types
- **React**: Functional components with hooks
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Comments**: Explain "why", not "what"
- **Testing**: Manual browser testing required for UI changes

### Areas for Contribution

- [ ] Additional grammar normalization algorithms
- [ ] Keyboard shortcuts for navigation
- [ ] Dark/light theme toggle
- [ ] Import/export from external files
- [ ] LaTeX equation rendering
- [ ] Performance optimizations
- [ ] Internationalization (i18n)
- [ ] Unit tests for algorithms
- [ ] Documentation improvements

---

## 📊 Performance

- **Build Time**: ~2.48s (TypeScript + Vite)
- **Bundle Size**: 650 KB (minified)
- **First Paint**: <1s on modern browsers
- **Parse Time**: <500ms for typical grammars
- **Conversion Time**: <1s for complex grammars

---

## 🐛 Known Limitations

- Maximum 50 production rules (recommend)
- Terminal symbols must be single characters or short strings
- Non-terminal symbols must be alphanumeric or underscores
- No support for parameterized non-terminals
- Browser storage limited by localStorage (~5-10MB)

---

## 📝 License

MIT © 2025 Ayush-CS-89112521

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev) and [TypeScript](https://www.typescriptlang.org)
- Styling by [Tailwind CSS](https://tailwindcss.com)
- Visualization powered by [vis-network](https://visjs.org)
- Formal language theory concepts from classic compiler design texts

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Ayush-CS-89112521/TAFL_Project_CNF_and_GNF_Converter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ayush-CS-89112521/TAFL_Project_CNF_and_GNF_Converter/discussions)
- **Author**: [Ayush-CS-89112521](https://github.com/Ayush-CS-89112521)
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
