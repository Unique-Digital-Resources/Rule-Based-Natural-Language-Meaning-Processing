/**
 * @fileoverview Tests for the Semantic module.
 * Tests entity extraction, predicate extraction, role assignment, and meaning representation.
 * @module tests/test-semantic
 */

import { describe, it, expect } from './test-runner.js';
import { Entity, Predicate, MeaningRepresentation } from '../src/semantic/meaning.js';
import { SemanticExtractor } from '../src/semantic/extractor.js';
import { SemanticValidator } from '../src/semantic/validator.js';
import { SemanticRole, PredicateType, SentenceType, POS } from '../src/core/types.js';
import { NLPAnalyzer } from '../src/analyzer.js';

/**
 * Creates a test analyzer with default configuration.
 * @returns {NLPAnalyzer} A configured analyzer
 */
function createTestAnalyzer() {
    return NLPAnalyzer.createDefault({ strictMode: false });
}

// ============================================
// Entity Class Tests
// ============================================

describe('Entity Class', () => {
    it('should create an entity with text', () => {
        const entity = new Entity({ text: 'man' });
        
        expect(entity.text).toBe('man');
        expect(entity.lemma).toBe('man');
    });

    it('should create an entity with categories', () => {
        const entity = new Entity({ 
            text: 'man', 
            categories: ['person', 'male', 'adult'] 
        });
        
        expect(entity.hasCategory('person')).toBe(true);
        expect(entity.hasCategory('male')).toBe(true);
        expect(entity.hasCategory('female')).toBe(false);
    });

    it('should create an entity with features', () => {
        const entity = new Entity({ 
            text: 'man', 
            features: { number: 'SINGULAR' } 
        });
        
        expect(entity.getFeature('number')).toBe('SINGULAR');
        expect(entity.isSingular()).toBe(true);
    });

    it('should check if entity is animate', () => {
        const person = new Entity({ text: 'man', categories: ['person'] });
        const animal = new Entity({ text: 'dog', categories: ['animal'] });
        const object = new Entity({ text: 'book', categories: ['object'] });
        
        expect(person.isAnimate()).toBe(true);
        expect(animal.isAnimate()).toBe(true);
        expect(object.isAnimate()).toBe(false);
    });

    it('should check if entity is a person', () => {
        const person = new Entity({ text: 'man', categories: ['person'] });
        const animal = new Entity({ text: 'dog', categories: ['animal'] });
        
        expect(person.isPerson()).toBe(true);
        expect(animal.isPerson()).toBe(false);
    });

    it('should add categories', () => {
        const entity = new Entity({ text: 'man' });
        entity.addCategory('person').addCategory('male');
        
        expect(entity.hasCategory('person')).toBe(true);
        expect(entity.hasCategory('male')).toBe(true);
    });

    it('should set features', () => {
        const entity = new Entity({ text: 'man' });
        entity.setFeature('number', 'PLURAL');
        
        expect(entity.getFeature('number')).toBe('PLURAL');
        expect(entity.isPlural()).toBe(true);
    });

    it('should serialize to JSON', () => {
        const entity = new Entity({ 
            text: 'man', 
            categories: ['person'],
            features: { number: 'SINGULAR' }
        });
        
        const json = entity.toJSON();
        
        expect(json.text).toBe('man');
        expect(json.categories).toContain('person');
        expect(json.features.number).toBe('SINGULAR');
    });

    it('should deserialize from JSON', () => {
        const json = {
            id: 'test_id',
            text: 'man',
            categories: ['person'],
            features: { number: 'SINGULAR' }
        };
        
        const entity = Entity.fromJSON(json);
        
        expect(entity.text).toBe('man');
        expect(entity.hasCategory('person')).toBe(true);
    });
});

// ============================================
// Predicate Class Tests
// ============================================

describe('Predicate Class', () => {
    it('should create a predicate with text', () => {
        const predicate = new Predicate({ text: 'runs' });
        
        expect(predicate.text).toBe('runs');
        expect(predicate.lemma).toBe('runs');
    });

    it('should create a predicate with type', () => {
        const action = new Predicate({ text: 'runs', type: PredicateType.DOES });
        const property = new Predicate({ text: 'red', type: PredicateType.HAS_PROPERTY });
        const identity = new Predicate({ text: 'man', type: PredicateType.IS_A });
        
        expect(action.isAction()).toBe(true);
        expect(property.isProperty()).toBe(true);
        expect(identity.isIdentity()).toBe(true);
    });

    it('should create a transitive predicate', () => {
        const predicate = new Predicate({ 
            text: 'reads', 
            features: { transitive: true } 
        });
        
        expect(predicate.isTransitive()).toBe(true);
    });

    it('should create a negated predicate', () => {
        const predicate = new Predicate({ text: 'not happy', negated: true });
        
        expect(predicate.negated).toBe(true);
    });

    it('should get tense and aspect', () => {
        const predicate = new Predicate({ 
            text: 'runs', 
            features: { tense: 'PRESENT', aspect: 'SIMPLE' } 
        });
        
        expect(predicate.getTense()).toBe('PRESENT');
        expect(predicate.getAspect()).toBe('SIMPLE');
    });

    it('should serialize to JSON', () => {
        const predicate = new Predicate({ 
            text: 'runs', 
            type: PredicateType.DOES,
            features: { tense: 'PRESENT' }
        });
        
        const json = predicate.toJSON();
        
        expect(json.text).toBe('runs');
        expect(json.type).toBe(PredicateType.DOES);
    });
});

