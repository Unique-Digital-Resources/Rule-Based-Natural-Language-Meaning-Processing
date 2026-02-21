/**
 * @fileoverview Sentence patterns for pattern-based parsing.
 * Defines common sentence structures and pattern matching logic.
 * @module parser/patterns
 */

import { POS, SentenceType, PredicateType, SemanticRole } from '../core/types.js';
import { XBarNode } from './xbar-node.js';
import { buildNP, buildVP, buildAP, buildPP, buildTP, findNP, findAP } from './phrase-builder.js';

/**
 * Represents a sentence pattern for matching.
 * @typedef {Object} SentencePattern
 * @property {string} name - Pattern name
 * @property {string} description - Human-readable description
 * @property {string[]} posSequence - Expected POS sequence (can use '*' as wildcard)
 * @property {string} sentenceType - Type of sentence (DECLARATIVE, etc.)
 * @property {string} predicateType - Type of predicate (IS_A, HAS_PROPERTY, DOES)
 * @property {Function} extractComponents - Function to extract subject, predicate, object
 * @property {Function} buildTree - Function to build X-Bar tree from components
 */

/**
 * Pattern: NP + VP (Basic Action Sentence)
 * Example: "The man sells cars"
 * 
 * Structure:
 *   TP
 *  /  \
 * NP   T'
 *     /  \
 *    T    VP
 *        /  \
 *       V    NP
 */
export const ACTION_PATTERN = {
    name: 'Action',
    description: 'Subject performs action on object',
    posSequence: ['NP', 'VP'],
    sentenceType: SentenceType.DECLARATIVE,
    predicateType: PredicateType.DOES,

    /**
     * Checks if tokens match this pattern.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {boolean} True if pattern matches
     */
    match(tokens) {
        if (!tokens || tokens.length < 2) return false;

        // First token(s) should form an NP
        // Then we need a verb
        let hasNoun = false;
        let hasVerb = false;

        for (const token of tokens) {
            if (token.pos === POS.NOUN || token.pos === POS.PRONOUN || token.pos === POS.DETERMINER) {
                hasNoun = true;
            }
            if (token.pos === POS.VERB) {
                hasVerb = true;
            }
        }

        return hasNoun && hasVerb && tokens[0].pos !== POS.VERB;
    },

    /**
     * Extracts components from tokens.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {Object} Extracted components
     */
    extractComponents(tokens) {
        // Find the subject NP (up to the verb)
        let verbIndex = -1;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].pos === POS.VERB) {
                verbIndex = i;
                break;
            }
        }

        if (verbIndex === -1) {
            return { error: 'No verb found in action pattern' };
        }

        const subjectTokens = tokens.slice(0, verbIndex);
        const verbToken = tokens[verbIndex];
        const objectTokens = tokens.slice(verbIndex + 1);

        return {
            subject: subjectTokens,
            predicate: verbToken,
            object: objectTokens.length > 0 ? objectTokens : null
        };
    },

    /**
     * Builds an X-Bar tree from components.
     * @param {Object} components - Extracted components
     * @returns {XBarNode} The TP root node
     */
    buildTree(components) {
        const { subject, predicate, object: obj } = components;

        // Build subject NP
        const subjectResult = buildNP(subject);
        if (!subjectResult.node) {
            return null;
        }
        const subjectNP = subjectResult.node;

        // Build VP
        const vpTokens = [predicate];
        if (obj) {
            vpTokens.push(...obj);
        }
        const vpResult = buildVP(vpTokens);
        if (!vpResult.node) {
            return null;
        }
        const vpNode = vpResult.node;

        // Build TP
        const tpNode = buildTP(subjectNP, vpNode, null);

        return tpNode;
    }
};

/**
 * Pattern: NP + Copula + AP (Property Attribution)
 * Example: "The apple is red"
 * 
 * Structure:
 *   TP
 *  /  \
 * NP   T'
 *     /  \
 *    T    AP
 *   (is)  /  \
 *        A   ...
 */
