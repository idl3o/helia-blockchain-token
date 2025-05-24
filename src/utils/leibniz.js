/**
 * leibniz.js - Binary mathematics for blockchain operations
 * 
 * Inspired by Gottfried Wilhelm Leibniz, who developed binary mathematics and saw
 * binary as representing creation (1) and void (0). This module implements 
 * cryptographic and mathematical operations essential for blockchain functionality.
 * 
 * @see Related modules:
 * - {@link ../planck.js} - Quantum principles for token discretization
 * - {@link ../godel.js} - Consistency verification for transactions
 * - {@link ../shannon.js} - Information theory for transaction analysis
 * - {@link ../index.js} - Navigation between philosophical concepts
 */

const crypto = require('crypto');

/**
 * Generates a deterministic hash from input using Leibniz-inspired approach
 * @param {Object|string|Buffer} data - Data to hash
 * @returns {string} - Resulting hash
 */
function monadHash(data) {
  const input = typeof data === 'object' && !(data instanceof Buffer)
    ? JSON.stringify(data, (key, value) => {
        // Handle BigInt serialization
        return typeof value === 'bigint' ? value.toString() : value;
      })
    : data;
  
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Creates a unique identifier using binary principles
 * @returns {string} - Unique identifier
 */
function createUniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Leibniz-inspired binary verification system
 * Verifies if a signature is valid for given data
 * @param {string} publicKey - Public key
 * @param {string} signature - Signature to verify
 * @param {Object|string|Buffer} data - Original data
 * @returns {boolean} - Whether signature is valid
 */
function verifySignature(publicKey, signature, data) {
  try {
    const input = typeof data === 'object' && !(data instanceof Buffer)
      ? JSON.stringify(data, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        )
      : data;
    
    const verify = crypto.createVerify('SHA256');
    verify.update(input);
    return verify.verify(publicKey, Buffer.from(signature, 'hex'));
  } catch (error) {
    console.error('Verification error:', error.message);
    return false;
  }
}

/**
 * Creates a digital signature for data
 * @param {string} privateKey - Private key
 * @param {Object|string|Buffer} data - Data to sign
 * @returns {string} - Digital signature
 */
function createSignature(privateKey, data) {
  try {
    // Handle BigInt serialization
    const input = typeof data === 'object' && !(data instanceof Buffer)
      ? JSON.stringify(data, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        )
      : data;
    
    const sign = crypto.createSign('SHA256');
    sign.update(input);
    return sign.sign(privateKey).toString('hex');
  } catch (error) {
    throw new Error(`Signature creation failed: ${error.message}`);
  }
}

/**
 * Creates a key pair for cryptographic operations
 * @returns {Object} - Object containing public and private keys
 */
function createKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  return { publicKey, privateKey };
}

module.exports = {
  monadHash,
  createUniqueId,
  verifySignature,
  createSignature,
  createKeyPair
};
