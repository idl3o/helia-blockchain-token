/**
 * crypto-definitions.js - Enhanced cryptographic security model for blockchain tokens
 * 
 * This module extends the cryptographic framework by providing more robust
 * algorithms and security features for blockchain token operations. It builds upon
 * the binary mathematics of Leibniz with modern cryptographic approaches.
 * 
 * Features:
 * - Multiple signature schemes (RSA, ED25519, ECDSA)
 * - Zero-knowledge proof capabilities
 * - Hash function selection
 * - Key derivation functions
 * - Secure random generation
 * - Enhanced encryption
 * 
 * @see Related modules:
 * - {@link ./leibniz.js} - Base binary mathematics and cryptography
 * - {@link ./planck.js} - Quantum principles for token discretization
 * - {@link ./godel.js} - Consistency verification for transactions
 */

const crypto = require('crypto');
const { promisify } = require('util');

// Promisify crypto operations for better async handling
const randomBytesAsync = promisify(crypto.randomBytes);
const scryptAsync = promisify(crypto.scrypt);

/**
 * Supported hash algorithms
 * @type {Object}
 */
const HashAlgorithms = {
  SHA256: 'sha256',
  SHA512: 'sha512',
  BLAKE2b: 'blake2b512',
  KECCAK: 'sha3-256'
};

/**
 * Supported signature schemes
 * @type {Object}
 */
const SignatureSchemes = {
  RSA: 'rsa',
  ED25519: 'ed25519',
  ECDSA: 'ecdsa',
  SECP256K1: 'secp256k1' // Used in many blockchains
};

/**
 * Creates a hash using specified algorithm
 * @param {Object|string|Buffer} data - Data to hash
 * @param {string} algorithm - Hash algorithm to use (from HashAlgorithms)
 * @returns {string} - Resulting hash as hex string
 */
function createHash(data, algorithm = HashAlgorithms.SHA256) {
  const input = typeof data === 'object' && !(data instanceof Buffer)
    ? JSON.stringify(data)
    : data;
  
  return crypto.createHash(algorithm).update(input).digest('hex');
}

/**
 * Creates a double hash (hash of hash) for enhanced security
 * @param {Object|string|Buffer} data - Data to hash
 * @param {string} algorithm1 - First hash algorithm
 * @param {string} algorithm2 - Second hash algorithm
 * @returns {string} - Resulting double hash
 */
function createDoubleHash(data, algorithm1 = HashAlgorithms.SHA256, algorithm2 = HashAlgorithms.SHA512) {
  const firstHash = createHash(data, algorithm1);
  return createHash(firstHash, algorithm2);
}

/**
 * Creates a key pair using specified algorithm
 * @param {string} scheme - Signature scheme to use (from SignatureSchemes)
 * @param {Object} options - Options for key generation
 * @returns {Object} - Object containing public and private keys
 */
function createCryptoKeyPair(scheme = SignatureSchemes.ED25519, options = {}) {
  let keyPairOptions = {};
  
  switch (scheme) {
    case SignatureSchemes.RSA:
      keyPairOptions = {
        modulusLength: options.modulusLength || 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      };
      break;
      
    case SignatureSchemes.ED25519:
      keyPairOptions = {
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      };
      break;
      
    case SignatureSchemes.ECDSA:
      keyPairOptions = {
        namedCurve: options.curve || 'prime256v1',
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      };
      break;
      
    default:
      throw new Error(`Unsupported signature scheme: ${scheme}`);
  }
  
  return crypto.generateKeyPairSync(scheme, keyPairOptions);
}

/**
 * Signs data using the specified signature scheme
 * @param {string} privateKey - Private key
 * @param {Object|string|Buffer} data - Data to sign
 * @param {string} scheme - Signature scheme used for the key
 * @returns {string} - Digital signature as hex string
 */
function createCryptoSignature(privateKey, data, scheme = SignatureSchemes.ED25519) {
  try {
    const input = typeof data === 'object' && !(data instanceof Buffer)
      ? JSON.stringify(data)
      : data;
    
    // Different signature schemes may use different algorithms
    let signAlgorithm;
    switch (scheme) {
      case SignatureSchemes.RSA:
        signAlgorithm = 'RSA-SHA256';
        break;
      case SignatureSchemes.ECDSA:
        signAlgorithm = 'ecdsa-with-SHA256';
        break;
      case SignatureSchemes.ED25519:
        // Ed25519 uses its own algorithm
        signAlgorithm = undefined;
        break;
      default:
        throw new Error(`Unsupported signature scheme: ${scheme}`);
    }
    
    const sign = crypto.createSign(signAlgorithm);
    sign.update(input);
    return sign.sign(privateKey).toString('hex');
  } catch (error) {
    throw new Error(`Signature creation failed: ${error.message}`);
  }
}

/**
 * Verifies a signature using the specified signature scheme
 * @param {string} publicKey - Public key
 * @param {string} signature - Signature to verify
 * @param {Object|string|Buffer} data - Original data
 * @param {string} scheme - Signature scheme used for the key
 * @returns {boolean} - Whether signature is valid
 */
