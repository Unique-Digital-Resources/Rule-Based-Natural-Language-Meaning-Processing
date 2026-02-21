/**
 * @fileoverview Semantic validation for meaning representations.
 * Validates semantic consistency, selectional restrictions, and agreement.
 * @module semantic/validator
 */

import { SemanticRole, PredicateType, Number as GramNumber, Person } from '../core/types.js';
import { MeaningRepresentation } from './meaning.js';

/**
 * Represents a validation error or warning.
 * @typedef {Object} ValidationMessage
 * @property {string} type - 'error' or 'warning'
 * @property {string} code - Error code for programmatic handling
 * @property {string} message - Human-readable message
 * @property {string} [location] - Where the issue occurred
 */

/**
 * Result of semantic validation.
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the meaning is valid
 * @property {ValidationMessage[]} errors - Array of error messages
 * @property {ValidationMessage[]} warnings - Array of warning messages
 * @property {Object} [details] - Additional validation details
 */

/**
 * Selectional restriction rules for predicates.
 * Maps predicate types to required/allowed categories for semantic roles.
 */
const SELECTIONAL_RESTRICTIONS = {
    // Verbs that require animate subjects
    animate_subject: ['think', 'believe', 'know', 'feel', 'love', 'hate', 'want', 'need', 'say', 'tell', 'ask'],
    
    // Verbs that require animate objects
    animate_object: ['love', 'hate', 'tell', 'ask', 'persuade', 'convince'],
    
    // Verbs that require inanimate objects
    inanimate_object: ['build', 'construct', 'destroy', 'break', 'fix'],
    
    // Categories that are typically animate
    animate_categories: ['person', 'animal', 'being'],
    
    // Categories that are typically inanimate
    inanimate_categories: ['object', 'place', 'substance', 'abstract']
};

/**
 * SemanticValidator class for validating meaning representations.
 */
export class SemanticValidator {
    /**
     * Creates a new SemanticValidator instance.
     * @param {Object} [options] - Validator options
     * @param {boolean} [options.strictMode=false] - Enable strict validation
     * @param {boolean} [options.checkSelectionalRestrictions=true] - Check selectional restrictions
     * @param {boolean} [options.checkAgreement=true] - Check agreement rules
     */
    constructor(options = {}) {
        /**
         * Validator options.
         * @type {Object}
         */
        this.options = {
            strictMode: options.strictMode ?? false,
            checkSelectionalRestrictions: options.checkSelectionalRestrictions ?? true,
            checkAgreement: options.checkAgreement ?? true
        };
    }

