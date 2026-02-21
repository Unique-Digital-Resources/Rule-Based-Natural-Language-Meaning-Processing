/**
 * @fileoverview Main parser class for the X-Bar NLP Analyzer.
 * Orchestrates tokenization, POS tagging, and tree building.
 * @module parser/parser
 */

import { Token } from '../core/token.js';
import { POS, SentenceType, PredicateType, PhraseType } from '../core/types.js';
import { Tokenizer, tokenize } from '../utils/tokenizer.js';
import { Dictionary } from '../lexicon/dictionary.js';
import { XBarNode } from './xbar-node.js';
import { matchPattern, analyzeSentence, getSentenceType, getPredicateType } from './patterns.js';
import { buildPhrase, buildTP } from './phrase-builder.js';

/**
 * Result of parsing a sentence.
 * @typedef {Object} ParseResult
 * @property {Token[]} tokens - Array of tagged tokens
 * @property {XBarNode|null} tree - The X-Bar tree root
 * @property {string} sentenceType - Type of sentence
 * @property {string} predicateType - Type of predicate
 * @property {Object} semantic - Extracted semantic information
 * @property {string[]} errors - Array of error messages
 * @property {boolean} success - Whether parsing was successful
 */

/**
 * Options for the parser.
 * @typedef {Object} ParserOptions
 * @property {boolean} [allowPartialParse=false] - Allow incomplete parses
 * @property {boolean} [strictMode=true] - Fail on unknown words
 * @property {boolean} [includeDetails=true] - Include detailed analysis
 */

/**
 * Main Parser class for the X-Bar NLP Analyzer.
 * Coordinates tokenization, lexical lookup, and tree building.
 */
export class Parser {
    /**
     * Creates a new Parser instance.
     * @param {Dictionary} dictionary - The dictionary for lexical lookups
     * @param {ParserOptions} [options] - Parser options
     */
    constructor(dictionary, options = {}) {
        /**
         * The dictionary instance for lexical lookups.
         * @type {Dictionary}
         */
        this.dictionary = dictionary;

        /**
         * Parser options.
         * @type {ParserOptions}
         */
        this.options = {
            allowPartialParse: options.allowPartialParse ?? false,
            strictMode: options.strictMode ?? true,
            includeDetails: options.includeDetails ?? true
        };

        /**
         * The tokenizer instance.
         * @type {Tokenizer}
         */
        this.tokenizer = new Tokenizer();
    }

    /**
     * Parses a sentence and returns the parse result.
     * @param {string} sentence - The sentence to parse
     * @returns {ParseResult} The parse result
     */
    parse(sentence) {
        const errors = [];

        // Step 1: Tokenize
        const tokens = this.tokenize(sentence);

        if (tokens.length === 0) {
            return this.createErrorResult('No tokens found in input', tokens);
        }

        // Step 2: POS Tagging
        const tagResult = this.tagPOS(tokens);
        if (tagResult.errors.length > 0) {
            errors.push(...tagResult.errors);
            
            if (this.options.strictMode && tagResult.unknownCount > 0) {
                return this.createErrorResult(
                    `Unknown words found: ${tagResult.unknownWords.join(', ')}`,
                    tokens,
                    errors
                );
            }
        }

        // Step 3: Build X-Bar Tree
        const treeResult = this.buildTree(tokens);

        if (!treeResult.tree) {
            errors.push(...treeResult.errors);
            return {
                tokens,
                tree: null,
                sentenceType: SentenceType.UNKNOWN,
                predicateType: PredicateType.UNKNOWN,
                semantic: {},
                errors,
                success: false
            };
        }

        // Step 4: Extract semantic information
        const semantic = this.extractSemantics(treeResult.tree, treeResult.pattern);

        return {
            tokens,
            tree: treeResult.tree,
            sentenceType: treeResult.sentenceType,
            predicateType: treeResult.predicateType,
            semantic,
            errors: [...errors, ...treeResult.errors],
            success: true
        };
    }

    /**
     * Tokenizes a sentence.
     * @param {string} sentence - The sentence to tokenize
     * @returns {Token[]} Array of tokens
     */
    tokenize(sentence) {
        const result = this.tokenizer.tokenize(sentence);
        
        // Filter out punctuation and whitespace for parsing
        const wordTokens = result.tokens.filter(t => t.isWord());

        // Assign positions
        let position = 0;
        for (const token of wordTokens) {
            token.position = position++;
        }

        return wordTokens;
    }

