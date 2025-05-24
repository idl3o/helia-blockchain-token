/**
 * Tests for the core token implementation
 */

const { setupTokenTestEnvironment } = require('../helpers/setup');
const tokenImplementation = require('../../src/token');

describe('Token Implementation Tests', () => {
  let env, fixtures, utils, storage, network;
  
  beforeAll(async () => {
    env = await setupTokenTestEnvironment();
    fixtures = env.fixtures;
    utils = env.utils;
    storage = env.storage;
    network = env.network;
    
    // Initialize the token system with mock storage and network
    await tokenImplementation.initialize({
      storage: storage,
      network: network
    });
  });
    describe('Token Operations', () => {
    let token;
    
    beforeEach(async () => {
      // Create a fresh token for each test
      token = await tokenImplementation.createToken({
        name: "Philosophical Token",
        symbol: "PHT",
        initialSupply: 10000,
        owner: fixtures.wallets.wallet1.address
      });
      
      // Clear any existing rules to prevent test interference
      await token.clearRules();
    });
    
    test('should initialize with correct metadata', () => {
      expect(token.getName()).toBe("Philosophical Token");
      expect(token.getSymbol()).toBe("PHT");
      expect(token.getTotalSupply()).toBe(10000n);
      expect(token.getOwner()).toBe(fixtures.wallets.wallet1.address);
    });
    
    test('should mint tokens when authorized', async () => {
      const initialSupply = token.getTotalSupply();
      
      await token.mint(fixtures.wallets.wallet2.address, 500, {
        from: fixtures.wallets.wallet1.address // authorized owner
      });
      
      expect(token.getTotalSupply()).toBe(initialSupply + 500n);
      expect(await token.balanceOf(fixtures.wallets.wallet2.address)).toBe(500n);
    });
    
    test('should transfer tokens between accounts', async () => {
      // Initial minting to wallet1
      await token.mint(fixtures.wallets.wallet1.address, 1000, {
        from: fixtures.wallets.wallet1.address
      });
      
      const initialBalance1 = await token.balanceOf(fixtures.wallets.wallet1.address);
      const initialBalance2 = await token.balanceOf(fixtures.wallets.wallet2.address);
      
      // Transfer from wallet1 to wallet2
      await token.transfer(
        fixtures.wallets.wallet1.address, 
        fixtures.wallets.wallet2.address, 
        300
      );
      
      // Check updated balances
      expect(await token.balanceOf(fixtures.wallets.wallet1.address)).toBe(initialBalance1 - 300n);
      expect(await token.balanceOf(fixtures.wallets.wallet2.address)).toBe(initialBalance2 + 300n);
    });
    
    test('should store transaction history', async () => {
      // Perform transactions
      await token.mint(fixtures.wallets.wallet1.address, 500, {
        from: fixtures.wallets.wallet1.address
      });
      
      await token.transfer(
        fixtures.wallets.wallet1.address,
        fixtures.wallets.wallet2.address,
        200
      );
      
      const history = await token.getTransactionHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[0].type).toBe('mint');
      expect(history[1].type).toBe('transfer');
    });
      test('should enforce philosophical rules', async () => {
      // Test that quantum discretization is enforced
      const amountWithDecimals = 123.456;
      await token.mint(fixtures.wallets.wallet1.address, amountWithDecimals, {
        from: fixtures.wallets.wallet1.address
      });
      
      // Should be quantized to 123 and added to existing balance (10000 + 123 = 10123)
      expect(await token.balanceOf(fixtures.wallets.wallet1.address)).toBe(10123n);
      
      // Test that Gödel's consistency is enforced
      const invalidTransfer = token.transfer(
        fixtures.wallets.wallet1.address,
        fixtures.wallets.wallet1.address, // Same source and destination
        50
      );
      
      await expect(invalidTransfer).rejects.toThrow();
    });
  });
  
  describe('Token Storage Integration', () => {
    let token;
    
    beforeEach(async () => {
      token = await tokenImplementation.createToken({
        name: "Storage Test Token",
        symbol: "STT",
        initialSupply: 1000,
        owner: fixtures.wallets.wallet1.address
      });
    });
    
    test('should persist token state to storage', async () => {
      // Distribute tokens
      await token.mint(fixtures.wallets.wallet1.address, 500, {
        from: fixtures.wallets.wallet1.address
      });
      
      await token.transfer(
        fixtures.wallets.wallet1.address,
        fixtures.wallets.wallet2.address,
        200
      );
      
      // Save state to storage
      const cid = await token.saveState();
      expect(cid).toBeDefined();
      
      // Create a new token instance and load the state
      const loadedToken = await tokenImplementation.loadToken(cid);
      
      // Verify the state was loaded correctly
      expect(loadedToken.getName()).toBe("Storage Test Token");
      expect(loadedToken.getSymbol()).toBe("STT");
      expect(await loadedToken.balanceOf(fixtures.wallets.wallet1.address)).toBe(300n);
      expect(await loadedToken.balanceOf(fixtures.wallets.wallet2.address)).toBe(200n);
    });
  });
  
  describe('Philosophical Token Governance', () => {
    let token;
    
    beforeEach(async () => {
      token = await tokenImplementation.createToken({
        name: "Governance Token",
        symbol: "GOV",
        initialSupply: 0,
        owner: fixtures.wallets.wallet1.address
      });
    });
    
    test('should enforce transaction rules', async () => {
      // Add initial tokens
      await token.mint(fixtures.wallets.wallet1.address, 1000, {
        from: fixtures.wallets.wallet1.address
      });
      
      // Add a minimum transfer rule
      await token.addRule('MinimumTransfer', {
        check: (tx) => tx.type === 'transfer' && tx.amount >= 100n,
        message: 'Transfers must be at least 100 tokens'
      });
      
      // Valid transfer (meets minimum)
      const validTransfer = token.transfer(
        fixtures.wallets.wallet1.address,
        fixtures.wallets.wallet2.address,
        100
      );
      await expect(validTransfer).resolves.not.toThrow();
      
      // Invalid transfer (below minimum)
      const invalidTransfer = token.transfer(
        fixtures.wallets.wallet1.address,
        fixtures.wallets.wallet2.address,
        50
      );
      await expect(invalidTransfer).rejects.toThrow(/at least 100 tokens/);
    });
    
    test('should calculate token statistics using Shannon entropy', async () => {
      // Generate some transaction activity
      await token.mint(fixtures.wallets.wallet1.address, 1000, {
        from: fixtures.wallets.wallet1.address
      });
      
      for (let i = 0; i < 5; i++) {
        await token.transfer(
          fixtures.wallets.wallet1.address,
          fixtures.wallets.wallet2.address,
          100 + i * 10
        );
        
        if (i % 2 === 0) {
          await token.transfer(
            fixtures.wallets.wallet2.address,
            fixtures.wallets.wallet3.address,
            50 + i * 5
          );
        }
      }
      
      // Calculate transaction statistics
      const stats = await token.getTransactionStatistics();
      
      expect(stats.totalTransactions).toBeGreaterThan(5);
      expect(stats.entropy).toBeGreaterThan(0);
      expect(stats.averageAmount).toBeGreaterThan(0);
      expect(stats.patterns).toBeDefined();
    });
  });
});
