/**
 * @fileoverview Sample verb dictionary entries.
 * Contains common English verbs with their features and forms.
 * @module lexicon/entries/verbs
 */

import { POS, SemanticRole, Tense } from '../../core/types.js';

/**
 * Sample verb entries for the dictionary.
 * Each entry includes the lemma, transitivity, and conjugated forms.
 * @type {import('../dictionary.js').LexicalEntry[]}
 */
export const verbEntries = [
    // Motion verbs
    {
        lemma: 'run',
        pos: POS.VERB,
        categories: ['action', 'motion'],
        features: { transitive: false },
        forms: ['runs', 'running', 'ran']
    },
    {
        lemma: 'walk',
        pos: POS.VERB,
        categories: ['action', 'motion'],
        features: { transitive: false },
        forms: ['walks', 'walking', 'walked']
    },
    {
        lemma: 'go',
        pos: POS.VERB,
        categories: ['action', 'motion'],
        features: { transitive: false },
        forms: ['goes', 'going', 'went', 'gone']
    },
    {
        lemma: 'come',
        pos: POS.VERB,
        categories: ['action', 'motion'],
        features: { transitive: false },
        forms: ['comes', 'coming', 'came']
    },
    {
        lemma: 'move',
        pos: POS.VERB,
        categories: ['action', 'motion'],
        features: { transitive: true },
        forms: ['moves', 'moving', 'moved']
    },

    // Communication verbs
    {
        lemma: 'say',
        pos: POS.VERB,
        categories: ['action', 'communication'],
        features: { transitive: true },
        forms: ['says', 'saying', 'said']
    },
    {
        lemma: 'tell',
        pos: POS.VERB,
        categories: ['action', 'communication'],
        features: { transitive: true },
        forms: ['tells', 'telling', 'told']
    },
    {
        lemma: 'speak',
        pos: POS.VERB,
        categories: ['action', 'communication'],
        features: { transitive: false },
        forms: ['speaks', 'speaking', 'spoke', 'spoken']
    },
    {
        lemma: 'write',
        pos: POS.VERB,
        categories: ['action', 'communication', 'creation'],
        features: { transitive: true },
        forms: ['writes', 'writing', 'wrote', 'written']
    },
    {
        lemma: 'read',
        pos: POS.VERB,
        categories: ['action', 'perception', 'mental'],
        features: { transitive: true },
        forms: ['reads', 'reading']
    },

    // Perception verbs
    {
        lemma: 'see',
        pos: POS.VERB,
        categories: ['action', 'perception'],
        features: { transitive: true },
        forms: ['sees', 'seeing', 'saw', 'seen']
    },
    {
        lemma: 'hear',
        pos: POS.VERB,
        categories: ['action', 'perception'],
        features: { transitive: true },
        forms: ['hears', 'hearing', 'heard']
    },
    {
        lemma: 'watch',
        pos: POS.VERB,
        categories: ['action', 'perception'],
        features: { transitive: true },
        forms: ['watches', 'watching', 'watched']
    },
    {
        lemma: 'look',
        pos: POS.VERB,
        categories: ['action', 'perception'],
        features: { transitive: false },
        forms: ['looks', 'looking', 'looked']
    },

    // Mental verbs
    {
        lemma: 'think',
        pos: POS.VERB,
        categories: ['action', 'mental'],
        features: { transitive: true },
        forms: ['thinks', 'thinking', 'thought']
    },
    {
        lemma: 'know',
        pos: POS.VERB,
        categories: ['action', 'mental', 'state'],
        features: { transitive: true },
        forms: ['knows', 'knowing', 'knew', 'known']
    },
    {
        lemma: 'understand',
        pos: POS.VERB,
        categories: ['action', 'mental'],
        features: { transitive: true },
        forms: ['understands', 'understanding', 'understood']
    },
    {
        lemma: 'believe',
        pos: POS.VERB,
        categories: ['action', 'mental'],
        features: { transitive: true },
        forms: ['believes', 'believing', 'believed']
    },

    // Consumption verbs
    {
        lemma: 'eat',
        pos: POS.VERB,
        categories: ['action', 'consumption'],
        features: { transitive: true },
        forms: ['eats', 'eating', 'ate', 'eaten']
    },
    {
        lemma: 'drink',
        pos: POS.VERB,
        categories: ['action', 'consumption'],
        features: { transitive: true },
        forms: ['drinks', 'drinking', 'drank', 'drunk']
    },

    // State/rest verbs
    {
        lemma: 'sleep',
        pos: POS.VERB,
        categories: ['action', 'state'],
        features: { transitive: false },
        forms: ['sleeps', 'sleeping', 'slept']
    },
    {
        lemma: 'sit',
        pos: POS.VERB,
        categories: ['action', 'state'],
        features: { transitive: false },
        forms: ['sits', 'sitting', 'sat']
    },
    {
        lemma: 'stand',
        pos: POS.VERB,
        categories: ['action', 'state'],
        features: { transitive: false },
        forms: ['stands', 'standing', 'stood']
    },

    // Possession verbs
    {
        lemma: 'have',
        pos: POS.VERB,
        categories: ['action', 'possession', 'state'],
        features: { transitive: true },
        forms: ['has', 'having', 'had']
    },
    {
        lemma: 'own',
        pos: POS.VERB,
        categories: ['action', 'possession', 'state'],
        features: { transitive: true },
        forms: ['owns', 'owning', 'owned']
    },

    // Transfer verbs
    {
        lemma: 'give',
        pos: POS.VERB,
        categories: ['action', 'transfer'],
        features: { transitive: true },
        forms: ['gives', 'giving', 'gave', 'given']
    },
    {
        lemma: 'take',
        pos: POS.VERB,
        categories: ['action', 'transfer'],
        features: { transitive: true },
        forms: ['takes', 'taking', 'took', 'taken']
    },
    {
        lemma: 'buy',
        pos: POS.VERB,
        categories: ['action', 'transfer', 'commercial'],
        features: { transitive: true },
        forms: ['buys', 'buying', 'bought']
    },
    {
        lemma: 'sell',
        pos: POS.VERB,
        categories: ['action', 'transfer', 'commercial'],
        features: { transitive: true },
        forms: ['sells', 'selling', 'sold']
    },

    // Creation/destruction verbs
    {
        lemma: 'make',
        pos: POS.VERB,
        categories: ['action', 'creation'],
        features: { transitive: true },
        forms: ['makes', 'making', 'made']
    },
    {
        lemma: 'build',
        pos: POS.VERB,
        categories: ['action', 'creation'],
        features: { transitive: true },
        forms: ['builds', 'building', 'built']
    },
    {
        lemma: 'break',
        pos: POS.VERB,
        categories: ['action', 'destruction'],
        features: { transitive: true },
        forms: ['breaks', 'breaking', 'broke', 'broken']
    },

    // Copula and auxiliary verbs
    {
        lemma: 'be',
        pos: POS.VERB,
        alternatePOS: [POS.COPULA, POS.AUXILIARY],
        categories: ['copula', 'auxiliary'],
        features: { transitive: false },
        forms: ['am', 'is', 'are', 'was', 'were', 'been', 'being']
    },
    {
        lemma: 'is',
        pos: POS.COPULA,
        categories: ['copula'],
        features: { tense: Tense.PRESENT, number: 'SINGULAR', person: 'THIRD' },
        forms: []
    },
    {
        lemma: 'are',
        pos: POS.COPULA,
        categories: ['copula'],
        features: { tense: Tense.PRESENT },
        forms: []
    },
    {
        lemma: 'was',
        pos: POS.COPULA,
        categories: ['copula'],
        features: { tense: Tense.PAST, number: 'SINGULAR' },
        forms: []
    },
    {
        lemma: 'were',
        pos: POS.COPULA,
        categories: ['copula'],
        features: { tense: Tense.PAST },
        forms: []
    },

    // Modal/auxiliary verbs
    {
        lemma: 'can',
        pos: POS.AUXILIARY,
        categories: ['modal', 'auxiliary'],
        features: {},
        forms: ['could']
    },
    {
        lemma: 'will',
        pos: POS.AUXILIARY,
        categories: ['modal', 'auxiliary'],
        features: {},
        forms: ['would']
    },
    {
        lemma: 'should',
        pos: POS.AUXILIARY,
        categories: ['modal', 'auxiliary'],
        features: {},
        forms: []
    },
    {
        lemma: 'must',
        pos: POS.AUXILIARY,
        categories: ['modal', 'auxiliary'],
        features: {},
        forms: []
    },
    {
        lemma: 'do',
        pos: POS.VERB,
        alternatePOS: [POS.AUXILIARY],
        categories: ['action', 'auxiliary'],
        features: { transitive: false },
        forms: ['does', 'doing', 'did', 'done']
    }
];

/**
 * Loads verb entries into a dictionary.
 * @param {import('../dictionary.js').Dictionary} dictionary - The dictionary to load into
 */
export function loadVerbs(dictionary) {
    dictionary.addEntries(verbEntries);
}

export default verbEntries;
