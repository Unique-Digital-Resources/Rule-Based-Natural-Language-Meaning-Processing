/**
 * @fileoverview Sample adjective dictionary entries.
 * Contains common English adjectives with their categories and features.
 * @module lexicon/entries/adjectives
 */

import { POS, SemanticRole } from '../../core/types.js';

/**
 * Sample adjective entries for the dictionary.
 * Each entry includes the lemma, categories, and grammatical features.
 * @type {import('../dictionary.js').LexicalEntry[]}
 */
export const adjectiveEntries = [
    // Size adjectives
    {
        lemma: 'big',
        pos: POS.ADJECTIVE,
        categories: ['size', 'dimension', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['bigger', 'biggest']
    },
    {
        lemma: 'small',
        pos: POS.ADJECTIVE,
        categories: ['size', 'dimension', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['smaller', 'smallest']
    },
    {
        lemma: 'large',
        pos: POS.ADJECTIVE,
        categories: ['size', 'dimension', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['larger', 'largest']
    },
    {
        lemma: 'tiny',
        pos: POS.ADJECTIVE,
        categories: ['size', 'dimension', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['tinier', 'tiniest']
    },
    {
        lemma: 'huge',
        pos: POS.ADJECTIVE,
        categories: ['size', 'dimension', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['huger', 'hugest']
    },

    // Color adjectives
    {
        lemma: 'red',
        pos: POS.ADJECTIVE,
        categories: ['color', 'visual', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['redder', 'reddest']
    },
    {
        lemma: 'blue',
        pos: POS.ADJECTIVE,
        categories: ['color', 'visual', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['bluer', 'bluest']
    },
    {
        lemma: 'green',
        pos: POS.ADJECTIVE,
        categories: ['color', 'visual', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['greener', 'greenest']
    },
    {
        lemma: 'yellow',
        pos: POS.ADJECTIVE,
        categories: ['color', 'visual', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['yellower', 'yellowest']
    },
    {
        lemma: 'black',
        pos: POS.ADJECTIVE,
        categories: ['color', 'visual', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['blacker', 'blackest']
    },
    {
        lemma: 'white',
        pos: POS.ADJECTIVE,
        categories: ['color', 'visual', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['whiter', 'whitest']
    },

    // Quality/evaluation adjectives
    {
        lemma: 'good',
        pos: POS.ADJECTIVE,
        categories: ['quality', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['better', 'best']
    },
    {
        lemma: 'bad',
        pos: POS.ADJECTIVE,
        categories: ['quality', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['worse', 'worst']
    },
    {
        lemma: 'excellent',
        pos: POS.ADJECTIVE,
        categories: ['quality', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: []
    },
    {
        lemma: 'terrible',
        pos: POS.ADJECTIVE,
        categories: ['quality', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['more terrible', 'most terrible']
    },

    // Emotional state adjectives
    {
        lemma: 'happy',
        pos: POS.ADJECTIVE,
        categories: ['emotion', 'state', 'mental'],
        features: { degree: 'POSITIVE' },
        forms: ['happier', 'happiest']
    },
    {
        lemma: 'sad',
        pos: POS.ADJECTIVE,
        categories: ['emotion', 'state', 'mental'],
        features: { degree: 'POSITIVE' },
        forms: ['sadder', 'saddest']
    },
    {
        lemma: 'angry',
        pos: POS.ADJECTIVE,
        categories: ['emotion', 'state', 'mental'],
        features: { degree: 'POSITIVE' },
        forms: ['angrier', 'angriest']
    },
    {
        lemma: 'afraid',
        pos: POS.ADJECTIVE,
        categories: ['emotion', 'state', 'mental'],
        features: { degree: 'POSITIVE' },
        forms: []
    },
    {
        lemma: 'calm',
        pos: POS.ADJECTIVE,
        categories: ['emotion', 'state', 'mental'],
        features: { degree: 'POSITIVE' },
        forms: ['calmer', 'calmest']
    },
    {
        lemma: 'nervous',
        pos: POS.ADJECTIVE,
        categories: ['emotion', 'state', 'mental'],
        features: { degree: 'POSITIVE' },
        forms: ['more nervous', 'most nervous']
    },

    // Age adjectives
    {
        lemma: 'old',
        pos: POS.ADJECTIVE,
        categories: ['age', 'time'],
        features: { degree: 'POSITIVE' },
        forms: ['older', 'oldest', 'elder', 'eldest']
    },
    {
        lemma: 'young',
        pos: POS.ADJECTIVE,
        categories: ['age', 'time'],
        features: { degree: 'POSITIVE' },
        forms: ['younger', 'youngest']
    },
    {
        lemma: 'new',
        pos: POS.ADJECTIVE,
        categories: ['age', 'time'],
        features: { degree: 'POSITIVE' },
        forms: ['newer', 'newest']
    },
    {
        lemma: 'ancient',
        pos: POS.ADJECTIVE,
        categories: ['age', 'time'],
        features: { degree: 'POSITIVE' },
        forms: ['more ancient', 'most ancient']
    },

    // Speed/movement adjectives
    {
        lemma: 'fast',
        pos: POS.ADJECTIVE,
        categories: ['speed', 'movement'],
        features: { degree: 'POSITIVE' },
        forms: ['faster', 'fastest']
    },
    {
        lemma: 'slow',
        pos: POS.ADJECTIVE,
        categories: ['speed', 'movement'],
        features: { degree: 'POSITIVE' },
        forms: ['slower', 'slowest']
    },
    {
        lemma: 'quick',
        pos: POS.ADJECTIVE,
        categories: ['speed', 'movement'],
        features: { degree: 'POSITIVE' },
        forms: ['quicker', 'quickest']
    },

    // Temperature adjectives
    {
        lemma: 'hot',
        pos: POS.ADJECTIVE,
        categories: ['temperature', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['hotter', 'hottest']
    },
    {
        lemma: 'cold',
        pos: POS.ADJECTIVE,
        categories: ['temperature', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['colder', 'coldest']
    },
    {
        lemma: 'warm',
        pos: POS.ADJECTIVE,
        categories: ['temperature', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['warmer', 'warmest']
    },
    {
        lemma: 'cool',
        pos: POS.ADJECTIVE,
        categories: ['temperature', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['cooler', 'coolest']
    },

    // Shape adjectives
    {
        lemma: 'round',
        pos: POS.ADJECTIVE,
        categories: ['shape', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['rounder', 'roundest']
    },
    {
        lemma: 'square',
        pos: POS.ADJECTIVE,
        categories: ['shape', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: []
    },
    {
        lemma: 'flat',
        pos: POS.ADJECTIVE,
        categories: ['shape', 'physical'],
        features: { degree: 'POSITIVE' },
        forms: ['flatter', 'flattest']
    },

    // Difficulty adjectives
    {
        lemma: 'easy',
        pos: POS.ADJECTIVE,
        categories: ['difficulty', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['easier', 'easiest']
    },
    {
        lemma: 'hard',
        pos: POS.ADJECTIVE,
        categories: ['difficulty', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['harder', 'hardest']
    },
    {
        lemma: 'difficult',
        pos: POS.ADJECTIVE,
        categories: ['difficulty', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['more difficult', 'most difficult']
    },
    {
        lemma: 'simple',
        pos: POS.ADJECTIVE,
        categories: ['difficulty', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['simpler', 'simplest']
    },

    // Quantity adjectives
    {
        lemma: 'many',
        pos: POS.ADJECTIVE,
        categories: ['quantity', 'number'],
        features: { degree: 'POSITIVE' },
        forms: ['more', 'most']
    },
    {
        lemma: 'few',
        pos: POS.ADJECTIVE,
        categories: ['quantity', 'number'],
        features: { degree: 'POSITIVE' },
        forms: ['fewer', 'fewest']
    },
    {
        lemma: 'some',
        pos: POS.ADJECTIVE,
        alternatePOS: [POS.DETERMINER],
        categories: ['quantity', 'number'],
        features: {},
        forms: []
    },
    {
        lemma: 'all',
        pos: POS.ADJECTIVE,
        alternatePOS: [POS.DETERMINER],
        categories: ['quantity', 'number'],
        features: {},
        forms: []
    },

    // Appearance adjectives
    {
        lemma: 'beautiful',
        pos: POS.ADJECTIVE,
        categories: ['appearance', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['more beautiful', 'most beautiful']
    },
    {
        lemma: 'ugly',
        pos: POS.ADJECTIVE,
        categories: ['appearance', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['uglier', 'ugliest']
    },
    {
        lemma: 'pretty',
        pos: POS.ADJECTIVE,
        categories: ['appearance', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['prettier', 'prettiest']
    },

    // Truth/value adjectives
    {
        lemma: 'true',
        pos: POS.ADJECTIVE,
        categories: ['truth', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['truer', 'truest']
    },
    {
        lemma: 'false',
        pos: POS.ADJECTIVE,
        categories: ['truth', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['falser', 'falsest']
    },
    {
        lemma: 'real',
        pos: POS.ADJECTIVE,
        categories: ['truth', 'evaluation'],
        features: { degree: 'POSITIVE' },
        forms: ['realer', 'realest', 'more real', 'most real']
    },

    // Other common adjectives
    {
        lemma: 'important',
        pos: POS.ADJECTIVE,
        categories: ['evaluation', 'significance'],
        features: { degree: 'POSITIVE' },
        forms: ['more important', 'most important']
    },
    {
        lemma: 'interesting',
        pos: POS.ADJECTIVE,
        categories: ['evaluation', 'interest'],
        features: { degree: 'POSITIVE' },
        forms: ['more interesting', 'most interesting']
    },
    {
        lemma: 'ready',
        pos: POS.ADJECTIVE,
        categories: ['state', 'preparedness'],
        features: { degree: 'POSITIVE' },
        forms: ['readier', 'readiest']
    },
    {
        lemma: 'available',
        pos: POS.ADJECTIVE,
        categories: ['state', 'availability'],
        features: { degree: 'POSITIVE' },
        forms: ['more available', 'most available']
    }
];

/**
 * Loads adjective entries into a dictionary.
 * @param {import('../dictionary.js').Dictionary} dictionary - The dictionary to load into
 */
export function loadAdjectives(dictionary) {
    dictionary.addEntries(adjectiveEntries);
}

export default adjectiveEntries;
