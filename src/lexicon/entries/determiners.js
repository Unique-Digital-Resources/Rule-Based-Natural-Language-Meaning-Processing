/**
 * @fileoverview Sample determiner dictionary entries.
 * Contains English determiners (articles, demonstratives, quantifiers).
 * @module lexicon/entries/determiners
 */

import { POS, SemanticRole, Number as GramNumber } from '../../core/types.js';

/**
 * Sample determiner entries for the dictionary.
 * Each entry includes the lemma, type, and grammatical features.
 * @type {import('../dictionary.js').LexicalEntry[]}
 */
export const determinerEntries = [
    // Definite article
    {
        lemma: 'the',
        pos: POS.DETERMINER,
        categories: ['article', 'definite'],
        features: { definiteness: 'DEFINITE' },
        semantic: SemanticRole.NONE
    },

    // Indefinite articles
    {
        lemma: 'a',
        pos: POS.DETERMINER,
        categories: ['article', 'indefinite'],
        features: { 
            definiteness: 'INDEFINITE',
            number: GramNumber.SINGULAR
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'an',
        pos: POS.DETERMINER,
        categories: ['article', 'indefinite'],
        features: { 
            definiteness: 'INDEFINITE',
            number: GramNumber.SINGULAR
        },
        semantic: SemanticRole.NONE
    },

    // Demonstrative determiners - singular
    {
        lemma: 'this',
        pos: POS.DETERMINER,
        categories: ['demonstrative', 'proximal'],
        features: { 
            number: GramNumber.SINGULAR,
            distance: 'PROXIMAL'
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'that',
        pos: POS.DETERMINER,
        categories: ['demonstrative', 'distal'],
        features: { 
            number: GramNumber.SINGULAR,
            distance: 'DISTAL'
        },
        semantic: SemanticRole.NONE
    },

    // Demonstrative determiners - plural
    {
        lemma: 'these',
        pos: POS.DETERMINER,
        categories: ['demonstrative', 'proximal'],
        features: { 
            number: GramNumber.PLURAL,
            distance: 'PROXIMAL'
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'those',
        pos: POS.DETERMINER,
        categories: ['demonstrative', 'distal'],
        features: { 
            number: GramNumber.PLURAL,
            distance: 'DISTAL'
        },
        semantic: SemanticRole.NONE
    },

    // Possessive determiners
    {
        lemma: 'my',
        pos: POS.DETERMINER,
        categories: ['possessive'],
        features: { 
            person: 'FIRST',
            number: GramNumber.SINGULAR,
            possession: true
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'your',
        pos: POS.DETERMINER,
        categories: ['possessive'],
        features: { 
            person: 'SECOND',
            possession: true
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'his',
        pos: POS.DETERMINER,
        categories: ['possessive'],
        features: { 
            person: 'THIRD',
            gender: 'MASCULINE',
            number: GramNumber.SINGULAR,
            possession: true
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'her',
        pos: POS.DETERMINER,
        alternatePOS: [POS.PRONOUN],
        categories: ['possessive'],
        features: { 
            person: 'THIRD',
            gender: 'FEMININE',
            number: GramNumber.SINGULAR,
            possession: true
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'its',
        pos: POS.DETERMINER,
        categories: ['possessive'],
        features: { 
            person: 'THIRD',
            gender: 'NEUTER',
            number: GramNumber.SINGULAR,
            possession: true
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'our',
        pos: POS.DETERMINER,
        categories: ['possessive'],
        features: { 
            person: 'FIRST',
            number: GramNumber.PLURAL,
            possession: true
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'their',
        pos: POS.DETERMINER,
        categories: ['possessive'],
        features: { 
            person: 'THIRD',
            number: GramNumber.PLURAL,
            possession: true
        },
        semantic: SemanticRole.NONE
    },

    // Quantifier determiners
    {
        lemma: 'some',
        pos: POS.DETERMINER,
        categories: ['quantifier'],
        features: { 
            quantity: 'INDEFINITE'
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'any',
        pos: POS.DETERMINER,
        categories: ['quantifier'],
        features: { 
            quantity: 'INDEFINITE'
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'every',
        pos: POS.DETERMINER,
        categories: ['quantifier', 'universal'],
        features: { 
            quantity: 'UNIVERSAL',
            number: GramNumber.SINGULAR
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'each',
        pos: POS.DETERMINER,
        categories: ['quantifier', 'distributive'],
        features: { 
            quantity: 'DISTRIBUTIVE',
            number: GramNumber.SINGULAR
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'all',
        pos: POS.DETERMINER,
        categories: ['quantifier', 'universal'],
        features: { 
            quantity: 'UNIVERSAL'
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'no',
        pos: POS.DETERMINER,
        categories: ['quantifier', 'negative'],
        features: { 
            quantity: 'ZERO',
            negative: true
        },
        semantic: SemanticRole.NONE
    },

    // Numerical determiners
    {
        lemma: 'one',
        pos: POS.DETERMINER,
        alternatePOS: [POS.NOUN, POS.ADJECTIVE],
        categories: ['numeral', 'cardinal'],
        features: { 
            number: GramNumber.SINGULAR,
            value: 1
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'two',
        pos: POS.DETERMINER,
        alternatePOS: [POS.NOUN, POS.ADJECTIVE],
        categories: ['numeral', 'cardinal'],
        features: { 
            number: GramNumber.PLURAL,
            value: 2
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'three',
        pos: POS.DETERMINER,
        alternatePOS: [POS.NOUN, POS.ADJECTIVE],
        categories: ['numeral', 'cardinal'],
        features: { 
            number: GramNumber.PLURAL,
            value: 3
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'four',
        pos: POS.DETERMINER,
        alternatePOS: [POS.NOUN, POS.ADJECTIVE],
        categories: ['numeral', 'cardinal'],
        features: { 
            number: GramNumber.PLURAL,
            value: 4
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'five',
        pos: POS.DETERMINER,
        alternatePOS: [POS.NOUN, POS.ADJECTIVE],
        categories: ['numeral', 'cardinal'],
        features: { 
            number: GramNumber.PLURAL,
            value: 5
        },
        semantic: SemanticRole.NONE
    },

    // Interrogative determiners
    {
        lemma: 'which',
        pos: POS.DETERMINER,
        categories: ['interrogative'],
        features: { 
            interrogative: true
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'what',
        pos: POS.DETERMINER,
        alternatePOS: [POS.PRONOUN],
        categories: ['interrogative'],
        features: { 
            interrogative: true
        },
        semantic: SemanticRole.NONE
    },
    {
        lemma: 'whose',
        pos: POS.DETERMINER,
        categories: ['interrogative', 'possessive'],
        features: { 
            interrogative: true,
            possession: true
        },
        semantic: SemanticRole.NONE
    }
];

/**
 * Loads determiner entries into a dictionary.
 * @param {import('../dictionary.js').Dictionary} dictionary - The dictionary to load into
 */
export function loadDeterminers(dictionary) {
    dictionary.addEntries(determinerEntries);
}

export default determinerEntries;
