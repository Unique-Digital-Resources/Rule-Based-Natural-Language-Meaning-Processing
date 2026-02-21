/**
 * @fileoverview Main NLP Analyzer class that integrates all components.
 * Provides a unified interface for text analysis using X-Bar theory.
 * @module analyzer
 */

import { Token } from './core/token.js';
import { POS, SentenceType, PredicateType } from './core/types.js';
import { Dictionary } from './lexicon/dictionary.js';
import { Parser } from './parser/parser.js';
import { SemanticExtractor } from './semantic/extractor.js';
import { SemanticValidator } from './semantic/validator.js';
import { MeaningRepresentation } from './semantic/meaning.js';

// Import dictionary loaders
import { loadNouns } from './lexicon/entries/nouns.js';
import { loadVerbs } from './lexicon/entries/verbs.js';
import { loadAdjectives } from './lexicon/entries/adjectives.js';
import { loadDeterminers } from './lexicon/entries/determiners.js';

/**
 * Result of analyzing text.
 * @typedef {Object} AnalysisResult
 * @property {Token[]} tokens - Tokenized words
 * @property {Object|null} tree - X-Bar tree (JSON representation)
 * @property {MeaningRepresentation|null} meaning - Extracted meaning
 * @property {Object} validation - Validation result
 * @property {string} summary - Human-readable summary
 * @property {string[]} errors - Array of error messages
 * @property {boolean} success - Whether analysis was successful
 */

/**
 * Options for the NLP Analyzer.
 * @typedef {Object} AnalyzerOptions
 * @property {boolean} [strictMode=false] - Fail on unknown words
 * @property {boolean} [includeDetails=true] - Include detailed analysis
 * @property {boolean} [validate=true] - Perform semantic validation
 */

/**
 * Main NLP Analyzer class.
 * Integrates tokenization, parsing, semantic extraction, and validation.
 */
export class NLPAnalyzer {
    /**
     * Creates a new NLPAnalyzer instance.
     * @param {Dictionary} dictionary - The dictionary to use
     * @param {AnalyzerOptions} [options] - Analyzer options
     */
    constructor(dictionary, options = {}) {
        /**
         * The dictionary instance.
         * @type {Dictionary}
         */
        this.dictionary = dictionary;

        /**
         * Analyzer options.
         * @type {AnalyzerOptions}
         */
        this.options = {
            strictMode: options.strictMode ?? false,
            includeDetails: options.includeDetails ?? true,
            validate: options.validate ?? true
        };

        /**
         * The parser instance.
         * @type {Parser}
         */
        this.parser = new Parser(dictionary, {
            strictMode: this.options.strictMode,
            includeDetails: this.options.includeDetails
        });

        /**
         * The semantic extractor instance.
         * @type {SemanticExtractor}
         */
        this.extractor = new SemanticExtractor({
            includeDetails: this.options.includeDetails
        });

        /**
         * The semantic validator instance.
         * @type {SemanticValidator}
         */
        this.validator = new SemanticValidator({
            strictMode: this.options.strictMode
        });
    }

    /**
     * Analyzes text and returns a complete analysis result.
     * @param {string} text - The text to analyze
     * @returns {AnalysisResult} The analysis result
     */
    analyze(text) {
        const errors = [];

        // Step 1: Parse the text
        const parseResult = this.parser.parse(text);

        if (!parseResult.success) {
            return this.createErrorResult(
                'Parsing failed',
                parseResult.tokens,
                [...parseResult.errors, ...errors]
            );
        }

        // Step 2: Extract semantic meaning
        let meaning = null;
        if (parseResult.tree) {
            meaning = this.extractor.extract(parseResult.tree);
            
            if (!meaning) {
                errors.push('Failed to extract meaning from parse tree');
            }
        }

        // Step 3: Validate the meaning
        let validation = { isValid: true, errors: [], warnings: [] };
        if (meaning && this.options.validate) {
            validation = this.validator.validate(meaning);
        }

        // Step 4: Generate summary
        const summary = this.generateSummary(parseResult, meaning, validation);

        return {
            tokens: parseResult.tokens,
            tree: parseResult.tree ? parseResult.tree.toJSON() : null,
            meaning: meaning ? meaning.toJSON() : null,
            validation: {
                isValid: validation.isValid,
                errors: validation.errors,
                warnings: validation.warnings,
                details: validation.details
            },
            summary,
            errors: [...errors, ...parseResult.errors],
            success: parseResult.success && (meaning !== null)
        };
    }

    /**
     * Analyzes text and returns only the meaning representation.
     * @param {string} text - The text to analyze
     * @returns {MeaningRepresentation|null} The meaning representation or null
     */
    extractMeaning(text) {
        const result = this.analyze(text);
        if (result.meaning) {
            return MeaningRepresentation.fromJSON(result.meaning);
        }
        return null;
    }

    /**
     * Analyzes text and returns only the parse tree.
     * @param {string} text - The text to analyze
     * @returns {Object|null} The parse tree (JSON) or null
     */
    parse(text) {
        const parseResult = this.parser.parse(text);
        return parseResult.tree ? parseResult.tree.toJSON() : null;
    }

