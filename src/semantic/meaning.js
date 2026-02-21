/**
 * @fileoverview Meaning representation classes for semantic analysis.
 * Defines Entity, Predicate, and MeaningRepresentation classes.
 * @module semantic/meaning
 */

import { SemanticRole, PredicateType, SentenceType, Tense, Aspect } from '../core/types.js';

/**
 * Represents an entity in the semantic representation.
 * An entity is a noun phrase that participates in the sentence meaning.
 */
export class Entity {
    /**
     * Creates a new Entity instance.
     * @param {Object} options - Entity options
     * @param {string} [options.id] - Unique identifier (auto-generated if not provided)
     * @param {string} options.text - Original text of the entity
     * @param {string} [options.lemma] - Lemma (base form) of the entity
     * @param {string[]} [options.categories] - Semantic categories (person, animal, etc.)
     * @param {Object} [options.features] - Grammatical features (number, gender, etc.)
     * @param {string} [options.determiner] - The determiner used with this entity
     */
    constructor({ id = null, text, lemma = null, categories = [], features = {}, determiner = null }) {
        /**
         * Unique identifier for this entity.
         * @type {string}
         */
        this.id = id || this.generateId();

        /**
         * The original text as it appears in the sentence.
         * @type {string}
         */
        this.text = text;

        /**
         * The lemma (base form) of the entity.
         * @type {string|null}
         */
        this.lemma = lemma || text.toLowerCase();

        /**
         * Semantic categories for this entity.
         * Examples: 'person', 'animal', 'object', 'place', 'abstract'
         * @type {string[]}
         */
        this.categories = [...categories];

        /**
         * Grammatical features for this entity.
         * @type {Object}
         */
        this.features = { ...features };

        /**
         * The determiner used with this entity (e.g., 'the', 'a', 'this').
         * @type {string|null}
         */
        this.determiner = determiner;
    }