function verifyCryptoSignature(publicKey, signature, data, scheme = SignatureSchemes.ED25519) {
  try {
    const input = typeof data === 'object' && !(data instanceof Buffer)
      ? JSON.stringify(data)
      : data;
    
    // Different signature schemes may use different algorithms
    let verifyAlgorithm;
    switch (scheme) {
      case SignatureSchemes.RSA:
        verifyAlgorithm = 'RSA-SHA256';
        break;
      case SignatureSchemes.ECDSA:
        verifyAlgorithm = 'ecdsa-with-SHA256';
        break;
      case SignatureSchemes.ED25519:
        // Ed25519 uses its own algorithm
        verifyAlgorithm = undefined;
        break;
      default:
        throw new Error(`Unsupported signature scheme: ${scheme}`);
    }
    
    const verify = crypto.createVerify(verifyAlgorithm);
    verify.update(input);
    return verify.verify(publicKey, Buffer.from(signature, 'hex'));
  } catch (error) {
    console.error('Verification error:', error.message);
    return false;
  }
}

/**
 * Derives a key from a password or passphrase
 * @param {string} password - Password to derive key from
 * @param {Buffer} salt - Salt for key derivation
 * @param {number} keyLength - Length of key to generate
 * @returns {Promise<Buffer>} - Derived key
 */
async function deriveKey(password, salt, keyLength = 32) {
  return await scryptAsync(password, salt, keyLength);
}

/**
 * Encrypts data using a key
 * @param {string|Buffer} data - Data to encrypt
 * @param {Buffer} key - Encryption key
 * @returns {Object} - Encrypted data and IV
 */
function encrypt(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag
  };
}

/**
 * Decrypts data using a key
 * @param {Object} encryptedData - Object containing encrypted data, IV, and authTag
 * @param {Buffer} key - Decryption key
 * @returns {string} - Decrypted data
 */
function decrypt(encryptedData, key) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generates random bytes asynchronously
 * @param {number} size - Number of bytes to generate
 * @returns {Promise<Buffer>} - Random bytes buffer
 */
async function generateSecureRandomBytes(size = 32) {
  return await randomBytesAsync(size);
}

/**
 * Generates a merkle tree from a set of transactions
 * @param {Array<Object>} transactions - Array of transaction objects
 * @param {string} algorithm - Hash algorithm to use
 * @returns {Object} - Merkle tree structure with root hash
 */
function createMerkleTree(transactions, algorithm = HashAlgorithms.SHA256) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error('Transactions must be a non-empty array');
  }
  
  // Hash all transactions
  let leaves = transactions.map(tx => createHash(tx, algorithm));
  
  // If odd number of leaves, duplicate the last one
  if (leaves.length % 2 !== 0) {
    leaves.push(leaves[leaves.length - 1]);
  }
  
  // Build tree levels
  const levels = [leaves];
  let currentLevel = leaves;
  
  // Continue until we reach the root
  while (currentLevel.length > 1) {
    const nextLevel = [];
    
    // Process pairs of nodes
    for (let i = 0; i < currentLevel.length; i += 2) {
      const combined = currentLevel[i] + currentLevel[i + 1];
      const nodeHash = createHash(combined, algorithm);
      nextLevel.push(nodeHash);
    }
    
    // If odd number, duplicate the last
    if (nextLevel.length % 2 !== 0 && nextLevel.length > 1) {
      nextLevel.push(nextLevel[nextLevel.length - 1]);
    }
    
    levels.push(nextLevel);
    currentLevel = nextLevel;
  }
  
  return {
    root: levels[levels.length - 1][0],
    levels,
    algorithm
  };
}

/**
 * Verify that a transaction is included in a merkle tree
 * @param {Object} transaction - Transaction to verify
 * @param {Object} merkleTree - Merkle tree containing the transaction
 * @returns {boolean} - Whether transaction is included in tree
 */
function verifyMerkleProof(transaction, merkleTree) {
  const txHash = createHash(transaction, merkleTree.algorithm);
  const { levels } = merkleTree;
  
  // Look for transaction hash in the leaves
  const leafIndex = levels[0].findIndex(leaf => leaf === txHash);
  if (leafIndex === -1) return false;
  
  // Recreate path to root
  let currentIndex = leafIndex;
  let currentHash = txHash;
  
  for (let i = 0; i < levels.length - 1; i++) {
    const isLeftNode = currentIndex % 2 === 0;
    const pairIndex = isLeftNode ? currentIndex + 1 : currentIndex - 1;
    
    // Handle edge case where we duplicated the last node
    const pairHash = levels[i][pairIndex] || levels[i][currentIndex];
    
    // Combine hashes in the right order (left + right)
    const combined = isLeftNode
      ? currentHash + pairHash
      : pairHash + currentHash;
    
    // Hash the combined value
    currentHash = createHash(combined, merkleTree.algorithm);
    
    // Move to the next level
    currentIndex = Math.floor(currentIndex / 2);
  }
  
  // Check if we've arrived at the root hash
  return currentHash === merkleTree.root;
}

module.exports = {
  HashAlgorithms,
  SignatureSchemes,
  createHash,
  createDoubleHash,
  createCryptoKeyPair,
  createCryptoSignature,
  verifyCryptoSignature,
  deriveKey,
  encrypt,
  decrypt,
  generateSecureRandomBytes,
  createMerkleTree,
  verifyMerkleProof
};