    /**
     * Validates a meaning representation.
     * @param {MeaningRepresentation} meaning - The meaning to validate
     * @returns {ValidationResult} The validation result
     */
    validate(meaning) {
        const errors = [];
        const warnings = [];
        const details = {};

        if (!meaning) {
            return {
                isValid: false,
                errors: [{ type: 'error', code: 'NULL_MEANING', message: 'No meaning representation provided' }],
                warnings: [],
                details: null
            };
        }

        // Check for required components
        this.checkRequiredComponents(meaning, errors, warnings);

        // Check predicate-argument structure
        this.checkPredicateArgumentStructure(meaning, errors, warnings);

        // Check selectional restrictions
        if (this.options.checkSelectionalRestrictions) {
            this.checkAllSelectionalRestrictions(meaning, errors, warnings);
        }

        // Check agreement
        if (this.options.checkAgreement) {
            this.checkAllAgreement(meaning, errors, warnings);
        }

        // Check for semantic consistency
        this.checkSemanticConsistency(meaning, errors, warnings);

        // Collect details
        details.entityCount = meaning.getAllEntities().length;
        details.hasPredicate = meaning.predicate !== null;
        details.predicateType = meaning.predicate?.type || null;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            details
        };
    }

    /**
     * Checks for required components in the meaning.
     * @param {MeaningRepresentation} meaning - The meaning to check
     * @param {ValidationMessage[]} errors - Error array to add to
     * @param {ValidationMessage[]} warnings - Warning array to add to
     */
    checkRequiredComponents(meaning, errors, warnings) {
        // Check for predicate
        if (!meaning.predicate) {
            errors.push({
                type: 'error',
                code: 'MISSING_PREDICATE',
                message: 'Meaning representation has no predicate'
            });
        }

        // Check for subject
        const subject = meaning.getSubject();
        if (!subject) {
            if (this.options.strictMode) {
                errors.push({
                    type: 'error',
                    code: 'MISSING_SUBJECT',
                    message: 'Meaning representation has no subject'
                });
            } else {
                warnings.push({
                    type: 'warning',
                    code: 'MISSING_SUBJECT',
                    message: 'Meaning representation has no subject'
                });
            }
        }

        // Check for arguments
        if (meaning.args.size === 0) {
            warnings.push({
                type: 'warning',
                code: 'NO_ARGUMENTS',
                message: 'Meaning representation has no arguments'
            });
        }
    }

    /**
     * Checks predicate-argument structure consistency.
     * @param {MeaningRepresentation} meaning - The meaning to check
     * @param {ValidationMessage[]} errors - Error array to add to
     * @param {ValidationMessage[]} warnings - Warning array to add to
     */
    checkPredicateArgumentStructure(meaning, errors, warnings) {
        if (!meaning.predicate) {
            return;
        }

        const predicate = meaning.predicate;
        const predicateType = predicate.type;

        // Check based on predicate type
        switch (predicateType) {
            case PredicateType.DOES:
                // Action predicates should have an AGENT
                if (!meaning.getArgument(SemanticRole.AGENT) && !meaning.getArgument(SemanticRole.THEME)) {
                    warnings.push({
                        type: 'warning',
                        code: 'MISSING_AGENT',
                        message: `Action predicate "${predicate.text}" has no agent`
                    });
                }
                
                // Transitive verbs should have a PATIENT
                if (predicate.isTransitive() && !meaning.getArgument(SemanticRole.PATIENT)) {
                    warnings.push({
                        type: 'warning',
                        code: 'MISSING_PATIENT',
                        message: `Transitive verb "${predicate.text}" has no object/patient`
                    });
                }
                break;

            case PredicateType.HAS_PROPERTY:
                // Property predicates should have a THEME
                if (!meaning.getArgument(SemanticRole.THEME)) {
                    warnings.push({
                        type: 'warning',
                        code: 'MISSING_THEME',
                        message: `Property predicate "${predicate.text}" has no theme`
                    });
                }
                break;

            case PredicateType.IS_A:
                // Identity predicates should have a THEME and PROPERTY/VALUE
                if (!meaning.getArgument(SemanticRole.THEME)) {
                    warnings.push({
                        type: 'warning',
                        code: 'MISSING_THEME',
                        message: 'Identity predicate has no theme (subject)'
                    });
                }
                if (!meaning.getArgument(SemanticRole.PROPERTY)) {
                    warnings.push({
                        type: 'warning',
                        code: 'MISSING_VALUE',
                        message: 'Identity predicate has no value (predicate nominal)'
                    });
                }
                break;
        }
    }

    /**
     * Checks all selectional restrictions.
     * @param {MeaningRepresentation} meaning - The meaning to check
     * @param {ValidationMessage[]} errors - Error array to add to
     * @param {ValidationMessage[]} warnings - Warning array to add to
     */
    checkAllSelectionalRestrictions(meaning, errors, warnings) {
        if (!meaning.predicate) {
            return;
        }

        const predicate = meaning.predicate;
        const predicateLemma = predicate.lemma?.toLowerCase() || predicate.text.toLowerCase();

        // Check subject selectional restrictions
        const agent = meaning.getArgument(SemanticRole.AGENT);
        const theme = meaning.getArgument(SemanticRole.THEME);
        const subject = agent || theme;

        if (subject) {
            const result = this.checkSelectionalRestrictions(predicate, subject, SemanticRole.AGENT);
            if (!result.valid) {
                warnings.push({
                    type: 'warning',
                    code: 'SELECTIONAL_VIOLATION',
                    message: result.message,
                    location: `subject "${subject.text}"`
                });
            }
        }

        // Check object selectional restrictions
        const patient = meaning.getArgument(SemanticRole.PATIENT);
        if (patient) {
            const result = this.checkSelectionalRestrictions(predicate, patient, SemanticRole.PATIENT);
            if (!result.valid) {
                warnings.push({
                    type: 'warning',
                    code: 'SELECTIONAL_VIOLATION',
                    message: result.message,
                    location: `object "${patient.text}"`
                });
            }
        }
    }

    /**
     * Checks selectional restrictions for a predicate and argument.
     * @param {Predicate} predicate - The predicate
     * @param {Entity} argument - The argument entity
     * @param {string} role - The semantic role of the argument
     * @returns {Object} Result with valid and message properties
     */
    checkSelectionalRestrictions(predicate, argument, role) {
        const predicateLemma = predicate.lemma?.toLowerCase() || predicate.text.toLowerCase();
        const categories = argument.categories || [];

        // Check for animate subject requirement
        if (role === SemanticRole.AGENT || role === SemanticRole.THEME) {
            if (SELECTIONAL_RESTRICTIONS.animate_subject.includes(predicateLemma)) {
                const isAnimate = categories.some(cat => 
                    SELECTIONAL_RESTRICTIONS.animate_categories.includes(cat)
                );
                if (!isAnimate && categories.length > 0) {
                    return {
                        valid: false,
                        message: `Predicate "${predicate.text}" typically requires an animate subject, but "${argument.text}" is not animate`
                    };
                }
            }
        }

        // Check for animate object requirement
        if (role === SemanticRole.PATIENT) {
            if (SELECTIONAL_RESTRICTIONS.animate_object.includes(predicateLemma)) {
                const isAnimate = categories.some(cat => 
                    SELECTIONAL_RESTRICTIONS.animate_categories.includes(cat)
                );
                if (!isAnimate && categories.length > 0) {
                    return {
                        valid: false,
                        message: `Predicate "${predicate.text}" typically requires an animate object, but "${argument.text}" is not animate`
                    };
                }
            }

            if (SELECTIONAL_RESTRICTIONS.inanimate_object.includes(predicateLemma)) {
                const isInanimate = categories.some(cat => 
                    SELECTIONAL_RESTRICTIONS.inanimate_categories.includes(cat)
                );
                const isAnimate = categories.some(cat => 
                    SELECTIONAL_RESTRICTIONS.animate_categories.includes(cat)
                );
                if (isAnimate && !isInanimate) {
                    return {
                        valid: false,
                        message: `Predicate "${predicate.text}" typically requires an inanimate object, but "${argument.text}" is animate`
                    };
                }
            }
        }

        return { valid: true };
    }

    /**
     * Checks all agreement rules.
     * @param {MeaningRepresentation} meaning - The meaning to check
     * @param {ValidationMessage[]} errors - Error array to add to
     * @param {ValidationMessage[]} warnings - Warning array to add to
     */
    checkAllAgreement(meaning, errors, warnings) {
        const subject = meaning.getSubject();
        const predicate = meaning.predicate;

        if (!subject || !predicate) {
            return;
        }

        // Check subject-predicate agreement
        const agreementResult = this.checkAgreement(subject, predicate);
        if (!agreementResult.valid) {
            errors.push({
                type: 'error',
                code: 'AGREEMENT_ERROR',
                message: agreementResult.message,
                location: 'subject-predicate agreement'
            });
        }
    }

    /**
     * Checks subject-predicate agreement.
     * @param {Entity} subject - The subject entity
     * @param {Predicate} predicate - The predicate
     * @returns {Object} Result with valid and message properties
     */
    checkAgreement(subject, predicate) {
        const subjectNumber = subject.getFeature('number');
        const predicateNumber = predicate.getFeature('number');

        // If both have number features, they should match
        if (subjectNumber && predicateNumber && subjectNumber !== predicateNumber) {
            return {
                valid: false,
                message: `Subject "${subject.text}" is ${subjectNumber.toLowerCase()} but predicate is ${predicateNumber.toLowerCase()}`
            };
        }

        // Check person agreement (for future implementation)
        const subjectPerson = subject.getFeature('person');
        const predicatePerson = predicate.getFeature('person');

        if (subjectPerson && predicatePerson && subjectPerson !== predicatePerson) {
            return {
                valid: false,
                message: `Subject and predicate person features do not agree`
            };
        }

        return { valid: true };
    }

    /**
     * Checks general semantic consistency.
     * @param {MeaningRepresentation} meaning - The meaning to check
     * @param {ValidationMessage[]} errors - Error array to add to
     * @param {ValidationMessage[]} warnings - Warning array to add to
     */
    checkSemanticConsistency(meaning, errors, warnings) {
        // Check for duplicate entities
        const entities = meaning.getAllEntities();
        const seen = new Map();

        for (const entity of entities) {
            const key = entity.text.toLowerCase();
            if (seen.has(key)) {
                warnings.push({
                    type: 'warning',
                    code: 'DUPLICATE_ENTITY',
                    message: `Entity "${entity.text}" appears multiple times`
                });
            }
            seen.set(key, entity);
        }

        // Check for contradictory features
        if (meaning.predicate) {
            // A predicate shouldn't be both negated and have a negative affix
            if (meaning.predicate.negated) {
                const negationAffixes = meaning.predicate.text.match(/^(un|dis|non|in|im)/i);
                if (negationAffixes) {
                    warnings.push({
                        type: 'warning',
                        code: 'DOUBLE_NEGATION',
                        message: `Predicate "${meaning.predicate.text}" appears to have double negation`
                    });
                }
            }
        }

        // Check for empty categories
        for (const entity of entities) {
            if (!entity.categories || entity.categories.length === 0) {
                warnings.push({
                    type: 'warning',
                    code: 'UNKNOWN_CATEGORY',
                    message: `Entity "${entity.text}" has no semantic categories`
                });
            }
        }
    }

    /**
     * Validates a specific predicate-argument combination.
     * @param {Predicate} predicate - The predicate
     * @param {Entity} argument - The argument
     * @param {string} role - The semantic role
     * @returns {ValidationResult} Validation result for this combination
     */
    validatePredicateArgument(predicate, argument, role) {
        const errors = [];
        const warnings = [];

        // Check selectional restrictions
        const selResult = this.checkSelectionalRestrictions(predicate, argument, role);
        if (!selResult.valid) {
            warnings.push({
                type: 'warning',
                code: 'SELECTIONAL_VIOLATION',
                message: selResult.message
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Creates a summary of the validation result.
     * @param {ValidationResult} result - The validation result
     * @returns {string} Human-readable summary
     */
    createSummary(result) {
        const parts = [];

        parts.push(`Valid: ${result.isValid ? 'Yes' : 'No'}`);

        if (result.errors.length > 0) {
            parts.push(`\nErrors (${result.errors.length}):`);
            for (const error of result.errors) {
                parts.push(`  - [${error.code}] ${error.message}`);
            }
        }

        if (result.warnings.length > 0) {
            parts.push(`\nWarnings (${result.warnings.length}):`);
            for (const warning of result.warnings) {
                parts.push(`  - [${warning.code}] ${warning.message}`);
            }
        }

        if (result.details) {
            parts.push('\nDetails:');
            parts.push(`  - Entity count: ${result.details.entityCount}`);
            parts.push(`  - Has predicate: ${result.details.hasPredicate}`);
            if (result.details.predicateType) {
                parts.push(`  - Predicate type: ${result.details.predicateType}`);
            }
        }

        return parts.join('\n');
    }
}

/**
 * Validates a meaning representation using default options.
 * @param {MeaningRepresentation} meaning - The meaning to validate
 * @returns {ValidationResult} The validation result
 */
export function validateMeaning(meaning) {
    const validator = new SemanticValidator();
    return validator.validate(meaning);
}

export default SemanticValidator;
