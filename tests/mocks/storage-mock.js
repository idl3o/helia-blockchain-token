/**
 * Mock storage implementation for testing
 */

class Storage {
  constructor(helia) {
    this.helia = helia;
    this.mockData = new Map();
  }

  async addBytes(bytes) {
    const cid = {
      toString: () => 'QmTest' + Math.random().toString(36).substr(2, 9)
    };
    this.mockData.set(cid.toString(), bytes);
    return cid;
  }
  async getBytes(cid) {
    const cidString = typeof cid === 'string' ? cid : cid.toString();
    const stored = this.mockData.get(cidString);
    if (stored) {
      return stored;
    }
    // Return mock JSON data for tokens that weren't explicitly stored
    const mockTokenData = {
      id: 'mock-token-id',
      name: 'Mock Token',
      symbol: 'MOCK',
      totalSupply: 1000,
      owner: 'mock-owner-address'
    };
    return Buffer.from(JSON.stringify(mockTokenData));
  }

  async put(data) {
    return await this.addBytes(Buffer.from(JSON.stringify(data)));
  }

  async get(cid) {
    const bytes = await this.getBytes(cid);
    return { data: bytes.toString() };
  }

  async delete(cid) {
    const cidString = typeof cid === 'string' ? cid : cid.toString();
    return this.mockData.delete(cidString);
  }
}

module.exports = {
  Storage,
  createStorage: async (helia) => new Storage(helia)
};