export const PROPERTY_PATTERN = {
    name: 'Property',
    description: 'Subject has a property',
    posSequence: ['NP', 'COPULA', 'AP'],
    sentenceType: SentenceType.DECLARATIVE,
    predicateType: PredicateType.HAS_PROPERTY,

    /**
     * Checks if tokens match this pattern.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {boolean} True if pattern matches
     */
    match(tokens) {
        if (!tokens || tokens.length < 3) return false;

        // Look for NP + Copula + AP pattern
        let hasCopula = false;
        let hasAdjective = false;
        let copulaIndex = -1;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].pos === POS.COPULA) {
                hasCopula = true;
                copulaIndex = i;
            }
            if (tokens[i].pos === POS.ADJECTIVE) {
                hasAdjective = true;
            }
        }

        // Copula should come before adjective
        if (hasCopula && hasAdjective) {
            const adjIndex = tokens.findIndex(t => t.pos === POS.ADJECTIVE);
            return copulaIndex < adjIndex;
        }

        return false;
    },

    /**
     * Extracts components from tokens.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {Object} Extracted components
     */
    extractComponents(tokens) {
        // Find the copula
        let copulaIndex = -1;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].pos === POS.COPULA) {
                copulaIndex = i;
                break;
            }
        }

        if (copulaIndex === -1) {
            return { error: 'No copula found in property pattern' };
        }

        const subjectTokens = tokens.slice(0, copulaIndex);
        const copulaToken = tokens[copulaIndex];
        const adjectiveTokens = tokens.slice(copulaIndex + 1);

        return {
            subject: subjectTokens,
            copula: copulaToken,
            predicate: adjectiveTokens
        };
    },

    /**
     * Builds an X-Bar tree from components.
     * @param {Object} components - Extracted components
     * @returns {XBarNode} The TP root node
     */
    buildTree(components) {
        const { subject, copula, predicate } = components;

        // Build subject NP
        const subjectResult = buildNP(subject);
        if (!subjectResult.node) {
            return null;
        }
        const subjectNP = subjectResult.node;

        // Build AP
        const apResult = buildAP(predicate);
        if (!apResult.node) {
            return null;
        }
        const apNode = apResult.node;

        // Build TP with copula as tense marker
        const tpNode = buildTP(subjectNP, apNode, copula);

        return tpNode;
    }
};

/**
 * Pattern: NP + Copula + NP (Identity/Equation/Inheritance)
 * Example: "Socrates is a man", "Paris is the capital of France"
 * 
 * Structure:
 *   TP
 *  /  \
 * NP   T'
 *     /  \
 *    T    NP
 *   (is)
 */
export const IDENTITY_PATTERN = {
    name: 'Identity',
    description: 'Subject is identified as another entity',
    posSequence: ['NP', 'COPULA', 'NP'],
    sentenceType: SentenceType.DECLARATIVE,
    predicateType: PredicateType.IS_A,

    /**
     * Checks if tokens match this pattern.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {boolean} True if pattern matches
     */
    match(tokens) {
        if (!tokens || tokens.length < 3) return false;

        // Look for NP + Copula + NP pattern
        // This means: copula followed by noun (not adjective)
        let copulaIndex = -1;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].pos === POS.COPULA) {
                copulaIndex = i;
                break;
            }
        }

        if (copulaIndex === -1 || copulaIndex >= tokens.length - 1) {
            return false;
        }

        // Check what comes after copula
        const afterCopula = tokens.slice(copulaIndex + 1);
        
        // Should have a noun (possibly with determiner)
        const hasNounAfter = afterCopula.some(t => 
            t.pos === POS.NOUN || t.pos === POS.PRONOUN
        );
        
        // Should NOT have an adjective as the main predicate
        const hasAdjAsPredicate = afterCopula.some(t => t.pos === POS.ADJECTIVE);

        return hasNounAfter && !hasAdjAsPredicate;
    },

    /**
     * Extracts components from tokens.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {Object} Extracted components
     */
    extractComponents(tokens) {
        // Find the copula
        let copulaIndex = -1;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].pos === POS.COPULA) {
                copulaIndex = i;
                break;
            }
        }

        if (copulaIndex === -1) {
            return { error: 'No copula found in identity pattern' };
        }

        const subjectTokens = tokens.slice(0, copulaIndex);
        const copulaToken = tokens[copulaIndex];
        const objectTokens = tokens.slice(copulaIndex + 1);

        return {
            subject: subjectTokens,
            copula: copulaToken,
            object: objectTokens
        };
    },

    /**
     * Builds an X-Bar tree from components.
     * @param {Object} components - Extracted components
     * @returns {XBarNode} The TP root node
     */
    buildTree(components) {
        const { subject, copula, object: obj } = components;

        // Build subject NP
        const subjectResult = buildNP(subject);
        if (!subjectResult.node) {
            return null;
        }
        const subjectNP = subjectResult.node;

        // Build object NP (predicate nominal)
        const objectResult = buildNP(obj);
        if (!objectResult.node) {
            return null;
        }
        const objectNP = objectResult.node;

        // Build TP with copula as tense marker
        const tpNode = buildTP(subjectNP, objectNP, copula);

        return tpNode;
    }
};

