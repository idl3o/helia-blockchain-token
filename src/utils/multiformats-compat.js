/**
 * Compatibility module for multiformats in CommonJS environment
 * Since multiformats is an ES module, we need to use dynamic imports
 */

let _CID = null;
let _cidPromise = null;

/**
 * Get CID constructor (lazy loaded)
 * @returns {Promise<Function>} CID constructor
 */
async function getCID() {
  if (_CID) {
    return _CID;
  }
  
  if (!_cidPromise) {
    _cidPromise = import('multiformats/cid').then(module => {
      _CID = module.CID;
      return _CID;
    });
  }
  
  return _cidPromise;
}

/**
 * Create a CID from string
 * @param {string} cidString - CID string
 * @returns {Promise<Object>} CID instance
 */
async function createCID(cidString) {
  const CID = await getCID();
  return CID.parse(cidString);
}

/**
 * Check if value is a CID
 * @param {any} value - Value to check
 * @returns {Promise<boolean>} True if value is a CID
 */
async function isCID(value) {
  const CID = await getCID();
  return CID.asCID(value) !== null;
}

/**
 * Convert CID to string
 * @param {Object} cid - CID instance
 * @returns {string} CID string
 */
function cidToString(cid) {
  return cid.toString();
}

module.exports = {
  getCID,
  createCID,
  isCID,
  cidToString
};
