/**
 * index.js - Distributed quantum-crypto synthesis entry point
 * 
 * Provides unified access to all distributed synthesis components
 * Exports factory functions and configuration utilities
 */

const DistributedSynthesisCoordinator = require('./distributed-synthesis-coordinator');
const QuantumProcessor = require('./quantum-processor');
const SignatureService = require('./signature-service');
const AdaptiveTokenManager = require('./adaptive-token-manager');
const CacheManager = require('./cache-manager');
const WorkerPool = require('./worker-pool');

/**
 * Create a fully configured distributed synthesis system
 * @param {Object} options - Configuration options
 * @param {Object} options.helia - Helia instance for storage orchestration
 * @param {Object} options.storageConfig - Storage orchestrator configuration
 * @param {boolean} options.storageEnabled - Enable distributed storage
 * @returns {DistributedSynthesisCoordinator} - Configured coordinator instance
 */
function createDistributedSynthesis(options = {}) {
  const defaultOptions = {
    quantumWorkers: 4,
    signatureBatchSize: 100,
    cacheSize: 10000,
    enableFailover: true,
    healthCheckInterval: 30000,
    storageEnabled: options.helia ? true : false,
    nodeId: null // Auto-generated if not provided
  };
  
  const config = { ...defaultOptions, ...options };
    return new DistributedSynthesisCoordinator(config);
}

/**
 * Create distributed synthesis with integrated storage orchestration
 * @param {Object} helia - Helia instance for IPFS operations
 * @param {Object} options - Configuration options
 * @param {Object} options.web3Storage - Web3.Storage configuration
 * @param {Object} options.filecoin - Filecoin storage configuration
 * @param {Object} options.pinning - Pinning service configuration
 * @returns {DistributedSynthesisCoordinator} - Coordinator with storage capabilities
 */
function createDistributedSynthesisWithStorage(helia, options = {}) {
  const storageConfig = {
    web3Storage: options.web3Storage || null,
    filecoin: options.filecoin || null,
    pinning: options.pinning || {},
    storageStrategy: options.storageStrategy || 'quantum-optimized',
    redundancyLevel: options.redundancyLevel || 2
  };

  return createDistributedSynthesis({
    ...options,
    helia,
    storageEnabled: true,
    storageConfig
  });
}

/**
 * Create individual distributed components
 */
function createQuantumProcessor(workerCount = 4) {
  return new QuantumProcessor(workerCount);
}

function createSignatureService(options = {}) {
  return new SignatureService(options);
}

function createAdaptiveTokenManager(options = {}) {
  return new AdaptiveTokenManager(options);
}

function createCacheManager(namespace, options = {}) {
  return new CacheManager(namespace, options);
}

function createWorkerPool(options = {}) {
  return new WorkerPool(options);
}

/**
 * Distributed synthesis patterns and utilities
 */
const DistributedPatterns = {
  // Load balancing strategies
  LoadBalancing: {
    ROUND_ROBIN: 'round_robin',
    LEAST_BUSY: 'least_busy',
    ENERGY_WEIGHTED: 'energy_weighted',
    QUANTUM_AFFINITY: 'quantum_affinity'
  },
  
  // Consensus algorithms
  Consensus: {
    SIMPLE_MAJORITY: 'simple_majority',
    SUPER_MAJORITY: 'super_majority',
    BYZANTINE_FAULT_TOLERANT: 'bft',
    QUANTUM_CONSENSUS: 'quantum_consensus'
  },
  
  // Replication strategies
  Replication: {
    SYNCHRONOUS: 'sync',
    ASYNCHRONOUS: 'async',
    EVENTUAL_CONSISTENCY: 'eventual',
    STRONG_CONSISTENCY: 'strong'
  },
  
  // Failure handling
  FailureHandling: {
    FAILOVER: 'failover',
    CIRCUIT_BREAKER: 'circuit_breaker',
    RETRY_WITH_BACKOFF: 'retry_backoff',
    GRACEFUL_DEGRADATION: 'graceful_degradation'
  }
};

/**
 * Configuration presets for different deployment scenarios
 */
const ConfigurationPresets = {
  // High-performance configuration
  highPerformance: {
    quantumWorkers: 8,
    signatureBatchSize: 200,
    cacheSize: 50000,
    enableFailover: true,
    healthCheckInterval: 15000
  },
  
  // Memory-optimized configuration
  memoryOptimized: {
    quantumWorkers: 2,
    signatureBatchSize: 50,
    cacheSize: 5000,
    enableFailover: true,
    healthCheckInterval: 60000
  },
  
  // Development configuration
  development: {
    quantumWorkers: 2,
    signatureBatchSize: 10,
    cacheSize: 1000,
    enableFailover: false,
    healthCheckInterval: 30000
  },
  
  // Production configuration
  production: {
    quantumWorkers: 6,
    signatureBatchSize: 150,
    cacheSize: 25000,
    enableFailover: true,
    healthCheckInterval: 20000
  }
};

