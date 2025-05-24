/**
 * Test suite for Planck module (quantum discretization)
 */

const planck = require('../../src/utils/planck');

describe('Planck Module - Quantum Discretization', () => {
  describe('QUANTUM_VALUE constant', () => {
    test('should be defined', () => {
      expect(planck.QUANTUM_VALUE).toBeDefined();
    });

    test('should be a BigInt', () => {
      expect(typeof planck.QUANTUM_VALUE).toBe('bigint');
    });

    test('should be positive', () => {
      expect(planck.QUANTUM_VALUE > 0n).toBe(true);
    });
  });

  describe('quantize function', () => {
    test('should convert number to BigInt', () => {
      const result = planck.quantize(100);
      expect(typeof result).toBe('bigint');
      expect(result).toEqual(100n);
    });

    test('should handle string input', () => {
      const result = planck.quantize('250');
      expect(result).toEqual(250n);
    });

    test('should handle BigInt input', () => {
      const result = planck.quantize(1000n);
      expect(result).toEqual(1000n);
    });

    test('should floor decimal values', () => {
      const result = planck.quantize(123.789);
      expect(result).toEqual(123n);
    });

    test('should handle zero', () => {
      const result = planck.quantize(0);
      expect(result).toEqual(0n);
    });
  });

  describe('isValidQuantum function', () => {
    test('should return true for valid quantum values', () => {
      expect(planck.isValidQuantum(0)).toBe(true);
      expect(planck.isValidQuantum(1)).toBe(true);
      expect(planck.isValidQuantum('100')).toBe(true);
      expect(planck.isValidQuantum(100n)).toBe(true);
    });

    test('should return false for negative values', () => {
      expect(planck.isValidQuantum(-1)).toBe(false);
      expect(planck.isValidQuantum('-100')).toBe(false);
      expect(planck.isValidQuantum(-100n)).toBe(false);
    });

    test('should return false for non-integer values in string form', () => {
      expect(planck.isValidQuantum('3.14')).toBe(false);
    });

    test('should return false for invalid types', () => {
      expect(planck.isValidQuantum(null)).toBe(false);
      expect(planck.isValidQuantum(undefined)).toBe(false);
      expect(planck.isValidQuantum({})).toBe(false);
      expect(planck.isValidQuantum('abc')).toBe(false);
    });
  });

  describe('calculateEnergyLevel function', () => {
    test('should multiply amount and frequency', () => {
      const amount = 100n;
      const frequency = 5n;
      const result = planck.calculateEnergyLevel(amount, frequency);
      expect(result).toEqual(500n);
    });

    test('should handle zero values', () => {
      expect(planck.calculateEnergyLevel(100n, 0n)).toEqual(0n);
      expect(planck.calculateEnergyLevel(0n, 5n)).toEqual(0n);
    });

    test('should return BigInt type', () => {
      const result = planck.calculateEnergyLevel(10n, 2n);
      expect(typeof result).toBe('bigint');
    });
  });
});
