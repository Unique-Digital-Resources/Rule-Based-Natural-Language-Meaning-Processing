/**
 * @fileoverview Core type definitions and constants for the X-Bar NLP Analyzer.
 * Defines Part of Speech tags, phrase types, semantic roles, and grammatical features.
 * @module core/types
 */

/**
 * Part of Speech (POS) constants
 * @readonly
 * @enum {string}
 */
export const POS = {
    /** Noun - e.g., "man", "dog", "happiness" */
    NOUN: 'NOUN',
    /** Verb - e.g., "run", "eat", "sleep" */
    VERB: 'VERB',
    /** Adjective - e.g., "big", "happy", "red" */
    ADJECTIVE: 'ADJECTIVE',
    /** Adverb - e.g., "quickly", "very", "well" */
    ADVERB: 'ADVERB',
    /** Determiner - e.g., "the", "a", "this" */
    DETERMINER: 'DETERMINER',
    /** Preposition - e.g., "in", "on", "with" */
    PREPOSITION: 'PREPOSITION',
    /** Conjunction - e.g., "and", "but", "or" */
    CONJUNCTION: 'CONJUNCTION',
    /** Auxiliary verb - e.g., "is", "has", "will" */
    AUXILIARY: 'AUXILIARY',
    /** Copula - e.g., "is", "are", "was" */
    COPULA: 'COPULA',
    /** Pronoun - e.g., "he", "she", "it" */
    PRONOUN: 'PRONOUN',
    /** Unknown POS */
    UNKNOWN: 'UNKNOWN'
};

/**
 * Phrase type constants based on X-Bar theory
 * @readonly
 * @enum {string}
 */
export const PhraseType = {
    /** Noun Phrase - headed by a noun */
    NP: 'NP',
    /** Verb Phrase - headed by a verb */
    VP: 'VP',
    /** Adjective Phrase - headed by an adjective */
    AP: 'AP',
    /** Adverb Phrase - headed by an adverb */
    ADV_P: 'AdvP',
    /** Prepositional Phrase - headed by a preposition */
    PP: 'PP',
    /** Tense Phrase - sentence level projection */
    TP: 'TP',
    /** Complementizer Phrase - embedded clauses */
    CP: 'CP',
    /** Determiner Phrase - headed by a determiner */
    DP: 'DP'
};

/**
 * X-Bar node level types
 * @readonly
 * @enum {string}
 */
export const XBarLevel = {
    /** Head level - the core word */
    X: 'X',
    /** Intermediate level - X-bar */
    X_BAR: 'X\'',
    /** Maximal projection - XP */
    XP: 'XP'
};

/**
 * Semantic role constants
 * @readonly
 * @enum {string}
 */
export const SemanticRole = {
    /** The entity that performs the action */
    AGENT: 'AGENT',
    /** The entity that undergoes the action */
    PATIENT: 'PATIENT',
    /** The entity that is moved or affected by the action */
    THEME: 'THEME',
    /** The entity that experiences a mental state */
    EXPERIENCER: 'EXPERIENCER',
    /** The entity that receives something */
    RECIPIENT: 'RECIPIENT',
    /** The starting point of motion */
    SOURCE: 'SOURCE',
    /** The endpoint of motion */
    GOAL: 'GOAL',
    /** The location of an action */
    LOCATION: 'LOCATION',
    /** The time of an action */
    TIME: 'TIME',
    /** An instrument used in the action */
    INSTRUMENT: 'INSTRUMENT',
    /** The cause of an event */
    CAUSE: 'CAUSE',
    /** A property or attribute */
    PROPERTY: 'PROPERTY',
    /** No specific semantic role */
    NONE: 'NONE'
};

/**
 * Number (grammatical number) constants
 * @readonly
 * @enum {string}
 */
export const Number = {
    /** Singular - one entity */
    SINGULAR: 'SINGULAR',
    /** Plural - multiple entities */
    PLURAL: 'PLURAL',
    /** Uncountable/mass noun */
    MASS: 'MASS',
    /** Number not specified */
    UNKNOWN: 'UNKNOWN'
};

/**
 * Tense constants for verbs
 * @readonly
 * @enum {string}
 */
export const Tense = {
    /** Present tense */
    PRESENT: 'PRESENT',
    /** Past tense */
    PAST: 'PAST',
    /** Future tense */
    FUTURE: 'FUTURE',
    /** Present perfect */
    PRESENT_PERFECT: 'PRESENT_PERFECT',
    /** Past perfect */
    PAST_PERFECT: 'PAST_PERFECT',
    /** No tense specified */
    UNKNOWN: 'UNKNOWN'
};

/**
 * Aspect constants for verbs
 * @readonly
 * @enum {string}
 */
