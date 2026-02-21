/**
 * @fileoverview Phrase construction utilities for building X-Bar trees.
 * Provides builder functions for each phrase type: NP, VP, AP, PP, TP.
 * @module parser/phrase-builder
 */

import { XBarNode, ChildRole } from './xbar-node.js';
import { PhraseType, XBarLevel, POS, SemanticRole, posToPhraseType } from '../core/types.js';
import { Token } from '../core/token.js';

/**
 * Result of phrase building.
 * @typedef {Object} BuildResult
 * @property {XBarNode|null} node - The built node (null if failed)
 * @property {string[]} errors - Array of error messages
 * @property {Token[]} consumedTokens - Tokens consumed during building
 */

/**
 * Options for phrase building.
 * @typedef {Object} BuildOptions
 * @property {boolean} [allowPartial=false] - Allow incomplete phrases
 * @property {Object} [dictionary] - Dictionary for lookups
 */

/**
 * Identifies the head token in a sequence of tokens for a specific phrase type.
 * @param {Token[]} tokens - Array of tokens
 * @param {string} phraseType - The phrase type (NP, VP, AP, PP)
 * @returns {Object} Object with head token and index, or null if not found
 */
export function findHead(tokens, phraseType) {
    if (!tokens || tokens.length === 0) {
        return null;
    }

    const headPOSMap = {
        [PhraseType.NP]: [POS.NOUN, POS.PRONOUN],
        [PhraseType.VP]: [POS.VERB],
        [PhraseType.AP]: [POS.ADJECTIVE],
        [PhraseType.PP]: [POS.PREPOSITION],
        [PhraseType.TP]: [POS.AUXILIARY, POS.COPULA]
    };

    const validHeads = headPOSMap[phraseType] || [];

    // Find the rightmost head candidate (heads are typically rightmost in English)
    for (let i = tokens.length - 1; i >= 0; i--) {
        const token = tokens[i];
        if (validHeads.includes(token.pos)) {
            return { token, index: i };
        }
    }

    return null;
}

/**
 * Finds the specifier in a token sequence.
 * Specifiers typically come before the head.
 * @param {Token[]} tokens - Array of tokens
 * @param {number} headIndex - Index of the head token
 * @param {string} phraseType - The phrase type
 * @returns {Object|null} Object with specifier tokens and indices
 */
export function findSpecifier(tokens, headIndex, phraseType) {
    if (headIndex <= 0) {
        return null;
    }

    const specifierPOSMap = {
        [PhraseType.NP]: [POS.DETERMINER, POS.POSSESSIVE],
        [PhraseType.VP]: [POS.ADVERB], // e.g., "always" in "always runs"
        [PhraseType.AP]: [POS.ADVERB], // e.g., "very" in "very happy"
        [PhraseType.PP]: [], // PPs typically don't have specifiers
        [PhraseType.TP]: [] // TP specifier is the subject NP
    };

    const validSpecifiers = specifierPOSMap[phraseType] || [];
    const specifierTokens = [];
    const specifierIndices = [];

    // Collect consecutive specifier tokens before the head
    for (let i = 0; i < headIndex; i++) {
        const token = tokens[i];
        if (validSpecifiers.includes(token.pos)) {
            specifierTokens.push(token);
            specifierIndices.push(i);
        } else if (specifierTokens.length > 0) {
            // Stop if we found specifiers and then hit a non-specifier
            break;
        }
    }

    if (specifierTokens.length === 0) {
        return null;
    }

    return {
        tokens: specifierTokens,
        indices: specifierIndices
    };
}

/**
 * Finds the complement in a token sequence.
 * Complements typically come after the head.
 * @param {Token[]} tokens - Array of tokens
 * @param {number} headIndex - Index of the head token
 * @param {string} phraseType - The phrase type
 * @returns {Object|null} Object with complement tokens and indices
 */
export function findComplement(tokens, headIndex, phraseType) {
    if (headIndex >= tokens.length - 1) {
        return null;
    }

    // Complement types depend on the phrase type
    const complementInfo = getComplementInfo(tokens, headIndex, phraseType);
    return complementInfo;
}