    /**
     * Performs part-of-speech tagging on tokens.
     * @param {Token[]} tokens - Array of tokens to tag
     * @returns {Object} Tagging result with errors and unknown count
     */
    tagPOS(tokens) {
        const errors = [];
        const unknownWords = [];
        let unknownCount = 0;

        for (const token of tokens) {
            // Skip non-words
            if (!token.isWord()) {
                continue;
            }

            // Look up in dictionary
            const lookupResult = this.dictionary.lookup(token.normalized);

            if (lookupResult) {
                const { entry, affixFeatures, fromAffixStripping } = lookupResult;

                // Set POS
                token.pos = entry.pos;
                token.lemma = entry.lemma;
                token.found = true;
                token.lexicalEntry = entry;

                // Apply features from dictionary entry
                if (entry.features) {
                    for (const [key, value] of Object.entries(entry.features)) {
                        token.setFeature(key, value);
                    }
                }

                // Apply features from affix stripping
                if (affixFeatures) {
                    for (const [key, value] of Object.entries(affixFeatures)) {
                        token.setFeature(key, value);
                    }
                }

                // Set base if affix stripping occurred
                if (fromAffixStripping && token.base) {
                    // Base is already set by tokenizer
                }
            } else {
                // Unknown word
                unknownCount++;
                unknownWords.push(token.text);
                token.pos = POS.UNKNOWN;
                token.found = false;

                // Try to infer POS from context or morphology
                const inferredPOS = this.inferPOS(token, tokens);
                if (inferredPOS) {
                    token.pos = inferredPOS;
                    errors.push(`Inferred POS for unknown word "${token.text}": ${inferredPOS}`);
                } else {
                    errors.push(`Unknown word: "${token.text}"`);
                }
            }
        }

        return {
            errors,
            unknownCount,
            unknownWords
        };
    }

    /**
     * Attempts to infer POS for an unknown token.
     * @param {Token} token - The unknown token
     * @param {Token[]} context - Surrounding tokens
     * @returns {string|null} Inferred POS or null
     */
    inferPOS(token, context) {
        const text = token.text.toLowerCase();

        // Check for common morphological patterns
        // Nouns often end in: -tion, -ness, -ment, -ity, -er, -or
        if (/(tion|ness|ment|ity|er|or)$/i.test(text)) {
            return POS.NOUN;
        }

        // Verbs often end in: -ize, -ate, -ify, -en
        if (/(ize|ate|ify|en)$/i.test(text)) {
            return POS.VERB;
        }

        // Adjectives often end in: -able, -ible, -ful, -less, -ous, -ive
        if (/(able|ible|ful|less|ous|ive)$/i.test(text)) {
            return POS.ADJECTIVE;
        }

        // Adverbs often end in: -ly
        if (/ly$/i.test(text)) {
            return POS.ADVERB;
        }

        // Check context
        const position = token.position;
        
        // First word is often a noun (subject) or determiner
        if (position === 0) {
            // Check if followed by a noun
            if (position + 1 < context.length) {
                const next = context[position + 1];
                if (next.pos === POS.NOUN) {
                    return POS.DETERMINER;
                }
            }
            return POS.NOUN;
        }

        // Word after determiner is often a noun or adjective
        if (position > 0) {
            const prev = context[position - 1];
            if (prev.pos === POS.DETERMINER) {
                // Could be adjective or noun
                // Check what comes next
                if (position + 1 < context.length) {
                    const next = context[position + 1];
                    if (next.pos === POS.NOUN) {
                        return POS.ADJECTIVE;
                    }
                }
                return POS.NOUN;
            }
        }

        // Word after copula is often an adjective or noun
        if (position > 0) {
            const prev = context[position - 1];
            if (prev.pos === POS.COPULA) {
                // Default to adjective for predicate
                return POS.ADJECTIVE;
            }
        }

        return null;
    }

    /**
     * Builds an X-Bar tree from tagged tokens.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {Object} Tree building result
     */
    buildTree(tokens) {
        const errors = [];

        // Use pattern matching to build the tree
        const matchResult = matchPattern(tokens);

        if (!matchResult.pattern) {
            errors.push(...matchResult.errors);
            return {
                tree: null,
                pattern: null,
                sentenceType: SentenceType.UNKNOWN,
                predicateType: PredicateType.UNKNOWN,
                errors
            };
        }

        const sentenceType = getSentenceType(matchResult.pattern);
        const predicateType = getPredicateType(matchResult.pattern);

        return {
            tree: matchResult.tree,
            pattern: matchResult.pattern,
            components: matchResult.components,
            sentenceType,
            predicateType,
            errors
        };
    }

