/**
 * @fileoverview Tests for the Parser module.
 * Tests NP building, VP building, AP building, pattern matching, and tree structure.
 * @module tests/test-parser
 */

import { describe, it, expect } from './test-runner.js';
import { Parser } from '../src/parser/parser.js';
import { Dictionary } from '../src/lexicon/dictionary.js';
import { POS, SentenceType, PredicateType, PhraseType } from '../src/core/types.js';
import { XBarNode } from '../src/parser/xbar-node.js';
import { loadNouns } from '../src/lexicon/entries/nouns.js';
import { loadVerbs } from '../src/lexicon/entries/verbs.js';
import { loadAdjectives } from '../src/lexicon/entries/adjectives.js';
import { loadDeterminers } from '../src/lexicon/entries/determiners.js';

/**
 * Creates a test parser with all built-in dictionary entries.
 * @returns {Parser} A configured parser
 */
function createTestParser() {
    const dictionary = new Dictionary();
    loadNouns(dictionary);
    loadVerbs(dictionary);
    loadAdjectives(dictionary);
    loadDeterminers(dictionary);
    
    return new Parser(dictionary, { strictMode: false });
}

// ============================================
// Parser Creation and Basic Operations
// ============================================

describe('Parser Creation', () => {
    it('should create a parser with a dictionary', () => {
        const dictionary = new Dictionary();
        const parser = new Parser(dictionary);
        
        expect(parser).toBeDefined();
        expect(parser.dictionary).toBe(dictionary);
    });

    it('should have a tokenizer', () => {
        const parser = createTestParser();
        
        expect(parser.tokenizer).toBeDefined();
    });
});

// ============================================
// Tokenization
// ============================================

describe('Parser Tokenization', () => {
    const parser = createTestParser();

    it('should tokenize a simple sentence', () => {
        const tokens = parser.tokenize('The man reads');
        
        expect(tokens.length).toBe(3);
    });

    it('should filter out punctuation', () => {
        const tokens = parser.tokenize('The man reads.');
        
        expect(tokens.length).toBe(3);
    });

    it('should assign positions to tokens', () => {
        const tokens = parser.tokenize('The man reads');
        
        expect(tokens[0].position).toBe(0);
        expect(tokens[1].position).toBe(1);
        expect(tokens[2].position).toBe(2);
    });
});

// ============================================
// POS Tagging
// ============================================

describe('POS Tagging', () => {
    const parser = createTestParser();

    it('should tag nouns correctly', () => {
        const tokens = parser.tokenize('man dog cat');
        parser.tagPOS(tokens);
        
        expect(tokens[0].pos).toBe(POS.NOUN);
        expect(tokens[1].pos).toBe(POS.NOUN);
        expect(tokens[2].pos).toBe(POS.NOUN);
    });

    it('should tag verbs correctly', () => {
        const tokens = parser.tokenize('run walk read');
        parser.tagPOS(tokens);
        
        expect(tokens[0].pos).toBe(POS.VERB);
        expect(tokens[1].pos).toBe(POS.VERB);
        expect(tokens[2].pos).toBe(POS.VERB);
    });

    it('should tag determiners correctly', () => {
        const tokens = parser.tokenize('the a');
        parser.tagPOS(tokens);
        
        expect(tokens[0].pos).toBe(POS.DETERMINER);
        expect(tokens[1].pos).toBe(POS.DETERMINER);
    });

    it('should tag adjectives correctly', () => {
        const tokens = parser.tokenize('big red happy');
        parser.tagPOS(tokens);
        
        expect(tokens[0].pos).toBe(POS.ADJECTIVE);
        expect(tokens[1].pos).toBe(POS.ADJECTIVE);
        expect(tokens[2].pos).toBe(POS.ADJECTIVE);
    });

    it('should tag copula correctly', () => {
        const tokens = parser.tokenize('is are was');
        parser.tagPOS(tokens);
        
        expect(tokens[0].pos).toBe(POS.COPULA);
        expect(tokens[1].pos).toBe(POS.COPULA);
        expect(tokens[2].pos).toBe(POS.COPULA);
    });

    it('should set lemma for inflected forms', () => {
        const tokens = parser.tokenize('men');
        parser.tagPOS(tokens);
        
        expect(tokens[0].lemma).toBe('man');
    });

    it('should handle unknown words', () => {
        const tokens = parser.tokenize('xyznonexistent');
        const result = parser.tagPOS(tokens);
        
        expect(result.unknownCount).toBe(1);
    });
});

// ============================================
// NP Building
// ============================================

describe('NP Building', () => {
    const parser = createTestParser();

    it('should parse a simple NP (determiner + noun)', () => {
        const result = parser.parse('The man');
        
        expect(result.success).toBe(true);
        expect(result.tree).toBeDefined();
    });

    it('should parse a proper noun NP', () => {
        const result = parser.parse('Socrates');
        
        expect(result.success).toBe(true);
    });

    it('should parse NP with adjective modifier', () => {
        const result = parser.parse('The big dog');
        
        expect(result.success).toBe(true);
    });

    it('should find NP nodes in tree', () => {
        const result = parser.parse('The man');
        
        if (result.tree) {
            const npNodes = result.tree.findByCategory(PhraseType.NP);
            expect(npNodes.length).toBeGreaterThan(0);
        }
    });
});

// ============================================
// VP Building
// ============================================

describe('VP Building', () => {
    const parser = createTestParser();

    it('should parse a simple VP (verb)', () => {
        const result = parser.parse('The man runs');
        
        expect(result.success).toBe(true);
    });

    it('should parse VP with object', () => {
        const result = parser.parse('The man reads a book');
        
        expect(result.success).toBe(true);
    });

    it('should find VP nodes in tree', () => {
        const result = parser.parse('The man reads a book');
        
        if (result.tree) {
            const vpNodes = result.tree.findByCategory(PhraseType.VP);
            expect(vpNodes.length).toBeGreaterThan(0);
        }
    });
});

