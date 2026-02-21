# System Architecture

This document provides a comprehensive overview of the X-Bar NLP Analyzer architecture, including data flow, module dependencies, and processing pipelines.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Data Flow](#data-flow)
- [Module Dependencies](#module-dependencies)
- [X-Bar Tree Structure](#x-bar-tree-structure)
- [Parsing Pipeline](#parsing-pipeline)
- [Semantic Extraction Process](#semantic-extraction-process)
- [Design Decisions](#design-decisions)

---

## High-Level Architecture

The X-Bar NLP Analyzer follows a modular, pipeline-based architecture with four main processing phases:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           X-Bar NLP Analyzer                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Input   │───▶│ Tokenize │───▶│  Parse   │───▶│ Extract  │──▶ Output   │
│  │  Text    │    │  & Tag   │    │  Tree    │    │ Meaning  │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                       │              │               │                       │
│                       ▼              ▼               ▼                       │
│                  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│                  │ Lexicon  │  │ Patterns │  │Validator │                   │
│                  │  Module  │  │  Module  │  │  Module  │                   │
│                  └──────────┘  └──────────┘  └──────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Components

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Tokenizer** | [`src/utils/tokenizer.js`](../src/utils/tokenizer.js) | Text segmentation, punctuation handling |
| **Dictionary** | [`src/lexicon/dictionary.js`](../src/lexicon/dictionary.js) | Lexical entry storage and lookup |
| **Affix Handler** | [`src/lexicon/affixes.js`](../src/lexicon/affixes.js) | Morphological analysis |
| **Parser** | [`src/parser/parser.js`](../src/parser/parser.js) | POS tagging, tree building |
| **X-Bar Nodes** | [`src/parser/xbar-node.js`](../src/parser/xbar-node.js) | Tree data structure |
| **Phrase Builder** | [`src/parser/phrase-builder.js`](../src/parser/phrase-builder.js) | Phrase construction |
| **Pattern Matcher** | [`src/parser/patterns.js`](../src/parser/patterns.js) | Sentence pattern detection |
| **Semantic Extractor** | [`src/semantic/extractor.js`](../src/semantic/extractor.js) | Meaning extraction |
| **Meaning Classes** | [`src/semantic/meaning.js`](../src/semantic/meaning.js) | Semantic representation |
| **Validator** | [`src/semantic/validator.js`](../src/semantic/validator.js) | Semantic validation |
| **Analyzer** | [`src/analyzer.js`](../src/analyzer.js) | Main orchestrator |

---

## Data Flow

### Complete Processing Pipeline

```
Input: "The cat is happy"
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: Tokenization                                           │
│                                                                 │
│  "The cat is happy" ──▶ ["The", "cat", "is", "happy"]          │
│                                                                 │
│  • Split on whitespace and punctuation                          │
│  • Create Token objects with position info                      │
│  • Apply affix stripping (e.g., "running" → "run" + "-ing")    │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 2: Lexical Analysis                                       │
│                                                                 │
│  Token    Dictionary    Result                                  │
│  ─────    ──────────    ──────                                  │
│  "The"    ──────────▶   DET [determiner]                        │
│  "cat"    ──────────▶   NOUN [animal]                           │
│  "is"     ──────────▶   COPULA [tense marker]                   │
│  "happy"  ──────────▶   ADJ [property]                          │
│                                                                 │
│  • Look up each token in dictionary                             │
│  • Apply features from affix stripping                          │
│  • Infer POS for unknown words (if not strict mode)             │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 3: Pattern Matching & Tree Building                       │
│                                                                 │
│  Pattern: [DET, NOUN, COPULA, ADJ] ──▶ Property Sentence        │
│                                                                 │
│  Build X-Bar Tree:                                              │
│                                                                 │
│           TP (Tense Phrase)                                     │
│          /  \                                                   │
│        NP    T'                                                 │
│       /  \    \                                                 │
│     Det   N    AP                                               │
│    "The" "cat"  A                                               │
│                "happy"                                          │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 4: Semantic Extraction                                    │
│                                                                 │
│  Traverse tree and extract:                                     │
│                                                                 │
│  • Subject: cat [animal]                                        │
│  • Predicate: happy (HAS_PROPERTY)                              │
│  • Tense: PRESENT                                               │
│                                                                 │
│  Build MeaningRepresentation:                                   │
│                                                                 │
│  {                                                              │
│    type: "DECLARATIVE",                                         │
│    predicate: { text: "happy", type: "HAS_PROPERTY" },          │
│    arguments: {                                                 │
│      THEME: { text: "cat", categories: ["animal"] }             │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Phase 5: Validation                                             │
│                                                                 │
│  • Check semantic role compatibility                            │
│  • Verify argument structure                                    │
│  • Generate warnings for unusual constructions                  │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
Output: AnalysisResult
```

---

## Module Dependencies

### Dependency Graph

```
analyzer.js
    │
    ├── core/
    │   ├── types.js (no dependencies)
    │   └── token.js
    │       └── types.js
    │
    ├── lexicon/
    │   ├── dictionary.js
    │   │   ├── types.js
    │   │   └── affixes.js
    │   └── affixes.js
    │       └── types.js
    │
    ├── parser/
    │   ├── parser.js
    │   │   ├── token.js
    │   │   ├── types.js
    │   │   ├── tokenizer.js
    │   │   ├── dictionary.js
    │   │   ├── xbar-node.js
    │   │   ├── patterns.js
    │   │   └── phrase-builder.js
    │   ├── xbar-node.js
    │   │   ├── types.js
    │   │   └── token.js
    │   ├── phrase-builder.js
    │   │   ├── xbar-node.js
    │   │   ├── types.js
    │   │   └── token.js
    │   └── patterns.js
    │       ├── types.js
    │       ├── token.js
    │       └── phrase-builder.js
    │
    ├── semantic/
    │   ├── meaning.js
    │   │   └── types.js
    │   ├── extractor.js
    │   │   ├── types.js
    │   │   ├── xbar-node.js
    │   │   └── meaning.js
    │   └── validator.js
    │       ├── types.js
    │       └── meaning.js
    │
    └── utils/
        └── tokenizer.js
            ├── token.js
            ├── types.js
            └── affixes.js
```

### Module Responsibilities

```
┌─────────────────────────────────────────────────────────────────┐
│                        Core Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  types.js     - Type constants, no dependencies                 │
│  token.js     - Token representation, depends on types          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Lexicon Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  affixes.js   - Morphological rules, depends on types           │
│  dictionary.js - Lexical storage, depends on affixes, types     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Parser Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  xbar-node.js - Tree structure, depends on core                 │
│  phrase-builder.js - Construction, depends on xbar-node         │
│  patterns.js  - Pattern matching, depends on phrase-builder     │
│  parser.js    - Main parser, depends on all above               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Semantic Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  meaning.js   - Semantic classes, depends on types              │
│  extractor.js - Meaning extraction, depends on meaning, parser  │
│  validator.js - Validation, depends on meaning                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Integration Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  analyzer.js  - Main API, depends on all modules                │
└─────────────────────────────────────────────────────────────────┘
```

---

## X-Bar Tree Structure

### Three-Level Hierarchy

X-Bar theory defines a three-level hierarchy for all phrase types:

```
Level 1: XP (Maximal Projection)
         Complete phrase, can appear in any phrase position
         
Level 2: X' (X-Bar)
         Intermediate level, contains head + complement
         Can be recursive for adjuncts
         
Level 3: X (Head)
         The core word that determines phrase category
```

### Generic Phrase Template

```
              XP
             /  \
        Spec     X'
               /    \
              X      Comp
           (head)   (complement)
              │
              ▼
         [Terminal]
```

### Example: Noun Phrase "the happy cat"

```
                  NP
                 /  \
               DP    N'
             (the)  /  \
                   N    AP
                (cat)   │
                        A
                     (happy)
```

**Structure breakdown:**

| Node | Type | Category | Children | Role |
|------|------|----------|----------|------|
| NP | XP | NP | DP, N' | Maximal projection |
| DP | XP | DP | - | Specifier (determiner) |
| N' | X' | NP | N, AP | Intermediate level |
| N | X | NP | - | Head (terminal) |
| AP | XP | AP | - | Adjunct (modifier) |

### Example: Verb Phrase "chases the mouse"

```
                  VP
                 /  \
               V'    (none)
              /  \
             V    NP
          (chases) │
                   N'
                  /  \
                 D    N
              (the) (mouse)
```

### Example: Full Sentence "The cat is happy"

```
                  TP
                 /  \
               NP    T'
              /  \    \
            DP   N'    AP
           (the)(cat)  │
                       A
                    (happy)
```

**Node types:**

| Node | Type | Description |
|------|------|-------------|
| TP | XP | Tense Phrase (sentence level) |
| NP | XP | Noun Phrase (subject) |
| T' | X' | Tense bar (contains predicate) |
| AP | XP | Adjective Phrase (predicate) |

### Binary Branching Principle

The analyzer enforces binary branching - each node has at most two children:

```
Valid:              Invalid:
   XP                  XP
  /  \               /  |  \
 X    Y             X   Y   Z
```

This constraint:
- Simplifies parsing algorithms
- Creates consistent tree structures
- Enables recursive processing
- Aligns with linguistic theory

---

## Parsing Pipeline

### Step-by-Step Process

#### 1. Tokenization

```javascript
Input: "The happy cat runs quickly"

Process:
1. Split on whitespace: ["The", "happy", "cat", "runs", "quickly"]
2. Separate punctuation
3. Create Token objects with indices
4. Apply affix stripping:
   - "runs" → base: "run", suffix: "s" (THIRD_PERSON_SINGULAR)
   - "quickly" → base: "quick", suffix: "ly" (MANNER)

Output: [Token("The"), Token("happy"), Token("cat"), Token("runs"), Token("quickly")]
```

#### 2. POS Tagging

```javascript
Input: [Token("The"), Token("happy"), Token("cat"), Token("runs"), Token("quickly")]

Process:
1. Look up each token in dictionary
2. Apply features from affix analysis
3. Handle unknown words (infer or fail)

Output:
  Token("The")     → pos: DETERMINER
  Token("happy")   → pos: ADJECTIVE
  Token("cat")     → pos: NOUN, categories: ["animal"]
  Token("runs")    → pos: VERB, lemma: "run", features: {tense: PRESENT}
  Token("quickly") → pos: ADVERB, lemma: "quick"
```

#### 3. Pattern Detection

```javascript
Input: [DET, ADJ, NOUN, VERB, ADV]

Process:
1. Create POS sequence: [DETERMINER, ADJECTIVE, NOUN, VERB, ADVERB]
2. Match against known patterns
3. Identify sentence type and predicate type

Matched Pattern: [DET, ADJ, NOUN, VERB, ADV] → Action Sentence
Components:
  - Subject: [DET, ADJ, NOUN] = "The happy cat"
  - Predicate: [VERB, ADV] = "runs quickly"
```

#### 4. Tree Building

```javascript
Input: Pattern match with components

Process:
1. Build subject NP:
   NP
  /  \
 DP   N'
(the) /  \
     AP   N
     │   (cat)
     A
  (happy)

2. Build predicate VP:
      VP
     /  \
    V'   AdvP
   /  \    │
  V    ∅   Adv
(runs)   (quickly)

3. Build TP (sentence):
      TP
     /  \
   NP    T'
   │     │
  ...   VP
         │
        ...
```

#### 5. Semantic Annotation

```javascript
Process:
1. Traverse tree bottom-up
2. Assign semantic roles:
   - Subject NP → AGENT
   - Object NP → PATIENT
   - PP → LOCATION, SOURCE, GOAL, etc.
3. Extract predicate information

Output: Tree with semantic annotations
```

---

## Semantic Extraction Process

### Tree Traversal Strategy

The semantic extractor uses depth-first traversal to process the tree:

```
1. Start at root (TP)
2. Visit specifier (subject NP) → Extract subject entity
3. Visit complement (T') → Extract tense and predicate
4. Visit predicate (VP/AP/NP) → Extract predicate and arguments
5. Visit adjuncts → Extract modifiers
```

### Extraction Rules

#### Subject Extraction

```javascript
// From TP specifier
if (node.category === 'TP' && node.type === 'XP') {
    if (node.specifier) {
        const headToken = node.specifier.getHeadToken();
        semantic.subject = {
            text: headToken.text,
            lemma: headToken.getEffectiveLemma(),
            categories: headToken.lexicalEntry?.categories || []
        };
    }
}
```

#### Predicate Extraction

```javascript
// From VP
if (node.category === 'VP') {
    const headToken = node.getHeadToken();
    semantic.predicate = {
        text: headToken.text,
        lemma: headToken.getEffectiveLemma(),
        type: PredicateType.DOES
    };
}

// From AP
if (node.category === 'AP') {
    const headToken = node.getHeadToken();
    semantic.predicate = {
        text: headToken.text,
        lemma: headToken.getEffectiveLemma(),
        type: PredicateType.HAS_PROPERTY
    };
}
```

#### Object Extraction

```javascript
// From VP complement
if (node.category === 'VP' && node.complement) {
    const headToken = node.complement.getHeadToken();
    semantic.object = {
        text: headToken.text,
        lemma: headToken.getEffectiveLemma(),
        categories: headToken.lexicalEntry?.categories || []
    };
}
```

### Semantic Role Assignment

```javascript
// Role assignment based on predicate type
assignRoles(meaning) {
    const predicateType = meaning.predicate.type;
    
    // Action sentences: subject is AGENT
    if (predicateType === PredicateType.DOES) {
        const theme = meaning.getArgument(SemanticRole.THEME);
        if (theme) {
            meaning.args.delete(SemanticRole.THEME);
            meaning.setArgument(SemanticRole.AGENT, theme);
        }
    }
    
    // Property sentences: subject is THEME
    if (predicateType === PredicateType.HAS_PROPERTY) {
        // THEME is already correct
    }
    
    // Identity sentences: subject is THEME
    if (predicateType === PredicateType.IS_A) {
        // THEME is already correct
    }
}
```

### Preposition Mapping

```javascript
// Map prepositions to semantic roles
const prepToRole = {
    'to': SemanticRole.GOAL,
    'toward': SemanticRole.GOAL,
    'from': SemanticRole.SOURCE,
    'away': SemanticRole.SOURCE,
    'with': SemanticRole.INSTRUMENT,
    'using': SemanticRole.INSTRUMENT,
    'at': SemanticRole.LOCATION,
    'in': SemanticRole.LOCATION,
    'on': SemanticRole.LOCATION,
    'under': SemanticRole.LOCATION,
    'over': SemanticRole.LOCATION,
    'near': SemanticRole.LOCATION,
    'for': SemanticRole.RECIPIENT
};
```

---

## Design Decisions

### 1. Deterministic Processing

**Decision**: The analyzer produces identical output for identical input.

**Rationale**: 
- Enables reproducible results
- Simplifies debugging and testing
- Aligns with project philosophy
- No randomness or external dependencies

**Implementation**:
- No random number generation
- No external API calls
- Consistent iteration order (Maps maintain insertion order)

### 2. Binary Branching

**Decision**: Enforce binary branching in X-Bar trees.

**Rationale**:
- Simplifies parsing algorithms
- Consistent with linguistic theory
- Enables recursive processing
- Clear parent-child relationships

**Implementation**:
- Each node has at most 2 structural children (specifier, complement)
- Adjuncts stored in array for flexibility

### 3. Pattern-Based Parsing

**Decision**: Use sentence pattern matching before tree building.

**Rationale**:
- Efficient for known patterns
- Clear error messages for unknown patterns
- Easy to extend with new patterns
- Separates pattern detection from tree construction

**Implementation**:
- [`patterns.js`](../src/parser/patterns.js) defines pattern templates
- Pattern matching identifies sentence structure
- Phrase builders construct trees based on pattern components

### 4. Modular Dictionary System

**Decision**: Separate dictionaries for different word types.

**Rationale**:
- Easier to maintain and extend
- Independent testing
- Clear organization
- Can load only needed dictionaries

**Implementation**:
- [`entries/nouns.js`](../src/lexicon/entries/nouns.js)
- [`entries/verbs.js`](../src/lexicon/entries/verbs.js)
- [`entries/adjectives.js`](../src/lexicon/entries/adjectives.js)
- [`entries/determiners.js`](../src/lexicon/entries/determiners.js)

### 5. Affix-First Processing

**Decision**: Process affixes before dictionary lookup.

**Rationale**:
- Handles morphological variations
- Reduces dictionary size (store only lemmas)
- Enables unknown word inference
- Captures grammatical features from affixes

**Implementation**:
- [`affixes.js`](../src/lexicon/affixes.js) defines affix rules
- Tokenizer applies affix stripping
- Features from affixes added to tokens

### 6. Fail-Explicitly Philosophy

**Decision**: Fail explicitly on ambiguity or errors rather than guessing.

**Rationale**:
- Prevents incorrect analysis
- Clear error messages
- User can handle edge cases
- Maintains deterministic behavior

**Implementation**:
- `strictMode` option to control behavior
- Error arrays in all results
- Validation step with detailed errors

---

## Performance Considerations

### Memory Management

- Tokens are lightweight objects
- Trees use parent references (circular for navigation)
- JSON serialization breaks circular references

### Optimization Opportunities

1. **Dictionary Lookup**: O(1) with Map-based storage
2. **Pattern Matching**: Linear scan through patterns (could use trie)
3. **Tree Traversal**: O(n) where n is number of nodes
4. **Affix Stripping**: O(m) where m is affix count

### Scalability

- Current design optimized for single-sentence analysis
- For batch processing, reuse analyzer instance
- Dictionary can be extended without code changes
