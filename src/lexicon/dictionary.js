/**
 * @fileoverview Dictionary management for lexical entries.
 * Provides lookup methods and supports multiple POS per word.
 * @module lexicon/dictionary
 */

import { POS, SemanticRole, Number as GramNumber, Tense } from '../core/types.js';
import { stripAffixes, getAllPossibleBases } from './affixes.js';

/**
 * Represents a lexical entry in the dictionary.
 * @typedef {Object} LexicalEntry
 * @property {string} lemma - The base form of the word
 * @property {string} pos - Part of speech (can be multiple, stored as primary)
 * @property {string[]} [categories] - Semantic categories (e.g., ['person', 'male'] for "man")
 * @property {Object} [features] - Grammatical features
 * @property {string} [semantic] - Semantic role
 * @property {string[]} [alternatePOS] - Other possible POS for this word
 * @property {string[]} [forms] - Inflected forms
 * @property {string} [definition] - Brief definition
 */

/**
 * Result of a dictionary lookup.
 * @typedef {Object} LookupResult
 * @property {LexicalEntry} entry - The found lexical entry
 * @property {string} matchedForm - The form that was matched (lemma or inflected)
 * @property {Object} [affixFeatures] - Features from stripped affixes
 * @property {boolean} fromAffixStripping - Whether the match came from affix stripping
 */

/**
 * Dictionary class for managing lexical entries.
 */
export class Dictionary {
    /**
     * Creates a new Dictionary instance.
     */
    constructor() {
        /**
         * Map of lemma -> LexicalEntry
         * @type {Map<string, LexicalEntry>}
         * @private
         */
        this._entries = new Map();

        /**
         * Map of inflected form -> lemma (for reverse lookup)
         * @type {Map<string, string>}
         * @private
         */
        this._forms = new Map();

        /**
         * Map of POS -> Set of lemmas (for POS-based lookup)
         * @type {Map<string, Set<string>>}
         * @private
         */
        this._posIndex = new Map();

        /**
         * Map of category -> Set of lemmas (for category-based lookup)
         * @type {Map<string, Set<string>>}
         * @private
         */
        this._categoryIndex = new Map();
    }

    /**
     * Adds a lexical entry to the dictionary.
     * @param {LexicalEntry} entry - The entry to add
     * @returns {Dictionary} This dictionary for chaining
     */
    addEntry(entry) {
        const lemma = entry.lemma.toLowerCase();
        
        // Store the entry
        this._entries.set(lemma, entry);
        
        // Index by POS
        const posList = [entry.pos, ...(entry.alternatePOS || [])];
        for (const pos of posList) {
            if (!this._posIndex.has(pos)) {
                this._posIndex.set(pos, new Set());
            }
            this._posIndex.get(pos).add(lemma);
        }
        
        // Index by categories
        if (entry.categories) {
            for (const category of entry.categories) {
                if (!this._categoryIndex.has(category)) {
                    this._categoryIndex.set(category, new Set());
                }
                this._categoryIndex.get(category).add(lemma);
            }
        }
        
        // Index inflected forms
        if (entry.forms) {
            for (const form of entry.forms) {
                this._forms.set(form.toLowerCase(), lemma);
            }
        }
        
        return this;
    }

    /**
     * Adds multiple entries to the dictionary.
     * @param {LexicalEntry[]} entries - The entries to add
     * @returns {Dictionary} This dictionary for chaining
     */
    addEntries(entries) {
        for (const entry of entries) {
            this.addEntry(entry);
        }
        return this;
    }

