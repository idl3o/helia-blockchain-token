# This file is a configuration file for Jest module mocking
module.exports = {
  multiformats: {
    CID: require('../mocks/multiformats-mock').CID
  }
}