// ============================================
// AP Building
// ============================================

describe('AP Building', () => {
    const parser = createTestParser();

    it('should parse a simple AP (adjective)', () => {
        const result = parser.parse('The apple is red');
        
        expect(result.success).toBe(true);
    });

    it('should find AP nodes in tree', () => {
        const result = parser.parse('The apple is red');
        
        if (result.tree) {
            const apNodes = result.tree.findByCategory(PhraseType.AP);
            expect(apNodes.length).toBeGreaterThan(0);
        }
    });
});

// ============================================
// Pattern Matching
// ============================================

describe('Pattern Matching', () => {
    const parser = createTestParser();

    it('should match ACTION pattern for "The man reads a book"', () => {
        const result = parser.parse('The man reads a book');
        
        expect(result.success).toBe(true);
        expect(result.predicateType).toBe(PredicateType.DOES);
    });

    it('should match PROPERTY pattern for "The apple is red"', () => {
        const result = parser.parse('The apple is red');
        
        expect(result.success).toBe(true);
        expect(result.predicateType).toBe(PredicateType.HAS_PROPERTY);
    });

    it('should match IDENTITY pattern for "Socrates is a man"', () => {
        const result = parser.parse('Socrates is a man');
        
        expect(result.success).toBe(true);
        expect(result.predicateType).toBe(PredicateType.IS_A);
    });

    it('should identify sentence type as DECLARATIVE', () => {
        const result = parser.parse('The man reads a book');
        
        expect(result.sentenceType).toBe(SentenceType.DECLARATIVE);
    });
});

// ============================================
// Tree Structure
// ============================================

describe('Tree Structure', () => {
    const parser = createTestParser();

    it('should create a TP as root', () => {
        const result = parser.parse('The man reads');
        
        expect(result.tree).toBeDefined();
        expect(result.tree.category).toBe(PhraseType.TP);
    });

    it('should have subject in specifier position', () => {
        const result = parser.parse('The man reads a book');
        
        expect(result.tree.specifier).toBeDefined();
    });

    it('should have VP in complement position', () => {
        const result = parser.parse('The man reads a book');
        
        expect(result.tree.complement).toBeDefined();
    });

    it('should traverse the tree', () => {
        const result = parser.parse('The man reads');
        
        let nodeCount = 0;
        result.tree.traverse(() => {
            nodeCount++;
        });
        
        expect(nodeCount).toBeGreaterThan(0);
    });

    it('should find nodes by category', () => {
        const result = parser.parse('The man reads a book');
        
        const npNodes = result.tree.findByCategory(PhraseType.NP);
        const vpNodes = result.tree.findByCategory(PhraseType.VP);
        
        expect(npNodes.length).toBeGreaterThan(0);
        expect(vpNodes.length).toBeGreaterThan(0);
    });

    it('should convert tree to JSON', () => {
        const result = parser.parse('The man reads');
        
        const json = result.tree.toJSON();
        
        expect(json).toBeDefined();
        expect(json.category).toBe(PhraseType.TP);
    });

    it('should convert tree to string', () => {
        const result = parser.parse('The man reads');
        
        const str = result.tree.toString();
        
        expect(str).toBeDefined();
        expect(str.length).toBeGreaterThan(0);
    });
});

// ============================================
// Semantic Extraction
// ============================================

describe('Parser Semantic Extraction', () => {
    const parser = createTestParser();

    it('should extract subject from parse', () => {
        const result = parser.parse('The man reads a book');
        
        expect(result.semantic.subject).toBeDefined();
        expect(result.semantic.subject.text).toBe('man');
    });

    it('should extract predicate from parse', () => {
        const result = parser.parse('The man reads a book');
        
        expect(result.semantic.predicate).toBeDefined();
        expect(result.semantic.predicate.text).toBe('reads');
    });

    it('should extract object from parse', () => {
        const result = parser.parse('The man reads a book');
        
        expect(result.semantic.object).toBeDefined();
        expect(result.semantic.object.text).toBe('book');
    });
});

// ============================================
// Error Handling
// ============================================

describe('Parser Error Handling', () => {
    const parser = createTestParser();

    it('should handle empty input', () => {
        const result = parser.parse('');
        
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle unknown words gracefully', () => {
        const parser = new Parser(new Dictionary(), { strictMode: false });
        const result = parser.parse('The xyznonexistent runs');
        
        // Should still try to parse
        expect(result).toBeDefined();
    });

    it('should report errors for failed parse', () => {
        const result = parser.parse('');
        
        expect(result.errors.length).toBeGreaterThan(0);
    });
});

// ============================================
// Validation
// ============================================

describe('Parser Validation', () => {
    const parser = createTestParser();

    it('should validate a successful parse', () => {
        const result = parser.parse('The man reads a book');
        const validation = parser.validate(result);
        
        expect(validation.isValid).toBe(true);
    });

    it('should invalidate a failed parse', () => {
        const result = parser.parse('');
        const validation = parser.validate(result);
        
        expect(validation.isValid).toBe(false);
    });
});

// ============================================
// Summary Generation
// ============================================

describe('Parser Summary', () => {
    const parser = createTestParser();

    it('should generate a summary for a parse', () => {
        const result = parser.parse('The man reads a book');
        const summary = parser.getSummary(result);
        
        expect(summary).toBeDefined();
        expect(summary.length).toBeGreaterThan(0);
    });
});

console.log('Parser tests loaded.');
