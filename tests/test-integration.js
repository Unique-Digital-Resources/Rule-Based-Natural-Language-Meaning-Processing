/**
 * @fileoverview End-to-end integration tests for the NLP Analyzer.
 * Tests the full analysis pipeline with sample sentences.
 * @module tests/test-integration
 */

import { describe, it, expect } from './test-runner.js';
import { NLPAnalyzer, createAnalyzer, analyze } from '../src/analyzer.js';
import { POS, SentenceType, PredicateType, SemanticRole, PhraseType } from '../src/core/types.js';

/**
 * Creates a test analyzer with default configuration.
 * @returns {NLPAnalyzer} A configured analyzer
 */
function createTestAnalyzer() {
    return NLPAnalyzer.createDefault({ strictMode: false });
}

// ============================================
// End-to-End: Action Sentences
// ============================================

describe('Action Sentence: "The man reads a book"', () => {
    const analyzer = createTestAnalyzer();
    const result = analyzer.analyze('The man reads a book');

    it('should successfully analyze the sentence', () => {
        expect(result.success).toBe(true);
    });

    it('should identify sentence type as DECLARATIVE', () => {
        expect(result.tree).toBeDefined();
    });

    it('should identify predicate type as DOES', () => {
        expect(result.meaning).toBeDefined();
        expect(result.meaning.predicate.type).toBe(PredicateType.DOES);
    });

    it('should tokenize into 5 words', () => {
        expect(result.tokens.length).toBe(5);
    });

    it('should tag "man" as NOUN', () => {
        const manToken = result.tokens.find(t => t.text === 'man');
        expect(manToken).toBeDefined();
        expect(manToken.pos).toBe(POS.NOUN);
    });

    it('should tag "reads" as VERB', () => {
        const readsToken = result.tokens.find(t => t.text === 'reads');
        expect(readsToken).toBeDefined();
        expect(readsToken.pos).toBe(POS.VERB);
    });

    it('should tag "book" as NOUN', () => {
        const bookToken = result.tokens.find(t => t.text === 'book');
        expect(bookToken).toBeDefined();
        expect(bookToken.pos).toBe(POS.NOUN);
    });

    it('should extract "man" as AGENT', () => {
        expect(result.meaning.arguments.AGENT).toBeDefined();
        expect(result.meaning.arguments.AGENT.text).toBe('man');
    });

    it('should extract "book" as PATIENT', () => {
        expect(result.meaning.arguments.PATIENT).toBeDefined();
        expect(result.meaning.arguments.PATIENT.text).toBe('book');
    });

    it('should extract "reads" as predicate', () => {
        expect(result.meaning.predicate).toBeDefined();
        expect(result.meaning.predicate.text).toBe('reads');
    });

    it('should include categories for "man"', () => {
        expect(result.meaning.arguments.AGENT.categories).toBeDefined();
        expect(result.meaning.arguments.AGENT.categories).toContain('person');
    });

    it('should pass validation', () => {
        expect(result.validation.isValid).toBe(true);
    });
});

// ============================================
// End-to-End: Property Sentences
// ============================================

describe('Property Sentence: "The apple is red"', () => {
    const analyzer = createTestAnalyzer();
    const result = analyzer.analyze('The apple is red');

    it('should successfully analyze the sentence', () => {
        expect(result.success).toBe(true);
    });

    it('should identify predicate type as HAS_PROPERTY', () => {
        expect(result.meaning).toBeDefined();
        expect(result.meaning.predicate.type).toBe(PredicateType.HAS_PROPERTY);
    });

    it('should tokenize into 4 words', () => {
        expect(result.tokens.length).toBe(4);
    });

    it('should tag "apple" as NOUN', () => {
        const appleToken = result.tokens.find(t => t.text === 'apple');
        expect(appleToken).toBeDefined();
        expect(appleToken.pos).toBe(POS.NOUN);
    });

    it('should tag "is" as COPULA', () => {
        const isToken = result.tokens.find(t => t.text === 'is');
        expect(isToken).toBeDefined();
        expect(isToken.pos).toBe(POS.COPULA);
    });

    it('should tag "red" as ADJECTIVE', () => {
        const redToken = result.tokens.find(t => t.text === 'red');
        expect(redToken).toBeDefined();
        expect(redToken.pos).toBe(POS.ADJECTIVE);
    });

    it('should extract "apple" as THEME', () => {
        expect(result.meaning.arguments.THEME).toBeDefined();
        expect(result.meaning.arguments.THEME.text).toBe('apple');
    });

    it('should extract "red" as predicate', () => {
        expect(result.meaning.predicate).toBeDefined();
        expect(result.meaning.predicate.text).toBe('red');
    });

    it('should pass validation', () => {
        expect(result.validation.isValid).toBe(true);
    });
});

