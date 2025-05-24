/**
 * Mock token implementation for testing
 */

class Token {
  constructor(storage, network) {
    this.storage = storage;
    this.network = network;
    this.state = {
      name: 'MockToken',
      symbol: 'MTK',
      totalSupply: BigInt(0),
      decimals: 18,
      balances: new Map(),
      owner: null,
      metadata: {}
    };
  }

  async init(params) {
    this.state.name = params.name || 'MockToken';
    this.state.symbol = params.symbol || 'MTK';
    this.state.decimals = params.decimals || 18;
    this.state.owner = params.owner || 'mock-owner';
    this.state.metadata = params.metadata || {};
    return this;
  }

  async createToken(options) {
    return {
      id: 'mock-token-id',
      name: options.name,
      symbol: options.symbol,
      initialSupply: options.initialSupply,
      owner: options.owner
    };
  }

  async transfer(from, to, amount) {
    return {
      success: true,
      txId: 'mock-tx-id'
    };
  }

  getBalance(address) {
    return BigInt(100);
  }
}

module.exports = {
  Token
};