/**
 * Gets complement information based on phrase type.
 * @param {Token[]} tokens - Array of tokens
 * @param {number} headIndex - Index of the head token
 * @param {string} phraseType - The phrase type
 * @returns {Object|null} Complement information
 * @private
 */
function getComplementInfo(tokens, headIndex, phraseType) {
    const remainingTokens = tokens.slice(headIndex + 1);
    if (remainingTokens.length === 0) {
        return null;
    }

    switch (phraseType) {
        case PhraseType.VP: {
            // VP complement is typically an NP (direct object)
            // Find the first NP
            const npResult = findNP(remainingTokens);
            if (npResult && npResult.node) {
                return {
                    tokens: remainingTokens.slice(0, npResult.consumedCount),
                    indices: range(headIndex + 1, headIndex + 1 + npResult.consumedCount),
                    node: npResult.node
                };
            }
            break;
        }

        case PhraseType.PP: {
            // PP complement is an NP
            const npResult = findNP(remainingTokens);
            if (npResult && npResult.node) {
                return {
                    tokens: remainingTokens.slice(0, npResult.consumedCount),
                    indices: range(headIndex + 1, headIndex + 1 + npResult.consumedCount),
                    node: npResult.node
                };
            }
            break;
        }

        case PhraseType.AP: {
            // AP can have PP complements (e.g., "proud of John")
            // or clause complements
            // For simplicity, look for PP
            const ppResult = findPP(remainingTokens);
            if (ppResult && ppResult.node) {
                return {
                    tokens: remainingTokens.slice(0, ppResult.consumedCount),
                    indices: range(headIndex + 1, headIndex + 1 + ppResult.consumedCount),
                    node: ppResult.node
                };
            }
            break;
        }

        case PhraseType.NP: {
            // NP can have PP complements (e.g., "book of poems")
            const ppResult = findPP(remainingTokens);
            if (ppResult && ppResult.node) {
                return {
                    tokens: remainingTokens.slice(0, ppResult.consumedCount),
                    indices: range(headIndex + 1, headIndex + 1 + ppResult.consumedCount),
                    node: ppResult.node
                };
            }
            break;
        }
    }

    return null;
}

/**
 * Creates a range array from start to end (exclusive).
 * @param {number} start - Start index
 * @param {number} end - End index (exclusive)
 * @returns {number[]} Range array
 * @private
 */
function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}

/**
 * Builds a Noun Phrase (NP) from tokens.
 * Structure: (Det) (Adj) N (PP)
 * 
 * @param {Token[]} tokens - Array of tokens to build from
 * @param {BuildOptions} [options] - Build options
 * @returns {BuildResult} Build result with node and metadata
 */