// ============================================
// MeaningRepresentation Class Tests
// ============================================

describe('MeaningRepresentation Class', () => {
    it('should create a meaning representation', () => {
        const meaning = new MeaningRepresentation({ 
            type: SentenceType.DECLARATIVE 
        });
        
        expect(meaning.type).toBe(SentenceType.DECLARATIVE);
    });

    it('should set and get arguments', () => {
        const meaning = new MeaningRepresentation();
        const agent = new Entity({ text: 'man', categories: ['person'] });
        
        meaning.setArgument(SemanticRole.AGENT, agent);
        
        expect(meaning.getArgument(SemanticRole.AGENT)).toBeDefined();
        expect(meaning.getArgument(SemanticRole.AGENT).text).toBe('man');
    });

    it('should get subject (AGENT or THEME)', () => {
        const actionMeaning = new MeaningRepresentation();
        const agent = new Entity({ text: 'man' });
        actionMeaning.setArgument(SemanticRole.AGENT, agent);
        
        const propertyMeaning = new MeaningRepresentation();
        const theme = new Entity({ text: 'apple' });
        propertyMeaning.setArgument(SemanticRole.THEME, theme);
        
        expect(actionMeaning.getSubject().text).toBe('man');
        expect(propertyMeaning.getSubject().text).toBe('apple');
    });

    it('should get object (PATIENT)', () => {
        const meaning = new MeaningRepresentation();
        const patient = new Entity({ text: 'book' });
        meaning.setArgument(SemanticRole.PATIENT, patient);
        
        expect(meaning.getObject().text).toBe('book');
    });

    it('should get all entities', () => {
        const meaning = new MeaningRepresentation();
        const agent = new Entity({ text: 'man' });
        const patient = new Entity({ text: 'book' });
        
        meaning.setArgument(SemanticRole.AGENT, agent);
        meaning.setArgument(SemanticRole.PATIENT, patient);
        
        const entities = meaning.getAllEntities();
        
        expect(entities.length).toBe(2);
    });

    it('should check sentence type', () => {
        const statement = new MeaningRepresentation({ type: SentenceType.DECLARATIVE });
        const question = new MeaningRepresentation({ type: SentenceType.INTERROGATIVE });
        const command = new MeaningRepresentation({ type: SentenceType.IMPERATIVE });
        
        expect(statement.isStatement()).toBe(true);
        expect(question.isQuestion()).toBe(true);
        expect(command.isCommand()).toBe(true);
    });

    it('should serialize to JSON', () => {
        const meaning = new MeaningRepresentation();
        meaning.setArgument(SemanticRole.AGENT, new Entity({ text: 'man' }));
        meaning.predicate = new Predicate({ text: 'runs', type: PredicateType.DOES });
        
        const json = meaning.toJSON();
        
        expect(json.predicate).toBeDefined();
        expect(json.arguments).toBeDefined();
    });

    it('should generate summary', () => {
        const meaning = new MeaningRepresentation();
        meaning.setArgument(SemanticRole.AGENT, new Entity({ text: 'man' }));
        meaning.predicate = new Predicate({ text: 'runs', type: PredicateType.DOES });
        
        const summary = meaning.toSummary();
        
        expect(summary).toBeDefined();
        expect(summary.length).toBeGreaterThan(0);
    });
});

// ============================================
// Entity Extraction Tests
// ============================================

describe('Entity Extraction', () => {
    const analyzer = createTestAnalyzer();

    it('should extract subject entity from action sentence', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.meaning).toBeDefined();
        expect(result.meaning.arguments).toBeDefined();
        
        // Check that AGENT is extracted
        const agent = result.meaning.arguments.AGENT;
        expect(agent).toBeDefined();
        expect(agent.text).toBe('man');
    });

    it('should extract object entity from action sentence', () => {
        const result = analyzer.analyze('The man reads a book');
        
        const patient = result.meaning.arguments.PATIENT;
        expect(patient).toBeDefined();
        expect(patient.text).toBe('book');
    });

    it('should extract theme from property sentence', () => {
        const result = analyzer.analyze('The apple is red');
        
        const theme = result.meaning.arguments.THEME;
        expect(theme).toBeDefined();
        expect(theme.text).toBe('apple');
    });

    it('should extract categories for entities', () => {
        const result = analyzer.analyze('The man reads');
        
        const agent = result.meaning.arguments.AGENT;
        expect(agent.categories).toBeDefined();
        expect(agent.categories).toContain('person');
    });
});

