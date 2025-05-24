/**
 * Mock network implementation for testing
 */

class Network {
  constructor() {
    this.peers = [];
    this.isStarted = false;
  }

  async start() {
    this.isStarted = true;
    return true;
  }

  async stop() {
    this.isStarted = false;
    return true;
  }

  async broadcast(data) {
    // Mock broadcast - just return success
    return { success: true, peers: this.peers.length };
  }

  async getPeers() {
    return this.peers;
  }

  async addPeer(peerId) {
    if (!this.peers.includes(peerId)) {
      this.peers.push(peerId);
    }
    return true;
  }
}

module.exports = {
  Network,
  createNetwork: async () => new Network()
};
