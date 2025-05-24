/**
 * distributed-synthesis-example.js - Comprehensive example of distributed quantum-crypto synthesis
 * 
 * Demonstrates the full distributed architecture with multiple nodes, load balancing,
 * consensus mechanisms, and adaptive token management
 */

const { 
  createDistributedSynthesis, 
  createDistributedSynthesisWithPreset,
  DistributedPatterns,
  ConfigurationPresets,
  MonitoringUtils
} = require('../src/utils/synthesis/distributed');

const { createQuantumCryptoSynthesis } = require('../src/utils/synthesis/quantum-crypto-synthesis');

async function demonstrateDistributedSynthesis() {
  console.log('🚀 Starting Distributed Quantum-Crypto Synthesis Demonstration');
  console.log('================================================================\n');

  // 1. Create distributed synthesis coordinator with high-performance preset
  console.log('1. Creating High-Performance Distributed Coordinator...');
  const coordinator = createDistributedSynthesisWithPreset('highPerformance', {
    nodeId: 'demo-coordinator-1'
  });

  // Setup event monitoring
  setupEventMonitoring(coordinator);

  // 2. Create metrics collector
  const metrics = MonitoringUtils.createMetricsCollector();

  try {
    // 3. Demonstrate distributed key pair generation
    console.log('\n2. Generating Quantum-Informed Key Pairs (Distributed)...');
    await demonstrateDistributedKeyGeneration(coordinator, metrics);

    // 4. Demonstrate batch signature processing
    console.log('\n3. Processing Signature Batch (Distributed)...');
    await demonstrateBatchSignatureProcessing(coordinator, metrics);

    // 5. Demonstrate adaptive token management
    console.log('\n4. Creating Adaptive Tokens (Distributed Management)...');
    await demonstrateAdaptiveTokens(coordinator, metrics);

    // 6. Demonstrate consensus and token evolution
    console.log('\n5. Demonstrating Token Evolution with Consensus...');
    await demonstrateTokenEvolution(coordinator, metrics);

    // 7. Show system statistics
    console.log('\n6. System Performance Statistics...');
    await showSystemStatistics(coordinator, metrics);

    // 8. Demonstrate load balancing
    console.log('\n7. Load Balancing and Health Monitoring...');
    await demonstrateLoadBalancing(coordinator);

    // 9. Demonstrate failover capabilities
    console.log('\n8. Failover and Recovery...');
    await demonstrateFailover(coordinator);

  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  } finally {
    // Cleanup
    console.log('\n9. Shutting down distributed system...');
    await coordinator.shutdown();
    console.log('✅ Demonstration complete!');
  }
}

function setupEventMonitoring(coordinator) {
  // Key pair generation events
  coordinator.on('keyPairGenerated', (event) => {
    console.log(`   ✓ Key pair generated: ${event.operationId} (distributed: ${event.distributed})`);
  });

  // Signature events
  coordinator.on('signatureCreated', (event) => {
    console.log(`   ✓ Signature created: ${event.operationId} (method: ${event.signatureMethod})`);
  });

  // Token evolution events
  coordinator.on('tokenEvolution', (event) => {
    console.log(`   🧬 Token evolved: ${event.tokenId}`);
  });

  // Distributed consensus events
  coordinator.on('distributedConsensus', (event) => {
    console.log(`   🤝 Consensus reached: ${event.proposalId}`);
  });

  // System health events
  coordinator.on('healthUpdate', (status) => {
    console.log(`   💚 Health status: ${status.globalHealth}`);
  });

  // Load balancing events
  coordinator.on('loadBalancing', (event) => {
    console.log(`   ⚖️  Load balancing triggered for: ${event.overloaded.join(', ')}`);
  });

  // Failover events
  coordinator.on('failoverTriggered', (event) => {
    console.log(`   🔄 Failover triggered for: ${event.component}`);
  });
}

async function demonstrateDistributedKeyGeneration(coordinator, metrics) {
  const tokenValues = [100n, 1000n, 10000n, 100000n];
  const frequencies = [1n, 5n, 10n, 25n];

  console.log('   Generating key pairs for different energy levels...');
  
  for (let i = 0; i < tokenValues.length; i++) {
    const startTime = Date.now();
    
    const keyPair = await coordinator.createQuantumInformedKeyPair(
      tokenValues[i], 
      frequencies[i]
    );
    
    const duration = Date.now() - startTime;
    metrics.recordOperation('keyPairGeneration', duration);
    
    console.log(`   - Value: ${tokenValues[i]}, Energy: ${keyPair.quantumMetadata.energyLevel}, Complexity: ${keyPair.quantumMetadata.cryptoComplexity?.complexity}`);
  }
}

