/**
 * godel.js - Consistency and completeness verification for blockchain transactions
 * 
 * Inspired by Kurt Gödel's incompleteness theorems, this module handles
 * validation logic to ensure the blockchain system maintains consistency
 * despite potential paradoxes or contradictions in transaction history.
 * 
 * @see Related modules:
 * - {@link ../leibniz.js} - Binary mathematics for cryptographic proofs
 * - {@link ../aristotle.js} - Logical frameworks for categorization
 * - {@link ../turing.js} - Computational model for state transitions
 * - {@link ../index.js} - Navigation between philosophical concepts
 */

const { monadHash } = require('./leibniz');

/**
 * Represents a verification system for ensuring transaction consistency
 */
class GodelVerifier {
  constructor(rules = []) {
    this.rules = rules;
    this.proofHistory = new Map();
  }

  /**
   * Adds a consistency rule to the verifier
   * @param {Function} ruleFn - Rule function that returns boolean
   * @param {string} description - Description of the rule
   */
  addRule(ruleFn, description) {
    this.rules.push({
      check: ruleFn,
      description
    });
  }

  /**
   * Verifies a transaction against all consistency rules
   * @param {Object} transaction - Transaction to verify
   * @returns {Object} - Result containing success status and any errors
   */
  verifyTransaction(transaction) {
    const errors = [];
    let isValid = true;

    // Create a unique proof identifier for this transaction
    const proofId = monadHash(transaction);
    
    // Check for self-reference (Gödel's inspired)
    if (this._containsSelfReference(transaction)) {
      errors.push('Transaction contains paradoxical self-reference');
      isValid = false;
    }

    // Apply all validation rules
    for (const rule of this.rules) {
      try {
        const ruleResult = rule.check(transaction, this.proofHistory);
        if (!ruleResult) {
          errors.push(`Failed rule: ${rule.description}`);
          isValid = false;
        }
      } catch (error) {
        errors.push(`Rule error (${rule.description}): ${error.message}`);
        isValid = false;
      }
    }

    // Record proof in history if valid
    if (isValid) {
      this.proofHistory.set(proofId, {
        transaction,
        timestamp: Date.now()
      });
    }

    return {
      isValid,
      errors: errors.length > 0 ? errors : null,
      proofId
    };
  }

  /**
   * Checks for logical paradoxes or self-references in transaction
   * Inspired by Gödel's work on self-referential formulas
   * @param {Object} transaction - Transaction to check
   * @returns {boolean} - Whether transaction contains self-reference
   * @private
   */
  _containsSelfReference(transaction) {
    // Check if transaction references its own hash (impossible normally)
    if (transaction.hash && transaction.data && 
        JSON.stringify(transaction.data).includes(transaction.hash)) {
      return true;
    }
    
    // Check for circular references that would create logical inconsistencies
    if (transaction.source === transaction.destination && 
        transaction.amount > 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Gets the proof history for auditing and verification
   * @returns {Array} - Array of proof records
   */
  getProofHistory() {
    return Array.from(this.proofHistory.values());
  }

  /**
   * Clears the proof history
   */
  clearProofHistory() {
    this.proofHistory.clear();
  }
}

// Common validation rules
const commonRules = [
  {
    check: (tx) => tx && typeof tx === 'object',
    description: 'Transaction must be a valid object'
  },
  {
    check: (tx) => tx.amount !== undefined && tx.amount >= 0,
    description: 'Transaction must have a non-negative amount'
  },
  {
    check: (tx) => tx.source && typeof tx.source === 'string',
    description: 'Transaction must have a valid source identifier'
  },
  {
    check: (tx) => tx.destination && typeof tx.destination === 'string',
    description: 'Transaction must have a valid destination identifier'
  }
];

/**
 * Creates a pre-configured Gödel verifier with common rules
 * @returns {GodelVerifier} - Configured verifier
 */
function createVerifier() {
  const verifier = new GodelVerifier();
  
  commonRules.forEach(rule => {
    verifier.addRule(rule.check, rule.description);
  });
  
  return verifier;
}

module.exports = {
  GodelVerifier,
  createVerifier,
  commonRules
};