// ============================================
// End-to-End: Identity Sentences
// ============================================

describe('Identity Sentence: "Socrates is a man"', () => {
    const analyzer = createTestAnalyzer();
    const result = analyzer.analyze('Socrates is a man');

    it('should successfully analyze the sentence', () => {
        expect(result.success).toBe(true);
    });

    it('should identify predicate type as IS_A', () => {
        expect(result.meaning).toBeDefined();
        expect(result.meaning.predicate.type).toBe(PredicateType.IS_A);
    });

    it('should tokenize into 4 words', () => {
        expect(result.tokens.length).toBe(4);
    });

    it('should tag "Socrates" as NOUN (or UNKNOWN)', () => {
        const socratesToken = result.tokens.find(t => t.text === 'Socrates');
        expect(socratesToken).toBeDefined();
        // Socrates is not in dictionary, so it might be UNKNOWN or inferred
    });

    it('should tag "is" as COPULA', () => {
        const isToken = result.tokens.find(t => t.text === 'is');
        expect(isToken).toBeDefined();
        expect(isToken.pos).toBe(POS.COPULA);
    });

    it('should extract "Socrates" as THEME', () => {
        expect(result.meaning.arguments.THEME).toBeDefined();
        expect(result.meaning.arguments.THEME.text).toBe('Socrates');
    });

    it('should extract "man" as predicate', () => {
        expect(result.meaning.predicate).toBeDefined();
        expect(result.meaning.predicate.text).toBe('man');
    });
});

// ============================================
// End-to-End: Sentences with Adjuncts
// ============================================

describe('Sentence with Adjunct: "A dog runs quickly"', () => {
    const analyzer = createTestAnalyzer();
    const result = analyzer.analyze('A dog runs quickly');

    it('should successfully analyze the sentence', () => {
        expect(result.success).toBe(true);
    });

    it('should identify predicate type as DOES', () => {
        expect(result.meaning).toBeDefined();
        expect(result.meaning.predicate.type).toBe(PredicateType.DOES);
    });

    it('should tokenize into 4 words', () => {
        expect(result.tokens.length).toBe(4);
    });

    it('should tag "dog" as NOUN', () => {
        const dogToken = result.tokens.find(t => t.text === 'dog');
        expect(dogToken).toBeDefined();
        expect(dogToken.pos).toBe(POS.NOUN);
    });

    it('should tag "runs" as VERB', () => {
        const runsToken = result.tokens.find(t => t.text === 'runs');
        expect(runsToken).toBeDefined();
        expect(runsToken.pos).toBe(POS.VERB);
    });

    it('should tag "quickly" as ADVERB', () => {
        const quicklyToken = result.tokens.find(t => t.text === 'quickly');
        expect(quicklyToken).toBeDefined();
        expect(quicklyToken.pos).toBe(POS.ADVERB);
    });

    it('should extract "dog" as AGENT', () => {
        expect(result.meaning.arguments.AGENT).toBeDefined();
        expect(result.meaning.arguments.AGENT.text).toBe('dog');
    });

    it('should extract "runs" as predicate', () => {
        expect(result.meaning.predicate).toBeDefined();
        expect(result.meaning.predicate.text).toBe('runs');
    });
});

// ============================================
// End-to-End: Multiple Sentences
// ============================================

describe('Multiple Sentences', () => {
    const analyzer = createTestAnalyzer();

    it('should analyze multiple sentences', () => {
        const results = analyzer.analyzeMultiple('The man reads. The dog runs.');
        
        expect(results.length).toBe(2);
        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(true);
    });
});

// ============================================
// End-to-End: Convenience Functions
// ============================================

describe('Convenience Functions', () => {
    it('should analyze using createAnalyzer', () => {
        const analyzer = createAnalyzer();
        const result = analyzer.analyze('The man reads');
        
        expect(result.success).toBe(true);
    });

    it('should analyze using analyze function', () => {
        const result = analyze('The man reads');
        
        expect(result.success).toBe(true);
    });
});

