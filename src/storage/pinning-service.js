/**
 * pinning-service.js - Universal Pinning Service Manager
 * 
 * Provides a unified interface for pinning content across multiple services:
 * - Web3.Storage for CDN and easy access
 * - Pinata for enterprise pinning
 * - Local IPFS pinning
 * - Custom pinning services
 * 
 * Integrates with quantum-crypto synthesis for intelligent pinning strategies
 */

const EventEmitter = require('events');
const { getCID, createCID, isCID, cidToString } = require('../utils/multiformats-compat');

// Import quantum-crypto synthesis components
const leibniz = require('../utils/leibniz');
const planck = require('../utils/planck');
const shannon = require('../utils/shannon');
const aristotle = require('../utils/aristotle');

/**
 * Universal Pinning Service Manager
 */
class PinningServiceManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.services = new Map();
    this.pinStrategies = new Map();
    this.quantumPinCache = new Map();
    
    this.config = {
      defaultStrategy: options.defaultStrategy || 'quantum-optimized',
      redundancyLevel: options.redundancyLevel || 2,
      failoverEnabled: options.failoverEnabled !== false,
      costOptimization: options.costOptimization !== false,
      ...options
    };
    
    this.stats = {
      totalPins: 0,
      successfulPins: 0,
      failedPins: 0,
      redundancyAchieved: 0,
      costSavings: 0
    };
    
    this.initializePinningStrategies();
  }

  /**
   * Register a pinning service
   * @param {string} name - Service name
   * @param {Object} service - Service instance with pin/unpin methods
   * @param {Object} config - Service configuration
   */
  registerService(name, service, config = {}) {
    this.services.set(name, {
      service,
      config: {
        priority: config.priority || 1,
        costPerGB: config.costPerGB || 0,
        maxFileSize: config.maxFileSize || Infinity,
        supportsQuantum: config.supportsQuantum || false,
        ...config
      },
      stats: {
        pins: 0,
        unpins: 0,
        failures: 0,
        totalCost: 0
      }
    });
    
    this.emit('serviceRegistered', { name, config });
  }

  /**
   * Pin content using quantum-optimized strategy
   * @param {Object} content - Content to pin
   * @param {Object} options - Pinning options
   * @returns {Promise<Object>} - Pinning results
   */
  async pinContent(content, options = {}) {
    try {
      // PLANCK: Quantize content properties
      const contentSize = this.estimateContentSize(content);
      const quantizedSize = planck.quantize(contentSize);
      
      // SHANNON: Calculate content entropy for strategy selection
      const entropy = shannon.calculateEntropy(content);
      
      // LEIBNIZ: Create content hash for tracking
      const contentHash = leibniz.monadHash(content);
      
      // ARISTOTLE: Classify content for appropriate handling
      const contentCategory = aristotle.classifyEntity({
        type: 'content',
        size: contentSize,
        entropy,
        metadata: options.metadata || {}
      });
      
      // Select optimal pinning strategy
      const strategy = this.selectPinningStrategy(quantizedSize, entropy, contentCategory, options);
      
      // Execute pinning across selected services
      const pinningResults = await this.executePinningStrategy(strategy, content, contentHash, options);
      
      // Track pinning information
      const pinInfo = {
        contentHash,
        strategy: strategy.name,
        services: pinningResults.services,
        quantumProperties: {
          quantizedSize,
          entropy,
          category: contentCategory
        },
        timestamp: Date.now(),
        status: pinningResults.success ? 'pinned' : 'failed'
      };
      
      this.quantumPinCache.set(contentHash, pinInfo);
      this.updateStats(pinningResults);
      
      this.emit('contentPinned', pinInfo);
      
      return {
        success: pinningResults.success,
        contentHash,
        strategy: strategy.name,
        services: pinningResults.services,
        redundancyAchieved: pinningResults.successCount,
        cost: pinningResults.totalCost,
        quantumOptimization: strategy.quantumOptimization
      };
      
    } catch (error) {
      this.emit('error', { operation: 'pinContent', error });
      throw error;
    }
  }

  /**
   * Unpin content from services
   * @param {string} contentHash - Hash of content to unpin
   * @param {Object} options - Unpinning options
   * @returns {Promise<Object>} - Unpinning results
   */
  async unpinContent(contentHash, options = {}) {
    try {
      const pinInfo = this.quantumPinCache.get(contentHash);
      if (!pinInfo) {
        throw new Error(`No pinning information found for content: ${contentHash}`);
      }
      
      const unpinResults = {
        success: true,
        services: {},
        failedServices: []
      };
      
      // Unpin from all services that pinned the content
      for (const [serviceName, pinData] of Object.entries(pinInfo.services)) {
        if (pinData.pinned) {
          try {
            const serviceInfo = this.services.get(serviceName);
            if (serviceInfo && serviceInfo.service.unpin) {
              await serviceInfo.service.unpin(pinData.pinId || contentHash);
              unpinResults.services[serviceName] = { unpinned: true };
              serviceInfo.stats.unpins++;
            }
          } catch (error) {
            unpinResults.services[serviceName] = { unpinned: false, error: error.message };
            unpinResults.failedServices.push(serviceName);
          }
        }
      }
      
      // Update pin info
      pinInfo.status = 'unpinned';
      pinInfo.unpinnedAt = Date.now();
      this.quantumPinCache.set(contentHash, pinInfo);
      
      this.emit('contentUnpinned', { contentHash, results: unpinResults });
      
      return unpinResults;
      
    } catch (error) {
      this.emit('error', { operation: 'unpinContent', error });
      throw error;
    }
  }

  /**
   * Initialize quantum-informed pinning strategies
   * @private
   */
  initializePinningStrategies() {
    // High-performance strategy for low-latency access
    this.pinStrategies.set('high-performance', {
      name: 'high-performance',
      description: 'Prioritizes speed and availability',
      serviceSelection: (services, content) => {
        return Array.from(services.entries())
          .filter(([_, info]) => info.config.priority >= 3)
          .sort((a, b) => b[1].config.priority - a[1].config.priority)
          .slice(0, this.config.redundancyLevel);
      },
      quantumOptimization: 'speed'
    });
    
    // Cost-optimized strategy for large content
    this.pinStrategies.set('cost-optimized', {
      name: 'cost-optimized',
      description: 'Minimizes cost while maintaining redundancy',
      serviceSelection: (services, content) => {
        return Array.from(services.entries())
          .sort((a, b) => a[1].config.costPerGB - b[1].config.costPerGB)
          .slice(0, this.config.redundancyLevel);
      },
      quantumOptimization: 'cost'
    });
    
    // Quantum-optimized strategy based on content properties
    this.pinStrategies.set('quantum-optimized', {
      name: 'quantum-optimized',
      description: 'Uses quantum properties to optimize pinning',
      serviceSelection: (services, content, quantumProps) => {
        const { quantizedSize, entropy, category } = quantumProps;
        
        // High entropy content benefits from CDN services
        if (entropy > 7) {
          return Array.from(services.entries())
            .filter(([_, info]) => info.config.supportsCDN)
            .slice(0, this.config.redundancyLevel);
        }
        
        // Large quantized content needs distributed pinning
        if (quantizedSize > 1000000n) {
          return Array.from(services.entries())
            .filter(([_, info]) => info.config.supportsLargeFiles)
            .slice(0, this.config.redundancyLevel);
        }
        
        // Default to balanced selection
        return Array.from(services.entries())
          .sort((a, b) => b[1].config.priority - a[1].config.priority)
          .slice(0, this.config.redundancyLevel);
      },
      quantumOptimization: 'adaptive'
    });
    
    // Redundancy-focused strategy for critical content
    this.pinStrategies.set('maximum-redundancy', {
      name: 'maximum-redundancy',
      description: 'Maximizes redundancy across all available services',
      serviceSelection: (services, content) => {
        return Array.from(services.entries());
      },
      quantumOptimization: 'redundancy'
    });
  }

  /**
   * Select optimal pinning strategy based on content properties
   * @private
   */
  selectPinningStrategy(quantizedSize, entropy, category, options) {
    const strategyName = options.strategy || this.config.defaultStrategy;
    
    // Override strategy based on quantum properties if auto-selection enabled
    if (strategyName === 'auto' || options.quantumAutoSelect) {
      if (entropy > 7 && quantizedSize < 100000n) {
        return this.pinStrategies.get('high-performance');
      } else if (quantizedSize > 1000000n) {
        return this.pinStrategies.get('cost-optimized');
      } else if (category.criticalityLevel === 'high') {
        return this.pinStrategies.get('maximum-redundancy');
      }
    }
    
    return this.pinStrategies.get(strategyName) || this.pinStrategies.get('quantum-optimized');
  }

  /**
   * Execute pinning strategy across selected services
   * @private
   */
  async executePinningStrategy(strategy, content, contentHash, options) {
    const quantumProps = {
      quantizedSize: planck.quantize(this.estimateContentSize(content)),
      entropy: shannon.calculateEntropy(content),
      category: aristotle.classifyEntity({ type: 'content', ...options.metadata })
    };
    
    const selectedServices = strategy.serviceSelection(this.services, content, quantumProps);
    
    const results = {
      success: false,
      services: {},
      successCount: 0,
      totalCost: 0,
      failedServices: []
    };
    
    // Pin to selected services concurrently
    const pinningPromises = selectedServices.map(async ([serviceName, serviceInfo]) => {
      try {
        const pinResult = await this.pinToService(serviceName, serviceInfo, content, contentHash, options);
        results.services[serviceName] = pinResult;
        
        if (pinResult.pinned) {
          results.successCount++;
          results.totalCost += pinResult.cost || 0;
          serviceInfo.stats.pins++;
          serviceInfo.stats.totalCost += pinResult.cost || 0;
        }
        
        return { serviceName, success: pinResult.pinned };
        
      } catch (error) {
        results.services[serviceName] = { pinned: false, error: error.message };
        results.failedServices.push(serviceName);
        serviceInfo.stats.failures++;
        
        return { serviceName, success: false, error };
      }
    });
    
    await Promise.allSettled(pinningPromises);
    
    // Determine overall success based on redundancy requirements
    results.success = results.successCount >= this.config.redundancyLevel;
    
    return results;
  }

  /**
   * Pin content to a specific service
   * @private
   */
  async pinToService(serviceName, serviceInfo, content, contentHash, options) {
    const { service, config } = serviceInfo;
    
    // Check if service supports the content
    const contentSize = this.estimateContentSize(content);
    if (contentSize > config.maxFileSize) {
      throw new Error(`Content too large for service ${serviceName}`);
    }
    
    // Pin content using service-specific method
    let pinResult;
    if (service.pinQuantumContent && config.supportsQuantum) {
      pinResult = await service.pinQuantumContent(content, { ...options, contentHash });
    } else if (service.pin) {
      pinResult = await service.pin(content, options);
    } else {
      throw new Error(`Service ${serviceName} does not support pinning`);
    }
    
    // Calculate cost
    const cost = config.costPerGB * (contentSize / (1024 * 1024 * 1024));
    
    return {
      pinned: true,
      pinId: pinResult.pinId || pinResult.cid || contentHash,
      cost,
      timestamp: Date.now(),
      metadata: pinResult.metadata
    };
  }

  /**
   * Estimate content size in bytes
   * @private
   */
  estimateContentSize(content) {
    if (typeof content === 'string') {
      return content.length;
    } else if (content instanceof Buffer) {
      return content.length;
    } else if (typeof content === 'object') {
      return JSON.stringify(content).length;
    } else {
      return String(content).length;
    }
  }

  /**
   * Update statistics
   * @private
   */
  updateStats(pinningResults) {
    this.stats.totalPins++;
    
    if (pinningResults.success) {
      this.stats.successfulPins++;
      this.stats.redundancyAchieved += pinningResults.successCount;
    } else {
      this.stats.failedPins++;
    }
    
    if (this.config.costOptimization && pinningResults.totalCost < this.stats.averageCost) {
      this.stats.costSavings += (this.stats.averageCost - pinningResults.totalCost);
    }
  }

  /**
   * List all pinned content
   * @param {Object} options - Listing options
   * @returns {Array} - List of pinned content
   */
  listPinnedContent(options = {}) {
    const pinnedContent = Array.from(this.quantumPinCache.values())
      .filter(pin => pin.status === 'pinned')
      .map(pin => ({
        contentHash: pin.contentHash,
        strategy: pin.strategy,
        services: Object.keys(pin.services),
        quantumProperties: pin.quantumProperties,
        timestamp: pin.timestamp
      }));
    
    if (options.limit) {
      return pinnedContent.slice(0, options.limit);
    }
    
    return pinnedContent;
  }

  /**
   * Get service statistics
   * @returns {Object} - Service statistics
   */
  getStats() {
    const serviceStats = {};
    for (const [name, info] of this.services.entries()) {
      serviceStats[name] = info.stats;
    }
    
    return {
      overall: this.stats,
      services: serviceStats,
      strategies: Array.from(this.pinStrategies.keys()),
      pinnedContent: this.quantumPinCache.size
    };
  }

  /**
   * Health check for all registered services
   * @returns {Promise<Object>} - Health status of all services
   */
  async healthCheck() {
    const healthResults = {};
    
    for (const [serviceName, serviceInfo] of this.services.entries()) {
      try {
        if (serviceInfo.service.healthCheck) {
          healthResults[serviceName] = await serviceInfo.service.healthCheck();
        } else {
          healthResults[serviceName] = { status: 'unknown', message: 'No health check available' };
        }
      } catch (error) {
        healthResults[serviceName] = { status: 'error', message: error.message };
      }
    }
    
    return healthResults;
  }
}

module.exports = {
  PinningServiceManager
};
