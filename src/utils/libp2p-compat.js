/**
 * Compatibility module for libp2p in CommonJS environment
 * Since libp2p and related modules are ES modules, we need to use dynamic imports
 */

let _createLibp2p = null;
let _tcp = null;
let _webSockets = null;
let _webRTC = null;
let _noise = null;
let _yamux = null;
let _mplex = null;
let _gossipsub = null;
let _bootstrap = null;
let _identify = null;
let _libp2pPromise = null;

/**
 * Get libp2p modules (lazy loaded)
 * @returns {Promise<Object>} libp2p modules
 */
async function getLibp2pModules() {  if (_createLibp2p && _tcp && _webSockets && _noise && _yamux && _mplex && _gossipsub && _bootstrap && _identify) {
    return {
      createLibp2p: _createLibp2p,
      tcp: _tcp,
      webSockets: _webSockets,
      webRTC: _webRTC,
      noise: _noise,
      yamux: _yamux,
      mplex: _mplex,
      gossipsub: _gossipsub,
      bootstrap: _bootstrap,
      identify: _identify
    };
  }
  
  if (!_libp2pPromise) {
    _libp2pPromise = Promise.all([      import('libp2p'),
      import('@libp2p/tcp'),
      import('@libp2p/websockets'),
      import('@libp2p/webrtc'),
      import('@chainsafe/libp2p-noise'),
      import('@chainsafe/libp2p-yamux'),
      import('@libp2p/mplex'),
      import('@chainsafe/libp2p-gossipsub'),
      import('@libp2p/bootstrap'),
      import('@libp2p/identify')    ]).then(([
      libp2pModule,
      tcpModule,
      webSocketsModule,
      webRTCModule,
      noiseModule,
      yamuxModule,
      mplexModule,
      gossipsubModule,
      bootstrapModule,
      identifyModule
    ]) => {
      _createLibp2p = libp2pModule.createLibp2p;
      _tcp = tcpModule.tcp;
      _webSockets = webSocketsModule.webSockets;
      _webRTC = webRTCModule.webRTC;
      _noise = noiseModule.noise;
      _yamux = yamuxModule.yamux;
      _mplex = mplexModule.mplex;
      _gossipsub = gossipsubModule.gossipsub;
      _bootstrap = bootstrapModule.bootstrap;
      _identify = identifyModule.identify;
      
      return {
        createLibp2p: _createLibp2p,
        tcp: _tcp,
        webSockets: _webSockets,
        webRTC: _webRTC,
        noise: _noise,
        yamux: _yamux,
        mplex: _mplex,
        gossipsub: _gossipsub,
        bootstrap: _bootstrap,
        identify: _identify
      };
    });
  }
  
  return _libp2pPromise;
}

/**
 * Create a libp2p instance
 * @param {Object} config - libp2p configuration
 * @returns {Promise<Object>} libp2p instance
 */
async function createLibp2pInstance(config = {}) {
  const { createLibp2p } = await getLibp2pModules();
  return createLibp2p(config);
}

module.exports = {
  getLibp2pModules,
  createLibp2pInstance
};
