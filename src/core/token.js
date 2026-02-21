/**
 * @fileoverview Token class for representing individual tokens in text.
 * A token is the smallest unit of text processing, typically a word or punctuation mark.
 * @module core/token
 */

import { POS, Number as GramNumber, Tense, Aspect, Person } from './types.js';

/**
 * Represents a grammatical feature set for a token.
 * @typedef {Object} TokenFeatures
 * @property {string} [number] - Grammatical number (SINGULAR, PLURAL, MASS)
 * @property {string} [tense] - Verb tense (PRESENT, PAST, FUTURE)
 * @property {string} [aspect] - Verb aspect (SIMPLE, PROGRESSIVE, PERFECT)
 * @property {string} [person] - Grammatical person (FIRST, SECOND, THIRD)
 * @property {boolean} [transitive] - Whether a verb is transitive
 * @property {string} [case] - Grammatical case (nominative, accusative, etc.)
 * @property {string} [gender] - Grammatical gender (masculine, feminine, neuter)
 * @property {string} [degree] - Degree for adjectives (positive, comparative, superlative)
 */

/**
 * Represents an affix that has been stripped from a token.
 * @typedef {Object} StrippedAffix
 * @property {string} affix - The affix text
 * @property {string} type - Affix type (PREFIX or SUFFIX)
 * @property {string} [meaning] - The meaning contributed by the affix
 * @property {string} [resultingPOS] - The POS that results from adding the affix
 */

/**
 * Token class representing a single token in text.
 * Tokens are created by the tokenizer and enriched through lexical analysis.
 */
export class Token {
    /**
     * Creates a new Token instance.
     * @param {Object} options - Token options
     * @param {string} options.text - The raw text of the token
     * @param {number} options.startIndex - The starting index in the source text
     * @param {number} options.endIndex - The ending index in the source text
     * @param {string} [options.lemma] - The lemma (base form) of the token
     * @param {string|POS} [options.pos] - The part of speech
     * @param {TokenFeatures} [options.features] - Grammatical features
     */
    constructor({ text, startIndex, endIndex, lemma = null, pos = POS.UNKNOWN, features = {} }) {
        /**
         * The raw text of the token as it appears in the source.
         * @type {string}
         */
        this.text = text;

        /**
         * The normalized (lowercase) form of the token.
         * @type {string}
         */
        this.normalized = text.toLowerCase();

        /**
         * The starting index of the token in the source text.
         * @type {number}
         */
        this.startIndex = startIndex;

        /**
         * The ending index of the token in the source text (exclusive).
         * @type {number}
         */
        this.endIndex = endIndex;

        /**
         * The lemma (base form) of the token.
         * For "running", this would be "run".
         * @type {string|null}
         */
        this.lemma = lemma;

        /**
         * The part of speech tag for this token.
         * @type {string}
         */
        this.pos = pos;

        /**
         * Grammatical features for this token.
         * @type {TokenFeatures}
         */
        this.features = { ...features };

        /**
         * Affixes that have been stripped from this token.
         * @type {StrippedAffix[]}
         */
        this.strippedAffixes = [];

        /**
         * The base form after affix stripping (before dictionary lookup).
         * @type {string|null}
         */
        this.base = null;

        /**
         * The position of this token in the sentence (0-indexed).
         * @type {number}
         */
        this.position = -1;

        /**
         * Whether this token was found in the dictionary.
         * @type {boolean}
         */
        this.found = false;

        /**
         * Any lexical entry data associated with this token.
         * @type {Object|null}
         */
        this.lexicalEntry = null;
    }

    /**
     * Gets the effective lemma for this token.
     * Returns the lemma if set, otherwise the base if set, otherwise the normalized text.
     * @returns {string} The effective lemma
     */
    getEffectiveLemma() {
        if (this.lemma) return this.lemma;
        if (this.base) return this.base;
        return this.normalized;
    }

    /**
     * Sets a grammatical feature for this token.
     * @param {string} featureName - The name of the feature (e.g., 'number', 'tense')
     * @param {*} value - The value of the feature
     * @returns {Token} This token for chaining
     */
    setFeature(featureName, value) {
        this.features[featureName] = value;
        return this;
    }

    /**
     * Gets a grammatical feature for this token.
     * @param {string} featureName - The name of the feature
     * @returns {*} The feature value, or undefined if not set
     */
    getFeature(featureName) {
        return this.features[featureName];
    }

    /**
     * Checks if a specific feature has a specific value.
     * @param {string} featureName - The name of the feature
     * @param {*} value - The value to check
     * @returns {boolean} True if the feature has the specified value
     */
    hasFeature(featureName, value) {
        return this.features[featureName] === value;
    }

    /**
     * Removes a grammatical feature from this token.
     * @param {string} featureName - The name of the feature to remove
     * @returns {Token} This token for chaining
     */
    removeFeature(featureName) {
        delete this.features[featureName];
        return this;
    }

    /**
     * Clears all grammatical features from this token.
     * @returns {Token} This token for chaining
     */
    clearFeatures() {
        this.features = {};
        return this;
    }

    /**
     * Adds a stripped affix to this token.
     * @param {StrippedAffix} affix - The affix that was stripped
     * @returns {Token} This token for chaining
     */
    addStrippedAffix(affix) {
        this.strippedAffixes.push(affix);
        return this;
    }

