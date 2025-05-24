# Helia Blockchain Token - Practical Example

This document demonstrates a complete practical example of using the Helia Blockchain Token system, showing how the philosophical components work together in real-world token operations.

## Basic Token Creation and Transfer

This example walks through creating a token and performing basic operations, showing how each philosophical concept is applied along the way.

### Prerequisites

Make sure you have installed the Helia Blockchain Token project and its dependencies:

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Step 1: Initialize the Token System

First, we'll initialize the token system, bringing together all philosophical components:

```javascript
const { initializeTokenSystem } = require('./src/index');

async function runExample() {
  console.log('Initializing Helia Blockchain Token system...');
  const system = await initializeTokenSystem();
  
  // The system now contains all philosophical modules
  console.log('System initialized successfully!');
  
  return system;
}
```

### Step 2: Create a Token

Next, we'll create a new token, which involves multiple philosophical principles:

```javascript
async function createToken(system) {
  // Create a key pair for the token owner
  const { publicKey, privateKey } = system.utils.leibniz.createKeyPair();
  
  // Create a new token
  const token = await system.token.createToken({
    name: 'Philosophical Token',
    symbol: 'PHT',
    decimals: 18,
    owner: publicKey
  });
  
  console.log(`Token created with ID: ${token.getInfo().tokenId}`);
  return { token, publicKey, privateKey };
}
```

In this step:
- **Leibniz**: Binary mathematics provides cryptographic key pairs
- **Aristotle**: Token categorization establishes the token's properties

### Step 3: Mint Initial Supply

Let's mint some initial tokens:

```javascript
async function mintInitialSupply(system, token, ownerKey) {
  const recipient = 'user123';
  const amount = '10000'; // We will quantize this value
  
  // Quantize the amount according to Planck principles
  const quantizedAmount = system.utils.planck.quantize(amount);
  console.log(`Quantized amount: ${quantizedAmount}`);
  
  // Mint tokens to the recipient
  const result = await token.mint(
    recipient,
    quantizedAmount,
    { sender: ownerKey, isOwner: true }
  );
  
  console.log(`Minting result: ${result.success ? 'Success' : 'Failure'}`);
  return result;
}
```

In this step:
- **Planck**: Quantum principles ensure token values are properly discretized
- **Turing**: State machine transitions handle the token balance updates

### Step 4: Perform a Token Transfer

Now let's transfer tokens between users:

```javascript
async function transferTokens(system, token) {
  const sender = 'user123';
  const recipient = 'user456';
  const amount = '1000';
  
  // Check if amount is valid according to quantum principles
  if (!system.utils.planck.isValidQuantum(amount)) {
    console.error('Invalid quantum value for transfer');
    return { success: false };
  }
  
  // Create a signature for the transfer
  const transferData = {
    from: sender,
    to: recipient,
    amount,
    timestamp: Date.now()
  };
  
  // Use Leibniz's cryptographic functions for signing
  const signature = system.utils.leibniz.createSignature(
    'senderPrivateKey', // In a real app, this would be securely stored
    transferData
  );
  
  // Verify transaction consistency using Gödel's principles
  const verificationResult = system.verifier.verifyTransaction({
    ...transferData,
    signature
  });
  
  if (!verificationResult.isValid) {
    console.error(`Validation failed: ${verificationResult.errors.join(', ')}`);
    return { success: false };
  }
  
  // Execute the transfer
  const result = await system.executeOperation({
    type: 'transfer',
    ...transferData
  }, {
    signature,
    publicKey: 'senderPublicKey' // In a real app, this would be the actual key
  });
  
  // Analyze the transaction using Shannon's information theory
  const infoAnalysis = system.utils.shannon.calculateEntropy(transferData);
  console.log(`Transaction entropy: ${infoAnalysis}`);
  
  return result;
}
```

In this step:
- **Planck**: Ensures the transfer amount adheres to quantum principles
- **Leibniz**: Provides cryptographic signing for transaction security
- **Gödel**: Verifies transaction consistency and prevents paradoxes
- **Turing**: Processes the state transition of the token balances
- **Shannon**: Analyzes the information content of the transaction

### Step 5: Token Categorization and Governance

Let's apply Aristotelian categorization to our token:

```javascript
function categorizeToken(system, token) {
  const tokenInfo = token.getInfo();
  
  // Create a rule system based on Aristotelian logic
  const ruleSystem = new system.utils.aristotle.AristotelianRuleSystem();
  
  // Add categories
  const baseToken = ruleSystem.addCategory('Token', { isToken: true });
  baseToken.addSubcategory('FungibleToken', { fungible: true });
  
  // Categorize the token
  const categories = ruleSystem.categorizeToken({
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    fungible: true,
    divisible: true
  });
  
  console.log(`Token categories: ${categories.join(', ')}`);
  
  // Create a governance rule
  ruleSystem.addRule(
    'MaxTransferRule',
    (op) => op.type === 'transfer',
    (op) => {
      if (BigInt(op.amount) > BigInt('1000000')) {
        throw new Error('Transfer amount exceeds governance limit');
      }
      return op;
    },
    'Transfers cannot exceed 1,000,000 tokens'
  );
  
  return { ruleSystem, categories };
}
```

In this step:
- **Aristotle**: Provides logical framework for token categorization and governance rules

### Complete Example

Here's how all the steps come together:

```javascript
async function runCompleteExample() {
  try {
    // Step 1: Initialize the system
    const system = await runExample();
    
    // Step 2: Create a token
    const { token, publicKey } = await createToken(system);
    
    // Step 3: Mint initial supply
    await mintInitialSupply(system, token, publicKey);
    
    // Step 4: Transfer tokens
    const transferResult = await transferTokens(system, token);
    console.log(`Transfer result: ${transferResult.success ? 'Success' : 'Failure'}`);
    
    // Step 5: Categorize token
    const { categories } = categorizeToken(system, token);
    
    console.log('\nExample completed successfully!');
    
    // Gracefully shut down the system
    await system.stop();
    
  } catch (error) {
    console.error(`Error in example: ${error.message}`);
  }
}

// Run the example
runCompleteExample().catch(console.error);
```

## Running the Example

Save this code in a file called `example.js` in the project root and run it:

```bash
node example.js
```

## Philosophical Integration Map

This diagram shows how the philosophical concepts integrate in this example:

```
┌─────────────────┐
│ User Interface  │
└────────┬────────┘
         │
┌────────▼────────┐
│ Token Creation  │◄──────── Aristotle (Categorization)
└────────┬────────┘          Leibniz (Cryptography)
         │
┌────────▼────────┐
│    Minting      │◄──────── Planck (Quantization)
└────────┬────────┘          Turing (State Transitions)
         │
┌────────▼────────┐
│    Transfer     │◄──────── Leibniz (Transaction Signing)
│    Operation    │          Gödel (Consistency Checking)
└────────┬────────┘          Shannon (Information Analysis)
         │
┌────────▼────────┐
│  State Update   │◄──────── Turing (State Machine)
└────────┬────────┘
         │
┌────────▼────────┐
│ IPFS Storage    │
└─────────────────┘
```

This example demonstrates how all philosophical components work together in a real token application, showing the practical benefits of this unique approach to blockchain token design.

## Extending the Example

You can extend this example by:

1. Adding more complex token governance rules (Aristotle)
2. Implementing quantum-resistant cryptography (Leibniz)
3. Creating more sophisticated state transition rules (Turing)
4. Enhancing the consistency verification system (Gödel)
5. Optimizing information encoding for transactions (Shannon)
6. Refining the token value quantization approach (Planck)

Each extension would further demonstrate the power of philosophical integration in blockchain token design.
