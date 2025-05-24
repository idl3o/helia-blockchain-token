/**
 * Mock for uint8arrays modules
 */

module.exports = {
  toString: (arr) => Buffer.isBuffer(arr) ? arr.toString() : String(arr),
  fromString: (str) => Buffer.from(str)
};