async function demonstrateBatchSignatureProcessing(coordinator, metrics) {
  // Create a batch of signature operations
  const batchOperations = Array.from({ length: 10 }, (_, i) => ({
    type: 'signatures',
    privateKey: `private-key-${i}`,
    data: { message: `Transaction ${i}`, value: 1000 + i * 100 },
    tokenValue: BigInt(1000 + i * 100)
  }));

  console.log(`   Processing batch of ${batchOperations.length} signature operations...`);
  
  const startTime = Date.now();
  const results = await coordinator.processBatch(batchOperations);
  const duration = Date.now() - startTime;
  
  metrics.recordOperation('batchSignature', duration);
  
  console.log(`   ✓ Batch completed: ${results.length} signatures processed in ${duration}ms`);
}

async function demonstrateAdaptiveTokens(coordinator, metrics) {
  const tokenDataSets = [
    { id: 'token-1', value: 500, metadata: { type: 'payment' } },
    { id: 'token-2', value: 2500, metadata: { type: 'governance' } },
    { id: 'token-3', value: 15000, metadata: { type: 'staking' } }
  ];

  console.log('   Creating adaptive tokens with distributed management...');
  
  for (const tokenData of tokenDataSets) {
    const startTime = Date.now();
    
    const adaptiveToken = await coordinator.createAdaptiveQuantumCryptoToken(tokenData);
    
    const duration = Date.now() - startTime;
    metrics.recordOperation('adaptiveTokenCreation', duration);
    
    console.log(`   - Token ${tokenData.id}: Value ${tokenData.value}, Complexity: ${adaptiveToken.quantumCryptoProperties.quantumMetadata.cryptoComplexity?.complexity}`);
  }
}

async function demonstrateTokenEvolution(coordinator, metrics) {
  console.log('   Creating token for evolution demonstration...');
  
  const initialToken = await coordinator.createAdaptiveQuantumCryptoToken({
    id: 'evolution-token',
    value: 1000,
    metadata: { type: 'evolving' }
  });

  console.log(`   Initial complexity: ${initialToken.quantumCryptoProperties.quantumMetadata.cryptoComplexity?.complexity}`);

  // Trigger evolution by significantly changing value
  console.log('   Triggering token evolution with value change...');
  
  const startTime = Date.now();
  const evolutionResult = await coordinator.adaptTokenCryptography(
    'evolution-token',
    50000, // Significant value increase
    10n    // Higher frequency
  );
  const duration = Date.now() - startTime;
  
  metrics.recordOperation('tokenEvolution', duration);
  
  if (evolutionResult.adapted) {
    console.log(`   ✓ Token evolved: ${evolutionResult.reason}`);
    console.log(`   New complexity: ${evolutionResult.newComplexity}`);
  } else {
    console.log(`   - No evolution needed: ${evolutionResult.reason}`);
  }
}

async function showSystemStatistics(coordinator, metrics) {
  const systemStats = await coordinator.getSystemStats();
  const performanceMetrics = metrics.getMetrics();

  console.log('   📊 System Statistics:');
  console.log(`   - Node ID: ${systemStats.coordinator.nodeId}`);
  console.log(`   - Uptime: ${Math.floor(systemStats.coordinator.uptime / 1000)}s`);
  console.log(`   - Total Operations: ${systemStats.coordinator.totalOperations}`);
  console.log(`   - Distributed Operations: ${systemStats.coordinator.distributedOperations}`);
  console.log(`   - Global Health: ${systemStats.coordinator.health.globalHealth}`);
  
  console.log('\n   📈 Performance Metrics:');
  console.log(`   - Total Operations: ${performanceMetrics.totalOperations}`);
  console.log(`   - Average Latency: ${Math.round(performanceMetrics.averageLatency)}ms`);
  console.log(`   - Throughput: ${Math.round(performanceMetrics.throughput)} ops/sec`);
  console.log(`   - Error Rate: ${(performanceMetrics.errorRate * 100).toFixed(2)}%`);

  // Component-specific stats
  console.log('\n   🔧 Component Statistics:');
  console.log(`   - Quantum Workers: ${systemStats.quantumProcessor.length} workers`);
  console.log(`   - Signature Cache Hits: ${systemStats.signatureService.cacheHits}`);
  console.log(`   - Tokens Managed: ${systemStats.tokenManager.tokensManaged}`);
  console.log(`   - Cache Hit Rate: ${((systemStats.globalCache.hits / (systemStats.globalCache.hits + systemStats.globalCache.misses)) * 100).toFixed(1)}%`);
}

