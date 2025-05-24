/**
 * Test suite for utils index module (philosophical navigation)
 */

const utils = require('../../src/utils');

describe('Utils Index Module - Philosophical Navigation', () => {
  describe('module exports', () => {
    test('should export all philosophical modules', () => {
      expect(utils.planck).toBeDefined();
      expect(utils.leibniz).toBeDefined();
      expect(utils.godel).toBeDefined();
      expect(utils.aristotle).toBeDefined();
      expect(utils.shannon).toBeDefined();
      expect(utils.turing).toBeDefined();
    });
    
    test('should export navigation helpers', () => {
      expect(typeof utils.getPhilosophicalConcept).toBe('function');
      expect(typeof utils.getRelatedModules).toBe('function');
      expect(typeof utils.createConceptualPipeline).toBe('function');
      expect(utils.philosophicalRelationships).toBeDefined();
    });
  });
    describe('philosophicalRelationships map', () => {
    test('should define relationships for all modules', () => {
      const philosophicalModules = [
        'planck', 'leibniz', 'godel', 'aristotle', 'shannon', 'turing'
      ];
      
      philosophicalModules.forEach(module => {
        expect(utils.philosophicalRelationships[module]).toBeDefined();
        expect(utils.philosophicalRelationships[module].relatedConcepts).toBeInstanceOf(Array);
        expect(utils.philosophicalRelationships[module].conceptualBasis).toBeDefined();
        expect(utils.philosophicalRelationships[module].appliedTo).toBeDefined();
      });
    });
    
    test('should have relationships defined for each concept', () => {
      // Check that each concept has at least one related concept
      Object.entries(utils.philosophicalRelationships).forEach(([concept, info]) => {
        expect(info.relatedConcepts.length).toBeGreaterThan(0);
      });
    });
  });
  
  describe('getPhilosophicalConcept function', () => {
    test('should return concept information', () => {
      const planckConcept = utils.getPhilosophicalConcept('planck');
      
      expect(planckConcept.relatedConcepts).toContain('leibniz');
      expect(planckConcept.relatedConcepts).toContain('turing');
      expect(planckConcept.conceptualBasis).toBeDefined();
      expect(planckConcept.appliedTo).toBeDefined();
      expect(planckConcept.module).toBe(utils.planck);
    });
    
    test('should throw error for unknown concept', () => {
      expect(() => {
        utils.getPhilosophicalConcept('unknownConcept');
      }).toThrow('Unknown philosophical concept');
    });
  });
  
  describe('getRelatedModules function', () => {
    test('should return related modules for a concept', () => {
      const relatedToGodel = utils.getRelatedModules('godel');
      
      expect(relatedToGodel.aristotle).toBe(utils.aristotle);
      expect(relatedToGodel.turing).toBe(utils.turing);
    });
    
    test('should throw error for unknown concept', () => {
      expect(() => {
        utils.getRelatedModules('unknownConcept');
      }).toThrow('Unknown philosophical concept');
    });
  });
  
  describe('createConceptualPipeline function', () => {
    test('should create a pipeline function', () => {
      const pipeline = utils.createConceptualPipeline(['planck', 'leibniz', 'turing']);
      expect(typeof pipeline).toBe('function');
    });
    
    test('should throw error for invalid concept in path', () => {
      expect(() => {
        utils.createConceptualPipeline(['planck', 'invalidConcept', 'turing']);
      }).toThrow('Unknown philosophical concept');
    });
    
    test('should return input unchanged (current implementation)', () => {
      const pipeline = utils.createConceptualPipeline(['planck', 'leibniz', 'turing']);
      const input = { test: 'data' };
      const output = pipeline(input);
      
      // Current implementation just returns input unchanged
      // This test may need to be updated if implementation changes
      expect(output).toBe(input);
    });
  });
});