    /**
     * Checks if this token has any stripped affixes.
     * @returns {boolean} True if affixes were stripped
     */
    hasStrippedAffixes() {
        return this.strippedAffixes.length > 0;
    }

    /**
     * Gets all prefixes that were stripped from this token.
     * @returns {StrippedAffix[]} Array of stripped prefixes
     */
    getStrippedPrefixes() {
        return this.strippedAffixes.filter(a => a.type === 'PREFIX');
    }

    /**
     * Gets all suffixes that were stripped from this token.
     * @returns {StrippedAffix[]} Array of stripped suffixes
     */
    getStrippedSuffixes() {
        return this.strippedAffixes.filter(a => a.type === 'SUFFIX');
    }

    /**
     * Checks if this token is a specific part of speech.
     * @param {string|POS} pos - The POS to check
     * @returns {boolean} True if the token has the specified POS
     */
    isPOS(pos) {
        return this.pos === pos;
    }

    /**
     * Checks if this token is a noun.
     * @returns {boolean} True if the token is a noun
     */
    isNoun() {
        return this.pos === POS.NOUN;
    }

    /**
     * Checks if this token is a verb.
     * @returns {boolean} True if the token is a verb
     */
    isVerb() {
        return this.pos === POS.VERB;
    }

    /**
     * Checks if this token is an adjective.
     * @returns {boolean} True if the token is an adjective
     */
    isAdjective() {
        return this.pos === POS.ADJECTIVE;
    }

    /**
     * Checks if this token is a determiner.
     * @returns {boolean} True if the token is a determiner
     */
    isDeterminer() {
        return this.pos === POS.DETERMINER;
    }

    /**
     * Checks if this token is a preposition.
     * @returns {boolean} True if the token is a preposition
     */
    isPreposition() {
        return this.pos === POS.PREPOSITION;
    }

    /**
     * Checks if this token is a copula (is, are, was, were).
     * @returns {boolean} True if the token is a copula
     */
    isCopula() {
        return this.pos === POS.COPULA;
    }

    /**
     * Checks if this token is singular.
     * @returns {boolean} True if the token is singular
     */
    isSingular() {
        return this.hasFeature('number', GramNumber.SINGULAR);
    }

    /**
     * Checks if this token is plural.
     * @returns {boolean} True if the token is plural
     */
    isPlural() {
        return this.hasFeature('number', GramNumber.PLURAL);
    }

    /**
     * Checks if this token is in past tense.
     * @returns {boolean} True if the token is past tense
     */
    isPastTense() {
        return this.hasFeature('tense', Tense.PAST);
    }

    /**
     * Checks if this token is in present tense.
     * @returns {boolean} True if the token is present tense
     */
    isPresentTense() {
        return this.hasFeature('tense', Tense.PRESENT);
    }

    /**
     * Checks if this token is in progressive aspect.
     * @returns {boolean} True if the token is progressive
     */
    isProgressive() {
        return this.hasFeature('aspect', Aspect.PROGRESSIVE);
    }

    /**
     * Gets the length of the token text.
     * @returns {number} The length of the token
     */
    get length() {
        return this.text.length;
    }

    /**
     * Checks if this token is punctuation.
     * @returns {boolean} True if the token is punctuation
     */
    isPunctuation() {
        return /^[^\w\s]$/.test(this.text);
    }

    /**
     * Checks if this token is a word (contains letters).
     * @returns {boolean} True if the token is a word
     */
    isWord() {
        return /[a-zA-Z]/.test(this.text);
    }

    /**
     * Creates a clone of this token.
     * @returns {Token} A new Token with the same properties
     */
    clone() {
        const cloned = new Token({
            text: this.text,
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            lemma: this.lemma,
            pos: this.pos,
            features: { ...this.features }
        });
        cloned.strippedAffixes = [...this.strippedAffixes];
        cloned.base = this.base;
        cloned.position = this.position;
        cloned.found = this.found;
        cloned.lexicalEntry = this.lexicalEntry ? { ...this.lexicalEntry } : null;
        return cloned;
    }

    /**
     * Converts this token to a plain object for serialization.
     * @returns {Object} A plain object representation
     */
    toJSON() {
        return {
            text: this.text,
            normalized: this.normalized,
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            lemma: this.lemma,
            pos: this.pos,
            features: { ...this.features },
            strippedAffixes: [...this.strippedAffixes],
            base: this.base,
            position: this.position,
            found: this.found
        };
    }

    /**
     * Creates a Token from a plain object.
     * @param {Object} obj - The plain object
     * @returns {Token} A new Token instance
     */
    static fromJSON(obj) {
        const token = new Token({
            text: obj.text,
            startIndex: obj.startIndex,
            endIndex: obj.endIndex,
            lemma: obj.lemma,
            pos: obj.pos,
            features: obj.features
        });
        token.strippedAffixes = obj.strippedAffixes || [];
        token.base = obj.base;
        token.position = obj.position;
        token.found = obj.found;
        return token;
    }

    /**
     * Returns a string representation of this token.
     * @returns {string} String representation
     */
    toString() {
        const parts = [this.text];
        if (this.pos !== POS.UNKNOWN) {
            parts.push(`[${this.pos}]`);
        }
        if (this.lemma && this.lemma !== this.normalized) {
            parts.push(`(lemma: ${this.lemma})`);
        }
        return parts.join(' ');
    }
}

export default Token;