    /**
     * Looks up a word in the dictionary.
     * @param {string} word - The word to look up
     * @param {string} [expectedPOS] - Optional expected POS for disambiguation
     * @returns {LookupResult|null} The lookup result or null if not found
     */
    lookup(word, expectedPOS = null) {
        const normalized = word.toLowerCase();
        
        // Try direct lookup
        let entry = this._entries.get(normalized);
        if (entry) {
            // If expectedPOS is specified, check if it matches
            if (expectedPOS) {
                if (entry.pos === expectedPOS || 
                    (entry.alternatePOS && entry.alternatePOS.includes(expectedPOS))) {
                    return {
                        entry,
                        matchedForm: normalized,
                        fromAffixStripping: false
                    };
                }
            } else {
                return {
                    entry,
                    matchedForm: normalized,
                    fromAffixStripping: false
                };
            }
        }
        
        // Try inflected form lookup
        const lemma = this._forms.get(normalized);
        if (lemma) {
            entry = this._entries.get(lemma);
            if (entry) {
                if (expectedPOS) {
                    if (entry.pos === expectedPOS || 
                        (entry.alternatePOS && entry.alternatePOS.includes(expectedPOS))) {
                        return {
                            entry,
                            matchedForm: normalized,
                            fromAffixStripping: false
                        };
                    }
                } else {
                    return {
                        entry,
                        matchedForm: normalized,
                        fromAffixStripping: false
                    };
                }
            }
        }
        
        // Try affix stripping
        const possibleBases = getAllPossibleBases(normalized);
        for (const analysis of possibleBases) {
            if (analysis.base === normalized) continue; // Skip the no-stripping case
            
            entry = this._entries.get(analysis.base);
            if (entry) {
                // Check POS compatibility
                if (expectedPOS) {
                    if (entry.pos !== expectedPOS && 
                        !(entry.alternatePOS && entry.alternatePOS.includes(expectedPOS))) {
                        continue;
                    }
                }
                
                return {
                    entry,
                    matchedForm: normalized,
                    affixFeatures: analysis.features,
                    fromAffixStripping: true
                };
            }
        }
        
        return null;
    }

    /**
     * Looks up a word and returns all matching entries (for ambiguous words).
     * @param {string} word - The word to look up
     * @returns {LookupResult[]} Array of matching results
     */
    lookupAll(word) {
        const results = [];
        const normalized = word.toLowerCase();
        
        // Direct lookup
        const entry = this._entries.get(normalized);
        if (entry) {
            results.push({
                entry,
                matchedForm: normalized,
                fromAffixStripping: false
            });
        }
        
        // Inflected form lookup
        const lemma = this._forms.get(normalized);
        if (lemma && lemma !== normalized) {
            const lemmaEntry = this._entries.get(lemma);
            if (lemmaEntry) {
                results.push({
                    entry: lemmaEntry,
                    matchedForm: normalized,
                    fromAffixStripping: false
                });
            }
        }
        
        // Affix stripping
        const possibleBases = getAllPossibleBases(normalized);
        for (const analysis of possibleBases) {
            if (analysis.base === normalized) continue;
            
            const baseEntry = this._entries.get(analysis.base);
            if (baseEntry) {
                results.push({
                    entry: baseEntry,
                    matchedForm: normalized,
                    affixFeatures: analysis.features,
                    fromAffixStripping: true
                });
            }
        }
        
        return results;
    }

    /**
     * Checks if a word exists in the dictionary.
     * @param {string} word - The word to check
     * @returns {boolean} True if the word exists
     */
    has(word) {
        const normalized = word.toLowerCase();
        return this._entries.has(normalized) || this._forms.has(normalized);
    }

    /**
     * Gets all entries for a specific POS.
     * @param {string} pos - The part of speech
     * @returns {LexicalEntry[]} Array of entries
     */
    getByPOS(pos) {
        const lemmas = this._posIndex.get(pos);
        if (!lemmas) return [];
        
        return Array.from(lemmas)
            .map(lemma => this._entries.get(lemma))
            .filter(entry => entry !== undefined);
    }

    /**
     * Gets all entries with a specific category.
     * @param {string} category - The category to search for
     * @returns {LexicalEntry[]} Array of entries
     */
    getByCategory(category) {
        const lemmas = this._categoryIndex.get(category);
        if (!lemmas) return [];
        
        return Array.from(lemmas)
            .map(lemma => this._entries.get(lemma))
            .filter(entry => entry !== undefined);
    }

