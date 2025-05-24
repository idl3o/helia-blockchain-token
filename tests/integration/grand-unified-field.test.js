/**
 * Grand Unified Field Test for Helia Blockchain Token
 * 
 * This test suite integrates all philosophical components and tests them as a unified system.
 * It demonstrates how quantum principles (Planck), binary mathematics (Leibniz), logical consistency (Gödel),
 * categorization (Aristotle), information theory (Shannon), and computational models (Turing)
 * work together to form a cohesive blockchain token system.
 */

const { setupTokenTestEnvironment, createTestTransaction, createTransactionChain } = require('../helpers/setup');

describe('Grand Unified Field Tests', () => {
  // Setup shared test environment
  let env, fixtures, utils;
  
  beforeAll(async () => {
    env = await setupTokenTestEnvironment();
    fixtures = env.fixtures;
    utils = env.utils;

    // Ensure we're testing with the actual modules, not mocks
    expect(utils.planck).toBeDefined();
    expect(utils.leibniz).toBeDefined();
    expect(utils.godel).toBeDefined();
    expect(utils.aristotle).toBeDefined();
    expect(utils.shannon).toBeDefined();
    expect(utils.turing).toBeDefined();
  });

  describe('Philosophical Components Integration', () => {
    test('should create and validate a quantum token value', () => {
      // PLANCK: Quantum discretization of token amounts
      const tokenAmount = utils.planck.quantize('1234.56789');
      expect(tokenAmount).toBe(1234n);
      expect(utils.planck.isValidQuantum(tokenAmount)).toBe(true);
      
      // LEIBNIZ: Create a hash of the token data
      const tokenData = {
        amount: tokenAmount,
        owner: fixtures.wallets.wallet1.address
      };
      const tokenHash = utils.leibniz.monadHash(tokenData);
      expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
      
      // GÖDEL: Verify consistency of token data
      const verifier = utils.godel.createVerifier();
      const validation = verifier.verifyTransaction({
        source: fixtures.wallets.wallet1.address,
        destination: fixtures.wallets.wallet2.address,
        amount: tokenAmount
      });
      expect(validation.isValid).toBe(true);
    });
    
    test('should classify and process a token transaction through the unified system', () => {
      // Define a test transaction
      const transaction = {
        type: 'transfer',
        source: fixtures.wallets.wallet1.address,
        destination: fixtures.wallets.wallet2.address,
        amount: utils.planck.quantize(100),
        timestamp: Date.now()
      };
      
      // ARISTOTLE: Categorize the transaction
      const ruleSystem = new utils.aristotle.AristotelianRuleSystem();
      const tokenCategory = ruleSystem.addCategory('Transfer', { type: 'transfer' });
      const categories = ruleSystem.categorizeToken(transaction);
      expect(categories).toContain('Transfer');
      
      // SHANNON: Calculate entropy and information content
      const entropy = utils.shannon.calculateEntropy(transaction);
      const informationContent = utils.shannon.calculateInformationContent(transaction);
      expect(entropy).toBeGreaterThan(0);
      expect(informationContent).toBeGreaterThan(0);
      
      // LEIBNIZ: Sign the transaction
      const keyPair = utils.leibniz.createKeyPair();
      const signature = utils.leibniz.createSignature(keyPair.privateKey, transaction);
      expect(utils.leibniz.verifySignature(keyPair.publicKey, signature, transaction)).toBe(true);
      
      // TURING: Process the transaction through a state machine
      const tokenComputation = utils.turing.createTokenComputation({
        balances: {
          [fixtures.wallets.wallet1.address]: 500,
          [fixtures.wallets.wallet2.address]: 300
        },
        totalSupply: 800
      });
      
      const result = tokenComputation.processOperation(transaction);
      expect(result.success).toBe(true);
      
      // Verify the final state
      const finalState = tokenComputation.getState();
      expect(finalState.balances[fixtures.wallets.wallet1.address]).toBe(400);
      expect(finalState.balances[fixtures.wallets.wallet2.address]).toBe(400);
    });
  });

  describe('Transaction Lifecycle', () => {
    // Create a full token system for this test suite
    let tokenSystem, verifier, ruleSystem;
    
    beforeAll(() => {
      // Initialize the token system components
      tokenSystem = utils.turing.createTokenComputation({
        balances: {
          [fixtures.wallets.wallet1.address]: 1000,
          [fixtures.wallets.wallet2.address]: 500,
          [fixtures.wallets.wallet3.address]: 200
        },
        totalSupply: 1700
      });
      
      verifier = utils.godel.createVerifier();
      
      ruleSystem = new utils.aristotle.AristotelianRuleSystem();
      ruleSystem.addCategory('Transfer', { type: 'transfer' });
      ruleSystem.addCategory('Mint', { type: 'mint' });
      
      // Add rules to the rule system
      ruleSystem.addRule(
        'MinimumTransferAmount',
        (op) => op.type === 'transfer',
        (op) => {
          if (op.amount < 10n) throw new Error('Transfer amount must be at least 10');
          return op;
        },
        'Enforces minimum transfer amount'
      );
    });
    
    test('should process a valid transaction through the entire lifecycle', () => {
      // 1. Create the transaction
      const transaction = {
        type: 'transfer',
        source: fixtures.wallets.wallet1.address,
        destination: fixtures.wallets.wallet2.address,
        amount: utils.planck.quantize(100)
      };
      
      // 2. Apply Planck's quantization
      expect(typeof transaction.amount).toBe('bigint');
      
      // 3. Generate a unique ID using Leibniz
      transaction.id = utils.leibniz.createUniqueId();
      
      // 4. Validate with Gödel
      const validation = verifier.verifyTransaction(transaction);
      expect(validation.isValid).toBe(true);
      
      // 5. Categorize with Aristotle
      const categories = ruleSystem.categorizeToken(transaction);
      expect(categories).toContain('Transfer');
      
      // 6. Apply governance rules
      const governanceResult = ruleSystem.applyRules(transaction);
      expect(governanceResult.valid).toBe(true);
      
      // 7. Calculate entropy with Shannon
      const entropy = utils.shannon.calculateEntropy(transaction);
      expect(entropy).toBeGreaterThan(0);
      
      // 8. Process state transition with Turing
      const processingResult = tokenSystem.processOperation(transaction);
      expect(processingResult.success).toBe(true);
      
      // 9. Verify final balances
      const finalState = tokenSystem.getState();
      expect(finalState.balances[fixtures.wallets.wallet1.address]).toBe(900);
      expect(finalState.balances[fixtures.wallets.wallet2.address]).toBe(600);
    });
    
    test('should reject an invalid transaction', () => {
      // Transaction with amount below minimum
      const invalidTransaction = {
        type: 'transfer',
        source: fixtures.wallets.wallet1.address,
        destination: fixtures.wallets.wallet2.address,
        amount: utils.planck.quantize(5) // Below minimum amount
      };
      
      // The transaction should pass basic validation
      const validation = verifier.verifyTransaction(invalidTransaction);
      expect(validation.isValid).toBe(true);
      
      // But fail the governance rules
      const governanceResult = ruleSystem.applyRules(invalidTransaction);
      expect(governanceResult.valid).toBe(false);
      expect(governanceResult.reason).toContain('Rule "MinimumTransferAmount" violation');
    });
    
    test('should handle a sequence of transactions correctly', () => {
      // Create a chain of transactions
      const transactions = [
        {
          type: 'transfer',
          source: fixtures.wallets.wallet1.address,
          destination: fixtures.wallets.wallet2.address,
          amount: utils.planck.quantize(50)
        },
        {
          type: 'transfer',
          source: fixtures.wallets.wallet2.address,
          destination: fixtures.wallets.wallet3.address,
          amount: utils.planck.quantize(100)
        },
        {
          type: 'transfer',
          source: fixtures.wallets.wallet3.address,
          destination: fixtures.wallets.wallet1.address,
          amount: utils.planck.quantize(25)
        }
      ];
      
      // Initial balances
      const initialState = tokenSystem.getState();
      const initialWallet1 = initialState.balances[fixtures.wallets.wallet1.address];
      const initialWallet2 = initialState.balances[fixtures.wallets.wallet2.address];
      const initialWallet3 = initialState.balances[fixtures.wallets.wallet3.address];
      
      // Process all transactions
      transactions.forEach(transaction => {
        const result = tokenSystem.processOperation(transaction);
        expect(result.success).toBe(true);
      });
      
      // Final balances should reflect all transactions
      const finalState = tokenSystem.getState();
      expect(finalState.balances[fixtures.wallets.wallet1.address]).toBe(initialWallet1 - 50 + 25);
      expect(finalState.balances[fixtures.wallets.wallet2.address]).toBe(initialWallet2 + 50 - 100);
      expect(finalState.balances[fixtures.wallets.wallet3.address]).toBe(initialWallet3 + 100 - 25);
      
      // Total supply should remain constant
      expect(finalState.totalSupply).toBe(initialState.totalSupply);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should detect and prevent double-spending', () => {
      // Create a token system with limited funds
      const tokenSystem = utils.turing.createTokenComputation({
        balances: { [fixtures.wallets.wallet1.address]: 100 },
        totalSupply: 100
      });
      
      // First transaction should succeed
      const tx1 = {
        type: 'transfer',
        source: fixtures.wallets.wallet1.address,
        destination: fixtures.wallets.wallet2.address,
        amount: utils.planck.quantize(100)
      };
      
      const result1 = tokenSystem.processOperation(tx1);
      expect(result1.success).toBe(true);
      
      // Second transaction with same source should fail (insufficient funds)
      const tx2 = {
        type: 'transfer',
        source: fixtures.wallets.wallet1.address,
        destination: fixtures.wallets.wallet3.address,
        amount: utils.planck.quantize(50)
      };
      
      const result2 = tokenSystem.processOperation(tx2);
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Insufficient balance');
    });
    
    test('should handle paradoxical self-reference', () => {
      // Create a Gödel verifier
      const verifier = utils.godel.createVerifier();
      
      // Create a transaction that references itself
      const txId = utils.leibniz.createUniqueId();
      const selfReferencingTx = {
        id: txId,
        source: fixtures.wallets.wallet1.address,
        destination: fixtures.wallets.wallet1.address, // Self-reference: same source and destination
        amount: utils.planck.quantize(100),
        data: { referenceId: txId } // Contains its own ID
      };
      
      // This should be detected as paradoxical
      const validation = verifier.verifyTransaction(selfReferencingTx);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Transaction contains paradoxical self-reference');
    });
  });

  describe('Philosophical Synergy', () => {
    test('should demonstrate the relationship between all philosophical components', () => {
      // This test demonstrates how all components work together in harmony
      
      // PLANCK: Create a quantum token value
      const tokenValue = utils.planck.quantize(123);
      expect(utils.planck.isValidQuantum(tokenValue)).toBe(true);
      
      // Calculate energy level
      const energyLevel = utils.planck.calculateEnergyLevel(tokenValue, 2n);
      expect(energyLevel).toBe(246n);
      
      // LEIBNIZ: Create a digital identity
      const keyPair = utils.leibniz.createKeyPair();
      const tokenData = {
        value: tokenValue,
        owner: keyPair.publicKey.slice(0, 20)
      };
      
      // Sign the data
      const signature = utils.leibniz.createSignature(keyPair.privateKey, tokenData);
      expect(utils.leibniz.verifySignature(keyPair.publicKey, signature, tokenData)).toBe(true);
      
      // GÖDEL: Verify consistency
      const verifier = utils.godel.createVerifier();
      const transaction = {
        source: 'system',
        destination: fixtures.wallets.wallet1.address,
        amount: tokenValue
      };
      const validation = verifier.verifyTransaction(transaction);
      expect(validation.isValid).toBe(true);
      
      // ARISTOTLE: Classify the token
      const ruleSystem = new utils.aristotle.AristotelianRuleSystem();
      const energyCategory = ruleSystem.addCategory('HighEnergy', {
        energyLevel: (level) => level > 200n
      });
      
      const tokenWithEnergy = {
        ...tokenData,
        energyLevel
      };
      
      const categories = ruleSystem.categorizeToken(tokenWithEnergy);
      expect(categories).toContain('HighEnergy');
      
      // SHANNON: Measure information content
      const entropy = utils.shannon.calculateEntropy(tokenData);
      const informationContent = utils.shannon.calculateInformationContent(tokenData);
      expect(entropy).toBeGreaterThan(0);
      expect(informationContent).toBeGreaterThan(0);
      
      // TURING: Process state change
      const tokenComputation = utils.turing.createTokenComputation({
        balances: { [fixtures.wallets.wallet1.address]: 0 },
        totalSupply: 0
      });
      
      const mintResult = tokenComputation.processOperation({
        type: 'mint',
        destination: fixtures.wallets.wallet1.address,
        amount: tokenValue
      }, { isAuthorized: true });
      
      expect(mintResult.success).toBe(true);
      expect(tokenComputation.getState().balances[fixtures.wallets.wallet1.address]).toBe(Number(tokenValue));
      
      // Demonstrate using the conceptual pipeline
      const conceptPath = ['planck', 'leibniz', 'godel', 'aristotle', 'shannon', 'turing'];
      const pipeline = utils.createConceptualPipeline(conceptPath);
      expect(typeof pipeline).toBe('function');
      
      // Navigate between related concepts
      const planckConcept = utils.getPhilosophicalConcept('planck');
      expect(planckConcept.relatedConcepts).toContain('leibniz');
      expect(planckConcept.relatedConcepts).toContain('turing');
    });
  });
});
