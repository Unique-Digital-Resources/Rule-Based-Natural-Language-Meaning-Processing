/**
 * @fileoverview Affix rules and processing for morphological analysis.
 * Handles prefixes and suffixes for English word decomposition.
 * @module lexicon/affixes
 */

import { POS, AffixType } from '../core/types.js';

/**
 * Represents an affix entry in the affix dictionary.
 * @typedef {Object} AffixEntry
 * @property {string} affix - The affix text (e.g., "un", "ing", "ed")
 * @property {string} type - AffixType (PREFIX or SUFFIX)
 * @property {string[]} appliesTo - Array of POS this affix can attach to
 * @property {string} meaning - The semantic contribution of the affix
 * @property {string} resultingPOS - The POS after affix attachment
 * @property {string[]} [examples] - Example words with this affix
 * @property {Object} [features] - Features added by this affix
 */

/**
 * Common English suffixes.
 * @type {AffixEntry[]}
 */
export const SUFFIXES = [
    // Noun-forming suffixes
    {
        affix: 's',
        type: AffixType.SUFFIX,
        appliesTo: [POS.NOUN],
        meaning: 'PLURAL',
        resultingPOS: POS.NOUN,
        examples: ['cats', 'dogs', 'books'],
        features: { number: 'PLURAL' }
    },
    {
        affix: 'es',
        type: AffixType.SUFFIX,
        appliesTo: [POS.NOUN],
        meaning: 'PLURAL',
        resultingPOS: POS.NOUN,
        examples: ['boxes', 'watches', 'buses'],
        features: { number: 'PLURAL' }
    },
    {
        affix: 'er',
        type: AffixType.SUFFIX,
        appliesTo: [POS.VERB],
        meaning: 'AGENT',
        resultingPOS: POS.NOUN,
        examples: ['runner', 'teacher', 'writer'],
        features: { derivation: 'AGENT' }
    },
    {
        affix: 'tion',
        type: AffixType.SUFFIX,
        appliesTo: [POS.VERB],
        meaning: 'NOMINALIZATION',
        resultingPOS: POS.NOUN,
        examples: ['action', 'creation', 'information']
    },
    {
        affix: 'ness',
        type: AffixType.SUFFIX,
        appliesTo: [POS.ADJECTIVE],
        meaning: 'STATE',
        resultingPOS: POS.NOUN,
        examples: ['happiness', 'darkness', 'kindness']
    },
    {
        affix: 'ment',
        type: AffixType.SUFFIX,
        appliesTo: [POS.VERB],
        meaning: 'RESULT',
        resultingPOS: POS.NOUN,
        examples: ['movement', 'development', 'agreement']
    },

    // Verb-forming suffixes
    {
        affix: 'ed',
        type: AffixType.SUFFIX,
        appliesTo: [POS.VERB],
        meaning: 'PAST',
        resultingPOS: POS.VERB,
        examples: ['walked', 'played', 'watched'],
        features: { tense: 'PAST' }
    },
    {
        affix: 'ing',
        type: AffixType.SUFFIX,
        appliesTo: [POS.VERB],
        meaning: 'PROGRESSIVE',
        resultingPOS: POS.VERB,
        examples: ['running', 'eating', 'sleeping'],
        features: { aspect: 'PROGRESSIVE' }
    },
    {
        affix: 's',
        type: AffixType.SUFFIX,
        appliesTo: [POS.VERB],
        meaning: 'THIRD_PERSON_SINGULAR',
        resultingPOS: POS.VERB,
        examples: ['runs', 'walks', 'eats'],
        features: { person: 'THIRD', number: 'SINGULAR' }
    },

    // Adjective-forming suffixes
    {
        affix: 'er',
        type: AffixType.SUFFIX,
        appliesTo: [POS.ADJECTIVE],
        meaning: 'COMPARATIVE',
        resultingPOS: POS.ADJECTIVE,
        examples: ['bigger', 'smaller', 'faster'],
        features: { degree: 'COMPARATIVE' }
    },
    {
        affix: 'est',
        type: AffixType.SUFFIX,
        appliesTo: [POS.ADJECTIVE],
        meaning: 'SUPERLATIVE',
        resultingPOS: POS.ADJECTIVE,
        examples: ['biggest', 'smallest', 'fastest'],
        features: { degree: 'SUPERLATIVE' }
    },
    {
        affix: 'able',
        type: AffixType.SUFFIX,
        appliesTo: [POS.VERB],
        meaning: 'CAPABLE',
        resultingPOS: POS.ADJECTIVE,
        examples: ['readable', 'movable', 'breakable']
    },
    {
        affix: 'ful',
        type: AffixType.SUFFIX,
        appliesTo: [POS.NOUN],
        meaning: 'FULL_OF',
        resultingPOS: POS.ADJECTIVE,
        examples: ['beautiful', 'helpful', 'careful']
    },
    {
        affix: 'less',
        type: AffixType.SUFFIX,
        appliesTo: [POS.NOUN],
        meaning: 'WITHOUT',
        resultingPOS: POS.ADJECTIVE,
        examples: ['careless', 'homeless', 'endless']
    },
    {
        affix: 'ous',
        type: AffixType.SUFFIX,
        appliesTo: [POS.NOUN],
        meaning: 'HAVING',
        resultingPOS: POS.ADJECTIVE,
        examples: ['famous', 'dangerous', 'curious']
    },
    {
        affix: 'ive',
        type: AffixType.SUFFIX,
        appliesTo: [POS.VERB],
        meaning: 'TENDING_TO',
        resultingPOS: POS.ADJECTIVE,
        examples: ['active', 'creative', 'attractive']
    },

    // Adverb-forming suffixes
    {
        affix: 'ly',
        type: AffixType.SUFFIX,
        appliesTo: [POS.ADJECTIVE],
        meaning: 'MANNER',
        resultingPOS: POS.ADVERB,
        examples: ['quickly', 'slowly', 'happily']
    }
];

