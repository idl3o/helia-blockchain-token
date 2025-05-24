/**
 * shannon.js - Information theory applied to token transactions
 * 
 * Inspired by Claude Shannon's information theory, this module provides
 * entropy calculations, transaction encoding, and information measurement
 * for blockchain operations.
 * 
 * @see Related modules:
 * - {@link ../leibniz.js} - Binary mathematics for data representation
 * - {@link ../turing.js} - Computational model for information processing
 * - {@link ../index.js} - Navigation between philosophical concepts
 */

/**
 * Calculates the entropy of a transaction or dataset
 * Higher entropy indicates more randomness/uniqueness
 * @param {Object|Array} data - Data to analyze
 * @returns {number} - Entropy value
 */
function calculateEntropy(data) {
  // Convert data to string for analysis
  const str = typeof data === 'object' 
    ? JSON.stringify(data, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ) 
    : String(data);
  const len = str.length;
  
  // Count frequency of each character
  const frequencies = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  // Calculate entropy using Shannon's formula: H = -∑(p(x) * log₂(p(x)))
  let entropy = 0;
  for (const char in frequencies) {
    const probability = frequencies[char] / len;
    entropy -= probability * (Math.log(probability) / Math.log(2));
  }
  
  return entropy;
}

/**
 * Encodes transaction data efficiently
 * @param {Object} transaction - Transaction to encode
 * @returns {Buffer} - Encoded transaction
 */
function encodeTransaction(transaction) {
  // Simple implementation using JSON
  // In a production system, this could use more efficient encoding
  // based on Shannon's source coding theorem
  return Buffer.from(JSON.stringify(transaction, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));
}

/**
 * Decodes transaction data
 * @param {Buffer} encoded - Encoded transaction
 * @returns {Object} - Decoded transaction
 */
function decodeTransaction(encoded) {
  return JSON.parse(encoded.toString());
}

/**
 * Calculates the information content of a transaction in bits
 * @param {Object} transaction - Transaction to measure
 * @returns {number} - Information content in bits
 */
function calculateInformationContent(transaction) {
  const encoded = encodeTransaction(transaction);
  return encoded.length * 8; // Convert bytes to bits
}

/**
 * Analyzes transaction patterns to detect anomalies
 * Based on expected information patterns
 * @param {Array} transactions - Array of transactions
 * @returns {Object} - Analysis results
 */
function analyzeTransactionPatterns(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { anomalies: [], entropy: 0, patterns: [] };
  }
  
  const anomalies = [];
  const entropies = transactions.map(calculateEntropy);
  const avgEntropy = entropies.reduce((sum, val) => sum + val, 0) / entropies.length;
  
  // Detect anomalies based on entropy deviation
  const stdDev = Math.sqrt(
    entropies.reduce((sum, val) => sum + Math.pow(val - avgEntropy, 2), 0) / entropies.length
  );
  
  entropies.forEach((entropy, index) => {
    // Transactions with entropy significantly different from average are flagged
    if (Math.abs(entropy - avgEntropy) > stdDev * 2) {
      anomalies.push({
        index,
        transaction: transactions[index],
        entropy,
        reason: entropy > avgEntropy ? 'Unusually high entropy' : 'Unusually low entropy'
      });
    }
  });
  
  // Find recurring patterns (simplified approach)
  const patterns = findRecurringPatterns(transactions);
  
  return {
    anomalies,
    entropy: avgEntropy,
    standardDeviation: stdDev,
    patterns
  };
}

/**
 * Helper function to find recurring transaction patterns
 * @param {Array} transactions - Transactions to analyze
 * @returns {Array} - Detected patterns
 * @private
 */
function findRecurringPatterns(transactions) {
  // This is a simplified implementation
  // A real implementation would use more sophisticated pattern recognition
  
  const patterns = [];
  const addressFrequency = {};
  
  // Track address frequencies
  transactions.forEach(tx => {
    if (tx.source) {
      addressFrequency[tx.source] = (addressFrequency[tx.source] || 0) + 1;
    }
    if (tx.destination) {
      addressFrequency[tx.destination] = (addressFrequency[tx.destination] || 0) + 1;
    }
  });
  
  // Find addresses with high frequency
  for (const [address, frequency] of Object.entries(addressFrequency)) {
    if (frequency > transactions.length * 0.2) { // 20% threshold
      patterns.push({
        type: 'high_frequency_address',
        address,
        frequency,
        percentage: (frequency / transactions.length) * 100
      });
    }
  }
  
  return patterns;
}

/**
 * Creates a communication channel for token transactions
 * @param {number} capacity - Channel capacity in bits
 * @returns {Object} - Communication channel object
 */
function createChannel(capacity) {
  return {
    capacity,
    noise: 0,
    
    /**
     * Sets the noise level for the channel
     * @param {number} level - Noise level (0-1)
     */
    setNoise(level) {
      this.noise = Math.max(0, Math.min(1, level));
    },
    
    /**
     * Calculates effective capacity with noise
     * @returns {number} - Effective capacity
     */
    effectiveCapacity() {
      return this.capacity * (1 - this.noise);
    },
    
    /**
     * Simulates sending a message through the channel
     * @param {Object} message - Message to send
     * @returns {Object} - Received message (possibly with errors)
     */
    transmit(message) {
      const encoded = encodeTransaction(message);
      
      // Simulate channel noise
      if (this.noise > 0) {
        const bitErrorRate = this.noise;
        const byteLength = encoded.length;
        
        // Randomly flip bits based on noise level
        for (let i = 0; i < byteLength; i++) {
          if (Math.random() < bitErrorRate) {
            // Flip a random bit in this byte
            const bitToFlip = Math.floor(Math.random() * 8);
            encoded[i] = encoded[i] ^ (1 << bitToFlip);
          }
        }
      }
      
      // Try to decode, but handle errors from potential corruption
      try {
        return decodeTransaction(encoded);
      } catch (error) {
        return { error: 'Transmission error', corrupted: true };
      }
    }
  };
}

module.exports = {
  calculateEntropy,
  encodeTransaction,
  decodeTransaction,
  calculateInformationContent,
  analyzeTransactionPatterns,
  createChannel
};
