/**
 * Test setup utilities for Helia Blockchain Token
 */

const utils = require('../../src/utils');
const fixtures = require('./fixtures');
const { createStorage } = require('../mocks/storage-mock');
const { createNetwork } = require('../mocks/network-mock');

/**
 * Sets up the test environment for token testing
 * @returns {Promise<Object>} Test environment
 */
async function setupTokenTestEnvironment() {
  const testFixtures = fixtures.createTokenFixtures();
  const initialState = fixtures.createInitialTokenState(testFixtures);
  const mockHelia = await fixtures.createMockHelia();
  const mockStorage = await createStorage(mockHelia);
  const mockNetwork = await createNetwork();
  
  return {
    fixtures: testFixtures,
    initialState,
    helia: mockHelia,
    storage: mockStorage,
    network: mockNetwork,
    utils
  };
}

/**
 * Creates a test transaction with given parameters
 * @param {Object} params - Transaction parameters
 * @returns {Object} Test transaction
 */
function createTestTransaction(params) {
  return {
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    ...params
  };
}

/**
 * Simulates a delay to mimic async operations
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a transaction chain for testing
 * @param {Object} fixtures - Test fixtures
 * @param {number} count - Number of transactions to create
 * @returns {Array<Object>} Chain of transactions
 */
function createTransactionChain(fixtures, count = 5) {
  const chain = [];
  const walletAddresses = Object.values(fixtures.wallets).map(w => w.address);
  
  for (let i = 0; i < count; i++) {
    const sourceIndex = i % walletAddresses.length;
    const destIndex = (i + 1) % walletAddresses.length;
    
    chain.push({
      type: 'transfer',
      source: walletAddresses[sourceIndex],
      destination: walletAddresses[destIndex],
      amount: 10 + i,
      timestamp: Date.now() + i * 1000
    });
  }
  
  return chain;
}

module.exports = {
  setupTokenTestEnvironment,
  createTestTransaction,
  delay,
  createTransactionChain
};
