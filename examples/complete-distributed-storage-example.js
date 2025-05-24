/**
 * complete-distributed-storage-example.js - Comprehensive example of distributed quantum-crypto synthesis with Web3.Storage integration
 * 
 * Demonstrates the complete distributed storage stack with Web3.Storage coordination:
 * - Quantum-crypto synthesis with distributed processing
 * - Unified storage orchestration across Helia, Filecoin, and Web3.Storage
 * - Intelligent pinning strategies and CDN optimization
 * - Adaptive token management with distributed storage
 */

const { createHelia } = require('helia');
const { unixfs } = require('@helia/unixfs');
const { 
  createQuantumCryptoSynthesis 
} = require('../src/utils/synthesis/quantum-crypto-synthesis');
const { 
  createDistributedSynthesis,
  createDistributedSynthesisWithStorage,
  MonitoringUtils 
} = require('../src/utils/synthesis/distributed');

async function demonstrateCompleteDistributedStorage() {
  console.log('🚀 Complete Distributed Storage with Web3.Storage Integration');
  console.log('================================================================\n');

  // 1. Initialize Helia for IPFS operations
  console.log('1. Initializing Helia IPFS Node...');
  const helia = await createHelia();
  const fs = unixfs(helia);
  
  // 2. Create distributed synthesis with integrated storage
  console.log('2. Creating Distributed Synthesis with Storage Integration...');
  const storageConfig = {
    web3Storage: {
      spaceDID: process.env.WEB3_STORAGE_SPACE_DID || null,
      email: process.env.WEB3_STORAGE_EMAIL || null,
      pinningStrategy: 'quantum-optimized',
      cdnEnabled: true
    },
    filecoin: {
      apiUrl: process.env.FILECOIN_API_URL || 'https://api.node.glif.io',
      dealConfig: {
        duration: 2880 * 180, // ~6 months
        verifiedDeal: true
      }
    },
    pinning: {
      services: ['web3-storage', 'local-ipfs'],
      defaultStrategy: 'quantum-optimized'
    },
    storageStrategy: 'quantum-optimized',
    redundancyLevel: 2
  };

  const coordinator = createDistributedSynthesisWithStorage(helia, {
    nodeId: 'storage-demo-coordinator',
    quantumWorkers: 4,
    signatureBatchSize: 50,
    cacheSize: 5000,
    ...storageConfig
  });

  // 3. Create quantum-crypto synthesis with storage enabled
  console.log('3. Creating Quantum-Crypto Synthesis with Storage...');
  const synthesis = createQuantumCryptoSynthesis({
    distributed: true,
    storageEnabled: true,
    helia,
    distributedConfig: {
      nodeId: 'synthesis-demo-node',
      ...storageConfig
    }
  });

  // Setup event monitoring
  setupComprehensiveEventMonitoring(coordinator, synthesis);

  // 4. Create metrics collector
  const metrics = MonitoringUtils.createMetricsCollector();

  try {
    // 5. Demonstrate adaptive tokens with distributed storage
    console.log('\n4. Creating Adaptive Tokens with Distributed Storage...');
    await demonstrateAdaptiveTokensWithStorage(synthesis, metrics);

    // 6. Demonstrate batch token storage
    console.log('\n5. Batch Token Storage Across Networks...');
    await demonstrateBatchTokenStorage(synthesis, metrics);

    // 7. Demonstrate token retrieval and verification
    console.log('\n6. Token Retrieval and Quantum Verification...');
    await demonstrateTokenRetrievalAndVerification(synthesis, metrics);

    // 8. Demonstrate storage strategy optimization
    console.log('\n7. Storage Strategy Optimization...');
    await demonstrateStorageOptimization(synthesis, metrics);

    // 9. Show comprehensive system statistics
    console.log('\n8. Complete System Statistics...');
    await showCompleteSystemStatistics(synthesis, coordinator, metrics);

  } catch (error) {
    console.error('Demo error:', error);
  } finally {
    // Cleanup
    console.log('\n9. Cleaning up...');
    await coordinator.shutdown();
    await helia.stop();
    console.log('✅ Demo completed successfully!');
  }
}