    /**
     * Extracts semantic information from the parse tree.
     * @param {XBarNode} tree - The parse tree
     * @param {Object} pattern - The matched pattern
     * @returns {Object} Semantic information
     */
    extractSemantics(tree, pattern) {
        if (!tree) {
            return {};
        }

        const semantic = {
            subject: null,
            predicate: null,
            object: null,
            modifiers: []
        };

        // Traverse the tree to extract semantic information
        tree.traverse(node => {
            // Extract subject from specifier of TP
            if (node.category === PhraseType.TP && node.type === 'XP') {
                if (node.specifier) {
                    const headToken = node.specifier.getHeadToken();
                    if (headToken) {
                        semantic.subject = {
                            text: headToken.text,
                            lemma: headToken.getEffectiveLemma(),
                            categories: headToken.lexicalEntry?.categories || [],
                            phrase: node.specifier.toJSON()
                        };
                    }
                }
            }

            // Extract predicate from complement of T'
            if (node.category === PhraseType.TP && node.type === "X'") {
                if (node.complement) {
                    const headToken = node.complement.getHeadToken();
                    if (headToken) {
                        semantic.predicate = {
                            text: headToken.text,
                            lemma: headToken.getEffectiveLemma(),
                            phraseType: node.complement.category,
                            phrase: node.complement.toJSON()
                        };
                    }
                }
            }

            // Extract object from complement of VP
            if (node.category === PhraseType.VP && node.complement) {
                const headToken = node.complement.getHeadToken();
                if (headToken) {
                    semantic.object = {
                        text: headToken.text,
                        lemma: headToken.getEffectiveLemma(),
                        categories: headToken.lexicalEntry?.categories || [],
                        phrase: node.complement.toJSON()
                    };
                }
            }
        });

        return semantic;
    }

    /**
     * Creates an error result.
     * @param {string} message - Error message
     * @param {Token[]} tokens - Tokens (if any)
     * @param {string[]} [additionalErrors] - Additional errors
     * @returns {ParseResult} Error result
     * @private
     */
    createErrorResult(message, tokens, additionalErrors = []) {
        return {
            tokens,
            tree: null,
            sentenceType: SentenceType.UNKNOWN,
            predicateType: PredicateType.UNKNOWN,
            semantic: {},
            errors: [message, ...additionalErrors],
            success: false
        };
    }

    /**
     * Parses multiple sentences.
     * @param {string} text - Text containing multiple sentences
     * @returns {ParseResult[]} Array of parse results
     */
    parseMultiple(text) {
        const sentences = this.tokenizer.splitIntoSentences(text);
        return sentences.map(s => this.parse(s));
    }

    /**
     * Validates a parse result.
     * @param {ParseResult} result - The parse result to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validate(result) {
        const errors = [];

        if (!result.success) {
            errors.push('Parse was not successful');
        }

        if (!result.tree) {
            errors.push('No tree was generated');
        }

        if (result.tree && !result.tree.isComplete()) {
            errors.push('Tree is incomplete');
        }

        // Check for unknown words
        const unknownTokens = result.tokens.filter(t => t.pos === POS.UNKNOWN);
        if (unknownTokens.length > 0) {
            errors.push(`Unknown words: ${unknownTokens.map(t => t.text).join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Gets a summary of the parse result.
     * @param {ParseResult} result - The parse result
     * @returns {string} Human-readable summary
     */
    getSummary(result) {
        if (!result.success) {
            return `Parse failed: ${result.errors.join('; ')}`;
        }

        const parts = [];

        parts.push(`Sentence type: ${result.sentenceType}`);
        parts.push(`Predicate type: ${result.predicateType}`);

        if (result.semantic.subject) {
            parts.push(`Subject: ${result.semantic.subject.text}`);
        }

        if (result.semantic.predicate) {
            parts.push(`Predicate: ${result.semantic.predicate.text}`);
        }

        if (result.semantic.object) {
            parts.push(`Object: ${result.semantic.object.text}`);
        }

        return parts.join('\n');
    }

    /**
     * Converts a parse result to JSON.
     * @param {ParseResult} result - The parse result
     * @returns {Object} JSON representation
     */
    toJSON(result) {
        return {
            success: result.success,
            tokens: result.tokens.map(t => t.toJSON()),
            tree: result.tree ? result.tree.toJSON() : null,
            sentenceType: result.sentenceType,
            predicateType: result.predicateType,
            semantic: result.semantic,
            errors: result.errors
        };
    }
}

/**
 * Creates a parser with the default dictionary.
 * @param {Dictionary} dictionary - The dictionary to use
 * @param {ParserOptions} [options] - Parser options
 * @returns {Parser} A new parser instance
 */
export function createParser(dictionary, options = {}) {
    return new Parser(dictionary, options);
}

export default Parser;
