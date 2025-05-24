/**
 * Storage module for Helia blockchain token
 * Uses Helia (IPFS implementation) for content-addressable storage
 */

const { getCID, createCID, isCID, cidToString } = require('../utils/multiformats-compat');
const { sha256 } = require('@noble/hashes/sha256');
const { toString, fromString } = require('../utils/uint8arrays-compat');

/**
 * Storage class for managing token data in Helia
 */
class Storage {
  /**
   * Creates a new Storage instance
   * @param {Object} fs - UnixFS instance
   * @param {Object} config - Storage configuration
   */
  constructor(fs, config = {}) {
    this.fs = fs;
    this.config = config;
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the storage instance
   * @param {Object} options - Initialization options
   * @param {Object} options.helia - Helia instance
   * @returns {Promise<void>}
   */
  async initialize(options) {
    if (this.isInitialized) {
      return;
    }

    const { getHeliaUtils } = require('../utils/helia-compat');
    const { helia, unixfs } = await getHeliaUtils();
    
    this.helia = options.helia || helia;
    this.fs = unixfs(this.helia);
    this.isInitialized = true;
  }
  /**
   * Stores data in Helia
   * @param {Object|string|Buffer} data - Data to store
   * @returns {Promise<CID>} - Content identifier
   */
  async store(data) {
    try {
      // Convert data to Buffer if it's an object
      const content = typeof data === 'object' && !(data instanceof Buffer)
        ? await fromString(JSON.stringify(data))
        : data;

      // Store in Helia
      const cid = await this.fs.addBytes(content);
      
      // Cache response
      if (this.config.useCache !== false) {
        this.cache.set(cid.toString(), data);
      }
      
      return cid;
    } catch (error) {
      console.error('Failed to store data:', error);
      throw error;
    }
  }

  /**
   * Stores string data in Helia
   * @param {string} data - String data to store
   * @returns {Promise<CID>} - Content identifier
   */
  async storeData(data) {
    try {
      const content = await fromString(data);
      const cid = await this.fs.addBytes(content);
      
      if (this.config.useCache !== false) {
        this.cache.set(cid.toString(), data);
      }
      
      return cid;
    } catch (error) {
      console.error('Failed to store string data:', error);
      throw error;
    }
  }

  /**
   * Retrieves string data from Helia by CID
   * @param {CID|string} cid - Content identifier
   * @returns {Promise<string>} - Retrieved string data
   */
  async retrieveData(cid) {
    try {
      // Check cache first
      if (this.config.useCache !== false) {
        const cachedData = this.cache.get(cid.toString());
        if (cachedData && typeof cachedData === 'string') return cachedData;
      }

      // Convert string CID to CID object if needed
      const cidObj = typeof cid === 'string' ? await createCID(cid) : cid;
      
      // Retrieve from Helia
      const chunks = [];
      for await (const chunk of this.fs.cat(cidObj)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks);
      const stringData = await toString(data);
      
      // Cache result
      if (this.config.useCache !== false) {
        this.cache.set(cidObj.toString(), stringData);
      }
      
      return stringData;
    } catch (error) {
      console.error('Failed to retrieve string data:', error);
      throw error;
    }
  }

  /**
   * Stores JSON object in Helia
   * @param {Object} data - JSON object to store
   * @returns {Promise<CID>} - Content identifier
   */
  async storeJSON(data) {
    try {
      const jsonString = JSON.stringify(data);
      const content = await fromString(jsonString);
      const cid = await this.fs.addBytes(content);
      
      if (this.config.useCache !== false) {
        this.cache.set(cid.toString(), data);
      }
      
      return cid;
    } catch (error) {
      console.error('Failed to store JSON data:', error);
      throw error;
    }
  }

  /**
   * Retrieves JSON object from Helia by CID
   * @param {CID|string} cid - Content identifier
   * @returns {Promise<Object>} - Retrieved JSON object
   */
  async retrieveJSON(cid) {
    try {
      // Check cache first
      if (this.config.useCache !== false) {
        const cachedData = this.cache.get(cid.toString());
        if (cachedData && typeof cachedData === 'object') return cachedData;
      }

      // Convert string CID to CID object if needed
      const cidObj = typeof cid === 'string' ? await createCID(cid) : cid;
      
      // Retrieve from Helia
      const chunks = [];
      for await (const chunk of this.fs.cat(cidObj)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks);
      const stringData = await toString(data);
      const jsonData = JSON.parse(stringData);
      
      // Cache result
      if (this.config.useCache !== false) {
        this.cache.set(cidObj.toString(), jsonData);
      }
      
      return jsonData;
    } catch (error) {
      console.error('Failed to retrieve JSON data:', error);
      throw error;
    }
  }

  /**
   * Stores binary data in Helia
   * @param {Buffer} data - Binary data to store
   * @returns {Promise<CID>} - Content identifier
   */
  async storeBinary(data) {
    try {
      const cid = await this.fs.addBytes(data);
      
      if (this.config.useCache !== false) {
        this.cache.set(cid.toString(), data);
      }
      
      return cid;
    } catch (error) {
      console.error('Failed to store binary data:', error);
      throw error;
    }
  }

  /**
   * Retrieves binary data from Helia by CID
   * @param {CID|string} cid - Content identifier
   * @returns {Promise<Buffer>} - Retrieved binary data
   */
  async retrieveBinary(cid) {
    try {
      // Check cache first
      if (this.config.useCache !== false) {
        const cachedData = this.cache.get(cid.toString());
        if (cachedData && Buffer.isBuffer(cachedData)) return cachedData;
      }

      // Convert string CID to CID object if needed
      const cidObj = typeof cid === 'string' ? await createCID(cid) : cid;
      
      // Retrieve from Helia
      const chunks = [];
      for await (const chunk of this.fs.cat(cidObj)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks);
      
      // Cache result
      if (this.config.useCache !== false) {
        this.cache.set(cidObj.toString(), data);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to retrieve binary data:', error);
      throw error;
    }
  }

  /**
   * Retrieves data from Helia by CID
   * @param {CID|string} cid - Content identifier
   * @returns {Promise<Object|string|Buffer>} - Retrieved data
   */
  async retrieve(cid) {
    try {
      // Check cache first
      if (this.config.useCache !== false) {
        const cachedData = this.cache.get(cid.toString());
        if (cachedData) return cachedData;
      }      // Convert string CID to CID object if needed
      const cidObj = typeof cid === 'string' ? await createCID(cid) : cid;
      
      // Retrieve from Helia
      const chunks = [];
      for await (const chunk of this.fs.cat(cidObj)) {
        chunks.push(chunk);
      }
      
      // Combine chunks and parse if it's JSON
      const data = Buffer.concat(chunks);
      
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(toString(data));
        
        // Cache result
        if (this.config.useCache !== false) {
          this.cache.set(cidObj.toString(), jsonData);
        }
        
        return jsonData;
      } catch (e) {
        // Return raw data if not JSON
        return data;
      }
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      throw error;
    }
  }

  /**
   * Queries for data using a filter function
   * @param {Function} filterFn - Filter function
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Matching items
   */
  async query(filterFn, options = {}) {
    const { limit = 100, maxRetrieval = 1000 } = options;
    
    // This is a simplified implementation
    // In a real system, you would need to implement some form of indexing
    // or database to efficiently query data stored in IPFS
    
    // For now, we'll use a mock implementation that warns about limitations
    console.warn('Warning: Storage query is using a simplified implementation.');
    console.warn('Real-world applications should implement proper indexing.');
    
    const results = [];
    let retrievalCount = 0;
    
    // Implementation would depend on how you're tracking content
    // In a real system, you would maintain indexes of your content
    
    // Placeholder for query implementation
    // This is where you would implement your actual query logic
    
    return results;
  }

  /**
   * Creates a key-value database on top of Helia
   * @param {string} name - Database name
   * @returns {Object} - KV Database interface
   */
  createKeyValueStore(name) {
    // Generate a unique root path for this database
    const root = `/token-database/${name}`;
    
    return {
      /**
       * Sets a value in the database
       * @param {string} key - Key
       * @param {any} value - Value
       * @returns {Promise<CID>} - Content identifier
       */
      set: async (key, value) => {
        const path = `${root}/${key}`;
        const content = typeof value === 'object'
          ? fromString(JSON.stringify(value))
          : fromString(String(value));
        
        const cid = await this.fs.addBytes(content);
        
        // Store a mapping
        await this._storeKeyMapping(path, cid);
        
        return cid;
      },
      
      /**
       * Gets a value from the database
       * @param {string} key - Key
       * @returns {Promise<any>} - Retrieved value
       */
      get: async (key) => {
        const path = `${root}/${key}`;
        
        try {
          const cid = await this._getKeyMapping(path);
          if (!cid) return null;
          
          return this.retrieve(cid);
        } catch (error) {
          console.error(`Error retrieving key ${key}:`, error);
          return null;
        }
      },
      
      /**
       * Deletes a value from the database
       * @param {string} key - Key to delete
       * @returns {Promise<boolean>} - Success status
       */
      delete: async (key) => {
        const path = `${root}/${key}`;
        
        try {
          // Remove mapping
          await this._deleteKeyMapping(path);
          return true;
        } catch (error) {
          console.error(`Error deleting key ${key}:`, error);
          return false;
        }
      },
      
      /**
       * Lists all keys in the database
       * @returns {Promise<Array>} - List of keys
       */
      keys: async () => {
        // Implementation would depend on how you're tracking keys
        // This is a placeholder
        return [];
      }
    };
  }

  /**
   * Stores a key mapping
   * @param {string} path - Key path
   * @param {CID} cid - Content identifier
   * @returns {Promise<void>}
   * @private
   */
  async _storeKeyMapping(path, cid) {
    // This is a simplified implementation
    // In a real system, you would store these mappings in a database or index
    // that's queryable
    
    // For now, we'll use a local cache
    this.cache.set(`keymap:${path}`, cid.toString());
  }

  /**
   * Gets a key mapping
   * @param {string} path - Key path
   * @returns {Promise<CID|null>} - Content identifier or null
   * @private
   */
  async _getKeyMapping(path) {
    // Get from cache
    const cidStr = this.cache.get(`keymap:${path}`);
    if (!cidStr) return null;
    
    return CID.parse(cidStr);
  }

  /**
   * Deletes a key mapping
   * @param {string} path - Key path
   * @returns {Promise<void>}
   * @private
   */
  async _deleteKeyMapping(path) {
    this.cache.delete(`keymap:${path}`);
  }

  /**
   * Searches for patterns in stored data using regex or text matching
   * @param {string|RegExp} pattern - Search pattern (string or regex)
   * @param {Object} options - Search options
   * @param {boolean} options.caseSensitive - Case sensitive search (default: false)
   * @param {boolean} options.wholeWord - Match whole words only (default: false)
   * @param {number} options.maxResults - Maximum results to return (default: 100)
   * @param {Array<string>} options.fileTypes - Filter by data types ['json', 'text', 'binary']
   * @param {Function} options.preprocessor - Function to preprocess data before matching
   * @returns {Promise<Array>} - Search results with metadata
   */
  async grep(pattern, options = {}) {
    const {
      caseSensitive = false,
      wholeWord = false,
      maxResults = 100,
      fileTypes = ['json', 'text', 'binary'],
      preprocessor = null
    } = options;

    console.log(`🔍 Starting GREP search for pattern: ${pattern}`);
    
    const results = [];
    const searchRegex = this._createSearchRegex(pattern, { caseSensitive, wholeWord });
    
    // Search through cached data first
    for (const [cidStr, data] of this.cache.entries()) {
      if (results.length >= maxResults) break;
      
      try {
        const matchResult = await this._searchInData(data, searchRegex, cidStr, preprocessor);
        if (matchResult && this._matchesFileType(data, fileTypes)) {
          results.push(matchResult);
        }
      } catch (error) {
        console.warn(`Error searching in cached data ${cidStr}:`, error.message);
      }
    }
    
    console.log(`✅ GREP search completed. Found ${results.length} matches.`);
    return results;
  }

  /**
   * Multi-pattern grep search (similar to grep -E with multiple patterns)
   * @param {Array<string|RegExp>} patterns - Array of search patterns
   * @param {Object} options - Search options
   * @param {string} options.operator - 'AND' or 'OR' for combining patterns (default: 'OR')
   * @returns {Promise<Array>} - Search results
   */
  async multiGrep(patterns, options = {}) {
    const { operator = 'OR', ...grepOptions } = options;
    
    console.log(`🔍 Multi-GREP search with ${patterns.length} patterns (${operator} operator)`);
    
    if (operator === 'OR') {
      // Union of all pattern matches
      const allResults = new Map();
      
      for (const pattern of patterns) {
        const patternResults = await this.grep(pattern, grepOptions);
        patternResults.forEach(result => {
          allResults.set(result.cid, result);
        });
      }
      
      return Array.from(allResults.values());
    } else {
      // Intersection - data must match ALL patterns
      const firstPattern = patterns[0];
      let results = await this.grep(firstPattern, grepOptions);
      
      for (let i = 1; i < patterns.length; i++) {
        const patternRegex = this._createSearchRegex(patterns[i], grepOptions);
        results = results.filter(result => {
          try {
            const searchableText = this._extractSearchableText(result.data);
            return patternRegex.test(searchableText);
          } catch (error) {
            return false;
          }
        });
      }
      
      return results;
    }
  }

  /**
   * Inverted grep search (similar to grep -v)
   * @param {string|RegExp} pattern - Pattern to exclude
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Results that don't match the pattern
   */
  async grepInvert(pattern, options = {}) {
    console.log(`🔍 Inverted GREP search (excluding pattern): ${pattern}`);
    
    const allData = [];
    const searchRegex = this._createSearchRegex(pattern, options);
    
    // Get all cached data
    for (const [cidStr, data] of this.cache.entries()) {
      try {
        const searchableText = this._extractSearchableText(data);
        if (!searchRegex.test(searchableText)) {
          allData.push({
            cid: cidStr,
            data: data,
            type: this._detectDataType(data),
            size: this._getDataSize(data),
            matches: []
          });
        }
      } catch (error) {
        console.warn(`Error processing data ${cidStr}:`, error.message);
      }
    }
    
    return allData;
  }

  /**
   * Context-aware grep (similar to grep -A -B -C)
   * @param {string|RegExp} pattern - Search pattern
   * @param {Object} options - Search options
   * @param {number} options.beforeContext - Lines before match (default: 0)
   * @param {number} options.afterContext - Lines after match (default: 0)
   * @param {number} options.context - Lines before and after match (default: 0)
   * @returns {Promise<Array>} - Search results with context
   */
  async grepWithContext(pattern, options = {}) {
    const {
      beforeContext = 0,
      afterContext = 0,
      context = 0,
      ...grepOptions
    } = options;
    
    const before = context || beforeContext;
    const after = context || afterContext;
    
    console.log(`🔍 Context GREP search with ${before}/${after} lines context`);
    
    const results = [];
    const searchRegex = this._createSearchRegex(pattern, grepOptions);
    
    for (const [cidStr, data] of this.cache.entries()) {
      try {
        const searchableText = this._extractSearchableText(data);
        const lines = searchableText.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          if (searchRegex.test(lines[i])) {
            const contextStart = Math.max(0, i - before);
            const contextEnd = Math.min(lines.length - 1, i + after);
            
            results.push({
              cid: cidStr,
              data: data,
              type: this._detectDataType(data),
              matchLine: i + 1,
              matchText: lines[i],
              context: {
                before: lines.slice(contextStart, i),
                match: lines[i],
                after: lines.slice(i + 1, contextEnd + 1)
              },
              contextLines: lines.slice(contextStart, contextEnd + 1)
            });
          }
        }
      } catch (error) {
        console.warn(`Error searching with context in ${cidStr}:`, error.message);
      }
    }
    
    return results;
  }