function setupComprehensiveEventMonitoring(coordinator, synthesis) {
  console.log('   Setting up comprehensive event monitoring...');

  // Distributed synthesis events
  coordinator.on('keyPairGenerated', (event) => {
    console.log(`   📊 Key pair generated: ${event.operationId} (Energy: ${event.energyLevel})`);
  });

  coordinator.on('quantumTokenStored', (event) => {
    console.log(`   💾 Token stored: ${event.tokenId} on networks: ${Object.keys(event.storageResult.networks || {}).join(', ')}`);
  });

  coordinator.on('quantumTokenRetrieved', (event) => {
    console.log(`   📥 Token retrieved: ${event.tokenId} (Original node: ${event.originalNodeId})`);
  });

  coordinator.on('batchStorageComplete', (event) => {
    console.log(`   📦 Batch storage: ${event.successful}/${event.successful + event.failed} tokens stored`);
  });

  coordinator.on('distributedStorageCompleted', (event) => {
    const duration = event.performance?.duration || 'unknown';
    console.log(`   ⚡ Storage ${event.operation}: ${duration}ms, Networks: ${event.networks || 'N/A'}`);
  });

  coordinator.on('storageReady', (event) => {
    console.log(`   🌐 Distributed storage ready on node: ${event.nodeId}`);
  });

  // Synthesis events
  synthesis.on?.('error', (error) => {
    console.error(`   ❌ Synthesis error: ${error.message}`);
  });
}

async function demonstrateAdaptiveTokensWithStorage(synthesis, metrics) {
  const tokenDataSets = [
    { 
      tokenId: 'quantum-token-1', 
      value: 1000, 
      metadata: { type: 'governance', importance: 'high' } 
    },
    { 
      tokenId: 'quantum-token-2', 
      value: 50000, 
      metadata: { type: 'staking', importance: 'critical' } 
    },
    { 
      tokenId: 'quantum-token-3', 
      value: 100, 
      metadata: { type: 'utility', importance: 'medium' } 
    }
  ];

  console.log('   Creating adaptive tokens with automatic storage...');
  
  for (const tokenData of tokenDataSets) {
    const startTime = Date.now();
    
    // Create adaptive token
    const adaptiveToken = await synthesis.createAdaptiveQuantumCryptoToken(tokenData);
    
    // Store with adaptive strategy
    const storageResult = await synthesis.storeAdaptiveToken(adaptiveToken, {
      metadata: { 
        created: new Date().toISOString(),
        importance: tokenData.metadata.importance 
      }
    });
    
    const duration = Date.now() - startTime;
    metrics.recordOperation('adaptiveTokenWithStorage', duration);
    
    console.log(`   - ${tokenData.tokenId}: ${tokenData.value} value, stored on ${Object.keys(storageResult.networks || {}).length} networks`);
    
    if (storageResult.success) {
      console.log(`     ✅ Storage successful, Cost: $${storageResult.totalCost?.toFixed(4) || '0'}`);
    } else {
      console.log(`     ❌ Storage failed`);
    }
  }
}

