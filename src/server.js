/**
 * Web server for Helia Blockchain Token
 * Provides a REST API and web interface for the blockchain token system
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeTokenSystem } = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Global token system instance
let tokenSystem = null;

/**
 * Initialize the blockchain token system
 */
async function initializeSystem() {
  try {
    console.log('🚀 Initializing Helia Blockchain Token System...');
    tokenSystem = await initializeTokenSystem({
      helia: {
        // Disable some P2P features for web environment
        config: {
          Addresses: {
            Swarm: ['/ip4/127.0.0.1/tcp/0']
          }
        }
      }
    });
    console.log('✅ Token system initialized successfully');
    return tokenSystem;
  } catch (error) {
    console.error('❌ Failed to initialize token system:', error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: tokenSystem ? 'initialized' : 'not_initialized'
  });
});

// System info endpoint
app.get('/api/system/info', async (req, res) => {
  try {
    if (!tokenSystem) {
      return res.status(503).json({ error: 'Token system not initialized' });
    }

    const info = {
      name: 'Helia Blockchain Token',
      version: '1.0.0',
      philosophical_modules: [
        'Planck (Quantum principles)',
        'Leibniz (Binary mathematics)',
        'Gödel (Consistency verification)',
        'Aristotle (Logical framework)',
        'Shannon (Information theory)',
        'Turing (Computational model)'
      ],
      components: {
        storage: 'Helia IPFS',
        network: 'libp2p P2P',
        crypto: 'Noble cryptography'
      }
    };

    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token operations
app.post('/api/tokens/create', async (req, res) => {
  try {
    if (!tokenSystem) {
      return res.status(503).json({ error: 'Token system not initialized' });
    }

    const { name, symbol, supply } = req.body;
    
    if (!name || !symbol || !supply) {
      return res.status(400).json({ error: 'Name, symbol, and supply are required' });
    }

    const result = await tokenSystem.token.createToken({
      name,
      symbol,
      totalSupply: parseInt(supply)
    });

    res.json({
      success: true,
      message: 'Token created successfully',
      token: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tokens/mint', async (req, res) => {
  try {
    if (!tokenSystem) {
      return res.status(503).json({ error: 'Token system not initialized' });
    }

    const { to, amount } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ error: 'Recipient address and amount are required' });
    }

    const result = await tokenSystem.token.mint(to, parseInt(amount));

    res.json({
      success: true,
      message: 'Tokens minted successfully',
      transaction: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tokens/transfer', async (req, res) => {
  try {
    if (!tokenSystem) {
      return res.status(503).json({ error: 'Token system not initialized' });
    }

    const { from, to, amount } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'From, to, and amount are required' });
    }

    const result = await tokenSystem.token.transfer(from, to, parseInt(amount));

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      transaction: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tokens/balance/:address', async (req, res) => {
  try {
    if (!tokenSystem) {
      return res.status(503).json({ error: 'Token system not initialized' });
    }

    const { address } = req.params;
    const balance = await tokenSystem.token.getBalance(address);

    res.json({
      address,
      balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Storage operations
app.post('/api/storage/store', async (req, res) => {
  try {
    if (!tokenSystem) {
      return res.status(503).json({ error: 'Token system not initialized' });
    }

    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const cid = await tokenSystem.storage.store(data);

    res.json({
      success: true,
      message: 'Data stored successfully',
      cid: cid.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/storage/retrieve/:cid', async (req, res) => {
  try {
    if (!tokenSystem) {
      return res.status(503).json({ error: 'Token system not initialized' });
    }

    const { cid } = req.params;
    const data = await tokenSystem.storage.retrieve(cid);

    res.json({
      cid,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Network operations
app.get('/api/network/peers', async (req, res) => {
  try {
    if (!tokenSystem || !tokenSystem.network) {
      return res.status(503).json({ error: 'Network not initialized' });
    }

    const info = tokenSystem.network.getNetworkInfo();
    const peers = tokenSystem.network.getPeers();

    res.json({
      peerId: info.peerId,
      peerCount: info.peerCount,
      listenAddresses: info.listenAddresses,
      peers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Philosophical utility endpoints
app.post('/api/utils/planck/quantize', (req, res) => {
  try {
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const planck = require('./utils/planck');
    const quantized = planck.quantize(BigInt(value));

    res.json({
      original: value,
      quantized: quantized.toString(),
      principle: 'Planck quantum energy discretization'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/utils/shannon/entropy', (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const shannon = require('./utils/shannon');
    const entropy = shannon.calculateEntropy(data);

    res.json({
      data,
      entropy,
      principle: 'Shannon information entropy calculation'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/utils/leibniz/monad', (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const leibniz = require('./utils/leibniz');
    const hash = leibniz.monadHash(data);

    res.json({
      data,
      monadHash: hash,
      principle: 'Leibniz monadic hash calculation'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Helia Blockchain Token</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card h3 {
            color: #5a67d8;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }
        
        .form-group input, .form-group select {
            width: 100%;
            padding: 10px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #5a67d8;
        }
        
        .btn {
            background: linear-gradient(135deg, #5a67d8 0%, #667eea 100%);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(90, 103, 216, 0.4);
        }
        
        .result {
            margin-top: 15px;
            padding: 15px;
            border-radius: 8px;
            background: #f8f9fa;
            border-left: 4px solid #5a67d8;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .philosophical {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 30px;
            border-radius: 15px;
            margin-top: 20px;
        }
        
        .philosophical h3 {
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        
        .modules {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .module {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            backdrop-filter: blur(5px);
        }
        
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status.healthy {
            background: #48bb78;
            color: white;
        }
        
        .status.unhealthy {
            background: #f56565;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌌 Helia Blockchain Token</h1>
            <p>Quantum-Philosophical Distributed Token System</p>
            <p>Status: <span id="systemStatus" class="status">Checking...</span></p>
        </div>
        
        <div class="grid">
            <!-- Token Operations -->
            <div class="card">
                <h3>🪙 Token Operations</h3>
                <div class="form-group">
                    <label>Operation:</label>
                    <select id="tokenOperation">
                        <option value="create">Create Token</option>
                        <option value="mint">Mint Tokens</option>
                        <option value="transfer">Transfer Tokens</option>
                        <option value="balance">Check Balance</option>
                    </select>
                </div>
                <div id="tokenFields"></div>
                <button class="btn" onclick="executeTokenOperation()">Execute</button>
                <div id="tokenResult" class="result" style="display: none;"></div>
            </div>
            
            <!-- Storage Operations -->
            <div class="card">
                <h3>💾 IPFS Storage</h3>
                <div class="form-group">
                    <label>Operation:</label>
                    <select id="storageOperation" onchange="updateStorageFields()">
                        <option value="store">Store Data</option>
                        <option value="retrieve">Retrieve Data</option>
                    </select>
                </div>
                <div id="storageFields"></div>
                <button class="btn" onclick="executeStorageOperation()">Execute</button>
                <div id="storageResult" class="result" style="display: none;"></div>
            </div>
            
            <!-- Network Status -->
            <div class="card">
                <h3>🌐 P2P Network</h3>
                <button class="btn" onclick="getNetworkInfo()">Get Network Info</button>
                <div id="networkResult" class="result" style="display: none;"></div>
            </div>
            
            <!-- Philosophical Utils -->
            <div class="card">
                <h3>🧠 Philosophical Utilities</h3>
                <div class="form-group">
                    <label>Utility:</label>
                    <select id="utilOperation" onchange="updateUtilFields()">
                        <option value="planck">Planck Quantization</option>
                        <option value="shannon">Shannon Entropy</option>
                        <option value="leibniz">Leibniz Monad Hash</option>
                    </select>
                </div>
                <div id="utilFields"></div>
                <button class="btn" onclick="executeUtilOperation()">Calculate</button>
                <div id="utilResult" class="result" style="display: none;"></div>
            </div>
        </div>
        
        <div class="philosophical">
            <h3>🎭 Philosophical Framework Integration</h3>
            <p>This system integrates mathematical and philosophical concepts from history's greatest thinkers</p>
            <div class="modules">
                <div class="module">
                    <strong>Planck</strong><br>
                    Quantum energy discretization
                </div>
                <div class="module">
                    <strong>Leibniz</strong><br>
                    Binary mathematics & monads
                </div>
                <div class="module">
                    <strong>Gödel</strong><br>
                    Consistency verification
                </div>
                <div class="module">
                    <strong>Aristotle</strong><br>
                    Logical frameworks
                </div>
                <div class="module">
                    <strong>Shannon</strong><br>
                    Information theory
                </div>
                <div class="module">
                    <strong>Turing</strong><br>
                    Computational models
                </div>
            </div>
        </div>
    </div>

    <script>
        // Check system status on load
        window.onload = function() {
            checkSystemStatus();
            updateTokenFields();
            updateStorageFields();
            updateUtilFields();
        };
        
        async function checkSystemStatus() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                const statusEl = document.getElementById('systemStatus');
                
                if (data.status === 'healthy' && data.system === 'initialized') {
                    statusEl.textContent = 'Online';
                    statusEl.className = 'status healthy';
                } else {
                    statusEl.textContent = 'Initializing...';
                    statusEl.className = 'status unhealthy';
                }
            } catch (error) {
                const statusEl = document.getElementById('systemStatus');
                statusEl.textContent = 'Offline';
                statusEl.className = 'status unhealthy';
            }
        }
        
        function updateTokenFields() {
            const operation = document.getElementById('tokenOperation').value;
            const fieldsDiv = document.getElementById('tokenFields');
            
            let html = '';
            switch (operation) {
                case 'create':
                    html = \`
                        <div class="form-group">
                            <label>Token Name:</label>
                            <input type="text" id="tokenName" placeholder="My Token">
                        </div>
                        <div class="form-group">
                            <label>Symbol:</label>
                            <input type="text" id="tokenSymbol" placeholder="MYT">
                        </div>
                        <div class="form-group">
                            <label>Total Supply:</label>
                            <input type="number" id="tokenSupply" placeholder="1000000">
                        </div>
                    \`;
                    break;
                case 'mint':
                    html = \`
                        <div class="form-group">
                            <label>To Address:</label>
                            <input type="text" id="mintTo" placeholder="0x...">
                        </div>
                        <div class="form-group">
                            <label>Amount:</label>
                            <input type="number" id="mintAmount" placeholder="100">
                        </div>
                    \`;
                    break;
                case 'transfer':
                    html = \`
                        <div class="form-group">
                            <label>From Address:</label>
                            <input type="text" id="transferFrom" placeholder="0x...">
                        </div>
                        <div class="form-group">
                            <label>To Address:</label>
                            <input type="text" id="transferTo" placeholder="0x...">
                        </div>
                        <div class="form-group">
                            <label>Amount:</label>
                            <input type="number" id="transferAmount" placeholder="50">
                        </div>
                    \`;
                    break;
                case 'balance':
                    html = \`
                        <div class="form-group">
                            <label>Address:</label>
                            <input type="text" id="balanceAddress" placeholder="0x...">
                        </div>
                    \`;
                    break;
            }
            fieldsDiv.innerHTML = html;
        }
        
        function updateStorageFields() {
            const operation = document.getElementById('storageOperation').value;
            const fieldsDiv = document.getElementById('storageFields');
            
            let html = '';
            if (operation === 'store') {
                html = \`
                    <div class="form-group">
                        <label>Data to Store:</label>
                        <input type="text" id="storeData" placeholder="Enter data to store">
                    </div>
                \`;
            } else {
                html = \`
                    <div class="form-group">
                        <label>CID:</label>
                        <input type="text" id="retrieveCid" placeholder="Qm...">
                    </div>
                \`;
            }
            fieldsDiv.innerHTML = html;
        }
        
        function updateUtilFields() {
            const operation = document.getElementById('utilOperation').value;
            const fieldsDiv = document.getElementById('utilFields');
            
            let html = '';
            if (operation === 'planck') {
                html = \`
                    <div class="form-group">
                        <label>Value to Quantize:</label>
                        <input type="number" id="planckValue" placeholder="1000">
                    </div>
                \`;
            } else {
                html = \`
                    <div class="form-group">
                        <label>Data:</label>
                        <input type="text" id="utilData" placeholder="Enter data">
                    </div>
                \`;
            }
            fieldsDiv.innerHTML = html;
        }
        
        async function executeTokenOperation() {
            const operation = document.getElementById('tokenOperation').value;
            const resultDiv = document.getElementById('tokenResult');
            
            try {
                let response;
                
                switch (operation) {
                    case 'create':
                        response = await fetch('/api/tokens/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: document.getElementById('tokenName').value,
                                symbol: document.getElementById('tokenSymbol').value,
                                supply: document.getElementById('tokenSupply').value
                            })
                        });
                        break;
                    case 'mint':
                        response = await fetch('/api/tokens/mint', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: document.getElementById('mintTo').value,
                                amount: document.getElementById('mintAmount').value
                            })
                        });
                        break;
                    case 'transfer':
                        response = await fetch('/api/tokens/transfer', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                from: document.getElementById('transferFrom').value,
                                to: document.getElementById('transferTo').value,
                                amount: document.getElementById('transferAmount').value
                            })
                        });
                        break;
                    case 'balance':
                        const address = document.getElementById('balanceAddress').value;
                        response = await fetch(\`/api/tokens/balance/\${address}\`);
                        break;
                }
                
                const data = await response.json();
                resultDiv.innerHTML = JSON.stringify(data, null, 2);
                resultDiv.style.display = 'block';
                
            } catch (error) {
                resultDiv.innerHTML = \`Error: \${error.message}\`;
                resultDiv.style.display = 'block';
            }
        }
        
        async function executeStorageOperation() {
            const operation = document.getElementById('storageOperation').value;
            const resultDiv = document.getElementById('storageResult');
            
            try {
                let response;
                
                if (operation === 'store') {
                    response = await fetch('/api/storage/store', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            data: document.getElementById('storeData').value
                        })
                    });
                } else {
                    const cid = document.getElementById('retrieveCid').value;
                    response = await fetch(\`/api/storage/retrieve/\${cid}\`);
                }
                
                const data = await response.json();
                resultDiv.innerHTML = JSON.stringify(data, null, 2);
                resultDiv.style.display = 'block';
                
            } catch (error) {
                resultDiv.innerHTML = \`Error: \${error.message}\`;
                resultDiv.style.display = 'block';
            }
        }
        
        async function getNetworkInfo() {
            const resultDiv = document.getElementById('networkResult');
            
            try {
                const response = await fetch('/api/network/peers');
                const data = await response.json();
                resultDiv.innerHTML = JSON.stringify(data, null, 2);
                resultDiv.style.display = 'block';
                
            } catch (error) {
                resultDiv.innerHTML = \`Error: \${error.message}\`;
                resultDiv.style.display = 'block';
            }
        }
        
        async function executeUtilOperation() {
            const operation = document.getElementById('utilOperation').value;
            const resultDiv = document.getElementById('utilResult');
            
            try {
                let response;
                let body = {};
                
                if (operation === 'planck') {
                    body.value = document.getElementById('planckValue').value;
                    response = await fetch('/api/utils/planck/quantize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                } else if (operation === 'shannon') {
                    body.data = document.getElementById('utilData').value;
                    response = await fetch('/api/utils/shannon/entropy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                } else {
                    body.data = document.getElementById('utilData').value;
                    response = await fetch('/api/utils/leibniz/monad', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                }
                
                const data = await response.json();
                resultDiv.innerHTML = JSON.stringify(data, null, 2);
                resultDiv.style.display = 'block';
                
            } catch (error) {
                resultDiv.innerHTML = \`Error: \${error.message}\`;
                resultDiv.style.display = 'block';
            }
        }
        
        // Update field handlers
        document.getElementById('tokenOperation').addEventListener('change', updateTokenFields);
    </script>
</body>
</html>
  `);
});

// Start server
async function startServer() {
  try {
    // Initialize the blockchain system first
    await initializeSystem();
    
    // Start the web server
    app.listen(PORT, () => {
      console.log(`🌐 Helia Blockchain Token Web Server running on:`);
      console.log(`   📍 Local:    http://localhost:${PORT}`);
      console.log(`   📍 Network:  http://0.0.0.0:${PORT}`);
      console.log(`\n🚀 Features available:`);
      console.log(`   • Token operations (create, mint, transfer, balance)`);
      console.log(`   • IPFS storage (store, retrieve)`);
      console.log(`   • P2P network status`);
      console.log(`   • Philosophical utilities (Planck, Shannon, Leibniz)`);
      console.log(`\n📖 API Documentation: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (tokenSystem) {
    await tokenSystem.stop();
  }
  process.exit(0);
});

// Export for use as a module
module.exports = { app, startServer };

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