async function demonstrateLoadBalancing(coordinator) {
  console.log('   Simulating load balancing scenario...');
  
  // Generate high load to trigger load balancing
  const highLoadOperations = Array.from({ length: 50 }, (_, i) => ({
    type: 'keyPairs',
    tokenValue: BigInt(1000 + i),
    frequency: 1n
  }));

  console.log('   Generating high load to trigger load balancing...');
  
  // Process in smaller batches to simulate continuous load
  for (let i = 0; i < highLoadOperations.length; i += 10) {
    const batch = highLoadOperations.slice(i, i + 10);
    coordinator.processBatch(batch).catch(() => {}); // Fire and forget
    
    // Small delay to simulate sustained load
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Trigger manual load balancing check
  await coordinator.balanceLoad();
  
  console.log('   ✓ Load balancing demonstration complete');
}

async function demonstrateFailover(coordinator) {
  console.log('   Simulating component failure and recovery...');
  
  // Simulate component failure
  coordinator.handleComponentError('quantumProcessor', new Error('Simulated failure'));
  
  // Wait for failover to trigger
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Try to continue operations during failover
  try {
    const keyPair = await coordinator.createQuantumInformedKeyPair(5000n, 1n);
    console.log('   ✓ Operations continued during failover');
  } catch (error) {
    console.log('   ⚠️  Operations affected by failure (expected)');
  }
  
  console.log('   ✓ Failover demonstration complete');
}

// Alternative demonstration with standard (non-distributed) synthesis
async function demonstrateStandardSynthesis() {
  console.log('\n🔄 Standard (Non-Distributed) Synthesis Comparison');
  console.log('================================================\n');

  const standardSynthesis = createQuantumCryptoSynthesis();
  const metrics = MonitoringUtils.createMetricsCollector();

  console.log('1. Standard key pair generation...');
  const startTime = Date.now();
  
  const keyPair = await standardSynthesis.createQuantumInformedKeyPair(10000n, 5n);
  
  const duration = Date.now() - startTime;
  metrics.recordOperation('standardKeyPair', duration);
  
  console.log(`   ✓ Generated in ${duration}ms`);
  console.log(`   Complexity: ${keyPair.quantumMetadata.cryptoComplexity.complexity}`);

  console.log('\n2. Standard adaptive token creation...');
  const tokenStartTime = Date.now();
  
  const adaptiveToken = await standardSynthesis.createAdaptiveQuantumCryptoToken({
    id: 'standard-token',
    value: 7500
  });
  
  const tokenDuration = Date.now() - tokenStartTime;
  metrics.recordOperation('standardToken', tokenDuration);
  
  console.log(`   ✓ Created in ${tokenDuration}ms`);
  console.log(`   Can adapt: ${adaptiveToken.quantumCryptoProperties.adaptiveCapabilities.canRekeySelf}`);
}

// Run both demonstrations
async function runCompleteDemo() {
  try {
    await demonstrateDistributedSynthesis();
    await demonstrateStandardSynthesis();
    
    console.log('\n🎯 Key Takeaways:');
    console.log('================');
    console.log('• Distributed synthesis provides scalability and fault tolerance');
    console.log('• Quantum-crypto synthesis adapts security based on token energy');
    console.log('• Adaptive tokens can evolve their cryptographic properties');
    console.log('• Consensus mechanisms ensure distributed consistency');
    console.log('• Load balancing optimizes resource utilization');
    console.log('• Failover capabilities maintain system availability');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for use in other contexts
module.exports = {
  demonstrateDistributedSynthesis,
  demonstrateStandardSynthesis,
  runCompleteDemo
};

// Run demo if executed directly
if (require.main === module) {
  runCompleteDemo();
}
