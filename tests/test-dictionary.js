/**
 * @fileoverview Tests for the Dictionary module.
 * Tests dictionary lookup, affix stripping, multiple POS handling, and category retrieval.
 * @module tests/test-dictionary
 */

import { describe, it, expect } from './test-runner.js';
import { Dictionary, createEntry, createNounEntry, createVerbEntry } from '../src/lexicon/dictionary.js';
import { POS } from '../src/core/types.js';
import { loadNouns } from '../src/lexicon/entries/nouns.js';
import { loadVerbs } from '../src/lexicon/entries/verbs.js';
import { loadAdjectives } from '../src/lexicon/entries/adjectives.js';
import { loadDeterminers } from '../src/lexicon/entries/determiners.js';

/**
 * Creates a test dictionary with all built-in entries.
 * @returns {Dictionary} A populated dictionary
 */
function createTestDictionary() {
    const dictionary = new Dictionary();
    loadNouns(dictionary);
    loadVerbs(dictionary);
    loadAdjectives(dictionary);
    loadDeterminers(dictionary);
    return dictionary;
}

// ============================================
// Dictionary Creation and Basic Operations
// ============================================

describe('Dictionary Creation', () => {
    it('should create an empty dictionary', () => {
        const dictionary = new Dictionary();
        expect(dictionary.size).toBe(0);
    });

    it('should add a single entry', () => {
        const dictionary = new Dictionary();
        const entry = createNounEntry('test', ['abstract']);
        dictionary.addEntry(entry);
        
        expect(dictionary.size).toBe(1);
        expect(dictionary.has('test')).toBe(true);
    });

    it('should add multiple entries', () => {
        const dictionary = new Dictionary();
        dictionary.addEntries([
            createNounEntry('cat', ['animal']),
            createNounEntry('dog', ['animal'])
        ]);
        
        expect(dictionary.size).toBe(2);
    });

    it('should chain addEntry calls', () => {
        const dictionary = new Dictionary();
        const result = dictionary
            .addEntry(createNounEntry('cat', ['animal']))
            .addEntry(createNounEntry('dog', ['animal']));
        
        expect(result).toBe(dictionary);
        expect(dictionary.size).toBe(2);
    });
});

// ============================================
// Dictionary Lookup
// ============================================

describe('Dictionary Lookup', () => {
    const dictionary = createTestDictionary();

    it('should find "man" as a noun', () => {
        const result = dictionary.lookup('man');
        expect(result).toBeDefined();
        expect(result.entry.pos).toBe(POS.NOUN);
    });

    it('should find "reads" as a verb form', () => {
        const result = dictionary.lookup('reads');
        expect(result).toBeDefined();
        expect(result.entry.lemma).toBe('read');
        expect(result.entry.pos).toBe(POS.VERB);
    });

    it('should find "men" as plural of "man"', () => {
        const result = dictionary.lookup('men');
        expect(result).toBeDefined();
        expect(result.entry.lemma).toBe('man');
    });

    it('should return null for unknown words', () => {
        const result = dictionary.lookup('xyznonexistent');
        expect(result).toBeNull();
    });

    it('should perform case-insensitive lookup', () => {
        const result1 = dictionary.lookup('MAN');
        const result2 = dictionary.lookup('Man');
        const result3 = dictionary.lookup('man');
        
        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
        expect(result3).toBeDefined();
        expect(result1.entry.lemma).toBe(result2.entry.lemma);
        expect(result2.entry.lemma).toBe(result3.entry.lemma);
    });

    it('should find "is" as a copula', () => {
        const result = dictionary.lookup('is');
        expect(result).toBeDefined();
        expect(result.entry.pos).toBe(POS.COPULA);
    });

    it('should find "the" as a determiner', () => {
        const result = dictionary.lookup('the');
        expect(result).toBeDefined();
        expect(result.entry.pos).toBe(POS.DETERMINER);
    });
});

// ============================================
// Affix Stripping
// ============================================

describe('Affix Stripping', () => {
    const dictionary = createTestDictionary();

    it('should strip plural suffix -s', () => {
        const result = dictionary.lookup('cats');
        expect(result).toBeDefined();
        expect(result.entry.lemma).toBe('cat');
        expect(result.fromAffixStripping).toBe(true);
    });

    it('should strip past tense suffix -ed', () => {
        const result = dictionary.lookup('walked');
        expect(result).toBeDefined();
        expect(result.entry.lemma).toBe('walk');
    });

    it('should strip progressive suffix -ing', () => {
        const result = dictionary.lookup('running');
        expect(result).toBeDefined();
        expect(result.entry.lemma).toBe('run');
    });

    it('should strip comparative suffix -er', () => {
        const result = dictionary.lookup('bigger');
        expect(result).toBeDefined();
        expect(result.entry.lemma).toBe('big');
    });

    it('should strip superlative suffix -est', () => {
        const result = dictionary.lookup('biggest');
        expect(result).toBeDefined();
        expect(result.entry.lemma).toBe('big');
    });

    it('should return affix features', () => {
        const result = dictionary.lookup('cats');
        expect(result).toBeDefined();
        expect(result.affixFeatures).toBeDefined();
    });
});

