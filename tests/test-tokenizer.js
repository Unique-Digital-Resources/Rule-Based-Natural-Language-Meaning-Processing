/**
 * @fileoverview Tests for the Tokenizer module.
 * Tests basic tokenization, punctuation handling, sentence boundary detection, and affix integration.
 * @module tests/test-tokenizer
 */

import { describe, it, expect } from './test-runner.js';
import { Tokenizer, tokenize, tokenizeFull, splitSentences } from '../src/utils/tokenizer.js';
import { POS } from '../src/core/types.js';

// ============================================
// Basic Tokenization
// ============================================

describe('Basic Tokenization', () => {
    const tokenizer = new Tokenizer();

    it('should tokenize a simple sentence', () => {
        const result = tokenizer.tokenize('The man reads');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens.length).toBe(3);
        expect(wordTokens[0].text).toBe('The');
        expect(wordTokens[1].text).toBe('man');
        expect(wordTokens[2].text).toBe('reads');
    });

    it('should handle multiple spaces', () => {
        const result = tokenizer.tokenize('The   man    reads');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens.length).toBe(3);
    });

    it('should handle leading and trailing spaces', () => {
        const result = tokenizer.tokenize('  The man reads  ');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens.length).toBe(3);
    });

    it('should handle empty input', () => {
        const result = tokenizer.tokenize('');
        expect(result.tokens.length).toBe(0);
    });

    it('should handle single word', () => {
        const result = tokenizer.tokenize('hello');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens.length).toBe(1);
        expect(wordTokens[0].text).toBe('hello');
    });

    it('should assign correct positions', () => {
        const result = tokenizer.tokenize('The man reads a book');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens[0].startIndex).toBe(0);
        expect(wordTokens[1].startIndex).toBe(4);
        expect(wordTokens[2].startIndex).toBe(8);
    });

    it('should tokenize a sentence with numbers', () => {
        const result = tokenizer.tokenize('I have 3 apples');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens.length).toBe(3);
        expect(wordTokens[1].text).toBe('have');
        expect(wordTokens[2].text).toBe('3');
    });
});

// ============================================
// Punctuation Handling
// ============================================

describe('Punctuation Handling', () => {
    const tokenizer = new Tokenizer();

    it('should separate punctuation from words', () => {
        const result = tokenizer.tokenize('Hello, world!');
        
        expect(result.tokens.length).toBe(4); // Hello , world !
        expect(result.tokens[1].text).toBe(',');
        expect(result.tokens[3].text).toBe('!');
    });

    it('should handle period at end of sentence', () => {
        const result = tokenizer.tokenize('The end.');
        const wordTokens = result.tokens.filter(t => t.isWord());
        const punctTokens = result.tokens.filter(t => t.isPunctuation());
        
        expect(wordTokens.length).toBe(2);
        expect(punctTokens.length).toBe(1);
        expect(punctTokens[0].text).toBe('.');
    });

    it('should handle multiple punctuation marks', () => {
        const result = tokenizer.tokenize('What?!');
        const punctTokens = result.tokens.filter(t => t.isPunctuation());
        
        expect(punctTokens.length).toBe(2);
    });

    it('should handle parentheses', () => {
        const result = tokenizer.tokenize('(hello)');
        
        expect(result.tokens.length).toBe(3);
        expect(result.tokens[0].text).toBe('(');
        expect(result.tokens[2].text).toBe(')');
    });

    it('should handle quotes', () => {
        const result = tokenizer.tokenize('"hello"');
        
        expect(result.tokens.length).toBe(3);
        expect(result.tokens[0].text).toBe('"');
        expect(result.tokens[2].text).toBe('"');
    });

    it('should handle hyphens', () => {
        const result = tokenizer.tokenize('well-known');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        // Hyphenated words may be split or kept together depending on implementation
        expect(wordTokens.length).toBeGreaterThan(0);
    });

    it('should handle semicolons and colons', () => {
        const result = tokenizer.tokenize('one; two: three');
        const punctTokens = result.tokens.filter(t => t.isPunctuation());
        
        expect(punctTokens.length).toBe(2);
    });
});

// ============================================
// Sentence Boundary Detection
// ============================================

describe('Sentence Boundary Detection', () => {
    const tokenizer = new Tokenizer();

    it('should detect sentence ending with period', () => {
        const result = tokenizer.tokenize('Hello world.');
        const lastWordToken = result.tokens.filter(t => t.isWord()).pop();
        const periodToken = result.tokens.filter(t => t.isPunctuation())[0];
        
        expect(periodToken.getFeature('sentenceEnd')).toBe(true);
    });

    it('should detect sentence ending with exclamation', () => {
        const result = tokenizer.tokenize('Hello world!');
        const exclamationToken = result.tokens.filter(t => t.isPunctuation())[0];
        
        expect(exclamationToken.getFeature('sentenceEnd')).toBe(true);
    });

    it('should detect sentence ending with question mark', () => {
        const result = tokenizer.tokenize('How are you?');
        const questionToken = result.tokens.filter(t => t.isPunctuation())[0];
        
        expect(questionToken.getFeature('sentenceEnd')).toBe(true);
    });

    it('should count sentences correctly', () => {
        const result = tokenizer.tokenize('First sentence. Second sentence!');
        
        expect(result.sentenceCount).toBe(2);
    });

    it('should mark first word as sentence start', () => {
        const result = tokenizer.tokenize('Hello world.');
        const firstWordToken = result.tokens.filter(t => t.isWord())[0];
        
        expect(firstWordToken.getFeature('sentenceStart')).toBe(true);
    });

    it('should split text into sentences', () => {
        const sentences = tokenizer.splitIntoSentences('First. Second! Third?');
        
        expect(sentences.length).toBe(3);
        expect(sentences[0]).toBe('First.');
        expect(sentences[1]).toBe('Second!');
        expect(sentences[2]).toBe('Third?');
    });

    it('should handle sentence with trailing quote', () => {
        const sentences = tokenizer.splitIntoSentences('He said "hello."');
        
        expect(sentences.length).toBe(1);
    });
});