export function buildNP(tokens, options = {}) {
    const errors = [];
    const consumedTokens = [];

    if (!tokens || tokens.length === 0) {
        return {
            node: null,
            errors: ['No tokens provided for NP'],
            consumedTokens: []
        };
    }

    // Find the head noun
    const headInfo = findHead(tokens, PhraseType.NP);
    if (!headInfo) {
        return {
            node: null,
            errors: ['No noun found for NP head'],
            consumedTokens: []
        };
    }

    const { token: headToken, index: headIndex } = headInfo;
    consumedTokens.push(headToken);

    // Find specifier (determiner)
    const specifierInfo = findSpecifier(tokens, headIndex, PhraseType.NP);
    let specifierNode = null;

    if (specifierInfo) {
        // Build specifier node (simple DP)
        const detToken = specifierInfo.tokens[0];
        specifierNode = XBarNode.createSimplePhrase(detToken, PhraseType.DP);
        specifierNode.semantic.role = SemanticRole.NONE;
        consumedTokens.unshift(detToken);
    }

    // Find complement (PP)
    const complementInfo = findComplement(tokens, headIndex, PhraseType.NP);
    let complementNode = null;

    if (complementInfo) {
        complementNode = complementInfo.node;
        consumedTokens.push(...complementInfo.tokens);
    }

    // Check for adjectives between specifier and head
    const adjectiveTokens = [];
    for (let i = (specifierInfo ? specifierInfo.indices[specifierInfo.indices.length - 1] + 1 : 0); i < headIndex; i++) {
        if (tokens[i].pos === POS.ADJECTIVE) {
            adjectiveTokens.push(tokens[i]);
            consumedTokens.splice(consumedTokens.indexOf(headToken), 0, tokens[i]);
        }
    }

    // Build the NP
    // For simplicity, adjectives are treated as adjuncts
    let npNode;

    if (specifierNode && complementNode) {
        npNode = XBarNode.createFullPhrase(headToken, PhraseType.NP, specifierNode, complementNode);
    } else if (specifierNode) {
        npNode = XBarNode.createPhraseWithSpecifier(headToken, PhraseType.NP, specifierNode);
    } else if (complementNode) {
        npNode = XBarNode.createPhraseWithComplement(headToken, PhraseType.NP, complementNode);
    } else {
        npNode = XBarNode.createSimplePhrase(headToken, PhraseType.NP);
    }

    // Add adjectives as adjuncts
    for (const adjToken of adjectiveTokens) {
        const adjNode = XBarNode.createSimplePhrase(adjToken, PhraseType.AP);
        adjNode.semantic.role = SemanticRole.PROPERTY;
        npNode.adjuncts.push(adjNode);
        adjNode._parent = npNode;
    }

    // Set semantic role based on context (to be determined by parent)
    npNode.semantic.role = SemanticRole.NONE;

    return {
        node: npNode,
        errors,
        consumedTokens
    };
}

/**
 * Finds and builds an NP from the beginning of a token sequence.
 * @param {Token[]} tokens - Array of tokens
 * @returns {Object|null} Object with node and consumedCount, or null
 */
export function findNP(tokens) {
    if (!tokens || tokens.length === 0) {
        return null;
    }

    // Try to find an NP starting from the beginning
    // Look for Det + Noun or just Noun pattern
    let consumedCount = 0;
    const npTokens = [];

    // Check for determiner
    if (tokens[0].pos === POS.DETERMINER) {
        npTokens.push(tokens[0]);
        consumedCount = 1;
    }

    // Check for adjectives
    while (consumedCount < tokens.length && tokens[consumedCount].pos === POS.ADJECTIVE) {
        npTokens.push(tokens[consumedCount]);
        consumedCount++;
    }

    // Check for noun
    if (consumedCount < tokens.length && (tokens[consumedCount].pos === POS.NOUN || tokens[consumedCount].pos === POS.PRONOUN)) {
        npTokens.push(tokens[consumedCount]);
        consumedCount++;

        // Build the NP
        const result = buildNP(npTokens);
        return {
            node: result.node,
            consumedCount
        };
    }

    // If no determiner/adjectives, try just noun
    if (tokens[0].pos === POS.NOUN || tokens[0].pos === POS.PRONOUN) {
        const result = buildNP([tokens[0]]);
        return {
            node: result.node,
            consumedCount: 1
        };
    }

    return null;
}

/**
 * Builds a Verb Phrase (VP) from tokens.
 * Structure: V (NP) (PP) (AdvP)
 * 
 * @param {Token[]} tokens - Array of tokens to build from
 * @param {BuildOptions} [options] - Build options
 * @returns {BuildResult} Build result with node and metadata
 */
export function buildVP(tokens, options = {}) {
    const errors = [];
    const consumedTokens = [];

    if (!tokens || tokens.length === 0) {
        return {
            node: null,
            errors: ['No tokens provided for VP'],
            consumedTokens: []
        };
    }

    // Find the head verb
    const headInfo = findHead(tokens, PhraseType.VP);
    if (!headInfo) {
        return {
            node: null,
            errors: ['No verb found for VP head'],
            consumedTokens: []
        };
    }

    const { token: headToken, index: headIndex } = headToken;
    consumedTokens.push(headInfo.token);

    // Find complement (direct object NP)
    const complementInfo = findComplement(tokens, headInfo.index, PhraseType.VP);
    let complementNode = null;

    if (complementInfo) {
        complementNode = complementInfo.node;
        consumedTokens.push(...complementInfo.tokens);
    }

    // Build the VP
    let vpNode;

    if (complementNode) {
        vpNode = XBarNode.createPhraseWithComplement(headInfo.token, PhraseType.VP, complementNode);
        complementNode.semantic.role = SemanticRole.PATIENT;
    } else {
        vpNode = XBarNode.createSimplePhrase(headInfo.token, PhraseType.VP);
    }

    vpNode.semantic.role = SemanticRole.NONE;

    return {
        node: vpNode,
        errors,
        consumedTokens
    };
}

