/**
 * @fileoverview Semantic extraction from X-Bar parse trees.
 * Extracts meaning representations from syntactic structures.
 * @module semantic/extractor
 */

import { PhraseType, XBarLevel, SemanticRole, PredicateType, SentenceType, POS } from '../core/types.js';
import { XBarNode } from '../parser/xbar-node.js';
import { Entity, Predicate, MeaningRepresentation } from './meaning.js';

/**
 * SemanticExtractor class for extracting meaning from X-Bar trees.
 * Traverses the tree and builds a MeaningRepresentation.
 */
export class SemanticExtractor {
    /**
     * Creates a new SemanticExtractor instance.
     * @param {Object} [options] - Extractor options
     * @param {boolean} [options.includeDetails=true] - Include detailed information
     */
    constructor(options = {}) {
        /**
         * Extractor options.
         * @type {Object}
         */
        this.options = {
            includeDetails: options.includeDetails ?? true
        };
    }

    /**
     * Extracts a meaning representation from an X-Bar tree.
     * @param {XBarNode} tree - The root of the X-Bar tree
     * @returns {MeaningRepresentation|null} The extracted meaning or null
     */
    extract(tree) {
        if (!tree) {
            return null;
        }

        // The root should be a TP (Tense Phrase)
        if (tree.category !== PhraseType.TP) {
            // Try to find TP in the tree
            const tpNodes = tree.findByCategory(PhraseType.TP);
            if (tpNodes.length > 0) {
                return this.extractFromTP(tpNodes[0]);
            }
            return null;
        }

        return this.extractFromTP(tree);
    }

    /**
     * Extracts meaning from a Tense Phrase (TP) node.
     * @param {XBarNode} node - The TP node
     * @returns {MeaningRepresentation} The extracted meaning
     */
    extractFromTP(node) {
        const meaning = new MeaningRepresentation({
            type: SentenceType.DECLARATIVE
        });

        // The specifier of TP is the subject
        if (node.specifier) {
            const subjectEntity = this.extractFromNP(node.specifier);
            if (subjectEntity) {
                // Role will be assigned based on predicate type
                meaning.setArgument(SemanticRole.THEME, subjectEntity);
            }
        }

        // The complement of TP is T' which contains the VP or AP
        if (node.complement) {
            this.extractFromTBar(node.complement, meaning);
        }

        // Assign proper semantic roles based on predicate type
        this.assignRoles(meaning);

        return meaning;
    }

    /**
     * Extracts meaning from a T-bar (T') node.
     * @param {XBarNode} node - The T' node
     * @param {MeaningRepresentation} meaning - The meaning being built
     */
    extractFromTBar(node, meaning) {
        // The head of T' is the tense/copula
        if (node.headToken) {
            meaning.setFeature('tense', node.headToken.getFeature('tense') || 'PRESENT');
        }

        // The complement of T' is the VP or AP
        if (node.complement) {
            if (node.complement.category === PhraseType.VP) {
                this.extractFromVP(node.complement, meaning);
            } else if (node.complement.category === PhraseType.AP) {
                this.extractFromAP(node.complement, meaning);
            } else if (node.complement.category === PhraseType.NP) {
                // Identity sentence: "X is a Y"
                this.extractIdentityPredicate(node.complement, meaning);
            }
        }
    }

    /**
     * Extracts an entity from a Noun Phrase (NP) node.
     * @param {XBarNode} node - The NP node
     * @returns {Entity|null} The extracted entity or null
     */
    extractFromNP(node) {
        if (!node) {
            return null;
        }

        // Get the head token (noun)
        const headToken = node.getHeadToken();
        if (!headToken) {
            return null;
        }

        const entity = new Entity({
            text: headToken.text,
            lemma: headToken.getEffectiveLemma(),
            categories: headToken.lexicalEntry?.categories || [],
            features: { ...headToken.features }
        });

        // Extract determiner if present
        if (node.specifier) {
            const detToken = node.specifier.getHeadToken();
            if (detToken && detToken.pos === POS.DETERMINER) {
                entity.determiner = detToken.text;
            }
        }

        // Extract modifiers (adjectives) from adjuncts
        if (node.adjuncts && node.adjuncts.length > 0) {
            const modifiers = [];
            for (const adjunct of node.adjuncts) {
                if (adjunct.category === PhraseType.AP) {
                    const adjToken = adjunct.getHeadToken();
                    if (adjToken) {
                        modifiers.push(adjToken.text);
                    }
                }
            }
            if (modifiers.length > 0) {
                entity.setFeature('modifiers', modifiers);
            }
        }

        return entity;
    }

