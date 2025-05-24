/**
 * Compatibility module for Helia in CommonJS environment
 * Since Helia is an ES module, we need to use dynamic imports
 */

let _createHelia = null;
let _unixfs = null;
let _heliaPromise = null;

/**
 * Get Helia creators (lazy loaded)
 * @returns {Promise<Object>} Helia functions
 */
async function getHelia() {
  if (_createHelia && _unixfs) {
    return { createHelia: _createHelia, unixfs: _unixfs };
  }
  
  if (!_heliaPromise) {
    _heliaPromise = Promise.all([
      import('helia'),
      import('@helia/unixfs')
    ]).then(([heliaModule, unixfsModule]) => {
      _createHelia = heliaModule.createHelia;
      _unixfs = unixfsModule.unixfs;
      return { createHelia: _createHelia, unixfs: _unixfs };
    });
  }
  
  return _heliaPromise;
}

/**
 * Create a Helia instance
 * @param {Object} config - Helia configuration
 * @returns {Promise<Object>} Helia instance
 */
async function createHeliaInstance(config = {}) {
  const { createHelia } = await getHelia();
  return createHelia(config);
}

/**
 * Create a UnixFS instance
 * @param {Object} helia - Helia instance
 * @returns {Promise<Object>} UnixFS instance
 */
async function createUnixFS(helia) {
  const { unixfs } = await getHelia();
  return unixfs(helia);
}

module.exports = {
  getHelia,
  createHeliaInstance,
  createUnixFS
};
