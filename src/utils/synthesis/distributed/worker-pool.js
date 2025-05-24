/**
 * worker-pool.js - Distributed worker pool for quantum-crypto operations
 * 
 * Manages CPU-intensive quantum-crypto operations across multiple worker threads
 * Provides load balancing, fault tolerance, and performance monitoring
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const crypto = require('crypto');
const EventEmitter = require('events');

/**
 * Distributed worker pool for quantum-crypto synthesis operations
 */
class QuantumCryptoWorkerPool extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      poolSize: options.poolSize || os.cpus().length,
      maxQueueSize: options.maxQueueSize || 1000,
      workerTimeout: options.workerTimeout || 30000,
      enableLoadBalancing: options.enableLoadBalancing !== false,
      enableFaultTolerance: options.enableFaultTolerance !== false
    };
    
    this.workers = [];
    this.taskQueue = [];
    this.activeJobs = new Map();
    this.workerStats = new Map();
    this.isShuttingDown = false;
    
    this._initializeWorkers();
    this._setupMonitoring();
  }

  /**
   * Execute quantum-informed key generation in worker
   */
  async generateKeyPair(tokenValue, frequency = 1n) {
    return this._executeTask({
      type: 'GENERATE_KEY_PAIR',
      data: { tokenValue: tokenValue.toString(), frequency: frequency.toString() },
      priority: this._calculatePriority(tokenValue)
    });
  }

  /**
   * Execute batch signature verification in workers
   */
  async verifySignaturesBatch(signatures) {
    const batchSize = Math.ceil(signatures.length / this.options.poolSize);
    const batches = this._chunkArray(signatures, batchSize);
    
    const verificationPromises = batches.map((batch, index) => {
      return this._executeTask({
        type: 'VERIFY_SIGNATURES_BATCH',
        data: { signatures: batch },
        priority: 5, // Medium priority
        workerId: this._selectOptimalWorker()
      });
    });
    
    try {
      const results = await Promise.all(verificationPromises);
      return results.flat();
    } catch (error) {
      this.emit('batch-verification-error', error);
      throw error;
    }
  }

  /**
   * Execute quantum energy calculations in parallel
   */
  async calculateEnergyLevelsBatch(quantizedValues, frequencies) {
    const batchSize = Math.max(1, Math.floor(quantizedValues.length / this.options.poolSize));
    const batches = [];
    
    for (let i = 0; i < quantizedValues.length; i += batchSize) {
      batches.push({
        values: quantizedValues.slice(i, i + batchSize).map(v => v.toString()),
        frequencies: frequencies.slice(i, i + batchSize).map(f => f.toString())
      });
    }
    
    const calculationPromises = batches.map(batch => {
      return this._executeTask({
        type: 'CALCULATE_ENERGY_BATCH',
        data: batch,
        priority: 3 // High priority for energy calculations
      });
    });
    
    const results = await Promise.all(calculationPromises);
    return results.flat().map(result => BigInt(result));
  }

  /**
   * Execute adaptive token creation with complexity analysis
   */
  async createAdaptiveToken(tokenData) {
    return this._executeTask({
      type: 'CREATE_ADAPTIVE_TOKEN',
      data: tokenData,
      priority: this._calculatePriority(tokenData.value || 0)
    });
  }

  /**
   * Get comprehensive worker pool statistics
   */
  getPoolStats() {
    const activeWorkers = this.workers.filter(w => w.busy).length;
    const queuedTasks = this.taskQueue.length;
    const totalCompleted = Array.from(this.workerStats.values())
      .reduce((sum, stats) => sum + stats.completed, 0);
    
    return {
      poolSize: this.workers.length,
      activeWorkers,
      queuedTasks,
      totalCompleted,
      averageResponseTime: this._calculateAverageResponseTime(),
      workerUtilization: activeWorkers / this.workers.length,
      queueUtilization: queuedTasks / this.options.maxQueueSize,
      errorRate: this._calculateErrorRate(),
      workerDetails: Array.from(this.workerStats.entries()).map(([id, stats]) => ({
        workerId: id,
        ...stats
      }))
    };
  }

  /**
   * Gracefully shutdown the worker pool
   */
  async shutdown() {
    this.isShuttingDown = true;
    
    // Wait for active jobs to complete
    const activeJobPromises = Array.from(this.activeJobs.values());
    await Promise.allSettled(activeJobPromises);
    
    // Terminate all workers
    const terminationPromises = this.workers.map(worker => {
      return new Promise((resolve) => {
        worker.terminate(() => resolve());
      });
    });
    
    await Promise.all(terminationPromises);
    this.emit('pool-shutdown');
  }

  /**
   * Scale the worker pool up or down
   */
  async scalePool(newSize) {
    const currentSize = this.workers.length;
    
    if (newSize > currentSize) {
      // Scale up
      for (let i = currentSize; i < newSize; i++) {
        this._createWorker();
      }
      this.emit('pool-scaled-up', { from: currentSize, to: newSize });
    } else if (newSize < currentSize) {
      // Scale down
      const workersToRemove = this.workers.splice(newSize);
      await Promise.all(workersToRemove.map(worker => 
        new Promise(resolve => worker.terminate(() => resolve()))
      ));
      this.emit('pool-scaled-down', { from: currentSize, to: newSize });
    }
  }

  // Private helper methods

  _initializeWorkers() {
    for (let i = 0; i < this.options.poolSize; i++) {
      this._createWorker();
    }
  }

  _createWorker() {
    const workerId = crypto.randomUUID();
    const worker = new Worker(__filename, {
      workerData: { isWorker: true, workerId }
    });
    
    worker.workerId = workerId;
    worker.busy = false;
    worker.currentTask = null;
    
    // Initialize worker stats
    this.workerStats.set(workerId, {
      created: Date.now(),
      completed: 0,
      errors: 0,
      totalTime: 0,
      averageTime: 0
    });
    
    worker.on('message', (result) => {
      this._handleWorkerMessage(worker, result);
    });
    
    worker.on('error', (error) => {
      this._handleWorkerError(worker, error);
    });
    
    worker.on('exit', (code) => {
      this._handleWorkerExit(worker, code);
    });
    
    this.workers.push(worker);
    this.emit('worker-created', { workerId });
    
    return worker;
  }

  async _executeTask(task) {
    if (this.isShuttingDown) {
      throw new Error('Worker pool is shutting down');
    }
    
    if (this.taskQueue.length >= this.options.maxQueueSize) {
      throw new Error('Task queue is full');
    }
    
    return new Promise((resolve, reject) => {
      const taskId = crypto.randomUUID();
      const enhancedTask = {
        ...task,
        id: taskId,
        timestamp: Date.now(),
        resolve,
        reject,
        timeout: setTimeout(() => {
          this._handleTaskTimeout(taskId);
        }, this.options.workerTimeout)
      };
      
      this.activeJobs.set(taskId, enhancedTask);
      this.taskQueue.push(enhancedTask);
      
      // Sort queue by priority (higher priority first)
      this.taskQueue.sort((a, b) => b.priority - a.priority);
      
      this._processQueue();
    });
  }

  _processQueue() {
    if (this.taskQueue.length === 0) return;
    
    const availableWorker = this._findAvailableWorker();
    if (!availableWorker) return;
    
    const task = this.taskQueue.shift();
    this._assignTaskToWorker(availableWorker, task);
  }

  _findAvailableWorker() {
    if (this.options.enableLoadBalancing) {
      return this._findLeastLoadedWorker();
    } else {
      return this.workers.find(worker => !worker.busy);
    }
  }

  _findLeastLoadedWorker() {
    let leastLoaded = null;
    let minLoad = Infinity;
    
    for (const worker of this.workers) {
      if (!worker.busy) {
        const stats = this.workerStats.get(worker.workerId);
        const load = stats.averageTime || 0;
        
        if (load < minLoad) {
          minLoad = load;
          leastLoaded = worker;
        }
      }
    }
    
    return leastLoaded;
  }

  _selectOptimalWorker() {
    if (this.options.enableLoadBalancing) {
      const leastLoaded = this._findLeastLoadedWorker();
      return leastLoaded ? leastLoaded.workerId : undefined;
    }
    return undefined;
  }

  _assignTaskToWorker(worker, task) {
    worker.busy = true;
    worker.currentTask = task;
    
    worker.postMessage({
      id: task.id,
      type: task.type,
      data: task.data
    });
    
    this.emit('task-assigned', { 
      taskId: task.id, 
      workerId: worker.workerId,
      type: task.type 
    });
  }

  _handleWorkerMessage(worker, result) {
    if (!worker.currentTask) return;
    
    const task = worker.currentTask;
    const stats = this.workerStats.get(worker.workerId);
    
    // Update statistics
    const executionTime = Date.now() - task.timestamp;
    stats.completed++;
    stats.totalTime += executionTime;
    stats.averageTime = stats.totalTime / stats.completed;
    
    // Clear task and free worker
    clearTimeout(task.timeout);
    worker.busy = false;
    worker.currentTask = null;
    
    this.activeJobs.delete(task.id);
    
    if (result.error) {
      stats.errors++;
      task.reject(new Error(result.error));
      this.emit('task-error', { 
        taskId: task.id, 
        workerId: worker.workerId,
        error: result.error 
      });
    } else {
      task.resolve(result.data);
      this.emit('task-completed', { 
        taskId: task.id, 
        workerId: worker.workerId,
        executionTime 
      });
    }
    
    // Process next task in queue
    this._processQueue();
  }

  _handleWorkerError(worker, error) {
    const stats = this.workerStats.get(worker.workerId);
    stats.errors++;
    
    this.emit('worker-error', { 
      workerId: worker.workerId, 
      error: error.message 
    });
    
    if (this.options.enableFaultTolerance) {
      this._replaceWorker(worker);
    }
  }

  _handleWorkerExit(worker, code) {
    this.emit('worker-exit', { 
      workerId: worker.workerId, 
      code 
    });
    
    // Remove worker from pool
    const index = this.workers.indexOf(worker);
    if (index > -1) {
      this.workers.splice(index, 1);
    }
    
    if (this.options.enableFaultTolerance && !this.isShuttingDown) {
      this._createWorker();
    }
  }

  _handleTaskTimeout(taskId) {
    const task = this.activeJobs.get(taskId);
    if (task) {
      this.activeJobs.delete(taskId);
      task.reject(new Error(`Task ${taskId} timed out`));
      this.emit('task-timeout', { taskId });
    }
  }

  _replaceWorker(faultyWorker) {
    const index = this.workers.indexOf(faultyWorker);
    if (index > -1) {
      this.workers.splice(index, 1);
      faultyWorker.terminate();
      this._createWorker();
    }
  }

  _calculatePriority(tokenValue) {
    const value = typeof tokenValue === 'bigint' ? Number(tokenValue) : tokenValue;
    if (value > 10000) return 10; // Highest priority
    if (value > 1000) return 7;   // High priority
    if (value > 100) return 5;    // Medium priority
    return 3;                     // Low priority
  }

  _calculateAverageResponseTime() {
    const totalTime = Array.from(this.workerStats.values())
      .reduce((sum, stats) => sum + stats.totalTime, 0);
    const totalCompleted = Array.from(this.workerStats.values())
      .reduce((sum, stats) => sum + stats.completed, 0);
    
    return totalCompleted > 0 ? totalTime / totalCompleted : 0;
  }

  _calculateErrorRate() {
    const totalErrors = Array.from(this.workerStats.values())
      .reduce((sum, stats) => sum + stats.errors, 0);
    const totalCompleted = Array.from(this.workerStats.values())
      .reduce((sum, stats) => sum + stats.completed, 0);
    
    return (totalCompleted + totalErrors) > 0 ? 
      totalErrors / (totalCompleted + totalErrors) : 0;
  }

  _chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  _setupMonitoring() {
    // Emit pool statistics every 30 seconds
    setInterval(() => {
      this.emit('pool-stats', this.getPoolStats());
    }, 30000);
  }
}