    /**
     * Extracts predicate and arguments from a Verb Phrase (VP) node.
     * @param {XBarNode} node - The VP node
     * @param {MeaningRepresentation} meaning - The meaning being built
     */
    extractFromVP(node, meaning) {
        // Get the head token (verb)
        const headToken = node.getHeadToken();
        if (!headToken) {
            return;
        }

        // Create the predicate
        const predicate = new Predicate({
            text: headToken.text,
            lemma: headToken.getEffectiveLemma(),
            type: PredicateType.DOES,
            features: { ...headToken.features }
        });

        // Check if verb is transitive
        if (headToken.lexicalEntry?.features?.transitive) {
            predicate.features.transitive = true;
        }

        meaning.predicate = predicate;

        // Extract object from complement
        if (node.complement) {
            const objectEntity = this.extractFromNP(node.complement);
            if (objectEntity) {
                meaning.setArgument(SemanticRole.PATIENT, objectEntity);
            }
        }

        // Extract adjuncts (PP, AdvP)
        if (node.adjuncts && node.adjuncts.length > 0) {
            for (const adjunct of node.adjuncts) {
                this.extractAdjunct(adjunct, meaning);
            }
        }
    }

    /**
     * Extracts predicate from an Adjective Phrase (AP) node.
     * @param {XBarNode} node - The AP node
     * @param {MeaningRepresentation} meaning - The meaning being built
     */
    extractFromAP(node, meaning) {
        // Get the head token (adjective)
        const headToken = node.getHeadToken();
        if (!headToken) {
            return;
        }

        // Create the predicate
        const predicate = new Predicate({
            text: headToken.text,
            lemma: headToken.getEffectiveLemma(),
            type: PredicateType.HAS_PROPERTY,
            features: { ...headToken.features }
        });

        meaning.predicate = predicate;

        // Check for degree modifiers in specifier
        if (node.specifier) {
            const degreeToken = node.specifier.getHeadToken();
            if (degreeToken && degreeToken.pos === POS.ADVERB) {
                predicate.setFeature('degree', degreeToken.text);
            }
        }
    }

    /**
     * Extracts an identity predicate from an NP complement.
     * Used for sentences like "X is a Y".
     * @param {XBarNode} node - The NP node (predicate nominal)
     * @param {MeaningRepresentation} meaning - The meaning being built
     */
    extractIdentityPredicate(node, meaning) {
        // Get the head token (noun)
        const headToken = node.getHeadToken();
        if (!headToken) {
            return;
        }

        // Create the predicate
        const predicate = new Predicate({
            text: headToken.text,
            lemma: headToken.getEffectiveLemma(),
            type: PredicateType.IS_A,
            features: { ...headToken.features }
        });

        meaning.predicate = predicate;

        // The predicate nominal can also be treated as a VALUE argument
        const valueEntity = this.extractFromNP(node);
        if (valueEntity) {
            meaning.setArgument(SemanticRole.PROPERTY, valueEntity);
        }
    }

    /**
     * Extracts meaning from an adjunct node.
     * @param {XBarNode} node - The adjunct node
     * @param {MeaningRepresentation} meaning - The meaning being built
     */
    extractAdjunct(node, meaning) {
        if (node.category === PhraseType.PP) {
            // Prepositional phrase
            const headToken = node.getHeadToken();
            if (headToken && node.complement) {
                const ppObject = this.extractFromNP(node.complement);
                if (ppObject) {
                    // Map common prepositions to semantic roles
                    const prep = headToken.text.toLowerCase();
                    let role = SemanticRole.LOCATION;

                    if (['to', 'toward'].includes(prep)) {
                        role = SemanticRole.GOAL;
                    } else if (['from', 'away'].includes(prep)) {
                        role = SemanticRole.SOURCE;
                    } else if (['with', 'using'].includes(prep)) {
                        role = SemanticRole.INSTRUMENT;
                    } else if (['at', 'in', 'on', 'under', 'over', 'near'].includes(prep)) {
                        role = SemanticRole.LOCATION;
                    } else if (['for'].includes(prep)) {
                        role = SemanticRole.RECIPIENT;
                    }

                    meaning.setArgument(role, ppObject);
                }
            }
        } else if (node.category === PhraseType.ADV_P) {
            // Adverb phrase - add as modifier
            const headToken = node.getHeadToken();
            if (headToken) {
                const modifiers = meaning.getFeature('modifiers') || [];
                modifiers.push(headToken.text);
                meaning.setFeature('modifiers', modifiers);
            }
        }
    }