/**
 * Finds and builds a VP from the beginning of a token sequence.
 * @param {Token[]} tokens - Array of tokens
 * @returns {Object|null} Object with node and consumedCount, or null
 */
export function findVP(tokens) {
    if (!tokens || tokens.length === 0) {
        return null;
    }

    // VP must start with a verb
    if (tokens[0].pos !== POS.VERB) {
        return null;
    }

    // Collect verb and potential object
    const vpTokens = [tokens[0]];
    let consumedCount = 1;

    // Look for NP complement
    const remainingTokens = tokens.slice(1);
    const npResult = findNP(remainingTokens);

    if (npResult) {
        vpTokens.push(...remainingTokens.slice(0, npResult.consumedCount));
        consumedCount += npResult.consumedCount;
    }

    const result = buildVP(vpTokens);
    return {
        node: result.node,
        consumedCount
    };
}

/**
 * Builds an Adjective Phrase (AP) from tokens.
 * Structure: (Adv) A (PP)
 * 
 * @param {Token[]} tokens - Array of tokens to build from
 * @param {BuildOptions} [options] - Build options
 * @returns {BuildResult} Build result with node and metadata
 */
export function buildAP(tokens, options = {}) {
    const errors = [];
    const consumedTokens = [];

    if (!tokens || tokens.length === 0) {
        return {
            node: null,
            errors: ['No tokens provided for AP'],
            consumedTokens: []
        };
    }

    // Find the head adjective
    const headInfo = findHead(tokens, PhraseType.AP);
    if (!headInfo) {
        return {
            node: null,
            errors: ['No adjective found for AP head'],
            consumedTokens: []
        };
    }

    const { token: headToken, index: headIndex } = headInfo;
    consumedTokens.push(headToken);

    // Find specifier (degree adverb like "very")
    const specifierInfo = findSpecifier(tokens, headIndex, PhraseType.AP);
    let specifierNode = null;

    if (specifierInfo) {
        const advToken = specifierInfo.tokens[0];
        specifierNode = XBarNode.createSimplePhrase(advToken, PhraseType.ADV_P);
        consumedTokens.unshift(advToken);
    }

    // Find complement (PP)
    const complementInfo = findComplement(tokens, headIndex, PhraseType.AP);
    let complementNode = null;

    if (complementInfo) {
        complementNode = complementInfo.node;
        consumedTokens.push(...complementInfo.tokens);
    }

    // Build the AP
    let apNode;

    if (specifierNode && complementNode) {
        apNode = XBarNode.createFullPhrase(headToken, PhraseType.AP, specifierNode, complementNode);
    } else if (specifierNode) {
        apNode = XBarNode.createPhraseWithSpecifier(headToken, PhraseType.AP, specifierNode);
    } else if (complementNode) {
        apNode = XBarNode.createPhraseWithComplement(headToken, PhraseType.AP, complementNode);
    } else {
        apNode = XBarNode.createSimplePhrase(headToken, PhraseType.AP);
    }

    apNode.semantic.role = SemanticRole.PROPERTY;

    return {
        node: apNode,
        errors,
        consumedTokens
    };
}

/**
 * Finds and builds an AP from the beginning of a token sequence.
 * @param {Token[]} tokens - Array of tokens
 * @returns {Object|null} Object with node and consumedCount, or null
 */