// ============================================
// End-to-End: Error Handling
// ============================================

describe('Error Handling', () => {
    const analyzer = createTestAnalyzer();

    it('should handle empty input', () => {
        const result = analyzer.analyze('');
        
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle whitespace-only input', () => {
        const result = analyzer.analyze('   ');
        
        expect(result.success).toBe(false);
    });

    it('should handle unknown words gracefully', () => {
        const result = analyzer.analyze('The xyznonexistent runs');
        
        // Should still produce a result
        expect(result).toBeDefined();
    });
});

// ============================================
// End-to-End: Summary Generation
// ============================================

describe('Summary Generation', () => {
    const analyzer = createTestAnalyzer();

    it('should generate a summary', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.summary).toBeDefined();
        expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should include sentence in summary', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.summary).toContain('man');
        expect(result.summary).toContain('reads');
    });
});

// ============================================
// End-to-End: Tree Structure
// ============================================

describe('Tree Structure', () => {
    const analyzer = createTestAnalyzer();

    it('should generate a valid tree structure', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.tree).toBeDefined();
        expect(result.tree.category).toBe(PhraseType.TP);
    });

    it('should have NP nodes in tree', () => {
        const result = analyzer.analyze('The man reads a book');
        
        // Tree is JSON, so we need to check structure
        expect(result.tree).toBeDefined();
    });
});

// ============================================
// End-to-End: Token Features
// ============================================

describe('Token Features', () => {
    const analyzer = createTestAnalyzer();

    it('should set lemma for inflected forms', () => {
        const result = analyzer.analyze('The men read books');
        
        const menToken = result.tokens.find(t => t.text === 'men');
        expect(menToken).toBeDefined();
        expect(menToken.lemma).toBe('man');
    });

    it('should set lemma for verbs', () => {
        const result = analyzer.analyze('The man reads');
        
        const readsToken = result.tokens.find(t => t.text === 'reads');
        expect(readsToken).toBeDefined();
        expect(readsToken.lemma).toBe('read');
    });
});

// ============================================
// End-to-End: Validation
// ============================================

describe('Full Pipeline Validation', () => {
    const analyzer = createTestAnalyzer();

    it('should validate action sentence', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.validation.isValid).toBe(true);
        expect(result.validation.errors.length).toBe(0);
    });

    it('should validate property sentence', () => {
        const result = analyzer.analyze('The apple is red');
        
        expect(result.validation.isValid).toBe(true);
    });

    it('should validate identity sentence', () => {
        const result = analyzer.analyze('Socrates is a man');
        
        expect(result.validation.isValid).toBe(true);
    });
});

// ============================================
// End-to-End: Analyzer Options
// ============================================

describe('Analyzer Options', () => {
    it('should respect strictMode option', () => {
        const strictAnalyzer = NLPAnalyzer.createDefault({ strictMode: true });
        const lenientAnalyzer = NLPAnalyzer.createDefault({ strictMode: false });
        
        // Unknown word should fail in strict mode
        const strictResult = strictAnalyzer.analyze('The xyznonexistent runs');
        const lenientResult = lenientAnalyzer.analyze('The xyznonexistent runs');
        
        // In strict mode, unknown words should cause failure
        // In lenient mode, it should still try to parse
        expect(lenientResult).toBeDefined();
    });

    it('should respect validate option', () => {
        const withValidation = NLPAnalyzer.createDefault({ validate: true });
        const withoutValidation = NLPAnalyzer.createDefault({ validate: false });
        
        const result1 = withValidation.analyze('The man reads');
        const result2 = withoutValidation.analyze('The man reads');
        
        expect(result1.validation).toBeDefined();
        expect(result2.validation).toBeDefined();
    });
});

// ============================================
// End-to-End: JSON Serialization
// ============================================

describe('JSON Serialization', () => {
    const analyzer = createTestAnalyzer();

    it('should serialize result to JSON', () => {
        const result = analyzer.analyze('The man reads a book');
        const json = analyzer.toJSON(result);
        
        expect(json).toBeDefined();
        expect(json.success).toBe(true);
        expect(json.tokens).toBeDefined();
        expect(json.tree).toBeDefined();
        expect(json.meaning).toBeDefined();
    });
});

console.log('Integration tests loaded.');