    /**
     * Generates a unique identifier for the entity.
     * @returns {string} A unique ID
     * @private
     */
    generateId() {
        return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Checks if the entity has a specific category.
     * @param {string} category - The category to check
     * @returns {boolean} True if the entity has the category
     */
    hasCategory(category) {
        return this.categories.includes(category);
    }

    /**
     * Adds a category to the entity.
     * @param {string} category - The category to add
     * @returns {Entity} This entity for chaining
     */
    addCategory(category) {
        if (!this.hasCategory(category)) {
            this.categories.push(category);
        }
        return this;
    }

    /**
     * Gets a specific feature value.
     * @param {string} featureName - The feature name
     * @returns {*} The feature value or undefined
     */
    getFeature(featureName) {
        return this.features[featureName];
    }

    /**
     * Sets a feature value.
     * @param {string} featureName - The feature name
     * @param {*} value - The feature value
     * @returns {Entity} This entity for chaining
     */
    setFeature(featureName, value) {
        this.features[featureName] = value;
        return this;
    }

    /**
     * Checks if the entity is singular.
     * @returns {boolean} True if singular
     */
    isSingular() {
        return this.features.number === 'SINGULAR';
    }

    /**
     * Checks if the entity is plural.
     * @returns {boolean} True if plural
     */
    isPlural() {
        return this.features.number === 'PLURAL';
    }

    /**
     * Checks if the entity is animate (has life).
     * @returns {boolean} True if animate
     */
    isAnimate() {
        const animateCategories = ['person', 'animal', 'being'];
        return this.categories.some(cat => animateCategories.includes(cat));
    }

    /**
     * Checks if the entity is a person.
     * @returns {boolean} True if a person
     */
    isPerson() {
        return this.hasCategory('person');
    }

    /**
     * Creates a plain object representation of this entity.
     * @returns {Object} Plain object
     */
    toJSON() {
        return {
            id: this.id,
            text: this.text,
            lemma: this.lemma,
            categories: this.categories,
            features: this.features,
            determiner: this.determiner
        };
    }

    /**
     * Creates an Entity from a plain object.
     * @param {Object} obj - The plain object
     * @returns {Entity} A new Entity instance
     */
    static fromJSON(obj) {
        return new Entity({
            id: obj.id,
            text: obj.text,
            lemma: obj.lemma,
            categories: obj.categories || [],
            features: obj.features || {},
            determiner: obj.determiner
        });
    }

    /**
     * Returns a string representation of this entity.
     * @returns {string} String representation
     */
    toString() {
        const parts = [this.text];
        if (this.categories.length > 0) {
            parts.push(`[${this.categories.join(', ')}]`);
        }
        return parts.join(' ');
    }
}

/**
 * Represents a predicate in the semantic representation.
 * A predicate is the main action, property, or relationship in the sentence.
 */
export class Predicate {
    /**
     * Creates a new Predicate instance.
     * @param {Object} options - Predicate options
     * @param {string} options.text - Original text of the predicate
     * @param {string} [options.lemma] - Lemma (base form) of the predicate
     * @param {string} [options.type] - Predicate type (ACTION, PROPERTY, IDENTITY)
     * @param {Object} [options.argumentStructure] - Expected argument structure
     * @param {Object} [options.features] - Grammatical features (tense, aspect, etc.)
     * @param {boolean} [options.negated] - Whether the predicate is negated
     */
    constructor({ text, lemma = null, type = PredicateType.UNKNOWN, argumentStructure = {}, features = {}, negated = false }) {
        /**
         * The original text as it appears in the sentence.
         * @type {string}
         */
        this.text = text;

        /**
         * The lemma (base form) of the predicate.
         * @type {string|null}
         */
        this.lemma = lemma || text.toLowerCase();

        /**
         * The type of predicate.
         * @type {string}
         */
        this.type = type;

        /**
         * Expected argument structure for this predicate.
         * Maps semantic roles to constraints.
         * @type {Object}
         */
        this.argumentStructure = { ...argumentStructure };

        /**
         * Grammatical features for this predicate.
         * @type {Object}
         */
        this.features = { ...features };

        /**
         * Whether the predicate is negated.
         * @type {boolean}
         */
        this.negated = negated;
    }

    /**
     * Gets the tense of the predicate.
     * @returns {string} The tense or UNKNOWN
     */
    getTense() {
        return this.features.tense || Tense.UNKNOWN;
    }

    /**
     * Gets the aspect of the predicate.
     * @returns {string} The aspect or UNKNOWN
     */
    getAspect() {
        return this.features.aspect || Aspect.UNKNOWN;
    }

    /**
     * Checks if the predicate is an action (verb-based).
     * @returns {boolean} True if an action
     */
    isAction() {
        return this.type === PredicateType.DOES;
    }

    /**
     * Checks if the predicate is a property (adjective-based).
     * @returns {boolean} True if a property
     */
    isProperty() {
        return this.type === PredicateType.HAS_PROPERTY;
    }

    /**
     * Checks if the predicate is an identity (copula with noun).
     * @returns {boolean} True if an identity
     */
    isIdentity() {
        return this.type === PredicateType.IS_A;
    }

    /**
     * Checks if the predicate is transitive (takes an object).
     * @returns {boolean} True if transitive
     */
    isTransitive() {
        return this.features.transitive === true;
    }

    /**
     * Gets the expected semantic roles for this predicate.
     * @returns {string[]} Array of expected roles
     */
    getExpectedRoles() {
        return Object.keys(this.argumentStructure);
    }

    /**
     * Gets the constraints for a specific semantic role.
     * @param {string} role - The semantic role
     * @returns {Object|null} The constraints or null
     */
    getRoleConstraints(role) {
        return this.argumentStructure[role] || null;
    }

    /**
     * Creates a plain object representation of this predicate.
     * @returns {Object} Plain object
     */
    toJSON() {
        return {
            text: this.text,
            lemma: this.lemma,
            type: this.type,
            argumentStructure: this.argumentStructure,
            features: this.features,
            negated: this.negated
        };
    }