// ============================================
// Predicate Extraction Tests
// ============================================

describe('Predicate Extraction', () => {
    const analyzer = createTestAnalyzer();

    it('should extract action predicate', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.meaning.predicate).toBeDefined();
        expect(result.meaning.predicate.text).toBe('reads');
        expect(result.meaning.predicate.type).toBe(PredicateType.DOES);
    });

    it('should extract property predicate', () => {
        const result = analyzer.analyze('The apple is red');
        
        expect(result.meaning.predicate).toBeDefined();
        expect(result.meaning.predicate.type).toBe(PredicateType.HAS_PROPERTY);
    });

    it('should extract identity predicate', () => {
        const result = analyzer.analyze('Socrates is a man');
        
        expect(result.meaning.predicate).toBeDefined();
        expect(result.meaning.predicate.type).toBe(PredicateType.IS_A);
    });
});

// ============================================
// Role Assignment Tests
// ============================================

describe('Role Assignment', () => {
    const analyzer = createTestAnalyzer();

    it('should assign AGENT role to subject in action sentence', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.meaning.arguments.AGENT).toBeDefined();
        expect(result.meaning.arguments.AGENT.text).toBe('man');
    });

    it('should assign PATIENT role to object in action sentence', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.meaning.arguments.PATIENT).toBeDefined();
        expect(result.meaning.arguments.PATIENT.text).toBe('book');
    });

    it('should assign THEME role to subject in property sentence', () => {
        const result = analyzer.analyze('The apple is red');
        
        expect(result.meaning.arguments.THEME).toBeDefined();
        expect(result.meaning.arguments.THEME.text).toBe('apple');
    });
});

// ============================================
// Meaning Representation Tests
// ============================================

describe('Meaning Representation', () => {
    const analyzer = createTestAnalyzer();

    it('should create complete meaning for action sentence', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.success).toBe(true);
        expect(result.meaning).toBeDefined();
        expect(result.meaning.predicate).toBeDefined();
        expect(result.meaning.arguments).toBeDefined();
    });

    it('should create complete meaning for property sentence', () => {
        const result = analyzer.analyze('The apple is red');
        
        expect(result.success).toBe(true);
        expect(result.meaning).toBeDefined();
    });

    it('should create complete meaning for identity sentence', () => {
        const result = analyzer.analyze('Socrates is a man');
        
        expect(result.success).toBe(true);
        expect(result.meaning).toBeDefined();
    });
});

// ============================================
// Semantic Validator Tests
// ============================================

describe('Semantic Validator', () => {
    const validator = new SemanticValidator();

    it('should validate a correct meaning', () => {
        const meaning = new MeaningRepresentation();
        meaning.setArgument(SemanticRole.AGENT, new Entity({ text: 'man', categories: ['person'] }));
        meaning.predicate = new Predicate({ text: 'runs', type: PredicateType.DOES });
        
        const result = validator.validate(meaning);
        
        expect(result.isValid).toBe(true);
    });

    it('should detect missing predicate', () => {
        const meaning = new MeaningRepresentation();
        meaning.setArgument(SemanticRole.AGENT, new Entity({ text: 'man' }));
        
        const result = validator.validate(meaning);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about missing subject', () => {
        const meaning = new MeaningRepresentation();
        meaning.predicate = new Predicate({ text: 'runs', type: PredicateType.DOES });
        
        const result = validator.validate(meaning);
        
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn about selectional restriction violations', () => {
        const meaning = new MeaningRepresentation();
        meaning.setArgument(SemanticRole.AGENT, new Entity({ text: 'rock', categories: ['object'] }));
        meaning.predicate = new Predicate({ text: 'thinks', type: PredicateType.DOES });
        
        const result = validator.validate(meaning);
        
        // 'think' requires animate subject
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate null meaning', () => {
        const result = validator.validate(null);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
});

// ============================================
// Validation Result Tests
// ============================================

describe('Validation Results', () => {
    const analyzer = createTestAnalyzer();

    it('should include validation in analysis result', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.validation).toBeDefined();
        expect(result.validation.isValid).toBeDefined();
    });

    it('should pass validation for valid sentences', () => {
        const result = analyzer.analyze('The man reads a book');
        
        expect(result.validation.isValid).toBe(true);
    });
});

console.log('Semantic tests loaded.');
