/**
 * Command line interface for Helia blockchain token
 * Allows interaction with the token system through command-line commands
 * 
 * This CLI integrates the philosophical concepts to provide a coherent
 * interface for users to interact with the token system.
 * 
 * @see Navigation paths:
 * - {@link ./utils/index.js} - Philosophical navigation
 * - {@link ./token/index.js} - Token implementation
 * - {@link ./docs/navigation.md} - Documentation navigation
 */

const { initializeTokenSystem } = require('./index');
const utils = require('./utils');
const readline = require('readline');
const { createEd25519PeerId } = require('@libp2p/peer-id-factory');
const { fromString } = require('uint8arrays/from-string');

// Create readline interface for CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let tokenSystem = null;
let currentToken = null;
let keyPair = null;

/**
 * Initialize the token system
 */
async function initialize() {
  console.log('Initializing Helia blockchain token system...');
  
  try {
    tokenSystem = await initializeTokenSystem();
    console.log('Token system initialized successfully!');
    
    // Generate key pair for operations
    keyPair = tokenSystem.utils.leibniz.createKeyPair();
    console.log('\nGenerated new key pair for token operations:');
    console.log(`Public Key: ${keyPair.publicKey.substring(0, 40)}...`);
    
    // Start command prompt
    promptCommand();
  } catch (error) {
    console.error('Failed to initialize token system:', error);
    process.exit(1);
  }
}

/**
 * Display help information
 */
function displayHelp() {
  console.log('\nHelia Blockchain Token CLI');
  console.log('--------------------------');
  console.log('Available commands:');
  console.log('  help                 - Show this help message');
  console.log('  create <name> <symbol> [decimals] - Create a new token');
  console.log('  mint <recipient> <amount> - Mint new tokens (owner only)');
  console.log('  transfer <to> <amount> - Transfer tokens');
  console.log('  balance [address]    - Check token balance');
  console.log('  info                 - Show token information');
  console.log('  peers                - List connected peers');
  console.log('  entropy <data>       - Calculate Shannon entropy of data');
  console.log('  verify <operation>   - Verify an operation');
  console.log('  exit                 - Exit the application');
  promptCommand();
}

/**
 * Prompt for command input
 */
function promptCommand() {
  const prefix = currentToken ? `[${currentToken.getInfo().symbol}]` : '';
  rl.question(`\n${prefix}> `, processCommand);
}

/**
 * Process command input
 * @param {string} input - Command input
 */
async function processCommand(input) {
  const [command, ...args] = input.trim().split(' ');
  
  try {
    switch (command.toLowerCase()) {
      case 'help':
        displayHelp();
        break;
        
      case 'create':
        await createToken(args);
        break;
        
      case 'mint':
        await mintTokens(args);
        break;
        
      case 'transfer':
        await transferTokens(args);
        break;
        
      case 'balance':
        await checkBalance(args);
        break;
        
      case 'info':
        showTokenInfo();
        break;
        
      case 'peers':
        await listPeers();
        break;
        
      case 'entropy':
        calculateEntropy(args.join(' '));
        break;
        
      case 'verify':
        await verifyOperation(args.join(' '));
        break;
        
      case 'exit':
        console.log('Shutting down...');
        await tokenSystem.stop();
        rl.close();
        process.exit(0);
        break;
        
      case '':
        promptCommand();
        break;
        
      default:
        console.log(`Unknown command: ${command}`);
        console.log('Type "help" for available commands');
        promptCommand();
        break;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    promptCommand();
  }
}

/**
 * Create a new token
 * @param {Array} args - Command arguments
 */
async function createToken(args) {
  if (args.length < 2) {
    console.log('Usage: create <name> <symbol> [decimals]');
    promptCommand();
    return;
  }
  
  const [name, symbol] = args;
  const decimals = args[2] ? parseInt(args[2]) : 18;
  
  console.log(`Creating token: ${name} (${symbol}) with ${decimals} decimals...`);
  
  try {
    const myAddress = tokenSystem.utils.leibniz.monadHash(keyPair.publicKey);
    currentToken = await tokenSystem.token.createToken({
      name,
      symbol,
      decimals,
      owner: myAddress,
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: myAddress
      }
    });
    
    console.log('Token created successfully!');
    showTokenInfo();
  } catch (error) {
    console.error('Failed to create token:', error);
  }
  
  promptCommand();
}

/**
 * Mint new tokens
 * @param {Array} args - Command arguments
 */