/**
 * Utility functions for distributed synthesis
 */
const DistributedUtils = {
  /**
   * Calculate optimal worker count based on system resources
   */
  calculateOptimalWorkerCount() {
    const cpuCount = require('os').cpus().length;
    return Math.max(2, Math.min(cpuCount - 1, 8));
  },
  
  /**
   * Generate distributed node identifier
   */
  generateNodeId(prefix = 'node') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Create network topology for distributed nodes
   */
  createNetworkTopology(nodeCount, topology = 'mesh') {
    const nodes = Array.from({ length: nodeCount }, (_, i) => 
      this.generateNodeId(`node-${i}`)
    );
    
    const connections = new Map();
    
    switch (topology) {
      case 'mesh':
        // Full mesh - every node connected to every other node
        nodes.forEach(nodeA => {
          connections.set(nodeA, nodes.filter(nodeB => nodeB !== nodeA));
        });
        break;
        
      case 'ring':
        // Ring topology - each node connected to next and previous
        nodes.forEach((node, index) => {
          const next = nodes[(index + 1) % nodes.length];
          const prev = nodes[(index - 1 + nodes.length) % nodes.length];
          connections.set(node, [next, prev]);
        });
        break;
        
      case 'star':
        // Star topology - one central hub connected to all others
        const hub = nodes[0];
        const spokes = nodes.slice(1);
        connections.set(hub, spokes);
        spokes.forEach(spoke => {
          connections.set(spoke, [hub]);
        });
        break;
    }
    
    return { nodes, connections };
  },
  
  /**
   * Validate distributed configuration
   */
  validateConfiguration(config) {
    const errors = [];
    
    if (config.quantumWorkers < 1) {
      errors.push('quantumWorkers must be at least 1');
    }
    
    if (config.signatureBatchSize < 1) {
      errors.push('signatureBatchSize must be at least 1');
    }
    
    if (config.cacheSize < 100) {
      errors.push('cacheSize must be at least 100');
    }
    
    if (config.healthCheckInterval < 5000) {
      errors.push('healthCheckInterval must be at least 5000ms');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

/**
 * Factory function with preset configuration
 */
function createDistributedSynthesisWithPreset(presetName, overrides = {}) {
  const preset = ConfigurationPresets[presetName];
  if (!preset) {
    throw new Error(`Unknown configuration preset: ${presetName}`);
  }
  
  const config = { ...preset, ...overrides };
  const validation = DistributedUtils.validateConfiguration(config);
  
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
  }
  
  return createDistributedSynthesis(config);
}

/**
 * Monitoring and metrics utilities
 */
const MonitoringUtils = {
  /**
   * Create performance metrics collector
   */
  createMetricsCollector() {
    const metrics = {
      operations: new Map(),
      latencies: [],
      throughput: 0,
      errors: 0,
      startTime: Date.now()
    };
    
    return {
      recordOperation(type, duration, success = true) {
        if (!metrics.operations.has(type)) {
          metrics.operations.set(type, { count: 0, totalDuration: 0 });
        }
        
        const op = metrics.operations.get(type);
        op.count++;
        op.totalDuration += duration;
        
        metrics.latencies.push(duration);
        
        if (!success) {
          metrics.errors++;
        }
        
        // Calculate throughput (operations per second)
        const uptime = (Date.now() - metrics.startTime) / 1000;
        metrics.throughput = this.getTotalOperations() / uptime;
      },
      
      getTotalOperations() {
        return Array.from(metrics.operations.values())
          .reduce((total, op) => total + op.count, 0);
      },
      
      getAverageLatency() {
        return metrics.latencies.length > 0 
          ? metrics.latencies.reduce((sum, lat) => sum + lat, 0) / metrics.latencies.length 
          : 0;
      },
      
      getMetrics() {
        return {
          ...metrics,
          totalOperations: this.getTotalOperations(),
          averageLatency: this.getAverageLatency(),
          errorRate: metrics.errors / this.getTotalOperations()
        };
      }
    };
  }
};

module.exports = {
  // Main factory functions
  createDistributedSynthesis,
  createDistributedSynthesisWithStorage,
  createDistributedSynthesisWithPreset,
  
  // Individual component factories
  createQuantumProcessor,
  createSignatureService,
  createAdaptiveTokenManager,
  createCacheManager,
  createWorkerPool,
  
  // Core classes
  DistributedSynthesisCoordinator,
  QuantumProcessor,
  SignatureService,
  AdaptiveTokenManager,
  CacheManager,
  WorkerPool,
  
  // Patterns and configuration
  DistributedPatterns,
  ConfigurationPresets,
  DistributedUtils,
  MonitoringUtils
};