/**
 * Pattern: NP + Copula + PP (Location)
 * Example: "The book is on the table"
 * 
 * Structure:
 *   TP
 *  /  \
 * NP   T'
 *     /  \
 *    T    PP
 *   (is)  /  \
 *        P    NP
 */
export const LOCATION_PATTERN = {
    name: 'Location',
    description: 'Subject is located somewhere',
    posSequence: ['NP', 'COPULA', 'PP'],
    sentenceType: SentenceType.DECLARATIVE,
    predicateType: PredicateType.IS_LOCATED,

    /**
     * Checks if tokens match this pattern.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {boolean} True if pattern matches
     */
    match(tokens) {
        if (!tokens || tokens.length < 3) return false;

        // Look for NP + Copula + PP pattern
        let copulaIndex = -1;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].pos === POS.COPULA) {
                copulaIndex = i;
                break;
            }
        }

        if (copulaIndex === -1 || copulaIndex >= tokens.length - 1) {
            return false;
        }

        // Check what comes after copula
        const afterCopula = tokens.slice(copulaIndex + 1);
        
        // Should start with a preposition
        return afterCopula.length > 0 && afterCopula[0].pos === POS.PREPOSITION;
    },

    /**
     * Extracts components from tokens.
     * @param {Token[]} tokens - Tagged tokens
     * @returns {Object} Extracted components
     */
    extractComponents(tokens) {
        // Find the copula
        let copulaIndex = -1;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].pos === POS.COPULA) {
                copulaIndex = i;
                break;
            }
        }

        if (copulaIndex === -1) {
            return { error: 'No copula found in location pattern' };
        }

        const subjectTokens = tokens.slice(0, copulaIndex);
        const copulaToken = tokens[copulaIndex];
        const ppTokens = tokens.slice(copulaIndex + 1);

        return {
            subject: subjectTokens,
            copula: copulaToken,
            location: ppTokens
        };
    },

    /**
     * Builds an X-Bar tree from components.
     * @param {Object} components - Extracted components
     * @returns {XBarNode} The TP root node
     */
    buildTree(components) {
        const { subject, copula, location } = components;

        // Build subject NP
        const subjectResult = buildNP(subject);
        if (!subjectResult.node) {
            return null;
        }
        const subjectNP = subjectResult.node;

        // Build PP
        const ppResult = buildPP(location);
        if (!ppResult.node) {
            return null;
        }
        const ppNode = ppResult.node;

        // Build TP with copula as tense marker
        const tpNode = buildTP(subjectNP, ppNode, copula);

        return tpNode;
    }
};

/**
 * All defined sentence patterns.
 * @type {SentencePattern[]}
 */
export const SENTENCE_PATTERNS = [
    PROPERTY_PATTERN,   // Check property first (has adjective)
    IDENTITY_PATTERN,   // Then identity (copula + NP)
    LOCATION_PATTERN,   // Then location (copula + PP)
    ACTION_PATTERN      // Finally action (verb-based)
];

/**
 * Result of pattern matching.
 * @typedef {Object} PatternMatchResult
 * @property {SentencePattern|null} pattern - The matched pattern
 * @property {Object|null} components - Extracted components
 * @property {XBarNode|null} tree - Built X-Bar tree
 * @property {string[]} errors - Array of error messages
 */

/**
 * Matches tokens against all patterns and returns the best match.
 * @param {Token[]} tokens - Tagged tokens
 * @returns {PatternMatchResult} Match result
 */
export function matchPattern(tokens) {
    const errors = [];

    if (!tokens || tokens.length === 0) {
        return {
            pattern: null,
            components: null,
            tree: null,
            errors: ['No tokens provided for pattern matching']
        };
    }

    // Try each pattern in order
    for (const pattern of SENTENCE_PATTERNS) {
        if (pattern.match(tokens)) {
            const components = pattern.extractComponents(tokens);
            
            if (components.error) {
                errors.push(`${pattern.name}: ${components.error}`);
                continue;
            }

            const tree = pattern.buildTree(components);

            if (tree) {
                return {
                    pattern,
                    components,
                    tree,
                    errors: []
                };
            } else {
                errors.push(`${pattern.name}: Failed to build tree`);
            }
        }
    }

    return {
        pattern: null,
        components: null,
        tree: null,
        errors: errors.length > 0 ? errors : ['No matching pattern found']
    };
}