  /**
   * Count occurrences of pattern (similar to grep -c)
   * @param {string|RegExp} pattern - Search pattern
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Count statistics
   */
  async grepCount(pattern, options = {}) {
    console.log(`🔍 GREP count for pattern: ${pattern}`);
    
    const searchRegex = this._createSearchRegex(pattern, options);
    const stats = {
      totalFiles: 0,
      filesWithMatches: 0,
      totalMatches: 0,
      fileStats: new Map()
    };
    
    for (const [cidStr, data] of this.cache.entries()) {
      stats.totalFiles++;
      
      try {
        const searchableText = this._extractSearchableText(data);
        const matches = searchableText.match(new RegExp(searchRegex.source, searchRegex.flags + 'g')) || [];
        
        if (matches.length > 0) {
          stats.filesWithMatches++;
          stats.totalMatches += matches.length;
          stats.fileStats.set(cidStr, {
            matches: matches.length,
            type: this._detectDataType(data),
            size: this._getDataSize(data)
          });
        }
      } catch (error) {
        console.warn(`Error counting in ${cidStr}:`, error.message);
      }
    }
    
    return stats;
  }

  /**
   * Search for patterns in transaction history
   * @param {string|RegExp} pattern - Search pattern
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Matching transactions
   */
  async grepTransactions(pattern, options = {}) {
    console.log(`🔍 GREP search in transaction history: ${pattern}`);
    
    const searchRegex = this._createSearchRegex(pattern, options);
    const results = [];
    
    // Search through cached transaction data
    for (const [cidStr, data] of this.cache.entries()) {
      if (this._isTransactionData(data)) {
        try {
          const matchResult = await this._searchInData(data, searchRegex, cidStr);
          if (matchResult) {
            matchResult.transactionType = this._getTransactionType(data);
            results.push(matchResult);
          }
        } catch (error) {
          console.warn(`Error searching transaction ${cidStr}:`, error.message);
        }
      }
    }
    
    return results;
  }