/**
 * Common English prefixes.
 * @type {AffixEntry[]}
 */
export const PREFIXES = [
    // Negation prefixes
    {
        affix: 'un',
        type: AffixType.PREFIX,
        appliesTo: [POS.ADJECTIVE, POS.VERB],
        meaning: 'NOT',
        resultingPOS: null, // Same as input
        examples: ['unhappy', 'undo', 'unfair']
    },
    {
        affix: 'dis',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB, POS.ADJECTIVE],
        meaning: 'NOT',
        resultingPOS: null,
        examples: ['disagree', 'dishonest', 'dislike']
    },
    {
        affix: 'in',
        type: AffixType.PREFIX,
        appliesTo: [POS.ADJECTIVE],
        meaning: 'NOT',
        resultingPOS: null,
        examples: ['incorrect', 'incomplete', 'invisible']
    },
    {
        affix: 'im',
        type: AffixType.PREFIX,
        appliesTo: [POS.ADJECTIVE],
        meaning: 'NOT',
        resultingPOS: null,
        examples: ['impossible', 'imperfect', 'immature']
    },
    {
        affix: 'ir',
        type: AffixType.PREFIX,
        appliesTo: [POS.ADJECTIVE],
        meaning: 'NOT',
        resultingPOS: null,
        examples: ['irregular', 'irresponsible']
    },
    {
        affix: 'il',
        type: AffixType.PREFIX,
        appliesTo: [POS.ADJECTIVE],
        meaning: 'NOT',
        resultingPOS: null,
        examples: ['illegal', 'illogical']
    },
    {
        affix: 'non',
        type: AffixType.PREFIX,
        appliesTo: [POS.NOUN, POS.ADJECTIVE],
        meaning: 'NOT',
        resultingPOS: null,
        examples: ['nonexistent', 'nonsense', 'nonstop']
    },

    // Direction/location prefixes
    {
        affix: 're',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB],
        meaning: 'AGAIN',
        resultingPOS: null,
        examples: ['rewrite', 'redo', 'rebuild']
    },
    {
        affix: 'pre',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB, POS.NOUN],
        meaning: 'BEFORE',
        resultingPOS: null,
        examples: ['preview', 'prewar', 'predict']
    },
    {
        affix: 'post',
        type: AffixType.PREFIX,
        appliesTo: [POS.NOUN, POS.ADJECTIVE],
        meaning: 'AFTER',
        resultingPOS: null,
        examples: ['postwar', 'postpone', 'postgraduate']
    },
    {
        affix: 'sub',
        type: AffixType.PREFIX,
        appliesTo: [POS.NOUN, POS.ADJECTIVE],
        meaning: 'UNDER',
        resultingPOS: null,
        examples: ['submarine', 'subway', 'substandard']
    },
    {
        affix: 'super',
        type: AffixType.PREFIX,
        appliesTo: [POS.NOUN, POS.ADJECTIVE],
        meaning: 'ABOVE',
        resultingPOS: null,
        examples: ['superhuman', 'supermarket', 'supernatural']
    },
    {
        affix: 'inter',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB, POS.ADJECTIVE],
        meaning: 'BETWEEN',
        resultingPOS: null,
        examples: ['interact', 'international', 'intervene']
    },
    {
        affix: 'trans',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB, POS.NOUN],
        meaning: 'ACROSS',
        resultingPOS: null,
        examples: ['transport', 'translate', 'transform']
    },

    // Size/degree prefixes
    {
        affix: 'mini',
        type: AffixType.PREFIX,
        appliesTo: [POS.NOUN, POS.ADJECTIVE],
        meaning: 'SMALL',
        resultingPOS: null,
        examples: ['minivan', 'miniature', 'minimal']
    },
    {
        affix: 'micro',
        type: AffixType.PREFIX,
        appliesTo: [POS.NOUN],
        meaning: 'VERY_SMALL',
        resultingPOS: null,
        examples: ['microscope', 'microphone', 'microorganism']
    },
    {
        affix: 'mega',
        type: AffixType.PREFIX,
        appliesTo: [POS.NOUN, POS.ADJECTIVE],
        meaning: 'VERY_LARGE',
        resultingPOS: null,
        examples: ['megaphone', 'megalomaniac']
    },

    // Other common prefixes
    {
        affix: 'over',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB, POS.ADJECTIVE],
        meaning: 'EXCESSIVE',
        resultingPOS: null,
        examples: ['overeat', 'overworked', 'overconfident']
    },
    {
        affix: 'under',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB, POS.ADJECTIVE],
        meaning: 'INSUFFICIENT',
        resultingPOS: null,
        examples: ['underestimate', 'underpaid', 'underdeveloped']
    },
    {
        affix: 'mis',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB, POS.NOUN],
        meaning: 'WRONGLY',
        resultingPOS: null,
        examples: ['misunderstand', 'misplace', 'mistake']
    },
    {
        affix: 'out',
        type: AffixType.PREFIX,
        appliesTo: [POS.VERB],
        meaning: 'EXCEEDING',
        resultingPOS: null,
        examples: ['outdo', 'outnumber', 'outgrow']
    }
];

