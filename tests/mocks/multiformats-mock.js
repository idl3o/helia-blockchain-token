/**
 * Mock implementation of multiformats for testing
 */

// Mock CID
class CID {
  constructor(version, codec, multihash) {
    this.version = version;
    this.codec = codec;
    this.multihash = multihash;
    this.bytes = Buffer.from([0, 1, 2, 3]); // Dummy bytes
  }

  toString() {
    return 'Qm' + Buffer.from(this.bytes || []).toString('hex');
  }

  equals(other) {
    return this.toString() === other.toString();
  }
}

// Export mocks
module.exports = {
  CID
};