  /**
   * Creates a search regex from pattern and options
   * @param {string|RegExp} pattern - Search pattern
   * @param {Object} options - Search options
   * @returns {RegExp} - Compiled regex
   * @private
   */
  _createSearchRegex(pattern, options = {}) {
    const { caseSensitive = false, wholeWord = false } = options;
    
    if (pattern instanceof RegExp) {
      return pattern;
    }
    
    let regexPattern = pattern;
    
    // Escape special regex characters if it's a plain string
    regexPattern = regexPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Add word boundaries if wholeWord is true
    if (wholeWord) {
      regexPattern = `\\b${regexPattern}\\b`;
    }
    
    const flags = caseSensitive ? 'g' : 'gi';
    return new RegExp(regexPattern, flags);
  }

  /**
   * Searches for pattern in data
   * @param {any} data - Data to search
   * @param {RegExp} regex - Search regex
   * @param {string} cid - Content identifier
   * @param {Function} preprocessor - Optional preprocessor function
   * @returns {Object|null} - Match result or null
   * @private
   */
  async _searchInData(data, regex, cid, preprocessor = null) {
    try {
      let searchableText = this._extractSearchableText(data);
      
      if (preprocessor && typeof preprocessor === 'function') {
        searchableText = preprocessor(searchableText);
      }
      
      const matches = [];
      let match;
      
      while ((match = regex.exec(searchableText)) !== null) {
        matches.push({
          text: match[0],
          index: match.index,
          groups: match.groups || {}
        });
        
        // Prevent infinite loop for global regexes
        if (!regex.global) break;
      }
      
      if (matches.length > 0) {
        return {
          cid: cid,
          data: data,
          type: this._detectDataType(data),
          size: this._getDataSize(data),
          matches: matches,
          matchCount: matches.length
        };
      }
      
      return null;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Extracts searchable text from data
   * @param {any} data - Data to extract text from
   * @returns {string} - Searchable text
   * @private
   */
  _extractSearchableText(data) {
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    
    if (Buffer.isBuffer(data)) {
      try {
        return data.toString('utf8');
      } catch (error) {
        return data.toString('hex');
      }
    }
    
    return String(data);
  }

  /**
   * Detects the type of data
   * @param {any} data - Data to analyze
   * @returns {string} - Data type
   * @private
   */
  _detectDataType(data) {
    if (typeof data === 'string') return 'text';
    if (typeof data === 'object' && data !== null) return 'json';
    if (Buffer.isBuffer(data)) return 'binary';
    return 'unknown';
  }

  /**
   * Gets the size of data
   * @param {any} data - Data to measure
   * @returns {number} - Size in bytes
   * @private
   */
  _getDataSize(data) {
    if (typeof data === 'string') {
      return Buffer.byteLength(data, 'utf8');
    }
    
    if (typeof data === 'object' && data !== null) {
      return Buffer.byteLength(JSON.stringify(data), 'utf8');
    }
    
    if (Buffer.isBuffer(data)) {
      return data.length;
    }
    
    return Buffer.byteLength(String(data), 'utf8');
  }

  /**
   * Checks if data matches specified file types
   * @param {any} data - Data to check
   * @param {Array<string>} fileTypes - Allowed file types
   * @returns {boolean} - Whether data matches
   * @private
   */
  _matchesFileType(data, fileTypes) {
    const dataType = this._detectDataType(data);
    return fileTypes.includes(dataType);
  }

  /**
   * Checks if data represents transaction information
   * @param {any} data - Data to check
   * @returns {boolean} - Whether data is transaction-related
   * @private
   */
  _isTransactionData(data) {
    if (typeof data === 'object' && data !== null) {
      // Check for common transaction fields
      const txFields = ['from', 'to', 'amount', 'source', 'destination', 'hash', 'timestamp'];
      const dataKeys = Object.keys(data);
      return txFields.some(field => dataKeys.includes(field));
    }
    return false;
  }

  /**
   * Gets the type of transaction
   * @param {Object} data - Transaction data
   * @returns {string} - Transaction type
   * @private
   */
  _getTransactionType(data) {
    if (data.type) return data.type;
    if (data.amount) return 'transfer';
    if (data.mint) return 'mint';
    if (data.burn) return 'burn';
    return 'unknown';
  }

  // ...existing code...
}

/**
 * Initializes the storage module
 * @param {Object} config - Configuration options
 * @returns {Promise<Storage>} - Storage interface
 */
async function initialize(config) {
  try {
    const { fs } = config;
    
    if (!fs) {
      throw new Error('UnixFS instance is required for storage initialization');
    }
    
    return new Storage(fs, config);
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Creates a new Storage instance
 * @param {Object} options - Storage options
 * @param {Object} options.helia - Helia instance
 * @returns {Promise<Storage>} - Storage instance
 */
async function createStorage(options) {
  const storage = new Storage();
  await storage.initialize(options);
  return storage;
}

module.exports = {
  initialize,
  Storage,
  createStorage
};