/**
 * All affixes combined for easy lookup.
 * @type {Map<string, AffixEntry[]>}
 */
const affixMap = new Map();

// Initialize the affix map
function initializeAffixMap() {
    // Add suffixes
    for (const suffix of SUFFIXES) {
        const key = suffix.affix.toLowerCase();
        if (!affixMap.has(key)) {
            affixMap.set(key, []);
        }
        affixMap.get(key).push(suffix);
    }
    
    // Add prefixes
    for (const prefix of PREFIXES) {
        const key = prefix.affix.toLowerCase();
        if (!affixMap.has(key)) {
            affixMap.set(key, []);
        }
        affixMap.get(key).push(prefix);
    }
}

// Initialize on module load
initializeAffixMap();

/**
 * Looks up an affix by its text.
 * @param {string} affixText - The affix text to look up
 * @returns {AffixEntry[]} Array of matching affix entries
 */
export function lookupAffix(affixText) {
    return affixMap.get(affixText.toLowerCase()) || [];
}

/**
 * Checks if a string is a known suffix.
 * @param {string} suffix - The suffix to check
 * @returns {boolean} True if it's a known suffix
 */
export function isKnownSuffix(suffix) {
    const entries = affixMap.get(suffix.toLowerCase()) || [];
    return entries.some(e => e.type === AffixType.SUFFIX);
}

/**
 * Checks if a string is a known prefix.
 * @param {string} prefix - The prefix to check
 * @returns {boolean} True if it's a known prefix
 */
export function isKnownPrefix(prefix) {
    const entries = affixMap.get(prefix.toLowerCase()) || [];
    return entries.some(e => e.type === AffixType.PREFIX);
}

/**
 * Result of stripping affixes from a word.
 * @typedef {Object} AffixStrippingResult
 * @property {string} base - The base form after stripping
 * @property {AffixEntry[]} strippedAffixes - Affixes that were stripped
 * @property {Object} accumulatedFeatures - Features accumulated from affixes
 */

/**
 * Strips suffixes from a word and returns the base form.
 * Tries to strip the longest matching suffix first.
 * @param {string} word - The word to process
 * @param {POS} [expectedPOS] - Expected POS of the base word (for disambiguation)
 * @returns {AffixStrippingResult} The result of suffix stripping
 */
export function stripSuffixes(word, expectedPOS = null) {
    const result = {
        base: word.toLowerCase(),
        strippedAffixes: [],
        accumulatedFeatures: {}
    };

    const normalizedWord = word.toLowerCase();
    
    // Try suffixes from longest to shortest
    const sortedSuffixes = [...SUFFIXES].sort((a, b) => b.affix.length - a.affix.length);
    
    for (const suffixEntry of sortedSuffixes) {
        if (normalizedWord.endsWith(suffixEntry.affix)) {
            const potentialBase = normalizedWord.slice(0, -suffixEntry.affix.length);
            
            // Skip if base would be too short (likely not a valid word)
            if (potentialBase.length < 2) continue;
            
            // Check if this suffix applies to expected POS
            if (expectedPOS && !suffixEntry.appliesTo.includes(expectedPOS)) continue;
            
            result.base = potentialBase;
            result.strippedAffixes.push({
                affix: suffixEntry.affix,
                type: suffixEntry.type,
                meaning: suffixEntry.meaning,
                resultingPOS: suffixEntry.resultingPOS,
                features: suffixEntry.features || {}
            });
            
            // Accumulate features
            if (suffixEntry.features) {
                Object.assign(result.accumulatedFeatures, suffixEntry.features);
            }
            
            // Only strip one suffix at a time for now
            break;
        }
    }
    
    return result;
}

