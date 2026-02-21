/**
 * @fileoverview Basic tokenizer for text processing.
 * Handles whitespace tokenization, punctuation, and affix stripping.
 * @module utils/tokenizer
 */

import { Token } from '../core/token.js';
import { POS } from '../core/types.js';
import { stripAffixes, getAllPossibleBases } from '../lexicon/affixes.js';

/**
 * Punctuation characters that should be separated from words.
 * @type {Set<string>}
 */
const PUNCTUATION = new Set([
    '.', ',', '!', '?', ';', ':', '-', '—', '–',
    '(', ')', '[', ']', '{', '}',
    '"', "'", '`', '""', "''",
    '/', '\\', '@', '#', '$', '%', '^', '&', '*',
    '+', '=', '<', '>', '|', '~'
]);

/**
 * Characters that indicate sentence boundaries.
 * @type {Set<string>}
 */
const SENTENCE_ENDINGS = new Set(['.', '!', '?']);

/**
 * Tokenizer options.
 * @typedef {Object} TokenizerOptions
 * @property {boolean} [separatePunctuation=true] - Whether to separate punctuation from words
 * @property {boolean} [preserveCase=false] - Whether to preserve original case
 * @property {boolean} [stripAffixes=true] - Whether to attempt affix stripping
 * @property {boolean} [includeWhitespace=false] - Whether to include whitespace tokens
 */

/**
 * Result of tokenization.
 * @typedef {Object} TokenizationResult
 * @property {Token[]} tokens - Array of tokens
 * @property {string} originalText - The original input text
 * @property {number} sentenceCount - Number of sentences detected
 */

/**
 * Tokenizer class for breaking text into tokens.
 */
export class Tokenizer {
    /**
     * Creates a new Tokenizer instance.
     * @param {TokenizerOptions} [options] - Tokenizer options
     */
    constructor(options = {}) {
        /**
         * Tokenizer options.
         * @type {TokenizerOptions}
         */
        this.options = {
            separatePunctuation: options.separatePunctuation ?? true,
            preserveCase: options.preserveCase ?? false,
            stripAffixes: options.stripAffixes ?? true,
            includeWhitespace: options.includeWhitespace ?? false
        };
    }

    /**
     * Tokenizes text into an array of tokens.
     * @param {string} text - The text to tokenize
     * @returns {TokenizationResult} The tokenization result
     */
    tokenize(text) {
        const tokens = [];
        let position = 0;
        let sentenceCount = 0;
        let lastWasSentenceEnd = true; // Start of text counts as sentence boundary

        let i = 0;
        while (i < text.length) {
            const char = text[i];

            // Handle whitespace
            if (/\s/.test(char)) {
                if (this.options.includeWhitespace) {
                    const start = i;
                    while (i < text.length && /\s/.test(text[i])) {
                        i++;
                    }
                    tokens.push(new Token({
                        text: text.slice(start, i),
                        startIndex: start,
                        endIndex: i,
                        pos: 'WHITESPACE'
                    }));
                } else {
                    i++;
                }
                continue;
            }

            // Handle punctuation
            if (PUNCTUATION.has(char)) {
                const start = i;
                // Handle multi-character punctuation (e.g., ellipsis, quotes)
                while (i < text.length && PUNCTUATION.has(text[i]) && text[i] === char) {
                    i++;
                }
                const punctText = text.slice(start, i);
                const token = new Token({
                    text: punctText,
                    startIndex: start,
                    endIndex: i,
                    pos: 'PUNCTUATION'
                });

                // Check for sentence ending
                if (SENTENCE_ENDINGS.has(char)) {
                    token.setFeature('sentenceEnd', true);
                    sentenceCount++;
                    lastWasSentenceEnd = true;
                } else {
                    lastWasSentenceEnd = false;
                }

                tokens.push(token);
                position++;
                continue;
            }

            // Handle words
            const start = i;
            while (i < text.length && !/\s/.test(text[i]) && !PUNCTUATION.has(text[i])) {
                i++;
            }
            const wordText = text.slice(start, i);
            
            const token = this.createWordToken(wordText, start, i);
            token.position = position;
            
            // Mark sentence start
            if (lastWasSentenceEnd) {
                token.setFeature('sentenceStart', true);
            }
            lastWasSentenceEnd = false;

            tokens.push(token);
            position++;
        }

        return {
            tokens,
            originalText: text,
            sentenceCount: sentenceCount || (tokens.length > 0 ? 1 : 0)
        };
    }