// ============================================
// Affix Integration
// ============================================

describe('Affix Integration', () => {
    const tokenizer = new Tokenizer({ stripAffixes: true });

    it('should strip plural suffix', () => {
        const result = tokenizer.tokenize('cats');
        const wordToken = result.tokens.filter(t => t.isWord())[0];
        
        expect(wordToken.base).toBe('cat');
    });

    it('should strip past tense suffix', () => {
        const result = tokenizer.tokenize('walked');
        const wordToken = result.tokens.filter(t => t.isWord())[0];
        
        expect(wordToken.base).toBe('walk');
    });

    it('should strip progressive suffix', () => {
        const result = tokenizer.tokenize('running');
        const wordToken = result.tokens.filter(t => t.isWord())[0];
        
        expect(wordToken.base).toBe('run');
    });

    it('should strip adverb suffix', () => {
        const result = tokenizer.tokenize('quickly');
        const wordToken = result.tokens.filter(t => t.isWord())[0];
        
        expect(wordToken.base).toBe('quick');
    });

    it('should handle words without affixes', () => {
        const result = tokenizer.tokenize('cat');
        const wordToken = result.tokens.filter(t => t.isWord())[0];
        
        // Base should be same as text or undefined
        expect(wordToken.text).toBe('cat');
    });

    it('should record stripped affixes', () => {
        const result = tokenizer.tokenize('cats');
        const wordToken = result.tokens.filter(t => t.isWord())[0];
        
        expect(wordToken.strippedAffixes.length).toBeGreaterThan(0);
    });
});

// ============================================
// Tokenizer Options
// ============================================

describe('Tokenizer Options', () => {
    it('should preserve case when option is set', () => {
        const tokenizer = new Tokenizer({ preserveCase: true });
        const result = tokenizer.tokenize('HELLO World');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens[0].text).toBe('HELLO');
        expect(wordTokens[1].text).toBe('World');
    });

    it('should not strip affixes when option is false', () => {
        const tokenizer = new Tokenizer({ stripAffixes: false });
        const result = tokenizer.tokenize('cats');
        const wordToken = result.tokens.filter(t => t.isWord())[0];
        
        // Base should not be set
        expect(wordToken.base).toBeUndefined();
    });

    it('should include whitespace when option is set', () => {
        const tokenizer = new Tokenizer({ includeWhitespace: true });
        const result = tokenizer.tokenize('a b');
        
        // Should include whitespace tokens
        const whitespaceTokens = result.tokens.filter(t => t.pos === 'WHITESPACE');
        expect(whitespaceTokens.length).toBeGreaterThan(0);
    });
});

// ============================================
// Token Methods
// ============================================

describe('Token Methods', () => {
    const tokenizer = new Tokenizer();

    it('should identify word tokens', () => {
        const result = tokenizer.tokenize('hello');
        const token = result.tokens[0];
        
        expect(token.isWord()).toBe(true);
        expect(token.isPunctuation()).toBe(false);
    });

    it('should identify punctuation tokens', () => {
        const result = tokenizer.tokenize('.');
        const token = result.tokens[0];
        
        expect(token.isPunctuation()).toBe(true);
        expect(token.isWord()).toBe(false);
    });

    it('should normalize text', () => {
        const result = tokenizer.tokenize('HELLO');
        const token = result.tokens[0];
        
        expect(token.normalized).toBe('hello');
    });
});

// ============================================
// Convenience Functions
// ============================================

describe('Convenience Functions', () => {
    it('should tokenize using default tokenizer', () => {
        const tokens = tokenize('Hello world');
        
        expect(tokens.length).toBe(2);
    });

    it('should get full tokenization result', () => {
        const result = tokenizeFull('Hello world.');
        
        expect(result.tokens).toBeDefined();
        expect(result.originalText).toBe('Hello world.');
        expect(result.sentenceCount).toBe(1);
    });

    it('should split sentences using default tokenizer', () => {
        const sentences = splitSentences('First. Second.');
        
        expect(sentences.length).toBe(2);
    });
});

// ============================================
// Edge Cases
// ============================================

describe('Edge Cases', () => {
    const tokenizer = new Tokenizer();

    it('should handle only punctuation', () => {
        const result = tokenizer.tokenize('...');
        const punctTokens = result.tokens.filter(t => t.isPunctuation());
        
        expect(punctTokens.length).toBe(1);
        expect(punctTokens[0].text).toBe('...');
    });

    it('should handle mixed content', () => {
        const result = tokenizer.tokenize('Hello, world! How are you?');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens.length).toBe(6);
    });

    it('should handle newlines', () => {
        const result = tokenizer.tokenize('Hello\nworld');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens.length).toBe(2);
    });

    it('should handle tabs', () => {
        const result = tokenizer.tokenize('Hello\tworld');
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        expect(wordTokens.length).toBe(2);
    });

    it('should handle contractions', () => {
        const result = tokenizer.tokenize("don't");
        const wordTokens = result.tokens.filter(t => t.isWord());
        
        // Contractions may be handled differently
        expect(wordTokens.length).toBeGreaterThan(0);
    });
});

console.log('Tokenizer tests loaded.');