/**
 * Strips prefixes from a word and returns the base form.
 * @param {string} word - The word to process
 * @param {POS} [expectedPOS] - Expected POS of the base word
 * @returns {AffixStrippingResult} The result of prefix stripping
 */
export function stripPrefixes(word, expectedPOS = null) {
    const result = {
        base: word.toLowerCase(),
        strippedAffixes: [],
        accumulatedFeatures: {}
    };

    const normalizedWord = word.toLowerCase();
    
    // Try prefixes from longest to shortest
    const sortedPrefixes = [...PREFIXES].sort((a, b) => b.affix.length - a.affix.length);
    
    for (const prefixEntry of sortedPrefixes) {
        if (normalizedWord.startsWith(prefixEntry.affix)) {
            const potentialBase = normalizedWord.slice(prefixEntry.affix.length);
            
            // Skip if base would be too short
            if (potentialBase.length < 2) continue;
            
            // Check if this prefix applies to expected POS
            if (expectedPOS && !prefixEntry.appliesTo.includes(expectedPOS)) continue;
            
            result.base = potentialBase;
            result.strippedAffixes.push({
                affix: prefixEntry.affix,
                type: prefixEntry.type,
                meaning: prefixEntry.meaning,
                resultingPOS: prefixEntry.resultingPOS,
                features: prefixEntry.features || {}
            });
            
            // Accumulate features
            if (prefixEntry.features) {
                Object.assign(result.accumulatedFeatures, prefixEntry.features);
            }
            
            // Only strip one prefix at a time
            break;
        }
    }
    
    return result;
}

/**
 * Strips both prefixes and suffixes from a word.
 * @param {string} word - The word to process
 * @param {POS} [expectedPOS] - Expected POS of the base word
 * @returns {AffixStrippingResult} The result of affix stripping
 */
export function stripAffixes(word, expectedPOS = null) {
    // First try suffixes
    const suffixResult = stripSuffixes(word, expectedPOS);
    
    // Then try prefixes on the result
    const prefixResult = stripPrefixes(suffixResult.base, expectedPOS);
    
    // Combine results
    return {
        base: prefixResult.base,
        strippedAffixes: [...suffixResult.strippedAffixes, ...prefixResult.strippedAffixes],
        accumulatedFeatures: {
            ...suffixResult.accumulatedFeatures,
            ...prefixResult.accumulatedFeatures
        }
    };
}

/**
 * Gets all possible base forms for a word by trying different affix combinations.
 * @param {string} word - The word to analyze
 * @returns {Array<{base: string, affixes: AffixEntry[], features: Object}>}
 *          Array of possible analyses
 */
export function getAllPossibleBases(word) {
    const results = [];
    const normalizedWord = word.toLowerCase();
    
    // Try no stripping
    results.push({
        base: normalizedWord,
        affixes: [],
        features: {}
    });
    
    // Try suffix stripping
    const suffixResult = stripSuffixes(normalizedWord);
    if (suffixResult.strippedAffixes.length > 0) {
        results.push({
            base: suffixResult.base,
            affixes: suffixResult.strippedAffixes,
            features: suffixResult.accumulatedFeatures
        });
    }
    
    // Try prefix stripping
    const prefixResult = stripPrefixes(normalizedWord);
    if (prefixResult.strippedAffixes.length > 0) {
        results.push({
            base: prefixResult.base,
            affixes: prefixResult.strippedAffixes,
            features: prefixResult.accumulatedFeatures
        });
    }
    
    // Try both
    const bothResult = stripAffixes(normalizedWord);
    if (bothResult.strippedAffixes.length > 1) {
        results.push({
            base: bothResult.base,
            affixes: bothResult.strippedAffixes,
            features: bothResult.accumulatedFeatures
        });
    }
    
    return results;
}

export default {
    SUFFIXES,
    PREFIXES,
    lookupAffix,
    isKnownSuffix,
    isKnownPrefix,
    stripSuffixes,
    stripPrefixes,
    stripAffixes,
    getAllPossibleBases
};
