/**
 * adaptive-token-manager.js - Distributed adaptive token management system
 * 
 * Manages token adaptation, evolution, and lifecycle across distributed nodes
 * Implements token migration, replication, and consensus for adaptive behaviors
 */

const EventEmitter = require('events');
const CacheManager = require('./cache-manager');

class AdaptiveTokenManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.nodeId = options.nodeId || this.generateNodeId();
    this.peers = new Map();
    this.tokens = new Map();
    
    this.cache = new CacheManager('adaptive-tokens', {
      maxSize: options.cacheSize || 5000,
      ttl: options.cacheTtl || 600000 // 10 minutes
    });
    
    this.adaptationThresholds = {
      energyChange: 0.25, // 25% energy change triggers adaptation
      timeThreshold: 300000, // 5 minutes minimum between adaptations
      consensusRequired: 0.67 // 67% consensus required for adaptation
    };
    
    this.stats = {
      tokensManaged: 0,
      adaptationsPerformed: 0,
      consensusReached: 0,
      migrationEvents: 0
    };
  }

  generateNodeId() {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register a token for adaptive management
   */
  async registerToken(tokenId, tokenData, initialKeyPair) {
    const adaptiveToken = {
      id: tokenId,
      data: tokenData,
      keyPair: initialKeyPair,
      adaptationHistory: [],
      lastAdaptation: Date.now(),
      energyHistory: [],
      replicationNodes: new Set([this.nodeId]),
      consensusVersion: 1,
      locked: false
    };
    
    this.tokens.set(tokenId, adaptiveToken);
    await this.cache.set(`token:${tokenId}`, adaptiveToken);
    
    this.stats.tokensManaged++;
    this.emit('tokenRegistered', { tokenId, nodeId: this.nodeId });
    
    // Replicate to peers
    await this.replicateTokenToPeers(tokenId, adaptiveToken);
    
    return adaptiveToken;
  }

  /**
   * Evaluate if token needs adaptation based on energy changes
   */
  async evaluateTokenAdaptation(tokenId, newValue, newFrequency) {
    const token = this.tokens.get(tokenId);
    if (!token || token.locked) return null;
    
    const currentEnergy = this.calculateTokenEnergy(token.data.value || 0, 1n);
    const newEnergy = this.calculateTokenEnergy(newValue, newFrequency);
    
    const energyChangePercent = Math.abs(newEnergy - currentEnergy) / currentEnergy;
    const timeSinceLastAdaptation = Date.now() - token.lastAdaptation;
    
    const needsAdaptation = 
      energyChangePercent > this.adaptationThresholds.energyChange &&
      timeSinceLastAdaptation > this.adaptationThresholds.timeThreshold;
    
    if (needsAdaptation) {
      return await this.proposeTokenAdaptation(tokenId, newValue, newFrequency, {
        energyChange: energyChangePercent,
        currentEnergy,
        newEnergy
      });
    }
    
    return null;
  }

  /**
   * Propose token adaptation to peer network for consensus
   */
  async proposeTokenAdaptation(tokenId, newValue, newFrequency, metrics) {
    const token = this.tokens.get(tokenId);
    if (!token) throw new Error(`Token ${tokenId} not found`);
    
    const proposal = {
      tokenId,
      proposerId: this.nodeId,
      proposalId: this.generateProposalId(),
      newValue,
      newFrequency,
      metrics,
      timestamp: Date.now(),
      votes: new Map([[this.nodeId, true]]), // Self-vote
      requiredVotes: Math.ceil(token.replicationNodes.size * this.adaptationThresholds.consensusRequired)
    };
    
    // Lock token during consensus
    token.locked = true;
    
    this.emit('adaptationProposed', proposal);
    
    // Broadcast proposal to peers
    await this.broadcastAdaptationProposal(proposal);
    
    // Wait for consensus or timeout
    return await this.waitForConsensus(proposal, 30000); // 30 second timeout
  }

  /**
   * Vote on adaptation proposal
   */
  async voteOnAdaptation(proposal, approve) {
    const token = this.tokens.get(proposal.tokenId);
    if (!token || !token.replicationNodes.has(this.nodeId)) {
      return false; // Not authorized to vote
    }
    
    proposal.votes.set(this.nodeId, approve);
    
    this.emit('adaptationVote', {
      proposalId: proposal.proposalId,
      nodeId: this.nodeId,
      vote: approve
    });
    
    // Check if consensus reached
    if (proposal.votes.size >= proposal.requiredVotes) {
      const approvals = Array.from(proposal.votes.values()).filter(v => v).length;
      const consensusReached = approvals >= proposal.requiredVotes;
      
      if (consensusReached) {
        await this.executeTokenAdaptation(proposal);
        this.stats.consensusReached++;
      } else {
        await this.rejectTokenAdaptation(proposal);
      }
      
      return consensusReached;
    }
    
    return false;
  }

  /**
   * Execute approved token adaptation
   */
  async executeTokenAdaptation(proposal) {
    const token = this.tokens.get(proposal.tokenId);
    if (!token) return;
    
    const oldComplexity = token.keyPair.quantumMetadata?.cryptoComplexity?.complexity;
    
    // Calculate new cryptographic complexity
    const newEnergy = this.calculateTokenEnergy(proposal.newValue, proposal.newFrequency);
    const newComplexity = this.determineCryptographicComplexity(newEnergy);
    
    // Generate new key pair if complexity changed
    let newKeyPair = token.keyPair;
    if (oldComplexity !== newComplexity.complexity) {
      newKeyPair = await this.generateQuantumInformedKeyPair(proposal.newValue, proposal.newFrequency);
    }
    
    // Update token
    const adaptation = {
      timestamp: Date.now(),
      proposalId: proposal.proposalId,
      oldValue: token.data.value,
      newValue: proposal.newValue,
      oldComplexity,
      newComplexity: newComplexity.complexity,
      energyChange: proposal.metrics.energyChange,
      keyRotated: oldComplexity !== newComplexity.complexity
    };
    
    token.data.value = proposal.newValue;
    token.keyPair = newKeyPair;
    token.adaptationHistory.push(adaptation);
    token.lastAdaptation = Date.now();
    token.consensusVersion++;
    token.locked = false;
    
    await this.cache.set(`token:${proposal.tokenId}`, token);
    
    this.stats.adaptationsPerformed++;
    this.emit('tokenAdapted', { tokenId: proposal.tokenId, adaptation });
    
    // Propagate changes to peers
    await this.propagateTokenUpdate(proposal.tokenId, token);
  }

  /**
   * Reject token adaptation proposal
   */
  async rejectTokenAdaptation(proposal) {
    const token = this.tokens.get(proposal.tokenId);
    if (token) {
      token.locked = false;
    }
    
    this.emit('adaptationRejected', {
      proposalId: proposal.proposalId,
      reason: 'Insufficient consensus'
    });
  }

  /**
   * Migrate token to different node
   */
  async migrateToken(tokenId, targetNodeId) {
    const token = this.tokens.get(tokenId);
    if (!token) throw new Error(`Token ${tokenId} not found`);
    
    const targetPeer = this.peers.get(targetNodeId);
    if (!targetPeer) throw new Error(`Target node ${targetNodeId} not found`);
    
    // Create migration package
    const migrationPackage = {
      token: { ...token },
      sourceNodeId: this.nodeId,
      targetNodeId,
      migrationId: this.generateMigrationId(),
      timestamp: Date.now()
    };
    
    this.emit('tokenMigrationStart', migrationPackage);
    
    try {
      // Send to target node
      await this.sendToNode(targetNodeId, 'migrateToken', migrationPackage);
      
      // Remove from local storage after successful migration
      this.tokens.delete(tokenId);
      await this.cache.delete(`token:${tokenId}`);
      
      this.stats.migrationEvents++;
      this.emit('tokenMigrationComplete', migrationPackage);
      
    } catch (error) {
      this.emit('tokenMigrationFailed', { migrationPackage, error });
      throw error;
    }
  }

  /**
   * Receive migrated token
   */
  async receiveMigratedToken(migrationPackage) {
    const { token, migrationId } = migrationPackage;
    
    // Store token locally
    this.tokens.set(token.id, token);
    await this.cache.set(`token:${token.id}`, token);
    
    // Update replication nodes
    token.replicationNodes.add(this.nodeId);
    
    this.emit('tokenMigrationReceived', { tokenId: token.id, migrationId });
  }

  /**
   * Get token adaptation statistics
   */
  getTokenStats(tokenId) {
    const token = this.tokens.get(tokenId);
    if (!token) return null;
    
    return {
      id: tokenId,
      currentValue: token.data.value,
      adaptationCount: token.adaptationHistory.length,
      lastAdaptation: token.lastAdaptation,
      currentComplexity: token.keyPair.quantumMetadata?.cryptoComplexity?.complexity,
      replicationNodes: Array.from(token.replicationNodes),
      consensusVersion: token.consensusVersion,
      locked: token.locked
    };
  }

  /**
   * Helper methods
   */
  calculateTokenEnergy(value, frequency) {
    // Simplified energy calculation for demonstration
    return Number(BigInt(value) * BigInt(frequency)) / 1000;
  }

  determineCryptographicComplexity(energyLevel) {
    if (energyLevel < 100) return { complexity: 'low', keyLength: 2048 };
    if (energyLevel < 1000) return { complexity: 'medium', keyLength: 3072 };
    if (energyLevel < 10000) return { complexity: 'high', keyLength: 4096 };
    return { complexity: 'maximum', keyLength: 8192 };
  }

  generateProposalId() {
    return `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMigrationId() {
    return `mig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async generateQuantumInformedKeyPair(value, frequency) {
    // Mock implementation - would integrate with quantum processor
    return {
      publicKey: `pub-${Date.now()}`,
      privateKey: `priv-${Date.now()}`,
      quantumMetadata: {
        energyLevel: this.calculateTokenEnergy(value, frequency),
        cryptoComplexity: this.determineCryptographicComplexity(this.calculateTokenEnergy(value, frequency))
      }
    };
  }

  async waitForConsensus(proposal, timeout) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(false);
      }, timeout);
      
      const checkConsensus = () => {
        if (proposal.votes.size >= proposal.requiredVotes) {
          clearTimeout(timer);
          resolve(true);
        }
      };
      
      this.on('adaptationVote', checkConsensus);
    });
  }

  async replicateTokenToPeers(tokenId, token) {
    // Mock implementation for peer replication
    for (const [peerId] of this.peers) {
      try {
        await this.sendToNode(peerId, 'replicateToken', { tokenId, token });
        token.replicationNodes.add(peerId);
      } catch (error) {
        console.warn(`Failed to replicate token ${tokenId} to peer ${peerId}:`, error);
      }
    }
  }

  async broadcastAdaptationProposal(proposal) {
    // Mock implementation for proposal broadcasting
    for (const nodeId of proposal.votes.keys()) {
      if (nodeId !== this.nodeId) {
        try {
          await this.sendToNode(nodeId, 'adaptationProposal', proposal);
        } catch (error) {
          console.warn(`Failed to send proposal to ${nodeId}:`, error);
        }
      }
    }
  }

  async propagateTokenUpdate(tokenId, token) {
    // Mock implementation for token update propagation
    for (const nodeId of token.replicationNodes) {
      if (nodeId !== this.nodeId) {
        try {
          await this.sendToNode(nodeId, 'tokenUpdate', { tokenId, token });
        } catch (error) {
          console.warn(`Failed to propagate token update to ${nodeId}:`, error);
        }
      }
    }
  }

  async sendToNode(nodeId, messageType, data) {
    // Mock implementation - would use actual network transport
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(true);
        } else {
          reject(new Error('Network error'));
        }
      }, Math.random() * 100); // Random delay 0-100ms
    });
  }

  getManagerStats() {
    return {
      nodeId: this.nodeId,
      peersConnected: this.peers.size,
      ...this.stats,
      cacheStats: this.cache.getStats()
    };
  }

  async cleanup() {
    await this.cache.cleanup();
    this.peers.clear();
    this.tokens.clear();
  }
}

module.exports = AdaptiveTokenManager;