export function findAP(tokens) {
    if (!tokens || tokens.length === 0) {
        return null;
    }

    const apTokens = [];
    let consumedCount = 0;

    // Check for degree adverb
    if (tokens[0].pos === POS.ADVERB) {
        apTokens.push(tokens[0]);
        consumedCount = 1;
    }

    // Check for adjective
    if (consumedCount < tokens.length && tokens[consumedCount].pos === POS.ADJECTIVE) {
        apTokens.push(tokens[consumedCount]);
        consumedCount++;

        const result = buildAP(apTokens);
        return {
            node: result.node,
            consumedCount
        };
    }

    // Try just adjective
    if (tokens[0].pos === POS.ADJECTIVE) {
        const result = buildAP([tokens[0]]);
        return {
            node: result.node,
            consumedCount: 1
        };
    }

    return null;
}

/**
 * Builds a Prepositional Phrase (PP) from tokens.
 * Structure: P NP
 * 
 * @param {Token[]} tokens - Array of tokens to build from
 * @param {BuildOptions} [options] - Build options
 * @returns {BuildResult} Build result with node and metadata
 */
export function buildPP(tokens, options = {}) {
    const errors = [];
    const consumedTokens = [];

    if (!tokens || tokens.length === 0) {
        return {
            node: null,
            errors: ['No tokens provided for PP'],
            consumedTokens: []
        };
    }

    // Find the head preposition
    const headInfo = findHead(tokens, PhraseType.PP);
    if (!headInfo) {
        return {
            node: null,
            errors: ['No preposition found for PP head'],
            consumedTokens: []
        };
    }

    const { token: headToken, index: headIndex } = headInfo;
    consumedTokens.push(headToken);

    // Find complement (NP)
    const complementInfo = findComplement(tokens, headIndex, PhraseType.PP);
    let complementNode = null;

    if (complementInfo) {
        complementNode = complementInfo.node;
        consumedTokens.push(...complementInfo.tokens);
    }

    // Build the PP
    let ppNode;

    if (complementNode) {
        ppNode = XBarNode.createPhraseWithComplement(headToken, PhraseType.PP, complementNode);
        complementNode.semantic.role = SemanticRole.LOCATION;
    } else {
        ppNode = XBarNode.createSimplePhrase(headToken, PhraseType.PP);
    }

    ppNode.semantic.role = SemanticRole.LOCATION;

    return {
        node: ppNode,
        errors,
        consumedTokens
    };
}

/**
 * Finds and builds a PP from the beginning of a token sequence.
 * @param {Token[]} tokens - Array of tokens
 * @returns {Object|null} Object with node and consumedCount, or null
 */
export function findPP(tokens) {
    if (!tokens || tokens.length === 0) {
        return null;
    }

    // PP must start with a preposition
    if (tokens[0].pos !== POS.PREPOSITION) {
        return null;
    }

    const ppTokens = [tokens[0]];
    let consumedCount = 1;

    // Look for NP complement
    const remainingTokens = tokens.slice(1);
    const npResult = findNP(remainingTokens);

    if (npResult) {
        ppTokens.push(...remainingTokens.slice(0, npResult.consumedCount));
        consumedCount += npResult.consumedCount;
    }

    const result = buildPP(ppTokens);
    return {
        node: result.node,
        consumedCount
    };
}

/**
 * Builds a Tense Phrase (TP) - the sentence-level projection.
 * Structure: NP (subject) T' (T VP)
 * 
 * @param {XBarNode} subjectNP - The subject NP
 * @param {XBarNode} predicate - The predicate (VP or AP or NP)
 * @param {Token} [tenseMarker] - The tense/copula token
 * @returns {XBarNode} The TP node
 */
export function buildTP(subjectNP, predicate, tenseMarker = null) {
    // Create the T' (bar) node
    // T' contains T (tense) and VP/AP complement
    const tBar = new XBarNode({
        type: XBarLevel.X_BAR,
        category: PhraseType.TP
    });

    // Set the complement (VP or AP)
    if (predicate) {
        tBar.complement = predicate;
        predicate._parent = tBar;
    }

    // Set head token (tense marker/copula)
    if (tenseMarker) {
        tBar.headToken = tenseMarker;
    }

    // Create the TP with subject as specifier
    const tpNode = new XBarNode({
        type: XBarLevel.XP,
        category: PhraseType.TP,
        specifier: subjectNP,
        complement: tBar
    });

    // Set parent references
    if (subjectNP) {
        subjectNP._parent = tpNode;
        subjectNP.semantic.role = SemanticRole.AGENT;
    }

    tBar._parent = tpNode;

    tpNode.semantic.role = SemanticRole.NONE;

    return tpNode;
}