// ============================================
// Multiple POS Handling
// ============================================

describe('Multiple POS Handling', () => {
    const dictionary = createTestDictionary();

    it('should find "run" as a verb', () => {
        const result = dictionary.lookup('run', POS.VERB);
        expect(result).toBeDefined();
        expect(result.entry.pos).toBe(POS.VERB);
    });

    it('should lookup all POS for a word', () => {
        const results = dictionary.lookupAll('run');
        expect(results.length).toBeGreaterThan(0);
    });

    it('should handle words with alternate POS', () => {
        // "be" has alternate POS of COPULA and AUXILIARY
        const result = dictionary.lookup('be');
        expect(result).toBeDefined();
        expect(result.entry.alternatePOS).toBeDefined();
        expect(result.entry.alternatePOS).toContain(POS.COPULA);
    });
});

// ============================================
// Category Retrieval
// ============================================

describe('Category Retrieval', () => {
    const dictionary = createTestDictionary();

    it('should get entries by POS', () => {
        const nouns = dictionary.getByPOS(POS.NOUN);
        expect(nouns.length).toBeGreaterThan(0);
        
        const verbs = dictionary.getByPOS(POS.VERB);
        expect(verbs.length).toBeGreaterThan(0);
    });

    it('should get entries by category', () => {
        const people = dictionary.getByCategory('person');
        expect(people.length).toBeGreaterThan(0);
        
        const animals = dictionary.getByCategory('animal');
        expect(animals.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown category', () => {
        const unknown = dictionary.getByCategory('nonexistent_category');
        expect(unknown.length).toBe(0);
    });

    it('should return all lemmas', () => {
        const lemmas = dictionary.getAllLemmas();
        expect(lemmas.length).toBeGreaterThan(0);
        expect(lemmas).toContain('man');
        expect(lemmas).toContain('dog');
    });
});

// ============================================
// Entry Creation Helpers
// ============================================

describe('Entry Creation Helpers', () => {
    it('should create a noun entry', () => {
        const entry = createNounEntry('test', ['category1', 'category2']);
        expect(entry.lemma).toBe('test');
        expect(entry.pos).toBe(POS.NOUN);
        expect(entry.categories).toContain('category1');
        expect(entry.categories).toContain('category2');
    });

    it('should create a verb entry', () => {
        const entry = createVerbEntry('test', true, ['subject1']);
        expect(entry.lemma).toBe('test');
        expect(entry.pos).toBe(POS.VERB);
        expect(entry.features.transitive).toBe(true);
    });

    it('should create a basic entry', () => {
        const entry = createEntry({
            lemma: 'test',
            pos: POS.ADJECTIVE,
            categories: ['property']
        });
        expect(entry.lemma).toBe('test');
        expect(entry.pos).toBe(POS.ADJECTIVE);
    });
});

// ============================================
// Dictionary Serialization
// ============================================

describe('Dictionary Serialization', () => {
    it('should export to JSON', () => {
        const dictionary = new Dictionary();
        dictionary.addEntry(createNounEntry('cat', ['animal']));
        
        const json = dictionary.toJSON();
        expect(json).toBeDefined();
        expect(json.entries).toBeDefined();
        expect(json.entries.length).toBe(1);
    });

    it('should import from JSON', () => {
        const dictionary1 = new Dictionary();
        dictionary1.addEntry(createNounEntry('cat', ['animal']));
        
        const json = dictionary1.toJSON();
        const dictionary2 = Dictionary.fromJSON(json);
        
        expect(dictionary2.size).toBe(1);
        expect(dictionary2.has('cat')).toBe(true);
    });

    it('should clear the dictionary', () => {
        const dictionary = new Dictionary();
        dictionary.addEntry(createNounEntry('cat', ['animal']));
        expect(dictionary.size).toBe(1);
        
        dictionary.clear();
        expect(dictionary.size).toBe(0);
    });
});

// ============================================
// Dictionary Size and State
// ============================================

describe('Dictionary Size and State', () => {
    it('should report correct size', () => {
        const dictionary = createTestDictionary();
        const size = dictionary.size;
        expect(size).toBeGreaterThan(30); // We have many built-in entries
    });

    it('should check if word exists', () => {
        const dictionary = createTestDictionary();
        
        expect(dictionary.has('man')).toBe(true);
        expect(dictionary.has('nonexistent')).toBe(false);
    });

    it('should find inflected forms', () => {
        const dictionary = createTestDictionary();
        
        // "men" is an irregular plural of "man"
        expect(dictionary.has('men')).toBe(true);
        // "running" is a form of "run"
        expect(dictionary.has('running')).toBe(true);
    });
});

console.log('Dictionary tests loaded.');