    /**
     * Creates a Predicate from a plain object.
     * @param {Object} obj - The plain object
     * @returns {Predicate} A new Predicate instance
     */
    static fromJSON(obj) {
        return new Predicate({
            text: obj.text,
            lemma: obj.lemma,
            type: obj.type,
            argumentStructure: obj.argumentStructure || {},
            features: obj.features || {},
            negated: obj.negated || false
        });
    }

    /**
     * Returns a string representation of this predicate.
     * @returns {string} String representation
     */
    toString() {
        const parts = [this.text];
        parts.push(`[${this.type}]`);
        if (this.negated) {
            parts.push('(NEGATED)');
        }
        return parts.join(' ');
    }
}

/**
 * Represents the complete meaning of a sentence.
 * Contains the predicate, arguments, and sentence-level features.
 */
export class MeaningRepresentation {
    /**
     * Creates a new MeaningRepresentation instance.
     * @param {Object} options - Meaning options
     * @param {string} [options.type] - Sentence type (PROPOSITION, QUESTION, COMMAND)
     * @param {Predicate} [options.predicate] - The main predicate
     * @param {Map<string, Entity|Entity[]>} [options.args] - Map of semantic roles to entities
     * @param {Object} [options.features] - Sentence-level features
     */
    constructor({ type = SentenceType.DECLARATIVE, predicate = null, args = new Map(), features = {} }) {
        /**
         * The type of sentence.
         * @type {string}
         */
        this.type = type;

        /**
         * The main predicate of the sentence.
         * @type {Predicate|null}
         */
        this.predicate = predicate;

        /**
         * Map of semantic roles to entities.
         * Keys are SemanticRole values, values are Entity or Entity[].
         * @type {Map<string, Entity|Entity[]>}
         */
        this.args = args instanceof Map ? args : new Map(Object.entries(args));

        /**
         * Sentence-level features.
         * @type {Object}
         */
        this.features = { ...features };

        /**
         * Confidence level (always 1.0 for deterministic system).
         * @type {number}
         */
        this.confidence = 1.0;
    }

    /**
     * Gets the entity/entities for a specific semantic role.
     * @param {string} role - The semantic role
     * @returns {Entity|Entity[]|null} The entity or entities, or null
     */
    getArgument(role) {
        return this.args.get(role) || null;
    }

    /**
     * Sets an entity for a specific semantic role.
     * @param {string} role - The semantic role
     * @param {Entity|Entity[]} entity - The entity or entities
     * @returns {MeaningRepresentation} This meaning for chaining
     */
    setArgument(role, entity) {
        this.args.set(role, entity);
        return this;
    }

    /**
     * Adds an entity to a role (creates array if multiple).
     * @param {string} role - The semantic role
     * @param {Entity} entity - The entity to add
     * @returns {MeaningRepresentation} This meaning for chaining
     */
    addArgument(role, entity) {
        const existing = this.args.get(role);
        if (!existing) {
            this.args.set(role, entity);
        } else if (Array.isArray(existing)) {
            existing.push(entity);
        } else {
            this.args.set(role, [existing, entity]);
        }
        return this;
    }

    /**
     * Gets the subject (AGENT or THEME) of the sentence.
     * @returns {Entity|null} The subject entity
     */
    getSubject() {
        // For action sentences, subject is AGENT
        if (this.args.has(SemanticRole.AGENT)) {
            const agent = this.args.get(SemanticRole.AGENT);
            return Array.isArray(agent) ? agent[0] : agent;
        }
        // For property/identity sentences, subject is THEME
        if (this.args.has(SemanticRole.THEME)) {
            const theme = this.args.get(SemanticRole.THEME);
            return Array.isArray(theme) ? theme[0] : theme;
        }
        return null;
    }