/**
 * Extracts phrase components from tokens based on a pattern.
 * @param {Token[]} tokens - Tagged tokens
 * @param {SentencePattern} pattern - The pattern to use
 * @returns {Object} Extracted components
 */
export function extractComponents(tokens, pattern) {
    if (!pattern || !pattern.extractComponents) {
        return { error: 'Invalid pattern' };
    }

    return pattern.extractComponents(tokens);
}

/**
 * Gets the sentence type for a matched pattern.
 * @param {SentencePattern} pattern - The matched pattern
 * @returns {string} The sentence type
 */
export function getSentenceType(pattern) {
    return pattern ? pattern.sentenceType : SentenceType.UNKNOWN;
}

/**
 * Gets the predicate type for a matched pattern.
 * @param {SentencePattern} pattern - The matched pattern
 * @returns {string} The predicate type
 */
export function getPredicateType(pattern) {
    return pattern ? pattern.predicateType : PredicateType.UNKNOWN;
}

/**
 * Analyzes a sentence and returns detailed pattern information.
 * @param {Token[]} tokens - Tagged tokens
 * @returns {Object} Analysis result with pattern info and semantic data
 */
export function analyzeSentence(tokens) {
    const matchResult = matchPattern(tokens);

    if (!matchResult.pattern) {
        return {
            success: false,
            errors: matchResult.errors,
            sentenceType: SentenceType.UNKNOWN,
            predicateType: PredicateType.UNKNOWN
        };
    }

    const { pattern, components, tree } = matchResult;

    // Extract semantic information
    const semantic = extractSemantics(components, pattern);

    return {
        success: true,
        pattern: pattern.name,
        sentenceType: pattern.sentenceType,
        predicateType: pattern.predicateType,
        components,
        tree,
        semantic,
        errors: []
    };
}

/**
 * Extracts semantic information from components.
 * @param {Object} components - Extracted components
 * @param {SentencePattern} pattern - The matched pattern
 * @returns {Object} Semantic information
 */
function extractSemantics(components, pattern) {
    const semantic = {
        subject: null,
        predicate: null,
        object: null
    };

    if (components.subject && components.subject.length > 0) {
        const subjToken = components.subject.find(t => t.pos === POS.NOUN || t.pos === POS.PRONOUN);
        if (subjToken) {
            semantic.subject = {
                text: subjToken.text,
                lemma: subjToken.getEffectiveLemma(),
                categories: subjToken.lexicalEntry?.categories || []
            };
        }
    }

    if (pattern.predicateType === PredicateType.HAS_PROPERTY) {
        if (components.predicate && components.predicate.length > 0) {
            const adjToken = components.predicate.find(t => t.pos === POS.ADJECTIVE);
            if (adjToken) {
                semantic.predicate = {
                    type: 'property',
                    text: adjToken.text,
                    lemma: adjToken.getEffectiveLemma()
                };
            }
        }
    } else if (pattern.predicateType === PredicateType.IS_A) {
        if (components.object && components.object.length > 0) {
            const objToken = components.object.find(t => t.pos === POS.NOUN);
            if (objToken) {
                semantic.object = {
                    text: objToken.text,
                    lemma: objToken.getEffectiveLemma(),
                    categories: objToken.lexicalEntry?.categories || []
                };
            }
        }
    } else if (pattern.predicateType === PredicateType.DOES) {
        if (components.predicate) {
            semantic.predicate = {
                type: 'action',
                text: components.predicate.text,
                lemma: components.predicate.getEffectiveLemma()
            };
        }
        if (components.object && components.object.length > 0) {
            const objToken = components.object.find(t => t.pos === POS.NOUN || t.pos === POS.PRONOUN);
            if (objToken) {
                semantic.object = {
                    text: objToken.text,
                    lemma: objToken.getEffectiveLemma(),
                    categories: objToken.lexicalEntry?.categories || []
                };
            }
        }
    }

    return semantic;
}

export default {
    SENTENCE_PATTERNS,
    ACTION_PATTERN,
    PROPERTY_PATTERN,
    IDENTITY_PATTERN,
    LOCATION_PATTERN,
    matchPattern,
    extractComponents,
    getSentenceType,
    getPredicateType,
    analyzeSentence
};