/**
 * Builds a TP from tokens (full sentence parsing).
 * @param {Token[]} tokens - Array of tokens
 * @param {BuildOptions} [options] - Build options
 * @returns {BuildResult} Build result with node and metadata
 */
export function buildTPFromTokens(tokens, options = {}) {
    const errors = [];
    const consumedTokens = [];

    if (!tokens || tokens.length === 0) {
        return {
            node: null,
            errors: ['No tokens provided for TP'],
            consumedTokens: []
        };
    }

    // Find the subject NP (typically at the beginning)
    const subjectResult = findNP(tokens);
    if (!subjectResult) {
        return {
            node: null,
            errors: ['Could not find subject NP'],
            consumedTokens: []
        };
    }

    const subjectNP = subjectResult.node;
    consumedTokens.push(...tokens.slice(0, subjectResult.consumedCount));

    // Find the predicate
    const remainingTokens = tokens.slice(subjectResult.consumedCount);
    let predicate = null;
    let tenseMarker = null;
    let predicateConsumed = 0;

    if (remainingTokens.length === 0) {
        return {
            node: null,
            errors: ['No predicate found'],
            consumedTokens
        };
    }

    // Check for copula
    if (remainingTokens[0].pos === POS.COPULA) {
        tenseMarker = remainingTokens[0];
        consumedTokens.push(tenseMarker);
        predicateConsumed = 1;

        // Look for AP or NP after copula
        const afterCopula = remainingTokens.slice(1);
        
        // Try AP
        const apResult = findAP(afterCopula);
        if (apResult) {
            predicate = apResult.node;
            predicateConsumed += apResult.consumedCount;
            consumedTokens.push(...afterCopula.slice(0, apResult.consumedCount));
        } else {
            // Try NP
            const npResult = findNP(afterCopula);
            if (npResult) {
                predicate = npResult.node;
                predicateConsumed += npResult.consumedCount;
                consumedTokens.push(...afterCopula.slice(0, npResult.consumedCount));
            }
        }
    } else if (remainingTokens[0].pos === POS.VERB) {
        // VP predicate
        const vpResult = findVP(remainingTokens);
        if (vpResult) {
            predicate = vpResult.node;
            predicateConsumed = vpResult.consumedCount;
            consumedTokens.push(...remainingTokens.slice(0, predicateConsumed));
        }
    }

    if (!predicate) {
        return {
            node: null,
            errors: ['Could not build predicate'],
            consumedTokens
        };
    }

    // Build the TP
    const tpNode = buildTP(subjectNP, predicate, tenseMarker);

    return {
        node: tpNode,
        errors,
        consumedTokens
    };
}

/**
 * Generic phrase builder that determines the phrase type and builds accordingly.
 * @param {Token[]} tokens - Array of tokens
 * @param {string} expectedType - Expected phrase type
 * @param {BuildOptions} [options] - Build options
 * @returns {BuildResult} Build result
 */
export function buildPhrase(tokens, expectedType, options = {}) {
    switch (expectedType) {
        case PhraseType.NP:
            return buildNP(tokens, options);
        case PhraseType.VP:
            return buildVP(tokens, options);
        case PhraseType.AP:
            return buildAP(tokens, options);
        case PhraseType.PP:
            return buildPP(tokens, options);
        case PhraseType.TP:
            return buildTPFromTokens(tokens, options);
        default:
            return {
                node: null,
                errors: [`Unknown phrase type: ${expectedType}`],
                consumedTokens: []
            };
    }
}

export default {
    buildNP,
    buildVP,
    buildAP,
    buildPP,
    buildTP,
    buildTPFromTokens,
    buildPhrase,
    findHead,
    findSpecifier,
    findComplement,
    findNP,
    findVP,
    findAP,
    findPP
};
