/**
 * Test suite for Leibniz module (binary mathematics for blockchain operations)
 */

const leibniz = require('../../src/utils/leibniz');

describe('Leibniz Module - Binary Mathematics', () => {
  describe('monadHash function', () => {
    test('should generate a hash string', () => {
      const result = leibniz.monadHash('test data');
      expect(typeof result).toBe('string');
      expect(result).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    test('should generate consistent hash for same input', () => {
      const hash1 = leibniz.monadHash('consistent data');
      const hash2 = leibniz.monadHash('consistent data');
      expect(hash1).toEqual(hash2);
    });

    test('should generate different hash for different input', () => {
      const hash1 = leibniz.monadHash('data1');
      const hash2 = leibniz.monadHash('data2');
      expect(hash1).not.toEqual(hash2);
    });

    test('should handle object input', () => {
      const data = { key: 'value', number: 123 };
      const result = leibniz.monadHash(data);
      expect(typeof result).toBe('string');
      expect(result).toHaveLength(64);
    });

    test('should handle buffer input', () => {
      const buffer = Buffer.from('buffer data');
      const result = leibniz.monadHash(buffer);
      expect(typeof result).toBe('string');
      expect(result).toHaveLength(64);
    });
  });

  describe('createUniqueId function', () => {
    test('should generate a string', () => {
      const id = leibniz.createUniqueId();
      expect(typeof id).toBe('string');
    });

    test('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(leibniz.createUniqueId());
      }
      expect(ids.size).toBe(10);
    });

    test('should have correct length (32 hex chars for 16 bytes)', () => {
      const id = leibniz.createUniqueId();
      expect(id).toHaveLength(32);
    });
  });

  describe('key pair and signature operations', () => {
    let keyPair;
    const testData = { message: 'Important blockchain data' };
    let signature;

    beforeAll(() => {
      keyPair = leibniz.createKeyPair();
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
    });

    test('should create RSA key pair', () => {
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
      expect(keyPair.publicKey).toContain('BEGIN PUBLIC KEY');
      expect(keyPair.privateKey).toContain('BEGIN PRIVATE KEY');
    });

    test('should create signature from private key', () => {
      signature = leibniz.createSignature(keyPair.privateKey, testData);
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    test('should verify signature with matching public key and data', () => {
      const isValid = leibniz.verifySignature(keyPair.publicKey, signature, testData);
      expect(isValid).toBe(true);
    });

    test('should reject signature with incorrect data', () => {
      const tamperedData = { ...testData, message: 'Altered message' };
      const isValid = leibniz.verifySignature(keyPair.publicKey, signature, tamperedData);
      expect(isValid).toBe(false);
    });

    test('should reject invalid signature', () => {
      const invalidSignature = 'deadbeef'.repeat(16);
      const isValid = leibniz.verifySignature(keyPair.publicKey, invalidSignature, testData);
      expect(isValid).toBe(false);
    });
  });
});
