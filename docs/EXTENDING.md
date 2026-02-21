# Extending the X-Bar NLP Analyzer

This guide explains how to extend the X-Bar NLP Analyzer with new words, affix rules, sentence patterns, and semantic roles.

## Table of Contents

- [Adding New Words](#adding-new-words)
- [Adding New Affix Rules](#adding-new-affix-rules)
- [Adding New Sentence Patterns](#adding-new-sentence-patterns)
- [Adding New Semantic Roles](#adding-new-semantic-roles)
- [Creating Custom Dictionaries](#creating-custom-dictionaries)
- [Example Extensions](#example-extensions)

---

## Adding New Words

### Basic Word Addition

The simplest way to add words is through the Dictionary API:

```javascript
import { Dictionary } from './src/lexicon/dictionary.js';
import { POS } from './src/core/types.js';

const dictionary = new Dictionary();

// Add a noun
dictionary.addEntry({
    lemma: 'robot',
    pos: POS.NOUN,
    categories: ['machine', 'artificial'],
    features: { number: 'SINGULAR' },
    definition: 'A machine capable of carrying out complex actions'
});

// Add a verb
dictionary.addEntry({
    lemma: 'compute',
    pos: POS.VERB,
    features: { transitive: true },
    definition: 'To calculate or determine mathematically'
});

// Add an adjective
dictionary.addEntry({
    lemma: 'artificial',
    pos: POS.ADJECTIVE,
    semantic: 'PROPERTY',
    definition: 'Made or produced by human beings'
});
```

### Using Helper Functions

For convenience, use the helper functions:

```javascript
import { 
    createNounEntry, 
    createVerbEntry, 
    createAdjectiveEntry,
    createDeterminerEntry 
} from './src/lexicon/dictionary.js';

// Create noun entry
const nounEntry = createNounEntry(
    'robot',                    // lemma
    ['machine', 'artificial'],  // categories
    null,                       // semantic role (optional)
    'SINGULAR'                  // grammatical number
);

// Create verb entry
const verbEntry = createVerbEntry(
    'compute',   // lemma
    true,        // transitive
    ['machine']  // valid subject categories
);

// Create adjective entry
const adjEntry = createAdjectiveEntry(
    'artificial',  // lemma
    'PROPERTY'     // semantic role (default: PROPERTY)
);

// Add to dictionary
dictionary.addEntry(nounEntry);
dictionary.addEntry(verbEntry);
dictionary.addEntry(adjEntry);
```

### Adding Words with Inflected Forms

For words with irregular forms, specify them explicitly:

```javascript
dictionary.addEntry({
    lemma: 'child',
    pos: POS.NOUN,
    categories: ['person', 'young'],
    forms: ['children'],  // Irregular plural
    features: { number: 'SINGULAR' }
});

// The dictionary will now recognize both 'child' and 'children'
```

### Adding Words with Multiple POS

Some words can function as different parts of speech:

```javascript
dictionary.addEntry({
    lemma: 'run',
    pos: POS.VERB,
    alternatePOS: [POS.NOUN],
    features: { transitive: false }
});

// 'run' will be recognized as both VERB and NOUN
```

### Creating Dictionary Files

For larger vocabularies, create a dedicated dictionary file:

```javascript
// src/lexicon/entries/custom-nouns.js

import { POS, Number as GramNumber } from '../core/types.js';

export function loadCustomNouns(dictionary) {
    const nouns = [
        {
            lemma: 'robot',
            pos: POS.NOUN,
            categories: ['machine', 'artificial'],
            features: { number: GramNumber.SINGULAR }
        },
        {
            lemma: 'computer',
            pos: POS.NOUN,
            categories: ['machine', 'electronic'],
            features: { number: GramNumber.SINGULAR }
        },
        {
            lemma: 'algorithm',
            pos: POS.NOUN,
            categories: ['abstract', 'mathematical'],
            features: { number: GramNumber.SINGULAR }
        }
    ];
    
    for (const noun of nouns) {
        dictionary.addEntry(noun);
    }
}
```

Then load it when creating the analyzer:

```javascript
import { NLPAnalyzer } from './src/analyzer.js';
import { loadCustomNouns } from './src/lexicon/entries/custom-nouns.js';

const analyzer = NLPAnalyzer.createDefault();
loadCustomNouns(analyzer.dictionary);
```

---

## Adding New Affix Rules

### Adding Suffixes

Add new suffix rules to handle morphological variations:

```javascript
import { SUFFIXES, AffixType } from './src/lexicon/affixes.js';
import { POS } from './src/core/types.js';

// Add a new suffix
SUFFIXES.push({
    affix: 'ish',
    type: AffixType.SUFFIX,
    appliesTo: [POS.ADJECTIVE],
    meaning: 'APPROXIMATE',
    resultingPOS: POS.ADJECTIVE,
    examples: ['reddish', 'bluish', 'youngish', 'oldish'],
    features: { degree: 'APPROXIMATE' }
});

// Add another suffix
SUFFIXES.push({
    affix: 'hood',
    type: AffixType.SUFFIX,
    appliesTo: [POS.NOUN],
    meaning: 'STATE',
    resultingPOS: POS.NOUN,
    examples: ['childhood', 'neighborhood', 'brotherhood']
});
```

### Adding Prefixes

Add new prefix rules:

```javascript
import { PREFIXES, AffixType } from './src/lexicon/affixes.js';
import { POS } from './src/core/types.js';

// Add a new prefix
PREFIXES.push({
    affix: 'semi',
    type: AffixType.PREFIX,
    appliesTo: [POS.NOUN, POS.ADJECTIVE],
    meaning: 'HALF',
    resultingPOS: null,  // Same as input
    examples: ['semicircle', 'semiconscious', 'semifinal']
});

// Add another prefix
PREFIXES.push({
    affix: 'anti',
    type: AffixType.PREFIX,
    appliesTo: [POS.NOUN, POS.ADJECTIVE],
    meaning: 'AGAINST',
    resultingPOS: null,
    examples: ['antibody', 'antisocial', 'antiwar']
});
```

### Affix Entry Structure

Each affix entry has the following structure:

```javascript
{
    affix: string,          // The affix text (e.g., 'ing', 'un')
    type: AffixType,        // PREFIX or SUFFIX
    appliesTo: POS[],       // Array of POS this affix can attach to
    meaning: string,        // Semantic contribution
    resultingPOS: POS|null, // Resulting POS (null = same as input)
    examples: string[],     // Example words
    features: Object        // Optional: features added by affix
}
```

### Testing New Affix Rules

```javascript
import { stripSuffixes, stripPrefixes, stripAffixes } from './src/lexicon/affixes.js';

// Test suffix stripping
const result = stripSuffixes('bluish');
console.log(result);
// { base: 'blue', strippedAffixes: [...], accumulatedFeatures: { degree: 'APPROXIMATE' } }

// Test prefix stripping
const result2 = stripPrefixes('semicircle');
console.log(result2);
// { base: 'circle', strippedAffixes: [...], accumulatedFeatures: {} }
```

---

## Adding New Sentence Patterns

### Understanding Pattern Structure

Sentence patterns are defined in [`src/parser/patterns.js`](../src/parser/patterns.js). Each pattern specifies:

1. **POS Sequence**: The sequence of parts of speech
2. **Components**: How to group tokens into phrases
3. **Tree Builder**: How to construct the X-Bar tree
4. **Semantic Mapping**: How to assign semantic roles

### Adding a Simple Pattern

To add a new pattern, modify [`patterns.js`](../src/parser/patterns.js):

```javascript
// Example: Add pattern for "There is X" sentences

import { POS, PhraseType, PredicateType, SentenceType } from '../core/types.js';

// Define the pattern
const existentialPattern = {
    name: 'EXISTENTIAL',
    posSequence: [POS.ADVERB, POS.COPULA, POS.DETERMINER, POS.NOUN],
    match: function(tokens) {
        // Check if tokens match the pattern
        if (tokens.length < 4) return false;
        return tokens[0].normalized === 'there' &&
               tokens[1].pos === POS.COPULA &&
               tokens[2].pos === POS.DETERMINER &&
               tokens[3].pos === POS.NOUN;
    },
    build: function(tokens, builder) {
        // Build the tree
        // "There is a cat" → TP with existential subject
        const np = builder.buildNP(tokens.slice(2));
        // ... build tree structure
        return tree;
    },
    getSemanticInfo: function() {
        return {
            sentenceType: SentenceType.DECLARATIVE,
            predicateType: PredicateType.IS_LOCATED
        };
    }
};

// Add to patterns array
PATTERNS.push(existentialPattern);
```

### Pattern Matching Function

The match function determines if a token sequence fits the pattern:

```javascript
match: function(tokens) {
    // Return true if tokens match this pattern
    // Can use:
    // - Token POS: token.pos
    // - Token text: token.text, token.normalized
    // - Token features: token.getFeature('tense')
    // - Token position: token.position
}
```

### Tree Building Function

The build function constructs the X-Bar tree:

```javascript
build: function(tokens, builder) {
    // Use builder functions from phrase-builder.js
    const subjectNP = builder.buildNP(subjectTokens);
    const predicateVP = builder.buildVP(predicateTokens);
    const tp = builder.buildTP(subjectNP, predicateVP, tenseToken);
    
    return tp;
}
```

### Complete Pattern Example

Here's a complete example for adding a pattern that handles sentences with prepositional phrases:

```javascript
// Pattern: "Subject verb object preposition object"
// Example: "The cat puts the food in the bowl"

const locativeActionPattern = {
    name: 'LOCATIVE_ACTION',
    
    posSequence: [
        POS.DETERMINER, POS.NOUN,           // Subject NP
        POS.VERB,                            // Verb
        POS.DETERMINER, POS.NOUN,           // Object NP
        POS.PREPOSITION,                     // Preposition
        POS.DETERMINER, POS.NOUN            // PP object
    ],
    
    match: function(tokens) {
        // More flexible matching
        if (tokens.length < 7) return false;
        
        // Find verb
        const verbIndex = tokens.findIndex(t => t.pos === POS.VERB);
        if (verbIndex === -1) return false;
        
        // Find preposition after verb
        const prepIndex = tokens.findIndex((t, i) => 
            i > verbIndex && t.pos === POS.PREPOSITION
        );
        
        return prepIndex !== -1;
    },
    
    build: function(tokens, builder) {
        // Extract components
        const subjectTokens = tokens.slice(0, 2);  // "The cat"
        const verbToken = tokens[2];               // "puts"
        const objectTokens = tokens.slice(3, 5);   // "the food"
        const ppTokens = tokens.slice(5);          // "in the bowl"
        
        // Build phrases
        const subjectNP = builder.buildNP(subjectTokens);
        const objectNP = builder.buildNP(objectTokens);
        const pp = builder.buildPP(ppTokens);
        
        // Build VP with object and PP adjunct
        const vp = builder.buildVP([verbToken]);
        vp.complement = objectNP;
        vp.adjuncts.push(pp);
        
        // Build TP
        const tp = builder.buildTP(subjectNP, vp, null);
        
        return tp;
    },
    
    getSemanticInfo: function() {
        return {
            sentenceType: SentenceType.DECLARATIVE,
            predicateType: PredicateType.DOES
        };
    }
};
```

---

## Adding New Semantic Roles

### Defining New Roles

Add new semantic roles in [`src/core/types.js`](../src/core/types.js):

```javascript
// In src/core/types.js
export const SemanticRole = {
    // ... existing roles ...
    
    // Add new roles
    BENEFICIARY: 'BENEFICIARY',     // Entity that benefits from action
    MANNER: 'MANNER',               // How an action is performed
    PURPOSE: 'PURPOSE',             // Why an action is performed
    ACCOMPANIMENT: 'ACCOMPANIMENT', // Entity accompanying the action
    TOPIC: 'TOPIC'                  // Topic of communication verbs
};
```

### Using New Roles in Extraction

Update the semantic extractor to assign new roles:

```javascript
// In src/semantic/extractor.js

extractAdjunct(node, meaning) {
    // ... existing code ...
    
    // Add handling for new roles
    if (node.category === PhraseType.PP) {
        const prep = headToken.text.toLowerCase();
        
        // Map prepositions to roles
        if (['for', 'for the benefit of'].includes(prep)) {
            role = SemanticRole.BENEFICIARY;
        } else if (['with', 'along with', 'together with'].includes(prep)) {
            role = SemanticRole.ACCOMPANIMENT;
        } else if (['about', 'regarding', 'concerning'].includes(prep)) {
            role = SemanticRole.TOPIC;
        }
        // ... etc.
    }
    
    // Handle manner adverbs
    if (node.category === PhraseType.ADV_P) {
        const headToken = node.getHeadToken();
        if (headToken) {
            meaning.addArgument(SemanticRole.MANNER, new Entity({
                text: headToken.text,
                lemma: headToken.getEffectiveLemma()
            }));
        }
    }
}
```

### Validation for New Roles

Update the validator to check new roles:

```javascript
// In src/semantic/validator.js

validateArgumentStructure(meaning) {
    const predicate = meaning.predicate;
    const roles = meaning.getExpectedRoles();
    
    // Define constraints for new roles
    const roleConstraints = {
        [SemanticRole.BENEFICIARY]: {
            requiresAnimate: true,  // Beneficiary should be animate
            optional: true
        },
        [SemanticRole.MANNER]: {
            requiresAdverb: true,
            optional: true
        },
        [SemanticRole.TOPIC]: {
            optional: true
        }
    };
    
    // Validate each role
    for (const role of roles) {
        const entity = meaning.getArgument(role);
        const constraints = roleConstraints[role];
        
        if (constraints && constraints.requiresAnimate) {
            if (!entity.isAnimate()) {
                this.addWarning('INANIMATE_BENEFICIARY', 
                    `Beneficiary '${entity.text}' is not animate`);
            }
        }
    }
}
```

---

## Creating Custom Dictionaries

### Dictionary from JSON

Load dictionaries from JSON files:

```javascript
// custom-dictionary.json
[
    {
        "lemma": "robot",
        "pos": "NOUN",
        "categories": ["machine", "artificial"],
        "features": { "number": "SINGULAR" }
    },
    {
        "lemma": "compute",
        "pos": "VERB",
        "features": { "transitive": true }
    }
]

// Load in JavaScript
import { Dictionary } from './src/lexicon/dictionary.js';

async function loadDictionaryFromJSON(url) {
    const response = await fetch(url);
    const entries = await response.json();
    
    const dictionary = new Dictionary();
    dictionary.addEntries(entries);
    
    return dictionary;
}

const customDict = await loadDictionaryFromJSON('custom-dictionary.json');
const analyzer = NLPAnalyzer.createWithDictionary(customDict);
```

### Domain-Specific Dictionaries

Create dictionaries for specific domains:

```javascript
// medical-dictionary.js
export const medicalTerms = [
    { lemma: 'patient', pos: 'NOUN', categories: ['person', 'medical'] },
    { lemma: 'doctor', pos: 'NOUN', categories: ['person', 'medical', 'professional'] },
    { lemma: 'diagnose', pos: 'VERB', features: { transitive: true } },
    { lemma: 'treat', pos: 'VERB', features: { transitive: true } },
    { lemma: 'symptom', pos: 'NOUN', categories: ['medical', 'abstract'] }
];

// legal-dictionary.js
export const legalTerms = [
    { lemma: 'plaintiff', pos: 'NOUN', categories: ['person', 'legal'] },
    { lemma: 'defendant', pos: 'NOUN', categories: ['person', 'legal'] },
    { lemma: 'sue', pos: 'VERB', features: { transitive: true } },
    { lemma: 'contract', pos: 'NOUN', categories: ['legal', 'document'] }
];
```

---

## Example Extensions

### Example 1: Adding Support for Questions

```javascript
// Add question detection to patterns.js

const yesNoQuestionPattern = {
    name: 'YES_NO_QUESTION',
    
    match: function(tokens) {
        // Check for auxiliary inversion: "Is the cat happy?"
        if (tokens.length < 3) return false;
        
        const first = tokens[0];
        return (first.pos === POS.AUXILIARY || first.pos === POS.COPULA) &&
               tokens[tokens.length - 1].text.includes('?');
    },
    
    build: function(tokens, builder) {
        // Move auxiliary to T position
        // Subject is now in specifier of TP
        // Build tree with subject-auxiliary inversion
        // ...
    },
    
    getSemanticInfo: function() {
        return {
            sentenceType: SentenceType.INTERROGATIVE,
            predicateType: PredicateType.HAS_PROPERTY
        };
    }
};
```

### Example 2: Adding Negation Support

```javascript
// Extend the extractor to handle negation

extractFromVP(node, meaning) {
    const headToken = node.getHeadToken();
    
    // Check for negation in specifier
    if (node.specifier) {
        const specToken = node.specifier.getHeadToken();
        if (specToken && specToken.normalized === 'not') {
            meaning.predicate.negated = true;
        }
    }
    
    // Check for negative adverbs
    for (const adjunct of node.adjuncts) {
        const adjToken = adjunct.getHeadToken();
        if (adjToken && ['never', 'rarely', 'seldom'].includes(adjToken.normalized)) {
            meaning.predicate.negated = true;
        }
    }
    
    // ... rest of extraction
}
```

### Example 3: Adding Comparative Constructions

```javascript
// Add comparative adjective handling

// In affixes.js
SUFFIXES.push({
    affix: 'er',
    type: AffixType.SUFFIX,
    appliesTo: [POS.ADJECTIVE],
    meaning: 'COMPARATIVE',
    resultingPOS: POS.ADJECTIVE,
    features: { degree: 'COMPARATIVE' }
});

// In patterns.js
const comparativePattern = {
    name: 'COMPARATIVE',
    
    match: function(tokens) {
        // "X is ADJ-er than Y"
        const hasComparative = tokens.some(t => 
            t.hasFeature('degree', 'COMPARATIVE')
        );
        const hasThan = tokens.some(t => 
            t.normalized === 'than'
        );
        return hasComparative && hasThan;
    },
    
    build: function(tokens, builder) {
        // Build tree with comparative structure
        // ...
    }
};
```

### Example 4: Adding Coordination Support

```javascript
// Add conjunction handling

// In types.js
export const SemanticRole = {
    // ... existing roles
    COORDINATE: 'COORDINATE'  // For coordinated elements
};

// In extractor.js
extractFromNP(node, meaning) {
    // Check for conjunctions in the NP
    const conjunctions = node.find(n => 
        n.headToken && n.headToken.pos === POS.CONJUNCTION
    );
    
    if (conjunctions.length > 0) {
        // Split NP into coordinated parts
        // "the cat and the dog" → [cat, dog]
        const parts = this.extractCoordinatedNPs(node);
        meaning.setArgument(SemanticRole.COORDINATE, parts);
    }
    
    // ... rest of extraction
}
```

---

## Testing Extensions

### Unit Testing New Words

```javascript
// tests/test-custom-words.js

import { Dictionary } from '../src/lexicon/dictionary.js';
import { POS } from '../src/core/types.js';

describe('Custom Words', () => {
    let dictionary;
    
    beforeEach(() => {
        dictionary = new Dictionary();
        dictionary.addEntry({
            lemma: 'robot',
            pos: POS.NOUN,
            categories: ['machine']
        });
    });
    
    test('should find custom word', () => {
        const result = dictionary.lookup('robot');
        expect(result).not.toBeNull();
        expect(result.entry.lemma).toBe('robot');
        expect(result.entry.categories).toContain('machine');
    });
    
    test('should handle inflected forms', () => {
        dictionary.addEntry({
            lemma: 'robot',
            pos: POS.NOUN,
            forms: ['robots']
        });
        
        const result = dictionary.lookup('robots');
        expect(result).not.toBeNull();
        expect(result.entry.lemma).toBe('robot');
    });
});
```

### Integration Testing

```javascript
// tests/test-custom-patterns.js

import { NLPAnalyzer } from '../src/analyzer.js';

describe('Custom Patterns', () => {
    let analyzer;
    
    beforeEach(() => {
        analyzer = NLPAnalyzer.createDefault();
    });
    
    test('should parse custom sentence pattern', () => {
        const result = analyzer.analyze('The robot computes the answer');
        
        expect(result.success).toBe(true);
        expect(result.meaning.predicate.text).toBe('computes');
        expect(result.meaning.getSubject().text).toBe('robot');
    });
});
```

---

## Best Practices

1. **Test Incrementally**: Add words and patterns one at a time, testing after each addition.

2. **Use Categories Wisely**: Categories enable semantic validation. Use consistent category names across your dictionary.

3. **Document Patterns**: Each pattern should have clear documentation about what sentences it matches.

4. **Handle Edge Cases**: Consider how your extensions handle:
   - Unknown words
   - Ambiguous parses
   - Malformed input

5. **Maintain Determinism**: Ensure your extensions produce consistent output for the same input.

6. **Validate Semantics**: Use the validator to catch semantic errors early.

7. **Reuse Existing Code**: Leverage the phrase builders and utility functions rather than reimplementing.