export const Aspect = {
    /** Simple aspect */
    SIMPLE: 'SIMPLE',
    /** Progressive/continuous aspect */
    PROGRESSIVE: 'PROGRESSIVE',
    /** Perfect aspect */
    PERFECT: 'PERFECT',
    /** Perfect progressive aspect */
    PERFECT_PROGRESSIVE: 'PERFECT_PROGRESSIVE',
    /** Aspect not specified */
    UNKNOWN: 'UNKNOWN'
};

/**
 * Person constants
 * @readonly
 * @enum {string}
 */
export const Person = {
    /** First person (I, we) */
    FIRST: 'FIRST',
    /** Second person (you) */
    SECOND: 'SECOND',
    /** Third person (he, she, it, they) */
    THIRD: 'THIRD',
    /** Person not specified */
    UNKNOWN: 'UNKNOWN'
};

/**
 * Affix type constants
 * @readonly
 * @enum {string}
 */
export const AffixType = {
    /** Prefix - added before the root */
    PREFIX: 'PREFIX',
    /** Suffix - added after the root */
    SUFFIX: 'SUFFIX',
    /** Infix - inserted within the root (rare in English) */
    INFIX: 'INFIX'
};

/**
 * Sentence type constants
 * @readonly
 * @enum {string}
 */
export const SentenceType = {
    /** Declarative - makes a statement */
    DECLARATIVE: 'DECLARATIVE',
    /** Interrogative - asks a question */
    INTERROGATIVE: 'INTERROGATIVE',
    /** Imperative - gives a command */
    IMPERATIVE: 'IMPERATIVE',
    /** Exclamatory - expresses strong emotion */
    EXCLAMATORY: 'EXCLAMATORY',
    /** Type not determined */
    UNKNOWN: 'UNKNOWN'
};

/**
 * Predicate type constants
 * @readonly
 * @enum {string}
 */
export const PredicateType = {
    /** Identity/categorization - "X is a Y" */
    IS_A: 'IS_A',
    /** Property assignment - "X is ADJ" */
    HAS_PROPERTY: 'HAS_PROPERTY',
    /** Action - "X verbs Y" */
    DOES: 'DOES',
    /** Location - "X is in Y" */
    IS_LOCATED: 'IS_LOCATED',
    /** Possession - "X has Y" */
    HAS: 'HAS',
    /** Type not determined */
    UNKNOWN: 'UNKNOWN'
};

/**
 * Mapping from POS to PhraseType
 * @param {POS} pos - The part of speech
 * @returns {PhraseType} The corresponding phrase type
 */
export function posToPhraseType(pos) {
    const mapping = {
        [POS.NOUN]: PhraseType.NP,
        [POS.VERB]: PhraseType.VP,
        [POS.ADJECTIVE]: PhraseType.AP,
        [POS.ADVERB]: PhraseType.ADV_P,
        [POS.PREPOSITION]: PhraseType.PP,
        [POS.DETERMINER]: PhraseType.DP,
        [POS.AUXILIARY]: PhraseType.TP,
        [POS.COPULA]: PhraseType.TP
    };
    return mapping[pos] || null;
}

/**
 * Get the head category symbol for a phrase type
 * @param {PhraseType} phraseType - The phrase type
 * @returns {string} The head category symbol (N, V, A, P, T, D)
 */
export function getHeadCategory(phraseType) {
    const mapping = {
        [PhraseType.NP]: 'N',
        [PhraseType.VP]: 'V',
        [PhraseType.AP]: 'A',
        [PhraseType.ADV_P]: 'Adv',
        [PhraseType.PP]: 'P',
        [PhraseType.TP]: 'T',
        [PhraseType.CP]: 'C',
        [PhraseType.DP]: 'D'
    };
    return mapping[phraseType] || '?';
}

/**
 * Check if a POS is a valid head for a phrase type
 * @param {POS} pos - The part of speech
 * @param {PhraseType} phraseType - The phrase type
 * @returns {boolean} True if the POS can head the phrase type
 */
export function isValidHead(pos, phraseType) {
    const validHeads = {
        [PhraseType.NP]: [POS.NOUN, POS.PRONOUN],
        [PhraseType.VP]: [POS.VERB],
        [PhraseType.AP]: [POS.ADJECTIVE],
        [PhraseType.ADV_P]: [POS.ADVERB],
        [PhraseType.PP]: [POS.PREPOSITION],
        [PhraseType.TP]: [POS.AUXILIARY, POS.COPULA],
        [PhraseType.DP]: [POS.DETERMINER]
    };
    return (validHeads[phraseType] || []).includes(pos);
}

// Export all constants as a single object for convenience
export default {
    POS,
    PhraseType,
    XBarLevel,
    SemanticRole,
    Number,
    Tense,
    Aspect,
    Person,
    AffixType,
    SentenceType,
    PredicateType,
    posToPhraseType,
    getHeadCategory,
    isValidHead
};
