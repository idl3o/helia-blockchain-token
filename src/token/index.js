/**
 * Token implementation module for Helia blockchain
 * Integrates with Leibniz (cryptography) and Turing (state transitions)
 */

const { getCID, createCID, isCID, cidToString } = require('../utils/multiformats-compat');
const { ethers } = require('ethers');

/**
 * Token class represents a blockchain token
 */
class Token {
  /**
   * Creates a new token instance
   */  constructor() {
    this.storage = null;
    this.network = null;
    this.transactionHistory = []; // Add transaction history tracking
      // Initialize internal state
    this.state = {
      name: '',
      symbol: '',
      totalSupply: BigInt(0),
      decimals: 18,
      balances: new Map(),
      owner: null,
      metadata: {},
      rules: new Map()
    };
  }
  
  /**
   * Initialize the token system with storage and network interfaces
   * @param {Object} params - Initialization parameters
   * @param {Object} params.storage - Storage interface
   * @param {Object} params.network - Network interface
   * @returns {Promise<Token>} - This token instance
   */
  async initialize(params) {
    try {
      this.storage = params.storage;
      this.network = params.network;
      
      // Set up internal structures
      this.tokens = new Map();
      this.balances = new Map();
      this.totalSupply = 0;
      
      console.log('Token system initialized');
      return this;
    } catch (error) {
      console.error('Token system initialization failed:', error.message);
      throw error;
    }
  }
    /**
   * Create a new token
   * @param {Object} options - Token creation options
   * @param {string} options.name - Token name
   * @param {string} options.symbol - Token symbol
   * @param {number} options.initialSupply - Initial token supply
   * @param {Object} options.owner - Owner's wallet details
   * @returns {Object} - Created token details
   */
  async createToken(options) {
    try {
      const { name, symbol, initialSupply, owner } = options;
      
      // Generate token ID
      const tokenId = ethers.hexlify(ethers.randomBytes(32));
        // Create token metadata
      const tokenMetadata = {
        id: tokenId,
        name,
        symbol,
        totalSupply: initialSupply,
        owner: owner, // owner is already a string address
        createdAt: Date.now(),
        transactions: []
      };// Store token metadata in Helia
      const tokenBytes = new TextEncoder().encode(JSON.stringify(tokenMetadata));
      const cid = await this.storage.addBytes(tokenBytes);
      
      // Update internal data
      this.tokens.set(tokenId, {
        metadata: tokenMetadata,
        cid: cid.toString()
      });      // Update current token state
      this.state.name = name;
      this.state.symbol = symbol;
      this.state.totalSupply = BigInt(initialSupply); // Use the provided initialSupply
      this.state.owner = owner; // owner is already a string address
      this.state.metadata = tokenMetadata;
      
      // Initialize owner balance with initial supply
      this.balances.set(owner, initialSupply);
      this.totalSupply = initialSupply;
      
      console.log(`Token created: ${name} (${symbol}) with ID ${tokenId}`);
      
      // Return this token instance so tests can call methods on it
      return this;
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error('Failed to create token');
    }
  }
  /**
   * Mint new tokens to an address
   * @param {string} to - Address to mint tokens to
   * @param {number} amount - Amount to mint
   * @param {Object} options - Minting options
   * @returns {Promise<boolean>} Success status
   */
  async mint(to, amount, options = {}) {
    try {
      // Check authorization - only owner can mint
      if (options.from !== this.state.owner) {
        throw new Error('Unauthorized: Only token owner can mint');
      }

      // Convert amount to integer (quantum discretization)
      const mintAmount = Math.floor(amount);
      
      // Update balances
      const currentBalance = this.balances.get(to) || 0;
      this.balances.set(to, currentBalance + mintAmount);
      
      // Update total supply
      this.state.totalSupply += BigInt(mintAmount);
      this.totalSupply += mintAmount;
      
      // Track transaction
      this.transactionHistory.push({
        type: 'mint',
        to: to,
        amount: mintAmount,
        from: options.from,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }
  /**
   * Transfer tokens between addresses
   * @param {string} from - Source address
   * @param {string} to - Destination address
   * @param {number} amount - Amount to transfer
   * @returns {Promise<boolean>} Success status
   */  async transfer(from, to, amount) {
    try {
      // Validate that source and destination are different (Gödel's consistency)
      if (from === to) {
        throw new Error('Cannot transfer to the same address');
      }
      
      const fromBalance = this.balances.get(from) || 0;
      
      if (fromBalance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Check governance rules if they exist
      if (this.state.rules) {
        const transaction = { type: 'transfer', from, to, amount };
        for (const [ruleName, rule] of this.state.rules.entries()) {
          if (!rule.check(transaction)) {
            throw new Error(rule.message);
          }
        }
      }
      
      // Update balances
      this.balances.set(from, fromBalance - amount);
      const toBalance = this.balances.get(to) || 0;
      this.balances.set(to, toBalance + amount);
      
      // Track transaction
      this.transactionHistory.push({
        type: 'transfer',
        from: from,
        to: to,
        amount: amount,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  /**
   * Get token details
   * @param {string} tokenId - Token ID
   * @returns {Object} - Token details
   */
  async getToken(tokenId) {
    try {
      if (!this.tokens.has(tokenId)) {
        throw new Error('Token does not exist');
      }
      
      return this.tokens.get(tokenId);
    } catch (error) {
      console.error('Error getting token:', error);
      throw new Error('Failed to get token');
    }
  }

  /**
   * Get balance for an address
   * @param {string} address - Account address
   * @param {string} tokenId - Token ID
   * @returns {number} - Account balance
   */
  async getBalance(address, tokenId) {
    try {
      // Verify token exists
      if (!this.tokens.has(tokenId)) {
        throw new Error('Token does not exist');
      }
      
      return this.balances.get(address) || 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  /**
   * Get the name of the current token
   * @returns {string} Token name
   */
  getName() {
    return this.state.name;
  }

  /**
   * Get the symbol of the current token
   * @returns {string} Token symbol
   */
  getSymbol() {
    return this.state.symbol;
  }

  /**
   * Get the total supply of the current token
   * @returns {bigint} Total supply
   */
  getTotalSupply() {
    return this.state.totalSupply;
  }

  /**
   * Get the owner of the current token
   * @returns {string} Owner address
   */
  getOwner() {
    return this.state.owner;
  }

  /**
   * Get balance for an address (async version for compatibility)
   * @param {string} address - Address to check
   * @returns {Promise<bigint>} Balance as bigint
   */
  async balanceOf(address) {
    const balance = this.balances.get(address) || 0;
    return BigInt(balance);
  }
  /**
   * Get transaction history
   * @returns {Promise<Array>} Transaction history
   */
  async getTransactionHistory() {
    return [...this.transactionHistory]; // Return copy of history
  }
  /**
   * Save current token state to storage
   * @returns {Promise<string>} CID of stored state
   */
  async saveState() {
    try {
      const stateData = {
        state: {
          ...this.state,
          totalSupply: this.state.totalSupply.toString() // Convert BigInt to string
        },
        balances: Object.fromEntries(this.balances),
        totalSupply: this.totalSupply
      };
      
      const cid = await this.storage.addBytes(Buffer.from(JSON.stringify(stateData)));
      return cid.toString();
    } catch (error) {
      console.error('Error saving state:', error);
      throw error;
    }
  }

  /**
   * Add a governance rule
   * @param {string} name - Rule name
   * @param {Object} rule - Rule definition
   */
  async addRule(name, rule) {
    if (!this.state.rules) {
      this.state.rules = new Map();
    }
    this.state.rules.set(name, rule);
  }
  /**
   * Clear all governance rules
   */
  async clearRules() {
    this.state.rules = new Map();
  }

  /**
   * Get transaction statistics using Shannon entropy
   * @returns {Promise<Object>} Statistics including entropy
   */
  async getTransactionStatistics() {
    const history = await this.getTransactionHistory();
    
    // Calculate Shannon entropy based on transaction types
    const typeCounts = {};
    let totalAmount = 0;
    
    history.forEach(tx => {
      typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;
      totalAmount += tx.amount || 0;
    });
    
    let entropy = 0;
    const total = history.length;
    
    if (total > 0) {
      Object.values(typeCounts).forEach(count => {
        const probability = count / total;
        entropy -= probability * Math.log2(probability);
      });
    }
    
    // Calculate patterns (simple analysis)
    const patterns = {
      mostActiveAddress: null,
      averageTimeBetweenTx: 0
    };
    
    if (history.length > 1) {
      const timeGaps = [];
      for (let i = 1; i < history.length; i++) {
        timeGaps.push(history[i].timestamp - history[i-1].timestamp);
      }
      patterns.averageTimeBetweenTx = timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length;
    }
    
    return {
      totalTransactions: history.length,
      entropy: entropy,
      averageAmount: total > 0 ? totalAmount / total : 0,
      typeDistribution: typeCounts,
      patterns: patterns
    };
  }

  /**
   * Load a token from storage by CID
   * @param {string} cid - Token CID to load
   * @returns {Promise<Token>} - Token instance
   */
  async loadToken(cid) {
    try {
      const tokenBytes = await this.storage.getBytes(cid);
      const tokenMetadata = JSON.parse(new TextDecoder().decode(tokenBytes));
      
      // Update current token state
      this.state.name = tokenMetadata.name;
      this.state.symbol = tokenMetadata.symbol;
      this.state.totalSupply = BigInt(tokenMetadata.totalSupply || 0);
      this.state.owner = tokenMetadata.owner;
      this.state.metadata = tokenMetadata;
      
      return this;
    } catch (error) {
      console.error('Error loading token:', error);
      throw new Error('Failed to load token');
    }
  }
}

module.exports = new Token();