    /**
     * Gets all lemmas in the dictionary.
     * @returns {string[]} Array of lemmas
     */
    getAllLemmas() {
        return Array.from(this._entries.keys());
    }

    /**
     * Gets the number of entries in the dictionary.
     * @returns {number} The count of entries
     */
    get size() {
        return this._entries.size;
    }

    /**
     * Clears all entries from the dictionary.
     */
    clear() {
        this._entries.clear();
        this._forms.clear();
        this._posIndex.clear();
        this._categoryIndex.clear();
    }

    /**
     * Exports the dictionary to a JSON-serializable object.
     * @returns {Object} The exported dictionary
     */
    toJSON() {
        return {
            entries: Array.from(this._entries.values())
        };
    }

    /**
     * Creates a Dictionary from a JSON object.
     * @param {Object} json - The JSON object
     * @returns {Dictionary} A new Dictionary instance
     */
    static fromJSON(json) {
        const dict = new Dictionary();
        if (json.entries) {
            dict.addEntries(json.entries);
        }
        return dict;
    }
}

/**
 * Creates a lexical entry with common defaults.
 * @param {Object} options - Entry options
 * @param {string} options.lemma - The base form
 * @param {string} options.pos - Part of speech
 * @param {string[]} [options.categories] - Semantic categories
 * @param {Object} [options.features] - Grammatical features
 * @param {string} [options.semantic] - Semantic role
 * @param {string[]} [options.forms] - Inflected forms
 * @param {string} [options.definition] - Brief definition
 * @returns {LexicalEntry} The created entry
 */
export function createEntry(options) {
    return {
        lemma: options.lemma.toLowerCase(),
        pos: options.pos,
        categories: options.categories || [],
        features: options.features || {},
        semantic: options.semantic || null,
        forms: options.forms || [],
        definition: options.definition || null
    };
}

/**
 * Creates a noun entry.
 * @param {string} lemma - The noun
 * @param {string[]} [categories] - Categories (e.g., ['person', 'male'])
 * @param {string} [semantic] - Semantic role
 * @param {string} [number] - Grammatical number (SINGULAR, PLURAL, MASS)
 * @returns {LexicalEntry} The created entry
 */
export function createNounEntry(lemma, categories = [], semantic = null, number = null) {
    return createEntry({
        lemma,
        pos: POS.NOUN,
        categories,
        semantic,
        features: number ? { number } : {}
    });
}

/**
 * Creates a verb entry.
 * @param {string} lemma - The verb
 * @param {boolean} [transitive] - Whether the verb is transitive
 * @param {string[]} [validSubjects] - Valid subject categories
 * @param {string} [semantic] - Semantic role
 * @returns {LexicalEntry} The created entry
 */
export function createVerbEntry(lemma, transitive = null, validSubjects = [], semantic = null) {
    const features = {};
    if (transitive !== null) features.transitive = transitive;
    
    return createEntry({
        lemma,
        pos: POS.VERB,
        semantic,
        features,
        forms: [] // Forms can be added separately
    });
}

/**
 * Creates an adjective entry.
 * @param {string} lemma - The adjective
 * @param {string} [semantic] - Semantic role
 * @returns {LexicalEntry} The created entry
 */
export function createAdjectiveEntry(lemma, semantic = SemanticRole.PROPERTY) {
    return createEntry({
        lemma,
        pos: POS.ADJECTIVE,
        semantic
    });
}

/**
 * Creates a determiner entry.
 * @param {string} lemma - The determiner
 * @param {string} [semantic] - Semantic role
 * @param {string} [number] - Grammatical number restriction
 * @returns {LexicalEntry} The created entry
 */
export function createDeterminerEntry(lemma, semantic = null, number = null) {
    const features = {};
    if (number) features.number = number;
    
    return createEntry({
        lemma,
        pos: POS.DETERMINER,
        semantic,
        features
    });
}

// Create and export a default dictionary instance
export const defaultDictionary = new Dictionary();

export default Dictionary;
