/**
 * @fileoverview Sample noun dictionary entries.
 * Contains common English nouns with their categories and features.
 * @module lexicon/entries/nouns
 */

import { POS, SemanticRole, Number as GramNumber } from '../../core/types.js';

/**
 * Sample noun entries for the dictionary.
 * Each entry includes the lemma, categories, and grammatical features.
 * @type {import('../dictionary.js').LexicalEntry[]}
 */
export const nounEntries = [
    // People - Male
    {
        lemma: 'man',
        pos: POS.NOUN,
        categories: ['person', 'male', 'adult', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['men']
    },
    {
        lemma: 'boy',
        pos: POS.NOUN,
        categories: ['person', 'male', 'child', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['boys']
    },
    {
        lemma: 'father',
        pos: POS.NOUN,
        categories: ['person', 'male', 'parent', 'family', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['fathers']
    },
    {
        lemma: 'king',
        pos: POS.NOUN,
        categories: ['person', 'male', 'royalty', 'ruler', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['kings']
    },

    // People - Female
    {
        lemma: 'woman',
        pos: POS.NOUN,
        categories: ['person', 'female', 'adult', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['women']
    },
    {
        lemma: 'girl',
        pos: POS.NOUN,
        categories: ['person', 'female', 'child', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['girls']
    },
    {
        lemma: 'mother',
        pos: POS.NOUN,
        categories: ['person', 'female', 'parent', 'family', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['mothers']
    },
    {
        lemma: 'queen',
        pos: POS.NOUN,
        categories: ['person', 'female', 'royalty', 'ruler', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['queens']
    },

    // People - General
    {
        lemma: 'person',
        pos: POS.NOUN,
        categories: ['person', 'human', 'being'],
        features: { number: GramNumber.SINGULAR },
        forms: ['people', 'persons']
    },
    {
        lemma: 'child',
        pos: POS.NOUN,
        categories: ['person', 'young', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['children']
    },
    {
        lemma: 'teacher',
        pos: POS.NOUN,
        categories: ['person', 'profession', 'education', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['teachers']
    },
    {
        lemma: 'doctor',
        pos: POS.NOUN,
        categories: ['person', 'profession', 'medicine', 'human'],
        features: { number: GramNumber.SINGULAR },
        forms: ['doctors']
    },

    // Animals
    {
        lemma: 'dog',
        pos: POS.NOUN,
        categories: ['animal', 'mammal', 'pet', 'canine'],
        features: { number: GramNumber.SINGULAR },
        forms: ['dogs']
    },
    {
        lemma: 'cat',
        pos: POS.NOUN,
        categories: ['animal', 'mammal', 'pet', 'feline'],
        features: { number: GramNumber.SINGULAR },
        forms: ['cats']
    },
    {
        lemma: 'bird',
        pos: POS.NOUN,
        categories: ['animal', 'bird', 'flying'],
        features: { number: GramNumber.SINGULAR },
        forms: ['birds']
    },
    {
        lemma: 'fish',
        pos: POS.NOUN,
        categories: ['animal', 'aquatic'],
        features: { number: GramNumber.SINGULAR },
        forms: ['fish', 'fishes']
    },
    {
        lemma: 'horse',
        pos: POS.NOUN,
        categories: ['animal', 'mammal', 'equine'],
        features: { number: GramNumber.SINGULAR },
        forms: ['horses']
    },

    // Objects
    {
        lemma: 'ball',
        pos: POS.NOUN,
        categories: ['object', 'toy', 'round'],
        features: { number: GramNumber.SINGULAR },
        forms: ['balls']
    },
    {
        lemma: 'book',
        pos: POS.NOUN,
        categories: ['object', 'reading', 'information'],
        features: { number: GramNumber.SINGULAR },
        forms: ['books']
    },
    {
        lemma: 'car',
        pos: POS.NOUN,
        categories: ['object', 'vehicle', 'transportation'],
        features: { number: GramNumber.SINGULAR },
        forms: ['cars']
    },
    {
        lemma: 'house',
        pos: POS.NOUN,
        categories: ['object', 'building', 'shelter', 'place'],
        features: { number: GramNumber.SINGULAR },
        forms: ['houses']
    },
    {
        lemma: 'table',
        pos: POS.NOUN,
        categories: ['object', 'furniture'],
        features: { number: GramNumber.SINGULAR },
        forms: ['tables']
    },
    {
        lemma: 'chair',
        pos: POS.NOUN,
        categories: ['object', 'furniture'],
        features: { number: GramNumber.SINGULAR },
        forms: ['chairs']
    },
    {
        lemma: 'door',
        pos: POS.NOUN,
        categories: ['object', 'fixture'],
        features: { number: GramNumber.SINGULAR },
        forms: ['doors']
    },
    {
        lemma: 'window',
        pos: POS.NOUN,
        categories: ['object', 'fixture'],
        features: { number: GramNumber.SINGULAR },
        forms: ['windows']
    },

    // Food
    {
        lemma: 'apple',
        pos: POS.NOUN,
        categories: ['food', 'fruit', 'plant'],
        features: { number: GramNumber.SINGULAR },
        forms: ['apples']
    },
    {
        lemma: 'bread',
        pos: POS.NOUN,
        categories: ['food', 'baked'],
        features: { number: GramNumber.MASS },
        forms: []
    },
    {
        lemma: 'water',
        pos: POS.NOUN,
        categories: ['substance', 'liquid', 'drink'],
        features: { number: GramNumber.MASS },
        forms: []
    },

    // Places
    {
        lemma: 'city',
        pos: POS.NOUN,
        categories: ['place', 'location', 'urban'],
        features: { number: GramNumber.SINGULAR },
        forms: ['cities']
    },
    {
        lemma: 'park',
        pos: POS.NOUN,
        categories: ['place', 'location', 'outdoor', 'recreation'],
        features: { number: GramNumber.SINGULAR },
        forms: ['parks']
    },
    {
        lemma: 'school',
        pos: POS.NOUN,
        categories: ['place', 'building', 'education'],
        features: { number: GramNumber.SINGULAR },
        forms: ['schools']
    },

    // Abstract concepts
    {
        lemma: 'happiness',
        pos: POS.NOUN,
        categories: ['abstract', 'emotion', 'state'],
        features: { number: GramNumber.MASS },
        forms: []
    },
    {
        lemma: 'love',
        pos: POS.NOUN,
        categories: ['abstract', 'emotion'],
        features: { number: GramNumber.MASS },
        forms: []
    },
    {
        lemma: 'time',
        pos: POS.NOUN,
        categories: ['abstract', 'concept'],
        features: { number: GramNumber.MASS },
        forms: []
    },
    {
        lemma: 'idea',
        pos: POS.NOUN,
        categories: ['abstract', 'thought', 'mental'],
        features: { number: GramNumber.SINGULAR },
        forms: ['ideas']
    }
];

/**
 * Loads noun entries into a dictionary.
 * @param {import('../dictionary.js').Dictionary} dictionary - The dictionary to load into
 */
export function loadNouns(dictionary) {
    dictionary.addEntries(nounEntries);
}

export default nounEntries;