// Worker thread execution context
if (!isMainThread && workerData?.isWorker) {
  const planck = require('../../planck');
  const leibniz = require('../../leibniz');
  
  parentPort.on('message', async (task) => {
    try {
      let result;
      
      switch (task.type) {
        case 'GENERATE_KEY_PAIR':
          result = await executeKeyGeneration(task.data);
          break;
        case 'VERIFY_SIGNATURES_BATCH':
          result = await executeSignatureVerification(task.data);
          break;
        case 'CALCULATE_ENERGY_BATCH':
          result = await executeEnergyCalculation(task.data);
          break;
        case 'CREATE_ADAPTIVE_TOKEN':
          result = await executeAdaptiveTokenCreation(task.data);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      parentPort.postMessage({ 
        id: task.id, 
        data: result 
      });
      
    } catch (error) {
      parentPort.postMessage({ 
        id: task.id, 
        error: error.message 
      });
    }
  });
  
  async function executeKeyGeneration({ tokenValue, frequency }) {
    const quantizedValue = planck.quantize(BigInt(tokenValue));
    const energyLevel = planck.calculateEnergyLevel(quantizedValue, BigInt(frequency));
    
    const complexity = determineCryptographicComplexity(energyLevel);
    const keyPair = leibniz.createKeyPair(complexity.keyLength);
    
    return {
      ...keyPair,
      quantumMetadata: {
        originalValue: tokenValue,
        quantizedValue: quantizedValue.toString(),
        energyLevel: energyLevel.toString(),
        cryptoComplexity: complexity,
        synthesisTimestamp: Date.now()
      }
    };
  }
  
  async function executeSignatureVerification({ signatures }) {
    const results = [];
    
    for (const sig of signatures) {
      try {
        const isValid = leibniz.verifySignature(
          sig.publicKey,
          sig.signature,
          sig.data,
          sig.method
        );
        
        results.push({ 
          id: sig.id, 
          valid: isValid,
          verificationTime: Date.now()
        });
      } catch (error) {
        results.push({ 
          id: sig.id, 
          valid: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }
  
  async function executeEnergyCalculation({ values, frequencies }) {
    const results = [];
    
    for (let i = 0; i < values.length; i++) {
      const quantizedValue = planck.quantize(BigInt(values[i]));
      const frequency = BigInt(frequencies[i]);
      const energyLevel = planck.calculateEnergyLevel(quantizedValue, frequency);
      
      results.push(energyLevel.toString());
    }
    
    return results;
  }
  
  async function executeAdaptiveTokenCreation(tokenData) {
    const quantizedValue = planck.quantize(BigInt(tokenData.value || 0));
    const energyLevel = planck.calculateEnergyLevel(quantizedValue, 1n);
    const complexity = determineCryptographicComplexity(energyLevel);
    const keyPair = leibniz.createKeyPair(complexity.keyLength);
    
    return {
      ...tokenData,
      quantumCryptoProperties: {
        quantizedValue: quantizedValue.toString(),
        publicKey: keyPair.publicKey,
        quantumMetadata: {
          originalValue: tokenData.value,
          quantizedValue: quantizedValue.toString(),
          energyLevel: energyLevel.toString(),
          cryptoComplexity: complexity,
          synthesisTimestamp: Date.now()
        },
        adaptiveCapabilities: {
          canRekeySelf: true,
          energyThresholdTriggered: false,
          lastAdaptation: Date.now()
        }
      }
    };
  }
  
  function determineCryptographicComplexity(energyLevel) {
    const thresholds = {
      low: 100n,
      medium: 1000n,
      high: 10000n
    };
    
    if (energyLevel < thresholds.low) {
      return { keyLength: 2048, method: 'basic', complexity: 'low' };
    } else if (energyLevel < thresholds.medium) {
      return { keyLength: 3072, method: 'enhanced', complexity: 'medium' };
    } else if (energyLevel < thresholds.high) {
      return { keyLength: 4096, method: 'advanced', complexity: 'high' };
    } else {
      return { keyLength: 8192, method: 'quantum-resistant', complexity: 'maximum' };
    }
  }
}

module.exports = {
  QuantumCryptoWorkerPool
};
