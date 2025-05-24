/**
 * Test helpers and fixtures for Helia Blockchain Token testing
 */

// Use mock implementations for tests instead of actual Helia
const crypto = require('crypto');

// Mock Helia and UnixFS for testing
const mockHelia = {
  blockstore: {
    put: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue({})
  },
  dag: {
    get: jest.fn().mockResolvedValue({}),
    put: jest.fn().mockResolvedValue({})
  }
};

// Mock the createHelia function
const createHelia = jest.fn().mockResolvedValue(mockHelia);

// Mock UnixFS
const unixfs = {
  createPath: jest.fn(),
  addBytes: jest.fn().mockResolvedValue('QmTestCID'),
  cat: jest.fn().mockResolvedValue(Buffer.from('test data'))
};

/**
 * Creates test fixtures for token operations
 * @returns {Object} Test fixtures
 */
function createTokenFixtures() {
  const wallets = {
    wallet1: {
      name: 'Alice',
      address: 'wallet_' + crypto.randomBytes(8).toString('hex'),
      initialBalance: 1000
    },
    wallet2: {
      name: 'Bob',
      address: 'wallet_' + crypto.randomBytes(8).toString('hex'),
      initialBalance: 500
    },
    wallet3: {
      name: 'Charlie',
      address: 'wallet_' + crypto.randomBytes(8).toString('hex'),
      initialBalance: 0
    }
  };

  const transactions = {
    valid: {
      transfer: {
        type: 'transfer',
        source: wallets.wallet1.address,
        destination: wallets.wallet2.address,
        amount: 100,
        timestamp: Date.now()
      },
      mint: {
        type: 'mint',
        destination: wallets.wallet3.address,
        amount: 250,
        timestamp: Date.now()
      }
    },
    invalid: {
      insufficientFunds: {
        type: 'transfer',
        source: wallets.wallet3.address,
        destination: wallets.wallet1.address,
        amount: 100,
        timestamp: Date.now()
      },
      selfTransfer: {
        type: 'transfer',
        source: wallets.wallet1.address,
        destination: wallets.wallet1.address,
        amount: 50,
        timestamp: Date.now()
      },
      negativeAmount: {
        type: 'transfer',
        source: wallets.wallet1.address,
        destination: wallets.wallet2.address,
        amount: -50,
        timestamp: Date.now()
      }
    }
  };

  return {
    wallets,
    transactions
  };
}

/**
 * Creates a mock Helia node for testing
 * @returns {Promise<Object>} Mock Helia node
 */
async function createMockHelia() {
  // Storage map for mock data
  const mockStorage = new Map();
  
  // Create a mock Helia instance with more complete API
  return {
    blockstore: {
      put: async (cid, bytes) => {
        mockStorage.set(cid.toString(), bytes);
        return cid;
      },
      get: async (cid) => {
        const data = mockStorage.get(cid.toString());
        if (!data) throw new Error(`CID not found: ${cid}`);
        return data;
      },
      has: async (cid) => {
        return mockStorage.has(cid.toString());
      }
    },
    dag: {
      get: async (cid) => {
        const data = mockStorage.get(cid.toString());
        return { value: data || {} };
      },
      put: async (data) => {
        const cid = 'Qm' + crypto.randomBytes(32).toString('hex');
        mockStorage.set(cid, data);
        return { cid };
      }
    },
    pins: {
      add: jest.fn().mockResolvedValue(true),
      rm: jest.fn().mockResolvedValue(true),
      ls: jest.fn().mockResolvedValue([])
    }
  };
}

/**
 * Creates a test token state with balances
 * @param {Object} fixtures - Test fixtures
 * @returns {Object} Initial token state
 */
function createInitialTokenState(fixtures) {
  const balances = {};
  
  Object.values(fixtures.wallets).forEach(wallet => {
    balances[wallet.address] = wallet.initialBalance;
  });
  
  return {
    balances,
    totalSupply: Object.values(balances).reduce((sum, val) => sum + val, 0),
    metadata: {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 0
    }
  };
}

module.exports = {
  createTokenFixtures,
  createMockHelia,
  createInitialTokenState
};
