# API Documentation

This document provides detailed API documentation for all modules in the X-Bar NLP Analyzer.

## Table of Contents

- [Core Module](#core-module)
  - [types.js](#typesjs)
  - [token.js](#tokenjs)
- [Lexicon Module](#lexicon-module)
  - [dictionary.js](#dictionaryjs)
  - [affixes.js](#affixesjs)
- [Parser Module](#parser-module)
  - [parser.js](#parserjs)
  - [xbar-node.js](#xbar-nodejs)
  - [phrase-builder.js](#phrase-builderjs)
- [Semantic Module](#semantic-module)
  - [meaning.js](#meaningjs)
  - [extractor.js](#extractorjs)
- [Analyzer](#analyzer)
- [Utilities](#utilities)
  - [tokenizer.js](#tokenizerjs)

---

## Core Module

### types.js

Core type definitions and constants for the X-Bar NLP Analyzer.

#### POS (Part of Speech)

```javascript
import { POS } from './src/core/types.js';

// Available POS constants
POS.NOUN        // 'NOUN' - e.g., "man", "dog", "happiness"
POS.VERB        // 'VERB' - e.g., "run", "eat", "sleep"
POS.ADJECTIVE   // 'ADJECTIVE' - e.g., "big", "happy", "red"
POS.ADVERB      // 'ADVERB' - e.g., "quickly", "very", "well"
POS.DETERMINER  // 'DETERMINER' - e.g., "the", "a", "this"
POS.PREPOSITION // 'PREPOSITION' - e.g., "in", "on", "with"
POS.CONJUNCTION // 'CONJUNCTION' - e.g., "and", "but", "or"
POS.AUXILIARY   // 'AUXILIARY' - e.g., "is", "has", "will"
POS.COPULA      // 'COPULA' - e.g., "is", "are", "was"
POS.PRONOUN     // 'PRONOUN' - e.g., "he", "she", "it"
POS.UNKNOWN     // 'UNKNOWN' - POS not determined
```

#### PhraseType

```javascript
import { PhraseType } from './src/core/types.js';

PhraseType.NP    // 'NP' - Noun Phrase
PhraseType.VP    // 'VP' - Verb Phrase
PhraseType.AP    // 'AP' - Adjective Phrase
PhraseType.ADV_P // 'AdvP' - Adverb Phrase
PhraseType.PP    // 'PP' - Prepositional Phrase
PhraseType.TP    // 'TP' - Tense Phrase (sentence level)
PhraseType.CP    // 'CP' - Complementizer Phrase
PhraseType.DP    // 'DP' - Determiner Phrase
```

#### SemanticRole

```javascript
import { SemanticRole } from './src/core/types.js';

SemanticRole.AGENT      // The entity that performs the action
SemanticRole.PATIENT    // The entity that undergoes the action
SemanticRole.THEME      // The entity that is moved or affected
SemanticRole.EXPERIENCER // The entity that experiences a mental state
SemanticRole.RECIPIENT  // The entity that receives something
SemanticRole.SOURCE     // The starting point of motion
SemanticRole.GOAL       // The endpoint of motion
SemanticRole.LOCATION   // The location of an action
SemanticRole.TIME       // The time of an action
SemanticRole.INSTRUMENT // An instrument used in the action
SemanticRole.CAUSE      // The cause of an event
SemanticRole.PROPERTY   // A property or attribute
SemanticRole.NONE       // No specific semantic role
```

#### Tense, Aspect, Person, Number

```javascript
import { Tense, Aspect, Person, Number } from './src/core/types.js';

// Tense
Tense.PRESENT          // Present tense
Tense.PAST             // Past tense
Tense.FUTURE           // Future tense
Tense.PRESENT_PERFECT  // Present perfect
Tense.PAST_PERFECT     // Past perfect
Tense.UNKNOWN          // Tense not specified

// Aspect
Aspect.SIMPLE              // Simple aspect
Aspect.PROGRESSIVE         // Progressive/continuous aspect
Aspect.PERFECT             // Perfect aspect
Aspect.PERFECT_PROGRESSIVE // Perfect progressive aspect
Aspect.UNKNOWN             // Aspect not specified

// Person
Person.FIRST   // First person (I, we)
Person.SECOND  // Second person (you)
Person.THIRD   // Third person (he, she, it, they)
Person.UNKNOWN // Person not specified

// Number (grammatical)
Number.SINGULAR // Singular - one entity
Number.PLURAL   // Plural - multiple entities
Number.MASS     // Uncountable/mass noun
Number.UNKNOWN  // Number not specified
```

#### SentenceType, PredicateType

```javascript
import { SentenceType, PredicateType } from './src/core/types.js';

// SentenceType
SentenceType.DECLARATIVE   // Makes a statement
SentenceType.INTERROGATIVE // Asks a question
SentenceType.IMPERATIVE    // Gives a command
SentenceType.EXCLAMATORY   // Expresses strong emotion
SentenceType.UNKNOWN       // Type not determined

// PredicateType
PredicateType.IS_A          // Identity/categorization - "X is a Y"
PredicateType.HAS_PROPERTY  // Property assignment - "X is ADJ"
PredicateType.DOES          // Action - "X verbs Y"
PredicateType.IS_LOCATED    // Location - "X is in Y"
PredicateType.HAS           // Possession - "X has Y"
PredicateType.UNKNOWN       // Type not determined
```

#### Utility Functions

```javascript
import { posToPhraseType, getHeadCategory, isValidHead } from './src/core/types.js';

// Map POS to PhraseType
posToPhraseType(POS.NOUN);        // Returns PhraseType.NP
posToPhraseType(POS.VERB);        // Returns PhraseType.VP
posToPhraseType(POS.ADJECTIVE);   // Returns PhraseType.AP

// Get head category symbol
getHeadCategory(PhraseType.NP);   // Returns 'N'
getHeadCategory(PhraseType.VP);   // Returns 'V'
getHeadCategory(PhraseType.AP);   // Returns 'A'

// Check if POS is valid head for phrase type
isValidHead(POS.NOUN, PhraseType.NP);     // Returns true
isValidHead(POS.VERB, PhraseType.VP);     // Returns true
isValidHead(POS.ADJECTIVE, PhraseType.NP); // Returns false
```

---

### token.js

Token class for representing individual tokens in text.

#### Class: Token

```javascript
import { Token } from './src/core/token.js';

// Constructor
const token = new Token({
    text: 'Running',        // The raw text of the token
    startIndex: 0,          // Starting index in source text
    endIndex: 7,            // Ending index in source text
    lemma: 'run',           // Optional: base form
    pos: POS.VERB,          // Optional: part of speech (default: UNKNOWN)
    features: {             // Optional: grammatical features
        tense: Tense.PRESENT,
        aspect: Aspect.PROGRESSIVE
    }
});
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Raw text as it appears in source |
| `normalized` | `string` | Lowercase form of the token |
| `startIndex` | `number` | Starting index in source text |
| `endIndex` | `number` | Ending index in source text (exclusive) |
| `lemma` | `string\|null` | Base form of the token |
| `pos` | `string` | Part of speech tag |
| `features` | `Object` | Grammatical features |
| `strippedAffixes` | `Array` | Affixes stripped from token |
| `base` | `string\|null` | Base form after affix stripping |
| `position` | `number` | Position in sentence (0-indexed) |
| `found` | `boolean` | Whether found in dictionary |
| `lexicalEntry` | `Object\|null` | Associated lexical entry |

#### Methods

```javascript
// Get effective lemma (lemma > base > normalized)
token.getEffectiveLemma();  // Returns string

// Feature management
token.setFeature('tense', Tense.PAST);  // Set feature (returns token for chaining)
token.getFeature('tense');               // Get feature value
token.hasFeature('number', 'PLURAL');    // Check feature value
token.removeFeature('tense');            // Remove feature
token.clearFeatures();                    // Clear all features

// Affix management
token.addStrippedAffix({
    affix: 'ing',
    type: 'SUFFIX',
    meaning: 'PROGRESSIVE'
});
token.hasStrippedAffixes();       // Returns boolean
token.getStrippedPrefixes();      // Returns array of prefixes
token.getStrippedSuffixes();      // Returns array of suffixes

// POS checking
token.isPOS(POS.VERB);    // Check specific POS
token.isNoun();           // Returns boolean
token.isVerb();           // Returns boolean
token.isAdjective();      // Returns boolean
token.isDeterminer();     // Returns boolean
token.isPreposition();    // Returns boolean
token.isCopula();         // Returns boolean

// Feature checking
token.isSingular();       // Returns boolean
token.isPlural();         // Returns boolean
token.isPastTense();      // Returns boolean
token.isPresentTense();   // Returns boolean
token.isProgressive();    // Returns boolean

// Token type checking
token.isPunctuation();    // Returns boolean
token.isWord();           // Returns boolean

// Utility methods
token.clone();            // Create a copy
token.toJSON();           // Serialize to object
Token.fromJSON(obj);      // Create from object (static)
token.toString();         // String representation
token.length;             // Text length (getter)
```

---

## Lexicon Module

### dictionary.js

Dictionary management for lexical entries.

#### Class: Dictionary

```javascript
import { Dictionary } from './src/lexicon/dictionary.js';

const dict = new Dictionary();
```

#### Methods

```javascript
// Add entries
dict.addEntry({
    lemma: 'cat',
    pos: POS.NOUN,
    categories: ['animal', 'mammal'],
    features: { number: Number.SINGULAR }
});
dict.addEntries([entry1, entry2]);  // Add multiple

// Lookup
dict.lookup('cats');              // Returns LookupResult or null
dict.lookup('cats', POS.NOUN);    // With expected POS
dict.lookupAll('runs');           // Returns all matches

// Check existence
dict.has('cat');                  // Returns boolean

// Get by criteria
dict.getByPOS(POS.NOUN);          // Returns entries with POS
dict.getByCategory('animal');     // Returns entries with category
dict.getAllLemmas();              // Returns all lemmas

// Utility
dict.size;                        // Entry count (getter)
dict.clear();                     // Clear all entries
dict.toJSON();                    // Serialize
Dictionary.fromJSON(json);        // Create from JSON (static)
```

#### LookupResult

```javascript
{
    entry: {
        lemma: 'cat',
        pos: 'NOUN',
        categories: ['animal'],
        features: { number: 'SINGULAR' }
    },
    matchedForm: 'cats',
    affixFeatures: { number: 'PLURAL' },
    fromAffixStripping: true
}
```

#### Helper Functions

```javascript
import { 
    createEntry, 
    createNounEntry, 
    createVerbEntry, 
    createAdjectiveEntry,
    createDeterminerEntry 
} from './src/lexicon/dictionary.js';

// Generic entry
createEntry({
    lemma: 'word',
    pos: POS.NOUN,
    categories: ['concept'],
    features: {}
});

// Specific entry types
createNounEntry('dog', ['animal'], null, Number.SINGULAR);
createVerbEntry('run', false, ['animal']);  // intransitive
createAdjectiveEntry('happy');
createDeterminerEntry('the', null, null);
```

---

### affixes.js

Affix rules and morphological analysis.

#### Constants

```javascript
import { SUFFIXES, PREFIXES } from './src/lexicon/affixes.js';

// SUFFIXES - Array of suffix entries
// Each entry has: affix, type, appliesTo, meaning, resultingPOS, examples, features

// PREFIXES - Array of prefix entries
// Each entry has: affix, type, appliesTo, meaning, resultingPOS, examples
```

#### Functions

```javascript
import {
    lookupAffix,
    isKnownSuffix,
    isKnownPrefix,
    stripSuffixes,
    stripPrefixes,
    stripAffixes,
    getAllPossibleBases
} from './src/lexicon/affixes.js';

// Lookup affix information
lookupAffix('ing');    // Returns matching affix entries
isKnownSuffix('ed');   // Returns boolean
isKnownPrefix('un');   // Returns boolean

// Strip affixes from words
stripSuffixes('running');   // Returns { base, strippedAffixes, accumulatedFeatures }
stripPrefixes('unhappy');   // Returns { base, strippedAffixes, accumulatedFeatures }
stripAffixes('unhappiness'); // Strips both

// Get all possible analyses
getAllPossibleBases('running');
// Returns array of { base, affixes, features }
```

#### AffixStrippingResult

```javascript
{
    base: 'run',
    strippedAffixes: [
        { affix: 'ing', type: 'SUFFIX', meaning: 'PROGRESSIVE', features: {...} }
    ],
    accumulatedFeatures: { aspect: 'PROGRESSIVE' }
}
```

---

## Parser Module

### parser.js

Main parser class for X-Bar parsing.

#### Class: Parser

```javascript
import { Parser } from './src/parser/parser.js';
import { Dictionary } from './src/lexicon/dictionary.js';

const dictionary = new Dictionary();
const parser = new Parser(dictionary, {
    allowPartialParse: false,  // Allow incomplete parses
    strictMode: true,          // Fail on unknown words
    includeDetails: true       // Include detailed analysis
});
```

#### Methods

```javascript
// Parse a sentence
const result = parser.parse('The cat is happy');

// Parse multiple sentences
const results = parser.parseMultiple('The cat is happy. The dog runs.');

// Tokenize only
const tokens = parser.tokenize('The cat is happy');

// Get summary
const summary = parser.getSummary(result);

// Validate result
const validation = parser.validate(result);

// Serialize
const json = parser.toJSON(result);
```

#### ParseResult

```javascript
{
    tokens: [Token, Token, ...],      // Tagged tokens
    tree: XBarNode,                   // X-Bar tree root
    sentenceType: 'DECLARATIVE',      // Sentence type
    predicateType: 'HAS_PROPERTY',    // Predicate type
    semantic: {...},                  // Extracted semantic info
    errors: [],                       // Error messages
    success: true                     // Whether parsing succeeded
}
```

---

### xbar-node.js

X-Bar tree node class.

#### Class: XBarNode

```javascript
import { XBarNode, ChildRole } from './src/parser/xbar-node.js';

// Constructor
const node = new XBarNode({
    type: 'XP',           // 'X', "X'", or 'XP'
    category: 'NP',       // NP, VP, AP, PP, TP
    head: token,          // Optional: head token
    complement: null,     // Optional: complement node
    specifier: null,      // Optional: specifier node
    adjuncts: [],         // Optional: adjunct nodes
    semantic: {}          // Optional: semantic info
});
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | Node type: X, X', or XP |
| `category` | `string` | Phrase category: NP, VP, AP, etc. |
| `headToken` | `Token\|null` | Head token for terminal nodes |
| `complement` | `XBarNode\|null` | Complement node |
| `specifier` | `XBarNode\|null` | Specifier node |
| `adjuncts` | `XBarNode[]` | Array of adjunct nodes |
| `semantic` | `Object` | Semantic information |
| `parent` | `XBarNode\|null` | Parent node reference (getter) |
| `children` | `XBarNode[]` | All child nodes (getter) |

#### Methods

```javascript
// Find head
node.findHead();           // Returns head node
node.getHeadToken();       // Returns head token

// Completeness
node.isComplete();         // Returns boolean

// Add children
node.addChild(childNode, ChildRole.COMPLEMENT);
node.addChild(childNode, ChildRole.SPECIFIER);
node.addChild(childNode, ChildRole.ADJUNCT);

// Traversal
node.traverse(callback, 'pre');   // Depth-first traversal
node.traverse(callback, 'post');  // Post-order traversal

// Finding nodes
node.find(n => n.category === 'NP');     // Find by predicate
node.findByCategory('NP');                // Find by category
node.findByType('XP');                    // Find by type

// Display
node.getLabel();           // Get display label
node.toString(0);          // String representation
node.toJSON();             // Serialize to object
XBarNode.fromJSON(json);   // Create from JSON (static)
```

#### Static Factory Methods

```javascript
// Create head node
XBarNode.createHead(token, 'NP');

// Create bar node
XBarNode.createBar('NP', headNode, complementNode);

// Create phrase node
XBarNode.createPhrase('NP', barNode, specifierNode);

// Create simple phrase (X -> X' -> XP)
XBarNode.createSimplePhrase(token, 'NP');

// Create phrase with specifier
XBarNode.createPhraseWithSpecifier(token, 'NP', specifierNode);

// Create phrase with complement
XBarNode.createPhraseWithComplement(token, 'VP', complementNode);

// Create full phrase
XBarNode.createFullPhrase(token, 'VP', specifierNode, complementNode);
```

---

### phrase-builder.js

Phrase construction utilities.

#### Functions

```javascript
import {
    buildNP,
    buildVP,
    buildAP,
    buildPP,
    buildTP,
    buildTPFromTokens,
    buildPhrase,
    findHead,
    findSpecifier,
    findComplement,
    findNP,
    findVP,
    findAP,
    findPP
} from './src/parser/phrase-builder.js';

// Build phrases from tokens
const npResult = buildNP([detToken, nounToken]);
const vpResult = buildVP([verbToken, npTokens]);
const apResult = buildAP([adjToken]);
const ppResult = buildPP([prepToken, npTokens]);

// Build TP (sentence level)
const tpNode = buildTP(subjectNP, predicateVP, tenseToken);
const tpResult = buildTPFromTokens(tokens);

// Generic builder
const result = buildPhrase(tokens, PhraseType.NP);

// Find phrase components
findHead(tokens, PhraseType.NP);
findSpecifier(tokens, headIndex, PhraseType.NP);
findComplement(tokens, headIndex, PhraseType.VP);

// Find phrases in token sequences
findNP(tokens);   // Returns { node, consumedCount }
findVP(tokens);
findAP(tokens);
findPP(tokens);
```

#### BuildResult

```javascript
{
    node: XBarNode,           // Built node (null if failed)
    errors: [],               // Error messages
    consumedTokens: [Token]   // Tokens consumed
}
```

---

## Semantic Module

### meaning.js

Meaning representation classes.

#### Class: Entity

```javascript
import { Entity } from './src/semantic/meaning.js';

const entity = new Entity({
    id: 'entity_1',           // Optional: auto-generated if not provided
    text: 'cat',              // Original text
    lemma: 'cat',             // Optional: base form
    categories: ['animal'],   // Semantic categories
    features: { number: 'SINGULAR' },  // Grammatical features
    determiner: 'the'         // Optional: determiner used
});
```

**Methods:**

```javascript
entity.hasCategory('animal');     // Returns boolean
entity.addCategory('mammal');     // Add category (returns entity)
entity.getFeature('number');      // Get feature value
entity.setFeature('gender', 'FEMININE');  // Set feature
entity.isSingular();              // Returns boolean
entity.isPlural();                // Returns boolean
entity.isAnimate();               // Returns boolean
entity.isPerson();                // Returns boolean
entity.toJSON();                  // Serialize
Entity.fromJSON(obj);             // Create from JSON (static)
entity.toString();                // String representation
```

#### Class: Predicate

```javascript
import { Predicate } from './src/semantic/meaning.js';

const predicate = new Predicate({
    text: 'runs',              // Original text
    lemma: 'run',              // Optional: base form
    type: PredicateType.DOES,  // Predicate type
    argumentStructure: {        // Expected arguments
        AGENT: { categories: ['animate'] },
        PATIENT: { categories: [] }
    },
    features: {                 // Grammatical features
        tense: Tense.PRESENT,
        transitive: false
    },
    negated: false              // Whether negated
});
```

**Methods:**

```javascript
predicate.getTense();              // Get tense
predicate.getAspect();             // Get aspect
predicate.isAction();              // Returns boolean
predicate.isProperty();            // Returns boolean
predicate.isIdentity();            // Returns boolean
predicate.isTransitive();          // Returns boolean
predicate.getExpectedRoles();      // Returns array of roles
predicate.getRoleConstraints('AGENT');  // Get constraints
predicate.toJSON();                // Serialize
Predicate.fromJSON(obj);           // Create from JSON (static)
predicate.toString();              // String representation
```

#### Class: MeaningRepresentation

```javascript
import { MeaningRepresentation } from './src/semantic/meaning.js';

const meaning = new MeaningRepresentation({
    type: SentenceType.DECLARATIVE,  // Sentence type
    predicate: predicateInstance,     // Predicate
    args: new Map([                   // Arguments map
        ['AGENT', entityInstance]
    ]),
    features: {}                       // Sentence-level features
});
```

**Methods:**

```javascript
// Argument management
meaning.getArgument('AGENT');           // Get entity for role
meaning.setArgument('AGENT', entity);   // Set entity for role
meaning.addArgument('LOCATION', entity); // Add to role (creates array if needed)

// Convenience methods
meaning.getSubject();    // Get subject (AGENT or THEME)
meaning.getObject();     // Get object (PATIENT)
meaning.getAllEntities(); // Get all entities

// Features
meaning.getFeature('tense');
meaning.setFeature('tense', Tense.PAST);

// Sentence type
meaning.isQuestion();    // Returns boolean
meaning.isCommand();     // Returns boolean
meaning.isStatement();   // Returns boolean

// Serialization
meaning.toJSON();                    // Serialize
MeaningRepresentation.fromJSON(obj); // Create from JSON (static)
meaning.toSummary();                 // Human-readable summary
meaning.toString();                  // String representation
```

---

### extractor.js

Semantic extraction from X-Bar trees.

#### Class: SemanticExtractor

```javascript
import { SemanticExtractor } from './src/semantic/extractor.js';

const extractor = new SemanticExtractor({
    includeDetails: true  // Include detailed information
});
```

**Methods:**

```javascript
// Extract meaning from tree
const meaning = extractor.extract(tree);

// Extract from specific nodes
extractor.extractFromTP(tpNode);
extractor.extractFromNP(npNode);
extractor.extractFromVP(vpNode, meaning);
extractor.extractFromAP(apNode, meaning);

// Get all entities from tree
const entities = extractor.extractAllEntities(tree);

// Create summary
const summary = extractor.createSummary(meaning);
```

#### Helper Function

```javascript
import { extractMeaning } from './src/semantic/extractor.js';

const meaning = extractMeaning(tree);  // Uses default options
```

---

## Analyzer

### analyzer.js

Main NLP Analyzer class.

#### Class: NLPAnalyzer

```javascript
import { NLPAnalyzer } from './src/analyzer.js';

// Create with default dictionaries
const analyzer = NLPAnalyzer.createDefault({
    strictMode: false,     // Fail on unknown words
    includeDetails: true,  // Include detailed analysis
    validate: true         // Perform semantic validation
});

// Create with custom dictionary
const analyzer = NLPAnalyzer.createWithDictionary(customDictionary, options);
```

**Methods:**

```javascript
// Full analysis
const result = analyzer.analyze('The cat is happy');

// Extract meaning only
const meaning = analyzer.extractMeaning('The cat is happy');

// Parse only (no semantic extraction)
const tree = analyzer.parse('The cat is happy');

// Tokenize only
const tokens = analyzer.tokenize('The cat is happy');

// Analyze multiple sentences
const results = analyzer.analyzeMultiple('The cat is happy. The dog runs.');

// Get version
NLPAnalyzer.getVersion();  // Returns '1.0.0'

// Serialize result
const json = analyzer.toJSON(result);
```

#### AnalysisResult

```javascript
{
    tokens: [Token],              // Tokenized words
    tree: Object,                 // X-Bar tree (JSON)
    meaning: Object,              // Extracted meaning (JSON)
    validation: {
        isValid: boolean,
        errors: [],
        warnings: [],
        details: Object
    },
    summary: string,              // Human-readable summary
    errors: [],                   // Error messages
    success: boolean              // Whether analysis succeeded
}
```

#### Helper Functions

```javascript
import { createAnalyzer, analyze } from './src/analyzer.js';

// Create analyzer
const analyzer = createAnalyzer({ strictMode: false });

// Quick analysis (creates temporary analyzer)
const result = analyze('The cat is happy');
```

---

## Utilities

### tokenizer.js

Text tokenization utilities.

#### Class: Tokenizer

```javascript
import { Tokenizer } from './src/utils/tokenizer.js';

const tokenizer = new Tokenizer({
    separatePunctuation: true,  // Separate punctuation from words
    preserveCase: false,        // Preserve original case
    stripAffixes: true,         // Attempt affix stripping
    includeWhitespace: false    // Include whitespace tokens
});
```

**Methods:**

```javascript
// Tokenize text
const result = tokenizer.tokenize('The cat is happy.');
// Returns { tokens, originalText, sentenceCount }

// Tokenize single sentence
const tokens = tokenizer.tokenizeSentence('The cat is happy.');

// Split into sentences
const sentences = tokenizer.splitIntoSentences('The cat is happy. The dog runs.');

// Tokenize by sentence
const tokenGroups = tokenizer.tokenizeBySentence('The cat is happy. The dog runs.');

// Utility methods
tokenizer.normalizeWord('Cat!');     // Returns 'cat'
tokenizer.isPunctuation('.');        // Returns boolean
tokenizer.isSentenceEnding('?');      // Returns boolean
```

#### TokenizationResult

```javascript
{
    tokens: [Token],
    originalText: 'The cat is happy.',
    sentenceCount: 1
}
```

#### Helper Functions

```javascript
import { 
    defaultTokenizer, 
    tokenize, 
    tokenizeFull, 
    splitSentences 
} from './src/utils/tokenizer.js';

// Using default tokenizer
const tokens = tokenize('The cat is happy.');
const result = tokenizeFull('The cat is happy.');
const sentences = splitSentences('The cat is happy. The dog runs.');
```

---

## Error Handling

All methods that can fail return error information in their results:

```javascript
const result = analyzer.analyze('Invalid sentence');

if (!result.success) {
    console.log('Analysis failed:', result.errors);
    console.log('Summary:', result.summary);
}
```

For parsing errors:

```javascript
const parseResult = parser.parse('Unknown word xyz');

if (!parseResult.success) {
    console.log('Parse errors:', parseResult.errors);
}
```

For validation errors:

```javascript
const result = analyzer.analyze('The cat is happy');

if (!result.validation.isValid) {
    console.log('Validation errors:', result.validation.errors);
    console.log('Warnings:', result.validation.warnings);
}
```
