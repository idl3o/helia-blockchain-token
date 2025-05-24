/**
 * Network module for Helia blockchain token
 * Handles peer-to-peer communication
 */

const { getLibp2pModules, createLibp2pInstance } = require('../utils/libp2p-compat');

/**
 * Network class handles P2P communication for token transactions
 */
class Network {
  /**
   * Initialize the P2P network
   * @param {Object} helia - Helia instance
   * @returns {Object} - Initialized network
   */  async initialize(helia) {
    try {
      this.helia = helia;
      this.peers = new Map();      // Get libp2p modules
      const { tcp, webSockets, noise, yamux, mplex, gossipsub, bootstrap, identify } = await getLibp2pModules();
      
      // Initialize p2p network using libp2p
      this.libp2p = await createLibp2pInstance({
        addresses: {
          listen: [
            '/ip4/0.0.0.0/tcp/0',
            '/ip4/0.0.0.0/tcp/0/ws',
          ]
        },
        transports: [
          tcp(),
          webSockets()
        ],
        connectionEncryption: [
          noise()
        ],
        streamMuxers: [
          yamux(),
          mplex()
        ],
        peerDiscovery: [
          bootstrap({
            list: [
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa'
            ]
          })
        ],
        services: {
          identify: identify(),
          pubsub: gossipsub({
            allowPublishToZeroPeers: true,
            emitSelf: true
          })
        }
      });
      
      // Set up token transaction topic
      this.topics = {
        transactions: 'helia-blockchain-token/transactions/v1'
      };
      
      // Subscribe to transaction topic
      await this.libp2p.services.pubsub.subscribe(this.topics.transactions);
      
      // Handle incoming transactions
      this.libp2p.services.pubsub.addEventListener('message', (message) => {
        if (message.topic === this.topics.transactions) {
          this._handleTransaction(message.data);
        }
      });
      
      // Handle peer discovery
      this.libp2p.addEventListener('peer:discovery', (evt) => {
        const peerId = evt.detail.id.toString();
        console.log(`Discovered peer: ${peerId}`);
      });
      
      // Handle peer connections
      this.libp2p.addEventListener('peer:connect', (evt) => {
        const peerId = evt.detail.remotePeer.toString();
        console.log(`Connected to peer: ${peerId}`);
        this.peers.set(peerId, {
          id: peerId,
          connectedAt: Date.now()
        });
      });
      
      // Handle peer disconnections
      this.libp2p.addEventListener('peer:disconnect', (evt) => {
        const peerId = evt.detail.remotePeer.toString();
        console.log(`Disconnected from peer: ${peerId}`);
        this.peers.delete(peerId);
      });
      
      // Start the libp2p node
      await this.libp2p.start();
      
      const addresses = this.libp2p.getMultiaddrs().map(addr => addr.toString());
      console.log('P2P network initialized with addresses:', addresses);
      
      return this;
    } catch (error) {
      console.error('Error initializing P2P network:', error);
      throw new Error('Failed to initialize P2P network');
    }
  }

  /**
   * Broadcast a token transaction to the network
   * @param {Object} transaction - Transaction details
   * @returns {boolean} - Success status
   */
  async broadcastTransaction(transaction) {
    try {
      const transactionBytes = new TextEncoder().encode(JSON.stringify(transaction));
      await this.libp2p.services.pubsub.publish(
        this.topics.transactions,
        transactionBytes
      );
      
      console.log(`Transaction broadcasted: ${transaction.tokenId}`);
      return true;
    } catch (error) {
      console.error('Error broadcasting transaction:', error);
      throw new Error('Failed to broadcast transaction');
    }
  }

  /**
   * Handle incoming transaction from the network
   * @private
   * @param {Uint8Array} data - Transaction data
   */
  _handleTransaction(data) {
    try {
      const transaction = JSON.parse(new TextDecoder().decode(data));
      console.log('Received transaction:', transaction);
      
      // Validate and process transaction
      // This would typically update the local state and potentially
      // be forwarded to a token management system
      
      // Example validation - in a real implementation, this would be more robust
      if (
        !transaction.tokenId ||
        !transaction.from ||
        !transaction.to ||
        !transaction.amount ||
        !transaction.signature
      ) {
        console.warn('Received invalid transaction', transaction);
        return;
      }
      
      // Emit event for other parts of the system to handle
      const event = new CustomEvent('transaction:received', {
        detail: transaction
      });
      this.emit(event);
      
    } catch (error) {
      console.error('Error handling transaction:', error);
    }
  }

  /**
   * Get the list of connected peers
   * @returns {Array} - List of peers
   */
  getPeers() {
    return Array.from(this.peers.values());
  }

  /**
   * Event emitter for network events
   * @param {Event} event - Custom event
   */
  emit(event) {
    // This is a simple event emitter implementation
    // In a real application, you might want to use a more robust event system
    if (this.handlers && this.handlers[event.type]) {
      this.handlers[event.type].forEach(handler => handler(event));
    }
  }

  /**
   * Add event handler
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   */
  on(eventName, handler) {
    if (!this.handlers) {
      this.handlers = {};
    }
    
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    
    this.handlers[eventName].push(handler);
  }

  /**
   * Stop the P2P network
   */
  async stop() {
    if (this.libp2p) {
      await this.libp2p.stop();
      console.log('P2P network stopped');
    }
  }
}

module.exports = new Network();