async function demonstrateBatchTokenStorage(synthesis, metrics) {
  const batchTokens = Array.from({ length: 5 }, (_, i) => ({
    tokenId: `batch-token-${i + 1}`,
    value: Math.floor(Math.random() * 10000) + 100,
    metadata: { 
      batch: true, 
      index: i,
      created: Date.now()
    }
  }));

  console.log(`   Batch storing ${batchTokens.length} tokens across distributed networks...`);
  
  const startTime = Date.now();
  
  // Create adaptive tokens first
  const adaptiveTokens = [];
  for (const tokenData of batchTokens) {
    const adaptiveToken = await synthesis.createAdaptiveQuantumCryptoToken(tokenData);
    adaptiveTokens.push(adaptiveToken);
  }
  
  // Batch store them
  const batchResult = await synthesis.batchStoreQuantumTokens(adaptiveTokens, {
    metadata: { batchDemo: true },
    strategy: 'balanced-performance'
  });
  
  const duration = Date.now() - startTime;
  metrics.recordOperation('batchTokenStorage', duration);
  
  console.log(`   - Batch completed: ${batchResult.successful} successful, ${batchResult.failed} failed`);
  console.log(`   - Total time: ${duration}ms`);
  
  if (batchResult.successful > 0) {
    const avgCostPerToken = batchResult.results
      .filter(r => r.success !== false)
      .reduce((sum, r) => sum + (r.totalCost || 0), 0) / batchResult.successful;
    console.log(`   - Average cost per token: $${avgCostPerToken.toFixed(4)}`);
  }
}

async function demonstrateTokenRetrievalAndVerification(synthesis, metrics) {
  const testTokenId = 'quantum-token-1'; // From previous demo
  
  console.log(`   Retrieving and verifying token: ${testTokenId}...`);
  
  const startTime = Date.now();
  
  try {
    // Retrieve token
    const retrievalResult = await synthesis.retrieveQuantumTokenData(testTokenId);
    
    const duration = Date.now() - startTime;
    metrics.recordOperation('tokenRetrieval', duration);
    
    if (retrievalResult.success) {
      console.log(`   ✅ Token retrieved in ${duration}ms`);
      console.log(`   - Retrieved from: ${retrievalResult.retrievedFrom || 'unknown'}`);
      console.log(`   - Content size: ${JSON.stringify(retrievalResult.content).length} bytes`);
      
      // Verify quantum properties if present
      const content = retrievalResult.content;
      if (content?.distributedMetadata?.quantumEnhanced) {
        console.log(`   - Quantum enhanced: ✅`);
        console.log(`   - Original node: ${content.distributedMetadata.nodeId}`);
        console.log(`   - Synthesis timestamp: ${new Date(content.distributedMetadata.synthesisTimestamp).toISOString()}`);
      }
      
      // Verify quantum-crypto properties
      if (content?.quantumCryptoProperties) {
        const qProps = content.quantumCryptoProperties;
        console.log(`   - Quantum complexity: ${qProps.quantumMetadata?.cryptoComplexity?.complexity || 'unknown'}`);
        console.log(`   - Energy level: ${qProps.quantumMetadata?.energyLevel || 'unknown'}`);
        console.log(`   - Can adapt: ${qProps.adaptiveCapabilities?.canRekeySelf ? '✅' : '❌'}`);
      }
    } else {
      console.log(`   ❌ Token retrieval failed`);
    }
    
  } catch (error) {
    console.log(`   ❌ Retrieval error: ${error.message}`);
  }
}

async function demonstrateStorageOptimization(synthesis, metrics) {
  console.log('   Testing storage strategy optimization...');
  
  const testScenarios = [
    { 
      name: 'High-Value Token', 
      value: 1000000, 
      expectedStrategy: 'maximum-security' 
    },
    { 
      name: 'Medium Token', 
      value: 5000, 
      expectedStrategy: 'balanced-performance' 
    },
    { 
      name: 'Micro Token', 
      value: 10, 
      expectedStrategy: 'cost-optimized' 
    }
  ];

  for (const scenario of testScenarios) {
    const startTime = Date.now();
    
    const token = await synthesis.createAdaptiveQuantumCryptoToken({
      tokenId: `optimization-test-${scenario.name.toLowerCase().replace(/\s+/g, '-')}`,
      value: scenario.value,
      metadata: { scenario: scenario.name }
    });
    
    const storageResult = await synthesis.storeAdaptiveToken(token);
    
    const duration = Date.now() - startTime;
    metrics.recordOperation('storageOptimization', duration);
    
    const networksUsed = Object.keys(storageResult.networks || {});
    console.log(`   - ${scenario.name}: ${networksUsed.length} networks, ${duration}ms`);
    console.log(`     Networks: ${networksUsed.join(', ')}`);
  }
}

