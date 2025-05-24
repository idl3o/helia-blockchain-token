/**
 * Test suite for Shannon module (information theory for blockchain transactions)
 */

const shannon = require('../../src/utils/shannon');

describe('Shannon Module - Information Theory', () => {
  describe('calculateEntropy function', () => {
    test('should calculate higher entropy for random data', () => {
      const randomData = { data: Math.random().toString().repeat(10) };
      const repeatingData = { data: 'AAAAAAAAAA' };
      
      const randomEntropy = shannon.calculateEntropy(randomData);
      const repeatingEntropy = shannon.calculateEntropy(repeatingData);
      
      expect(randomEntropy).toBeGreaterThan(repeatingEntropy);
    });
    
    test('should calculate zero entropy for identical characters', () => {
      const identical = 'AAAAAAAAAA';
      expect(shannon.calculateEntropy(identical)).toBeCloseTo(0);
    });
    
    test('should handle different input types', () => {
      expect(shannon.calculateEntropy('test')).toBeGreaterThan(0);
      expect(shannon.calculateEntropy({ prop: 'value' })).toBeGreaterThan(0);
      expect(shannon.calculateEntropy([1, 2, 3])).toBeGreaterThan(0);
    });
  });
  
  describe('transaction encoding/decoding', () => {
    test('should encode transaction to buffer', () => {
      const transaction = { id: '123', amount: 100, source: 'wallet1' };
      const encoded = shannon.encodeTransaction(transaction);
      
      expect(Buffer.isBuffer(encoded)).toBe(true);
    });
    
    test('should decode transaction correctly', () => {
      const transaction = { id: '123', amount: 100, source: 'wallet1' };
      const encoded = shannon.encodeTransaction(transaction);
      const decoded = shannon.decodeTransaction(encoded);
      
      expect(decoded).toEqual(transaction);
    });
    
    test('should maintain integrity through encode/decode cycle', () => {
      const transaction = { 
        id: '123', 
        amount: 100, 
        source: 'wallet1',
        destination: 'wallet2',
        timestamp: Date.now(),
        metadata: { category: 'payment', note: 'Invoice #4429' }
      };
      
      const decoded = shannon.decodeTransaction(shannon.encodeTransaction(transaction));
      expect(decoded).toEqual(transaction);
    });
  });
  
  describe('calculateInformationContent function', () => {
    test('should calculate information content in bits', () => {
      const transaction = { id: '123', amount: 100 };
      const content = shannon.calculateInformationContent(transaction);
      
      expect(typeof content).toBe('number');
      expect(content).toBeGreaterThan(0);
      
      // Verify larger transactions have more information content
      const largerTransaction = { 
        id: '123', 
        amount: 100,
        data: 'Additional data that increases the size' 
      };
      
      const largerContent = shannon.calculateInformationContent(largerTransaction);
      expect(largerContent).toBeGreaterThan(content);
    });
  });
  
  describe('analyzeTransactionPatterns function', () => {
    test('should return default values for empty transactions', () => {
      const result = shannon.analyzeTransactionPatterns([]);
      
      expect(result.anomalies).toEqual([]);
      expect(result.entropy).toBe(0);
      expect(result.patterns).toEqual([]);
    });
    
    test('should detect anomalies in transaction patterns', () => {
      // Normal transactions with consistent structure
      const normalTransactions = Array.from({ length: 10 }, (_, i) => ({
        source: `wallet${i % 3}`,
        destination: `wallet${(i + 1) % 3}`,
        amount: 100 + i
      }));
      
      // Anomalous transaction with unusual structure
      const anomalousTransaction = {
        source: 'wallet0',
        destination: 'wallet999',
        amount: 9999999,
        data: 'x'.repeat(1000) // Lots of redundant data to change entropy
      };
      
      const transactions = [...normalTransactions, anomalousTransaction];
      const analysis = shannon.analyzeTransactionPatterns(transactions);
      
      // Should detect at least one anomaly (our unusual transaction)
      expect(analysis.anomalies.length).toBeGreaterThan(0);
      expect(analysis.entropy).toBeGreaterThan(0);
    });
    
    test('should detect high frequency addresses', () => {
      // Create transactions where one address appears frequently
      const transactions = Array.from({ length: 10 }, (_, i) => ({
        source: 'frequentWallet', // This address will appear in all transactions
        destination: `wallet${i}`,
        amount: 100 + i
      }));
      
      const analysis = shannon.analyzeTransactionPatterns(transactions);
      
      // Should detect 'frequentWallet' as a high frequency address
      const hasFrequentWallet = analysis.patterns.some(
        pattern => pattern.type === 'high_frequency_address' && 
                 pattern.address === 'frequentWallet'
      );
      
      expect(hasFrequentWallet).toBe(true);
    });
  });
  
  describe('createChannel function', () => {
    let channel;
    
    beforeEach(() => {
      channel = shannon.createChannel(1000); // 1000 bits capacity
    });
    
    test('should create channel with specified capacity', () => {
      expect(channel.capacity).toBe(1000);
      expect(channel.noise).toBe(0);
    });
    
    test('should calculate effective capacity based on noise', () => {
      expect(channel.effectiveCapacity()).toBe(1000);
      
      channel.setNoise(0.2);
      expect(channel.noise).toBe(0.2);
      expect(channel.effectiveCapacity()).toBe(800);
    });
    
    test('should transmit message perfectly when noise is zero', () => {
      const message = { id: 'test', data: 'perfect transmission' };
      const received = channel.transmit(message);
      
      expect(received).toEqual(message);
    });
    
    test('should have chance of corrupting message with noise', () => {
      // Set very high noise to almost guarantee corruption
      channel.setNoise(1);
      
      let corruptionDetected = false;
      
      // Try multiple times as corruption is probabilistic
      for (let i = 0; i < 10; i++) {
        const message = { id: 'test', data: 'noise test'.repeat(100) };
        const received = channel.transmit(message);
        
        if (received.corrupted === true) {
          corruptionDetected = true;
          break;
        }
      }
      
      expect(corruptionDetected).toBe(true);
    });
    
    test('should clamp noise between 0 and 1', () => {
      channel.setNoise(-0.5);
      expect(channel.noise).toBe(0);
      
      channel.setNoise(1.5);
      expect(channel.noise).toBe(1);
    });
  });
});
