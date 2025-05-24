/**
 * Token implementation using Helia blockchain
 * Main entry point for the application
 * 
 * Integrates philosophical and mathematical concepts from great thinkers:
 * - Planck: Quantum principles for token value discretization
 * - Leibniz: Binary mathematics and cryptographic operations
 * - Gödel: Consistency and completeness verification
 * - Aristotle: Logical framework for token governance
 * - Shannon: Information theory for transaction analysis
 * - Turing: Computational model for token state transitions
 */

// Import core dependencies
const { createHeliaInstance, createUnixFS } = require('./utils/helia-compat');
require('dotenv').config();

// Import core modules
const tokenModule = require('./token');
const networkModule = require('./network');
const storageModule = require('./storage');

// Import philosophical/mathematical utility modules
const planck = require('./utils/planck');
const leibniz = require('./utils/leibniz');
const godel = require('./utils/godel');
const aristotle = require('./utils/aristotle');
const shannon = require('./utils/shannon');
const turing = require('./utils/turing');

/**
 * Initializes the Helia Blockchain Token system with the specified configuration
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} - Initialized token system
 */
async function initializeTokenSystem(config = {}) {
  try {
    // Initialize Helia node
    const helia = await createHeliaInstance(config.helia);
    console.log('Helia node initialized');    // Initialize UnixFS for content storage
    const fs = await createUnixFS(helia);
    
    // Initialize storage layer
    const storage = await storageModule.initialize({ fs, ...config.storage });
    
    // Initialize network layer
    const network = await networkModule.initialize({ helia, ...config.network });
    
    // Initialize token logic
    const token = await tokenModule.initialize({
      storage,
      network,
      ...config.token
    });
    
    // Create integrated token computation environment
    const computation = turing.createTokenComputation({
      totalSupply: 0,
      balances: {}
    });
    
    // Create verification system
    const verifier = godel.createVerifier();
    
    // Create token categorization system
    const categorization = new aristotle.AristotelianRuleSystem();
    setupTokenCategories(categorization);
    
    console.log('Helia blockchain token system initialized successfully');
    
    return {
      token,
      network,
      storage,
      helia,
      utils: {
        planck,
        leibniz,
        godel,
        aristotle,
        shannon,
        turing
      },
      computation,
      verifier,
      categorization,
      
      /**
       * Executes a token operation with full validation
       * @param {Object} operation - Operation to execute
       * @param {Object} context - Execution context
       * @returns {Promise<Object>} - Operation result
       */
      async executeOperation(operation, context = {}) {
        // Generate cryptographic proof
        const signature = context.signature || '';
        const publicKey = context.publicKey || '';
        
        // Validate operation structure
        const validationResult = verifier.verifyTransaction(operation);
        if (!validationResult.isValid) {
          return {
            success: false,
            errors: validationResult.errors,
            message: 'Operation validation failed'
          };
        }
        
        // Verify signature if provided
        if (signature && publicKey) {
          const isValidSignature = leibniz.verifySignature(
            publicKey, 
            signature, 
            operation
          );
          
          if (!isValidSignature) {
            return {
              success: false,
              message: 'Invalid operation signature'
            };
          }
        }
        
        try {
          // Process operation through state machine
          const compResult = computation.processOperation(operation, context);
          if (!compResult.success) {
            return {
              success: false,
              message: compResult.error || 'Operation processing failed'
            };
          }
          
          // Store operation in distributed storage
          const cid = await storage.store({
            operation,
            result: compResult,
            timestamp: Date.now(),
            signature
          });
          
          // Broadcast operation to network
          await network.broadcast({
            type: 'OPERATION',
            payload: operation,
            cid
          });
          
          return {
            success: true,
            cid,
            state: compResult.state
          };
          
        } catch (error) {
          return {
            success: false,
            message: `Operation execution error: ${error.message}`
          };
        }
      },
      
      // Graceful shutdown method
      async stop() {
        console.log('Shutting down Helia Blockchain Token application...');
        return helia.stop();
      }
    };
    
  } catch (error) {
    console.error('Failed to initialize token system:', error);
    throw error;
  }
}

/**
 * Sets up token categories using Aristotelian logic
 * @param {AristotelianRuleSystem} system - Categorization system
 * @private
 */
function setupTokenCategories(system) {
  // Create base token category
  const baseToken = system.addCategory('Token', {
    isToken: true
  });
  
  // Add fungible token subcategory
  baseToken.addSubcategory('FungibleToken', {
    fungible: true,
    divisible: value => value === true || value === false
  });
  
  // Add non-fungible token subcategory
  baseToken.addSubcategory('NonFungibleToken', {
    fungible: false,
    uniqueId: value => typeof value === 'string' && value.length > 0
  });
  
  // Add governance token subcategory
  baseToken.addSubcategory('GovernanceToken', {
    governance: true
  });
}

/**
 * Main function to initialize and run the blockchain token application
 */
async function main() {
  try {
    console.log('Starting Helia Blockchain Token application...');

    // Initialize the token system with default configuration
    const system = await initializeTokenSystem();
    
    console.log('Helia Blockchain Token application is running!');
    
    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
      await system.stop();
      process.exit(0);
    });
    
    return system;
    
  } catch (error) {
    console.error('Error starting Helia Blockchain Token application:', error);
    process.exit(1);
  }
}

// Exports for both programmatic usage and direct execution
module.exports = {
  initializeTokenSystem,
  main
};

// Start the application if this is the main module
if (require.main === module) {
  main().catch(console.error);
}