async function mintTokens(args) {
  if (!currentToken) {
    console.log('No token selected. Create a token first with the "create" command.');
    promptCommand();
    return;
  }
  
  if (args.length < 2) {
    console.log('Usage: mint <recipient> <amount>');
    promptCommand();
    return;
  }
  
  const [recipient, amountStr] = args;
  const amount = BigInt(amountStr);
  
  console.log(`Minting ${amount} tokens to ${recipient}...`);
  
  try {
    const myAddress = tokenSystem.utils.leibniz.monadHash(keyPair.publicKey);
    const result = await currentToken.mint(recipient, amount, { 
      sender: myAddress,
      publicKey: keyPair.publicKey,
      isOwner: true
    });
    
    if (result.success) {
      console.log(`Successfully minted ${amount} tokens to ${recipient}`);
      console.log(`Transaction ID: ${result.transactionId}`);
    } else {
      console.log(`Mint failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Failed to mint tokens:', error);
  }
  
  promptCommand();
}

/**
 * Transfer tokens
 * @param {Array} args - Command arguments
 */
async function transferTokens(args) {
  if (!currentToken) {
    console.log('No token selected. Create a token first with the "create" command.');
    promptCommand();
    return;
  }
  
  if (args.length < 2) {
    console.log('Usage: transfer <to> <amount>');
    promptCommand();
    return;
  }
  
  const [to, amountStr] = args;
  const amount = BigInt(amountStr);
  
  const myAddress = tokenSystem.utils.leibniz.monadHash(keyPair.publicKey);
  console.log(`Transferring ${amount} tokens from ${myAddress} to ${to}...`);
  
  try {
    const operation = {
      type: 'transfer',
      from: myAddress,
      to,
      amount,
      timestamp: Date.now(),
      nonce: Math.random().toString()
    };
    
    // Sign the operation
    const signature = tokenSystem.utils.leibniz.createSignature(
      keyPair.privateKey,
      operation
    );
    
    const result = await currentToken.transfer(myAddress, to, amount, {
      sender: myAddress,
      signature,
      publicKey: keyPair.publicKey
    });
    
    if (result.success) {
      console.log(`Successfully transferred ${amount} tokens to ${to}`);
      console.log(`Transaction ID: ${result.transactionId}`);
    } else {
      console.log(`Transfer failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Failed to transfer tokens:', error);
  }
  
  promptCommand();
}

/**
 * Check token balance
 * @param {Array} args - Command arguments
 */
async function checkBalance(args) {
  if (!currentToken) {
    console.log('No token selected. Create a token first with the "create" command.');
    promptCommand();
    return;
  }
  
  let address;
  if (args.length > 0) {
    address = args[0];
  } else {
    address = tokenSystem.utils.leibniz.monadHash(keyPair.publicKey);
  }
  
  try {
    const balance = currentToken.balanceOf(address);
    console.log(`Balance of ${address}: ${balance} ${currentToken.getInfo().symbol}`);
  } catch (error) {
    console.error('Failed to check balance:', error);
  }
  
  promptCommand();
}

/**
 * Show token information
 */
function showTokenInfo() {
  if (!currentToken) {
    console.log('No token selected. Create a token first with the "create" command.');
    promptCommand();
    return;
  }
  
  const info = currentToken.getInfo();
  console.log('\nToken Information:');
  console.log('-----------------');
  console.log(`Name: ${info.name}`);
  console.log(`Symbol: ${info.symbol}`);
  console.log(`Decimals: ${info.decimals}`);
  console.log(`Total Supply: ${info.totalSupply}`);
  console.log(`Token ID: ${info.tokenId}`);
  console.log(`Owner: ${info.owner}`);
  console.log(`Genesis Block: ${info.genesisBlock}`);
  
  promptCommand();
}

/**
 * List connected peers
 */
async function listPeers() {
  if (!tokenSystem || !tokenSystem.network) {
    console.log('Network not initialized.');
    promptCommand();
    return;
  }
  
  const info = tokenSystem.network.getNetworkInfo();
  console.log('\nNetwork Information:');
  console.log('-------------------');
  console.log(`Peer ID: ${info.peerId}`);
  console.log(`Connected Peers: ${info.peerCount}`);
  console.log('\nListening Addresses:');
  info.listenAddresses.forEach(addr => console.log(`  ${addr}`));
  console.log('\nPeers:');
  
  const peers = tokenSystem.network.getPeers();
  if (peers.length === 0) {
    console.log('  No peers connected');
  } else {
    peers.forEach(peer => console.log(`  ${peer}`));
  }
  
  promptCommand();
}

/**
 * Calculate Shannon entropy of data
 * @param {string} data - Data to analyze
 */
function calculateEntropy(data) {
  if (!data) {
    console.log('Usage: entropy <data>');
    promptCommand();
    return;
  }
  
  const entropy = tokenSystem.utils.shannon.calculateEntropy(data);
  console.log(`Shannon entropy of input data: ${entropy.toFixed(6)} bits`);
  
  promptCommand();
}

/**
 * Verify an operation
 * @param {string} operationStr - Operation JSON string
 */
async function verifyOperation(operationStr) {
  if (!operationStr) {
    console.log('Usage: verify <operation>');
    promptCommand();
    return;
  }
  
  try {
    const operation = JSON.parse(operationStr);
    const result = tokenSystem.verifier.verifyTransaction(operation);
    
    console.log('\nVerification Result:');
    console.log('-------------------');
    console.log(`Valid: ${result.isValid}`);
    
    if (!result.isValid && result.errors) {
      console.log('\nErrors:');
      result.errors.forEach(err => console.log(`  - ${err}`));
    }
  } catch (error) {
    console.error('Failed to verify operation:', error);
  }
  
  promptCommand();
}

// Start the CLI
initialize().catch(console.error);
