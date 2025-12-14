/**
 * Mock for NetInfo in tests
 */

let mockState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
};

const setMockState = (state) => {
  mockState = { ...mockState, ...state };
};

const NetInfo = {
  fetch: jest.fn(() => {
    return Promise.resolve(mockState);
  }),
  addEventListener: jest.fn((callback) => {
    callback(mockState);
    return () => {}; // unsubscribe
  }),
};

module.exports = NetInfo;
module.exports.default = NetInfo;
module.exports.setMockState = setMockState;