async function showCompleteSystemStatistics(synthesis, coordinator, metrics) {
  console.log('   Gathering comprehensive system statistics...');
  
  const [synthesisStats, coordinatorStats, metricsData] = await Promise.all([
    synthesis.getSystemStats(),
    coordinator.getSystemStats(),
    Promise.resolve(metrics.getMetrics())
  ]);
  
  console.log('\n📊 COMPLETE SYSTEM STATISTICS');
  console.log('=====================================');
  
  // Synthesis statistics
  console.log(`\n🧮 Quantum-Crypto Synthesis:`);
  console.log(`   Mode: ${synthesisStats.mode}`);
  console.log(`   Storage Enabled: ${synthesisStats.storageEnabled ? '✅' : '❌'}`);
  console.log(`   Local Cache Size: ${synthesisStats.localCache?.size || 0}`);
  
  // Coordinator statistics
  console.log(`\n🔄 Distributed Coordinator:`);
  console.log(`   Node ID: ${coordinatorStats.coordinator.nodeId}`);
  console.log(`   Uptime: ${Math.floor(coordinatorStats.coordinator.uptime / 1000)}s`);
  console.log(`   Total Operations: ${coordinatorStats.coordinator.totalOperations}`);
  console.log(`   Storage Operations: ${coordinatorStats.coordinator.storageOperations || 0}`);
  
  // Storage statistics
  if (coordinatorStats.storageOrchestrator) {
    console.log(`\n💾 Storage Orchestrator:`);
    console.log(`   Successful Operations: ${coordinatorStats.storageOrchestrator.successfulOperations}`);
    console.log(`   Failed Operations: ${coordinatorStats.storageOrchestrator.failedOperations}`);
    console.log(`   Total Bytes Stored: ${coordinatorStats.storageOrchestrator.bytesStored}`);
    console.log(`   Cost Savings: $${coordinatorStats.storageOrchestrator.costSavings?.toFixed(4) || '0'}`);
  }
  
  // Performance metrics
  console.log(`\n⚡ Performance Metrics:`);
  console.log(`   Total Operations: ${metricsData.totalOperations}`);
  console.log(`   Average Latency: ${metricsData.averageLatency?.toFixed(2)}ms`);
  console.log(`   Error Rate: ${(metricsData.errorRate * 100)?.toFixed(2)}%`);
  console.log(`   Throughput: ${metricsData.throughput?.toFixed(2)} ops/sec`);
  
  // Operation breakdown
  console.log(`\n📈 Operation Breakdown:`);
  Object.entries(metricsData.operations).forEach(([op, data]) => {
    console.log(`   ${op}: ${data.count} operations, avg ${data.averageTime?.toFixed(2)}ms`);
  });
  
  console.log('\n✨ Distributed storage with Web3.Storage integration is fully operational!');
}

// Alternative demonstration with error handling
async function demonstrateWithErrorHandling() {
  try {
    await demonstrateCompleteDistributedStorage();
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
    console.error('Stack trace:', error.stack);
    
    // Provide helpful troubleshooting
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Ensure you have proper Web3.Storage credentials set:');
    console.log('   export WEB3_STORAGE_EMAIL="your-email@example.com"');
    console.log('   export WEB3_STORAGE_SPACE_DID="your-space-did"');
    console.log('2. Check your internet connection for IPFS operations');
    console.log('3. Verify that all dependencies are properly installed');
    
    process.exit(1);
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateWithErrorHandling();
}

module.exports = {
  demonstrateCompleteDistributedStorage,
  demonstrateWithErrorHandling
};
