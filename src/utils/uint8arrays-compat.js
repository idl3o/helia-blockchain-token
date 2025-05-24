/**
 * Compatibility wrapper for uint8arrays ES module
 * Provides CommonJS interface for uint8arrays functions
 */

let uint8ArraysCache = null;

async function loadUint8Arrays() {
  if (uint8ArraysCache) {
    return uint8ArraysCache;
  }

  try {
    const [
      { toString },
      { fromString },
      { concat },
      { equals }
    ] = await Promise.all([
      import('uint8arrays/to-string'),
      import('uint8arrays/from-string'),
      import('uint8arrays/concat'),
      import('uint8arrays/equals')
    ]);

    uint8ArraysCache = {
      toString,
      fromString,
      concat,
      equals
    };

    return uint8ArraysCache;
  } catch (error) {
    console.error('Failed to load uint8arrays:', error);
    throw error;
  }
}

// Export async functions that load the modules when needed
async function toString(...args) {
  const { toString } = await loadUint8Arrays();
  return toString(...args);
}

async function fromString(...args) {
  const { fromString } = await loadUint8Arrays();
  return fromString(...args);
}

async function concat(...args) {
  const { concat } = await loadUint8Arrays();
  return concat(...args);
}

async function equals(...args) {
  const { equals } = await loadUint8Arrays();
  return equals(...args);
}

module.exports = {
  toString,
  fromString,
  concat,
  equals
};