    /**
     * Gets the object (PATIENT or THEME) of the sentence.
     * @returns {Entity|null} The object entity
     */
    getObject() {
        // For action sentences, object is PATIENT
        if (this.args.has(SemanticRole.PATIENT)) {
            const patient = this.args.get(SemanticRole.PATIENT);
            return Array.isArray(patient) ? patient[0] : patient;
        }
        return null;
    }

    /**
     * Gets all entities in this meaning representation.
     * @returns {Entity[]} Array of all entities
     */
    getAllEntities() {
        const entities = [];
        for (const value of this.args.values()) {
            if (Array.isArray(value)) {
                entities.push(...value);
            } else {
                entities.push(value);
            }
        }
        return entities;
    }

    /**
     * Gets a feature value.
     * @param {string} featureName - The feature name
     * @returns {*} The feature value or undefined
     */
    getFeature(featureName) {
        return this.features[featureName];
    }

    /**
     * Sets a feature value.
     * @param {string} featureName - The feature name
     * @param {*} value - The feature value
     * @returns {MeaningRepresentation} This meaning for chaining
     */
    setFeature(featureName, value) {
        this.features[featureName] = value;
        return this;
    }

    /**
     * Checks if the sentence is a question.
     * @returns {boolean} True if a question
     */
    isQuestion() {
        return this.type === SentenceType.INTERROGATIVE;
    }

    /**
     * Checks if the sentence is a command.
     * @returns {boolean} True if a command
     */
    isCommand() {
        return this.type === SentenceType.IMPERATIVE;
    }

    /**
     * Checks if the sentence is a statement.
     * @returns {boolean} True if a statement
     */
    isStatement() {
        return this.type === SentenceType.DECLARATIVE;
    }

    /**
     * Creates a plain object representation of this meaning.
     * @returns {Object} Plain object
     */
    toJSON() {
        const argsObj = {};
        for (const [role, entity] of this.args) {
            argsObj[role] = Array.isArray(entity) 
                ? entity.map(e => e.toJSON()) 
                : entity.toJSON();
        }

        return {
            type: this.type,
            predicate: this.predicate ? this.predicate.toJSON() : null,
            arguments: argsObj,
            features: this.features,
            confidence: this.confidence
        };
    }

    /**
     * Creates a MeaningRepresentation from a plain object.
     * @param {Object} obj - The plain object
     * @returns {MeaningRepresentation} A new MeaningRepresentation instance
     */
    static fromJSON(obj) {
        const argsMap = new Map();
        if (obj.arguments) {
            for (const [role, entity] of Object.entries(obj.arguments)) {
                if (Array.isArray(entity)) {
                    argsMap.set(role, entity.map(e => Entity.fromJSON(e)));
                } else {
                    argsMap.set(role, Entity.fromJSON(entity));
                }
            }
        }

        return new MeaningRepresentation({
            type: obj.type,
            predicate: obj.predicate ? Predicate.fromJSON(obj.predicate) : null,
            args: argsMap,
            features: obj.features || {}
        });
    }

    /**
     * Returns a human-readable summary of the meaning.
     * @returns {string} Human-readable summary
     */
    toSummary() {
        const parts = [];

        // Sentence type
        parts.push(`Type: ${this.type}`);

        // Predicate
        if (this.predicate) {
            parts.push(`Predicate: ${this.predicate.text} (${this.predicate.type})`);
        }

        // Arguments
        for (const [role, entity] of this.args) {
            if (Array.isArray(entity)) {
                parts.push(`${role}: ${entity.map(e => e.text).join(', ')}`);
            } else {
                parts.push(`${role}: ${entity.text}`);
            }
        }

        // Features
        if (Object.keys(this.features).length > 0) {
            parts.push(`Features: ${JSON.stringify(this.features)}`);
        }

        return parts.join('\n');
    }

    /**
     * Returns a string representation of this meaning.
     * @returns {string} String representation
     */
    toString() {
        return this.toSummary();
    }
}

// Export all classes
export default {
    Entity,
    Predicate,
    MeaningRepresentation
};
