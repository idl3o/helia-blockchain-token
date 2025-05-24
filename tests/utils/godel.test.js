/**
 * Test suite for Gödel module (consistency verification for blockchain transactions)
 */

const godel = require('../../src/utils/godel');

describe('Gödel Module - Consistency Verification', () => {
  describe('GodelVerifier class', () => {
    let verifier;

    beforeEach(() => {
      verifier = new godel.GodelVerifier();
    });

    test('should create an instance with empty rules', () => {
      expect(verifier.rules).toEqual([]);
      expect(verifier.proofHistory).toBeInstanceOf(Map);
      expect(verifier.proofHistory.size).toBe(0);
    });

    test('should add rules correctly', () => {
      const testRule = (tx) => tx.amount > 0;
      verifier.addRule(testRule, 'Amount must be positive');
      
      expect(verifier.rules).toHaveLength(1);
      expect(verifier.rules[0].check).toBe(testRule);
      expect(verifier.rules[0].description).toBe('Amount must be positive');
    });

    test('should verify valid transaction', () => {
      const validTransaction = {
        source: 'wallet1',
        destination: 'wallet2',
        amount: 100
      };

      verifier.addRule(tx => tx.amount > 0, 'Amount must be positive');
      
      const result = verifier.verifyTransaction(validTransaction);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
      expect(result.proofId).toBeDefined();
      expect(verifier.proofHistory.size).toBe(1);
    });

    test('should reject transaction failing rules', () => {
      const invalidTransaction = {
        source: 'wallet1',
        destination: 'wallet2',
        amount: -50 // negative amount
      };

      verifier.addRule(tx => tx.amount > 0, 'Amount must be positive');
      
      const result = verifier.verifyTransaction(invalidTransaction);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Failed rule: Amount must be positive');
      expect(verifier.proofHistory.size).toBe(0); // Invalid transactions aren't recorded
    });

    test('should detect self-reference (paradoxical transactions)', () => {
      const hash = 'abc123';
      const selfReferencingTx = {
        source: 'wallet1',
        destination: 'wallet1', // same as source
        amount: 100,
        hash: hash,
        data: { referenceHash: hash } // contains its own hash
      };

      const result = verifier.verifyTransaction(selfReferencingTx);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Transaction contains paradoxical self-reference');
    });

    test('should get proof history', () => {
      const tx1 = { source: 'wallet1', destination: 'wallet2', amount: 100 };
      const tx2 = { source: 'wallet2', destination: 'wallet3', amount: 50 };
      
      verifier.verifyTransaction(tx1);
      verifier.verifyTransaction(tx2);
      
      const history = verifier.getProofHistory();
      expect(history).toHaveLength(2);
      expect(history[0].transaction).toEqual(tx1);
      expect(history[1].transaction).toEqual(tx2);
    });

    test('should clear proof history', () => {
      const tx = { source: 'wallet1', destination: 'wallet2', amount: 100 };
      verifier.verifyTransaction(tx);
      expect(verifier.proofHistory.size).toBe(1);
      
      verifier.clearProofHistory();
      expect(verifier.proofHistory.size).toBe(0);
    });
  });

  describe('createVerifier factory function', () => {
    test('should create verifier with common rules', () => {
      const verifier = godel.createVerifier();
      
      expect(verifier).toBeInstanceOf(godel.GodelVerifier);
      expect(verifier.rules.length).toBe(godel.commonRules.length);
    });

    test('should correctly verify with common rules', () => {
      const verifier = godel.createVerifier();
      
      const validTx = {
        source: 'wallet1',
        destination: 'wallet2',
        amount: 100
      };
      
      const invalidTx = {
        source: 'wallet1',
        // missing destination
        amount: 100
      };
      
      expect(verifier.verifyTransaction(validTx).isValid).toBe(true);
      expect(verifier.verifyTransaction(invalidTx).isValid).toBe(false);
    });
  });

  describe('commonRules array', () => {
    test('should contain expected validation rules', () => {
      expect(godel.commonRules).toBeInstanceOf(Array);
      expect(godel.commonRules.length).toBeGreaterThan(0);
      
      // Check rule structure
      godel.commonRules.forEach(rule => {
        expect(rule).toHaveProperty('check');
        expect(rule).toHaveProperty('description');
        expect(typeof rule.check).toBe('function');
        expect(typeof rule.description).toBe('string');
      });
    });
  });
});
