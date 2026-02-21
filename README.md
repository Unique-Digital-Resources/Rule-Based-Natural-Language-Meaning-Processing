# Rule-Based Natural Language Meaning Processing

A deterministic, rule-based NLP analyzer using X-Bar theory for extracting precise, unambiguous meaning from natural language text.

> **Philosophy**: Language is governed by rules, syntax, and logic. It is not a statistical distribution. This library processes language "the right way"—through structural parsing and logical transformation—rather than the probabilistic approximation used by LLMs.

---

## Table of Contents

- [Features](#features)
- [X-Bar Theory Introduction](#x-bar-theory-introduction)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Overview](#api-overview)
- [Example Usage](#example-usage)
- [Extending the Analyzer](#extending-the-analyzer)
- [Academic References](#academic-references)
- [License](#license)

---

## Features

- **Deterministic Processing**: Same input always produces the exact same output
- **X-Bar Theory Based**: Uses linguistic theory for phrase structure parsing
- **Morphological Analysis**: Handles prefixes, suffixes, and word decomposition
- **Semantic Extraction**: Extracts structured meaning representations
- **Pattern Matching**: Supports multiple sentence patterns (declarative, property, action)
- **Validation**: Built-in semantic validation and error reporting
- **Extensible**: Easy to add new words, patterns, and semantic roles

### Supported Sentence Patterns

| Pattern | Example | Semantic Output |
|---------|---------|-----------------|
| Identity | "Carl is a man" | `IS_A(Carl, man)` |
| Property | "The apple is red" | `HAS_PROPERTY(apple, red)` |
| Action | "The cat chases the mouse" | `DOES(cat, chase, mouse)` |

---

## X-Bar Theory Introduction

X-Bar Theory is a generative linguistics framework developed by Noam Chomsky that provides a template for phrase structure. All phrases share a common structural pattern:

```
        XP (Maximal Projection)
       /  \
    Spec   X'
          /  \
       X    Comp
     (head) (complement)
```

### Three-Level Hierarchy

| Level | Notation | Description |
|-------|----------|-------------|
| **X** | Head | The core word that determines phrase type |
| **X'** | X-bar | Intermediate level containing head + complement |
| **XP** | Maximal Projection | Complete phrase with specifier |

### Phrase Types

| Phrase | Head | Example |
|--------|------|---------|
| NP (Noun Phrase) | Noun | "the big dog" |
| VP (Verb Phrase) | Verb | "eats the apple" |
| AP (Adjective Phrase) | Adjective | "very happy" |
| PP (Prepositional Phrase) | Preposition | "in the house" |
| TP (Tense Phrase) | Tense/Copula | Full sentence |

---

## Project Structure

```
src/
├── core/
│   ├── types.js          # Type definitions and constants
│   └── token.js          # Token class for word representation
├── lexicon/
│   ├── dictionary.js     # Dictionary management
│   ├── affixes.js        # Prefix/suffix rules
│   └── entries/
│       ├── nouns.js      # Noun dictionary
│       ├── verbs.js      # Verb dictionary
│       ├── adjectives.js # Adjective dictionary
│       └── determiners.js# Determiner dictionary
├── parser/
│   ├── parser.js         # Main parser class
│   ├── xbar-node.js      # X-Bar tree node
│   ├── phrase-builder.js # Phrase construction utilities
│   └── patterns.js       # Sentence pattern matching
├── semantic/
│   ├── meaning.js        # Meaning representation classes
│   ├── extractor.js      # Semantic extraction
│   └── validator.js      # Semantic validation
├── utils/
│   └── tokenizer.js      # Text tokenization
└── analyzer.js           # Main NLPAnalyzer class

tests/                    # Test suite
docs/                     # Documentation
demo.html                 # Interactive demo
```

---

## Installation

### Browser (ES Modules)

```html
<script type="module">
    import { NLPAnalyzer } from './src/analyzer.js';
    
    const analyzer = NLPAnalyzer.createDefault();
    const result = analyzer.analyze('The cat is happy');
    console.log(result);
</script>
```

### Node.js

```bash
# Clone the repository
git clone https://github.com/your-username/Rule-Based-Natural-Language-Meaning-Processing.git
cd Rule-Based-Natural-Language-Meaning-Processing
```

```javascript
import { NLPAnalyzer } from './src/analyzer.js';

const analyzer = NLPAnalyzer.createDefault();
const result = analyzer.analyze('The dog runs');
```

---

## Quick Start

```javascript
import { NLPAnalyzer } from './src/analyzer.js';

// Create analyzer with built-in dictionaries
const analyzer = NLPAnalyzer.createDefault();

// Analyze a sentence
const result = analyzer.analyze('The cat chases the mouse');

// Check success
console.log(result.success); // true

// Get meaning representation
console.log(result.meaning);
// {
//   type: 'DECLARATIVE',
//   predicate: { text: 'chases', type: 'DOES', lemma: 'chase' },
//   arguments: {
//     AGENT: { text: 'cat', categories: ['animal'] },
//     PATIENT: { text: 'mouse', categories: ['animal'] }
//   }
// }

// Get parse tree
console.log(result.tree);
// TP structure with NP subject and VP predicate

// Get human-readable summary
console.log(result.summary);
```

---

## API Overview

### Main Classes

#### [`NLPAnalyzer`](src/analyzer.js)

The main entry point for text analysis.

```javascript
// Create default analyzer
const analyzer = NLPAnalyzer.createDefault();

// Create with options
const analyzer = NLPAnalyzer.createDefault({
    strictMode: false,    // Allow unknown words
    includeDetails: true, // Include detailed analysis
    validate: true        // Perform semantic validation
});

// Analyze text
const result = analyzer.analyze('The dog is happy');

// Extract meaning only
const meaning = analyzer.extractMeaning('The cat runs');

// Parse only (no semantic extraction)
const tree = analyzer.parse('The bird sings');

// Tokenize only
const tokens = analyzer.tokenize('The quick fox');
```

#### [`Parser`](src/parser/parser.js)

Handles tokenization, POS tagging, and tree building.

```javascript
import { Parser } from './src/parser/parser.js';
import { Dictionary } from './src/lexicon/dictionary.js';

const dictionary = new Dictionary();
const parser = new Parser(dictionary, { strictMode: false });

const result = parser.parse('The cat is happy');
console.log(result.tree);      // X-Bar tree
console.log(result.tokens);    // Tagged tokens
console.log(result.semantic);  // Extracted semantic info
```

#### [`Dictionary`](src/lexicon/dictionary.js)

Manages lexical entries with lookup and indexing.

```javascript
import { Dictionary, createNounEntry, createVerbEntry } from './src/lexicon/dictionary.js';

const dict = new Dictionary();

// Add entries
dict.addEntry(createNounEntry('cat', ['animal']));
dict.addEntry(createVerbEntry('runs', false));

// Lookup
const result = dict.lookup('cats');
console.log(result.entry.lemma); // 'cat'
console.log(result.affixFeatures); // { number: 'PLURAL' }
```

#### [`SemanticExtractor`](src/semantic/extractor.js)

Extracts meaning representations from X-Bar trees.

```javascript
import { SemanticExtractor } from './src/semantic/extractor.js';

const extractor = new SemanticExtractor();
const meaning = extractor.extract(parseTree);

console.log(meaning.getSubject());    // Subject entity
console.log(meaning.predicate);        // Predicate
console.log(meaning.getAllEntities()); // All entities
```

### Core Types

```javascript
import { 
    POS,            // Part of Speech constants
    PhraseType,     // NP, VP, AP, PP, TP
    SemanticRole,   // AGENT, PATIENT, THEME, etc.
    Tense,          // PRESENT, PAST, FUTURE
    SentenceType,   // DECLARATIVE, INTERROGATIVE, etc.
    PredicateType   // IS_A, HAS_PROPERTY, DOES
} from './src/core/types.js';
```

---

## Example Usage

### Analyzing Different Sentence Types

```javascript
const analyzer = NLPAnalyzer.createDefault();

// Identity sentence
let result = analyzer.analyze('Carl is a man');
console.log(result.meaning.predicate.type); // 'IS_A'

// Property sentence
result = analyzer.analyze('The apple is red');
console.log(result.meaning.predicate.type); // 'HAS_PROPERTY'

// Action sentence
result = analyzer.analyze('The dog chases the cat');
console.log(result.meaning.predicate.type); // 'DOES'
```

### Working with Tokens

```javascript
const result = analyzer.analyze('The happy dog runs quickly');

for (const token of result.tokens) {
    console.log(`${token.text}: ${token.pos}`);
    if (token.lemma) {
        console.log(`  Lemma: ${token.lemma}`);
    }
    if (token.hasStrippedAffixes()) {
        console.log(`  Stripped: ${token.strippedAffixes.map(a => a.affix).join(', ')}`);
    }
}
```

### Accessing the Parse Tree

```javascript
const result = analyzer.analyze('The cat is happy');

// Tree is JSON-serializable
const treeJson = JSON.stringify(result.tree, null, 2);

// Navigate the tree
const tp = result.tree;                    // Tense Phrase
const subject = tp.specifier;              // Subject NP
const predicate = tp.complement.complement; // VP or AP
```

### Handling Unknown Words

```javascript
// Non-strict mode: infers POS for unknown words
const analyzer = NLPAnalyzer.createDefault({ strictMode: false });

const result = analyzer.analyze('The zorblax is happy');
// 'zorblax' will be inferred as a noun based on context
```

---

## Extending the Analyzer

### Adding New Words

```javascript
import { Dictionary, createNounEntry, createVerbEntry, createAdjectiveEntry } from './src/lexicon/dictionary.js';

const dictionary = new Dictionary();

// Add a noun with categories
dictionary.addEntry({
    lemma: 'robot',
    pos: 'NOUN',
    categories: ['machine', 'artificial'],
    features: { number: 'SINGULAR' }
});

// Add a verb with transitivity
dictionary.addEntry({
    lemma: 'compute',
    pos: 'VERB',
    features: { transitive: true }
});

// Add an adjective
dictionary.addEntry({
    lemma: 'artificial',
    pos: 'ADJECTIVE',
    semantic: 'PROPERTY'
});

// Create analyzer with custom dictionary
const analyzer = NLPAnalyzer.createWithDictionary(dictionary);
```

### Adding New Affix Rules

```javascript
import { SUFFIXES, PREFIXES } from './src/lexicon/affixes.js';

// Add a new suffix
SUFFIXES.push({
    affix: 'ish',
    type: 'SUFFIX',
    appliesTo: ['ADJECTIVE'],
    meaning: 'APPROXIMATE',
    resultingPOS: 'ADJECTIVE',
    examples: ['reddish', 'bluish', 'youngish']
});

// Add a new prefix
PREFIXES.push({
    affix: 'semi',
    type: 'PREFIX',
    appliesTo: ['NOUN', 'ADJECTIVE'],
    meaning: 'HALF',
    resultingPOS: null,
    examples: ['semicircle', 'semiconscious']
});
```

### Adding New Sentence Patterns

See [`docs/EXTENDING.md`](docs/EXTENDING.md) for detailed instructions on adding custom sentence patterns and semantic roles.

---

## Academic References

1. Chomsky, N. (1995). *The Minimalist Program*. MIT Press.
2. Jackendoff, R. (1977). *X-Bar Syntax: A Study of Phrase Structure*. MIT Press.
3. Haegeman, L. (1994). *Introduction to Government and Binding Theory*. Blackwell.
4. Carnie, A. (2013). *Syntax: A Generative Introduction*. Wiley-Blackwell.
5. Jurafsky, D. & Martin, J.H. (2023). *Speech and Language Processing*. Prentice Hall.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Status

This project is under active research and development. See [plans/x-bar-nlp-analysis.md](plans/x-bar-nlp-analysis.md) for the development roadmap.
