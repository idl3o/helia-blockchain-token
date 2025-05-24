/**
 * Tests for the Helia IPFS storage integration
 */

const { setupTokenTestEnvironment } = require('../helpers/setup');
const storageImplementation = require('../../src/storage');
const { getCID, createCID, isCID, cidToString } = require('../../src/utils/multiformats-compat');

describe('Storage Implementation Tests', () => {
  let env, fixtures, utils;
  let storage;
  
  beforeAll(async () => {
    env = await setupTokenTestEnvironment();
    fixtures = env.fixtures;
    utils = env.utils;
    
    // Initialize storage with the mock Helia instance
    storage = await storageImplementation.createStorage({
      helia: env.helia
    });
  });
  
  describe('Basic Storage Operations', () => {
    test('should store and retrieve string data', async () => {
      const testData = 'Test string data for storage';
      
      // Store the data
      const cid = await storage.storeData(testData);
      expect(cid).toBeDefined();
      expect(typeof cid.toString()).toBe('string');
      
      // Retrieve the data
      const retrievedData = await storage.retrieveData(cid);
      expect(retrievedData).toBe(testData);
    });
    
    test('should store and retrieve JSON objects', async () => {
      const testObject = {
        name: 'Test Object',
        values: [1, 2, 3, 4, 5],
        nested: {
          field: 'value',
          active: true
        }
      };
      
      // Store the object
      const cid = await storage.storeJSON(testObject);
      expect(cid).toBeDefined();
      
      // Retrieve the object
      const retrievedObject = await storage.retrieveJSON(cid);
      expect(retrievedObject).toEqual(testObject);
    });
    
    test('should handle binary data', async () => {
      const binaryData = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
      
      // Store binary data
      const cid = await storage.storeBinary(binaryData);
      expect(cid).toBeDefined();
      
      // Retrieve binary data
      const retrievedData = await storage.retrieveBinary(cid);
      expect(Buffer.compare(retrievedData, binaryData)).toBe(0);
    });
  });
  
  describe('Advanced Storage Features', () => {
    test('should create and traverse linked data structures', async () => {
      // Create a linked data structure
      const leaf1 = { data: 'Leaf 1 data' };
      const leaf2 = { data: 'Leaf 2 data' };
      
      const leaf1CID = await storage.storeJSON(leaf1);
      const leaf2CID = await storage.storeJSON(leaf2);
      
      const branch = {
        name: 'Branch',
        leftLeaf: leaf1CID.toString(),
        rightLeaf: leaf2CID.toString()
      };
      
      const branchCID = await storage.storeJSON(branch);
      
      const root = {
        name: 'Root',
        branch: branchCID.toString()
      };
      
      const rootCID = await storage.storeJSON(root);
      
      // Traverse the structure
      const retrievedRoot = await storage.retrieveJSON(rootCID);
      expect(retrievedRoot.name).toBe('Root');
      
      const retrievedBranch = await storage.retrieveJSON(CID.parse(retrievedRoot.branch));
      expect(retrievedBranch.name).toBe('Branch');
      
      const retrievedLeaf1 = await storage.retrieveJSON(CID.parse(retrievedBranch.leftLeaf));
      expect(retrievedLeaf1.data).toBe('Leaf 1 data');
      
      const retrievedLeaf2 = await storage.retrieveJSON(CID.parse(retrievedBranch.rightLeaf));
      expect(retrievedLeaf2.data).toBe('Leaf 2 data');
    });
    
    test('should handle storage of transaction history', async () => {
      // Create transaction data
      const transactions = fixtures.wallets.wallet1.address;
      
      const tx1 = {
        type: 'transfer',
        from: fixtures.wallets.wallet1.address,
        to: fixtures.wallets.wallet2.address,
        amount: 100,
        timestamp: Date.now()
      };
      
      const tx2 = {
        type: 'transfer',
        from: fixtures.wallets.wallet2.address,
        to: fixtures.wallets.wallet3.address,
        amount: 50,
        timestamp: Date.now() + 1000
      };
      
      // Store initial transaction
      const tx1CID = await storage.storeTransaction(tx1);
      
      // Store second transaction with link to previous
      const tx2CID = await storage.storeTransaction(tx2, tx1CID);
      
      // Retrieve transaction history
      const history = await storage.retrieveTransactionHistory(tx2CID);
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('transfer');
      expect(history[1].type).toBe('transfer');
    });
  });
  
  describe('Philosophical Integration', () => {
    test('should integrate with Leibniz for content addressing', async () => {
      const data = 'Content-addressed data using Leibniz hashing';
      
      // Use Leibniz hash for content addressing
      const hash = utils.leibniz.monadHash(data);
      
      // Store with custom identifier
      const stored = await storage.storeWithIdentifier(data, hash);
      expect(stored).toBe(true);
      
      // Retrieve by identifier
      const retrieved = await storage.retrieveByIdentifier(hash);
      expect(retrieved).toBe(data);
    });
    
    test('should integrate with Gödel for data consistency verification', async () => {
      // Create a verifier
      const verifier = utils.godel.createVerifier();
      
      // Store data with consistency checking
      const tokenState = {
        balances: {
          [fixtures.wallets.wallet1.address]: 1000,
          [fixtures.wallets.wallet2.address]: 500
        },
        totalSupply: 1500,
        lastUpdated: Date.now()
      };
      
      // Verify consistency before storing
      const validation = verifier.verifyTransaction({
        type: 'state_update',
        data: tokenState,
        previousTotal: 1500
      });
      
      expect(validation.isValid).toBe(true);
      
      // Store with proof
      const cid = await storage.storeWithProof(tokenState, validation.proofId);
      
      // Retrieve with verification
      const result = await storage.retrieveWithVerification(cid, verifier);
      expect(result.data).toEqual(tokenState);
      expect(result.verified).toBe(true);
    });
    
    test('should use Shannon entropy to optimize storage', async () => {
      const repeatingData = 'AAAAAAAAAAAAAAAAAAAAAA'; // Low entropy
      const randomData = crypto.randomBytes(20).toString('hex'); // High entropy
      
      // Store both pieces of data
      const repeatingCID = await storage.storeWithCompression(repeatingData);
      const randomCID = await storage.storeWithCompression(randomData);
      
      // Get storage statistics
      const repeatingStats = await storage.getStorageStats(repeatingCID);
      const randomStats = await storage.getStorageStats(randomCID);
      
      // Low entropy data should have better compression
      expect(repeatingStats.compressionRatio).toBeGreaterThan(randomStats.compressionRatio);
      
      // Retrieve data to confirm it's still correct
      const retrievedRepeating = await storage.retrieveWithCompression(repeatingCID);
      const retrievedRandom = await storage.retrieveWithCompression(randomCID);
      
      expect(retrievedRepeating).toBe(repeatingData);
      expect(retrievedRandom).toBe(randomData);
    });
  });
});