    /**
     * Assigns proper semantic roles based on predicate type.
     * @param {MeaningRepresentation} meaning - The meaning to adjust
     */
    assignRoles(meaning) {
        if (!meaning.predicate) {
            return;
        }

        const predicateType = meaning.predicate.type;

        // For action sentences, THEME becomes AGENT
        if (predicateType === PredicateType.DOES) {
            const theme = meaning.getArgument(SemanticRole.THEME);
            if (theme) {
                meaning.args.delete(SemanticRole.THEME);
                meaning.setArgument(SemanticRole.AGENT, theme);
            }
        }
        // For property sentences, THEME stays as THEME
        else if (predicateType === PredicateType.HAS_PROPERTY) {
            // THEME is already set correctly
        }
        // For identity sentences, THEME stays as THEME
        else if (predicateType === PredicateType.IS_A) {
            // THEME is already set correctly
        }
    }

    /**
     * Gets the sentence type from the tree structure.
     * @param {XBarNode} tree - The parse tree
     * @returns {string} The sentence type
     */
    getSentenceType(tree) {
        // Check for question markers
        // In a full implementation, this would check for:
        // - Subject-auxiliary inversion
        // - WH-movement
        // - Question marks in punctuation

        // For now, default to declarative
        return SentenceType.DECLARATIVE;
    }

    /**
     * Extracts all entities from a tree.
     * @param {XBarNode} tree - The parse tree
     * @returns {Entity[]} Array of all entities found
     */
    extractAllEntities(tree) {
        const entities = [];

        // Find all NPs
        const npNodes = tree.findByCategory(PhraseType.NP);

        for (const np of npNodes) {
            const entity = this.extractFromNP(np);
            if (entity) {
                entities.push(entity);
            }
        }

        return entities;
    }

    /**
     * Creates a summary of the extracted meaning.
     * @param {MeaningRepresentation} meaning - The meaning to summarize
     * @returns {string} Human-readable summary
     */
    createSummary(meaning) {
        if (!meaning) {
            return 'No meaning extracted.';
        }

        const parts = [];

        // Sentence type
        parts.push(`Sentence Type: ${meaning.type}`);

        // Predicate
        if (meaning.predicate) {
            const pred = meaning.predicate;
            parts.push(`Predicate: ${pred.text} (${pred.type})`);
            if (pred.negated) {
                parts.push('  - Negated: true');
            }
        }

        // Arguments
        const subject = meaning.getSubject();
        if (subject) {
            parts.push(`Subject: ${subject.text}`);
            if (subject.categories.length > 0) {
                parts.push(`  - Categories: ${subject.categories.join(', ')}`);
            }
        }

        const object = meaning.getObject();
        if (object) {
            parts.push(`Object: ${object.text}`);
            if (object.categories.length > 0) {
                parts.push(`  - Categories: ${object.categories.join(', ')}`);
            }
        }

        // Other arguments
        for (const [role, entity] of meaning.args) {
            if (role === SemanticRole.AGENT || role === SemanticRole.THEME || role === SemanticRole.PATIENT) {
                continue; // Already handled
            }
            if (Array.isArray(entity)) {
                parts.push(`${role}: ${entity.map(e => e.text).join(', ')}`);
            } else {
                parts.push(`${role}: ${entity.text}`);
            }
        }

        return parts.join('\n');
    }
}

/**
 * Extracts meaning from a parse tree using default options.
 * @param {XBarNode} tree - The parse tree
 * @returns {MeaningRepresentation|null} The extracted meaning
 */
export function extractMeaning(tree) {
    const extractor = new SemanticExtractor();
    return extractor.extract(tree);
}

export default SemanticExtractor;