    /**
     * Creates a token for a word, optionally stripping affixes.
     * @param {string} word - The word text
     * @param {number} startIndex - Start index in source
     * @param {number} endIndex - End index in source
     * @returns {Token} The created token
     * @private
     */
    createWordToken(word, startIndex, endIndex) {
        const token = new Token({
            text: word,
            startIndex,
            endIndex,
            pos: POS.UNKNOWN
        });

        // Apply affix stripping if enabled
        if (this.options.stripAffixes) {
            const affixResult = stripAffixes(word);
            if (affixResult.strippedAffixes.length > 0) {
                token.base = affixResult.base;
                
                // Add stripped affixes to token
                for (const affix of affixResult.strippedAffixes) {
                    token.addStrippedAffix(affix);
                }

                // Apply features from affixes
                for (const [key, value] of Object.entries(affixResult.accumulatedFeatures)) {
                    token.setFeature(key, value);
                }
            }
        }

        return token;
    }

    /**
     * Tokenizes a sentence (text assumed to be a single sentence).
     * @param {string} sentence - The sentence text
     * @returns {Token[]} Array of tokens
     */
    tokenizeSentence(sentence) {
        const result = this.tokenize(sentence);
        return result.tokens.filter(t => t.isWord() || t.isPunctuation());
    }

    /**
     * Splits text into sentences.
     * @param {string} text - The text to split
     * @returns {string[]} Array of sentences
     */
    splitIntoSentences(text) {
        const sentences = [];
        let currentSentence = '';
        let i = 0;

        while (i < text.length) {
            const char = text[i];
            currentSentence += char;

            // Check for sentence ending punctuation
            if (SENTENCE_ENDINGS.has(char)) {
                // Look ahead for quotes or closing brackets
                i++;
                while (i < text.length && (text[i] === '"' || text[i] === "'" || text[i] === ')')) {
                    currentSentence += text[i];
                    i++;
                }

                // Trim and add sentence if not empty
                const trimmed = currentSentence.trim();
                if (trimmed) {
                    sentences.push(trimmed);
                }
                currentSentence = '';
                continue;
            }

            i++;
        }

        // Add remaining text as a sentence if not empty
        const remaining = currentSentence.trim();
        if (remaining) {
            sentences.push(remaining);
        }

        return sentences;
    }

    /**
     * Tokenizes multiple sentences and returns tokens grouped by sentence.
     * @param {string} text - The text to tokenize
     * @returns {Token[][]} Array of token arrays, one per sentence
     */
    tokenizeBySentence(text) {
        const sentences = this.splitIntoSentences(text);
        return sentences.map(s => this.tokenizeSentence(s));
    }

    /**
     * Normalizes a word (lowercase, strip punctuation).
     * @param {string} word - The word to normalize
     * @returns {string} The normalized word
     */
    normalizeWord(word) {
        let normalized = word.toLowerCase();
        
        // Strip leading/trailing punctuation
        normalized = normalized.replace(/^[^\w]+|[^\w]+$/g, '');
        
        return normalized;
    }

    /**
     * Checks if a character is punctuation.
     * @param {string} char - The character to check
     * @returns {boolean} True if punctuation
     */
    isPunctuation(char) {
        return PUNCTUATION.has(char);
    }

    /**
     * Checks if a character is a sentence ending.
     * @param {string} char - The character to check
     * @returns {boolean} True if sentence ending
     */
    isSentenceEnding(char) {
        return SENTENCE_ENDINGS.has(char);
    }
}

/**
 * Default tokenizer instance with standard options.
 * @type {Tokenizer}
 */
export const defaultTokenizer = new Tokenizer();

/**
 * Tokenizes text using the default tokenizer.
 * @param {string} text - The text to tokenize
 * @returns {Token[]} Array of tokens
 */
export function tokenize(text) {
    return defaultTokenizer.tokenizeSentence(text);
}

/**
 * Tokenizes text and returns full result using the default tokenizer.
 * @param {string} text - The text to tokenize
 * @returns {TokenizationResult} The tokenization result
 */
export function tokenizeFull(text) {
    return defaultTokenizer.tokenize(text);
}

/**
 * Splits text into sentences using the default tokenizer.
 * @param {string} text - The text to split
 * @returns {string[]} Array of sentences
 */
export function splitSentences(text) {
    return defaultTokenizer.splitIntoSentences(text);
}

export default Tokenizer;