    /**
     * Tokenizes text without full analysis.
     * @param {string} text - The text to tokenize
     * @returns {Token[]} Array of tokens
     */
    tokenize(text) {
        const parseResult = this.parser.parse(text);
        return parseResult.tokens;
    }

    /**
     * Generates a human-readable summary of the analysis.
     * @param {Object} parseResult - The parse result
     * @param {MeaningRepresentation|null} meaning - The extracted meaning
     * @param {Object} validation - The validation result
     * @returns {string} Human-readable summary
     */
    generateSummary(parseResult, meaning, validation) {
        const parts = [];

        // Original sentence
        const originalText = parseResult.tokens.map(t => t.text).join(' ');
        parts.push(`Sentence: "${originalText}"`);
        parts.push('');

        // Parse info
        parts.push('=== Parse Information ===');
        parts.push(`Sentence Type: ${parseResult.sentenceType}`);
        parts.push(`Predicate Type: ${parseResult.predicateType}`);

        // Tokens
        if (this.options.includeDetails && parseResult.tokens.length > 0) {
            parts.push('');
            parts.push('Tokens:');
            for (const token of parseResult.tokens) {
                const posInfo = token.pos !== POS.UNKNOWN ? ` [${token.pos}]` : '';
                const lemmaInfo = token.lemma && token.lemma !== token.normalized ? ` (lemma: ${token.lemma})` : '';
                parts.push(`  - ${token.text}${posInfo}${lemmaInfo}`);
            }
        }

        // Meaning
        if (meaning) {
            parts.push('');
            parts.push('=== Semantic Meaning ===');
            parts.push(meaning.toSummary());
        }

        // Validation
        if (!validation.isValid) {
            parts.push('');
            parts.push('=== Validation Issues ===');
            for (const error of validation.errors) {
                parts.push(`  ERROR: ${error.message}`);
            }
        }

        if (validation.warnings.length > 0) {
            parts.push('');
            parts.push('=== Warnings ===');
            for (const warning of validation.warnings) {
                parts.push(`  WARNING: ${warning.message}`);
            }
        }

        return parts.join('\n');
    }

    /**
     * Creates an error result.
     * @param {string} message - Error message
     * @param {Token[]} tokens - Tokens (if any)
     * @param {string[]} errors - Error messages
     * @returns {AnalysisResult} Error result
     * @private
     */
    createErrorResult(message, tokens, errors) {
        return {
            tokens: tokens || [],
            tree: null,
            meaning: null,
            validation: {
                isValid: false,
                errors: [{ type: 'error', code: 'ANALYSIS_ERROR', message }],
                warnings: [],
                details: null
            },
            summary: `Analysis failed: ${message}`,
            errors: [message, ...errors],
            success: false
        };
    }

    /**
     * Analyzes multiple sentences.
     * @param {string} text - Text containing multiple sentences
     * @returns {AnalysisResult[]} Array of analysis results
     */
    analyzeMultiple(text) {
        const sentences = this.parser.tokenizer.splitIntoSentences(text);
        return sentences.map(s => this.analyze(s));
    }

    /**
     * Gets the version of the analyzer.
     * @returns {string} Version string
     */
    static getVersion() {
        return '1.0.0';
    }

    /**
     * Creates a default NLPAnalyzer with built-in dictionaries.
     * @param {AnalyzerOptions} [options] - Analyzer options
     * @returns {NLPAnalyzer} A new NLPAnalyzer instance
     */
    static createDefault(options = {}) {
        const dictionary = new Dictionary();
        
        // Load all built-in dictionaries
        loadNouns(dictionary);
        loadVerbs(dictionary);
        loadAdjectives(dictionary);
        loadDeterminers(dictionary);

        return new NLPAnalyzer(dictionary, options);
    }

    /**
     * Creates an NLPAnalyzer with a custom dictionary.
     * @param {Dictionary} dictionary - The custom dictionary
     * @param {AnalyzerOptions} [options] - Analyzer options
     * @returns {NLPAnalyzer} A new NLPAnalyzer instance
     */
    static createWithDictionary(dictionary, options = {}) {
        return new NLPAnalyzer(dictionary, options);
    }

    /**
     * Converts an analysis result to JSON.
     * @param {AnalysisResult} result - The analysis result
     * @returns {Object} JSON representation
     */
    toJSON(result) {
        return {
            success: result.success,
            tokens: result.tokens.map(t => t.toJSON ? t.toJSON() : t),
            tree: result.tree,
            meaning: result.meaning,
            validation: result.validation,
            summary: result.summary,
            errors: result.errors
        };
    }
}

/**
 * Creates a default NLPAnalyzer instance.
 * @param {AnalyzerOptions} [options] - Analyzer options
 * @returns {NLPAnalyzer} A new NLPAnalyzer instance
 */
export function createAnalyzer(options = {}) {
    return NLPAnalyzer.createDefault(options);
}

/**
 * Analyzes text using a default analyzer.
 * @param {string} text - The text to analyze
 * @returns {AnalysisResult} The analysis result
 */
export function analyze(text) {
    const analyzer = NLPAnalyzer.createDefault();
    return analyzer.analyze(text);
}

// Export the main classes and functions
export default NLPAnalyzer;
