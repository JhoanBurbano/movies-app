/**
 * Mock for expo-file-system in tests
 */

const mockFiles = {};

module.exports = {
  cacheDirectory: '/mock/cache/',
  getInfoAsync: jest.fn(async (path) => {
    return mockFiles[path] || { exists: false };
  }),
  makeDirectoryAsync: jest.fn(async (path) => {
    mockFiles[path] = { exists: true };
  }),
  downloadAsync: jest.fn(async (uri, fileUri) => {
    mockFiles[fileUri] = { exists: true, size: 1000 };
    return { status: 200, uri: fileUri };
  }),
  readDirectoryAsync: jest.fn(async (path) => {
    return Object.keys(mockFiles).filter((key) => key.startsWith(path));
  }),
  deleteAsync: jest.fn(async (path) => {
    Object.keys(mockFiles).forEach((key) => {
      if (key.startsWith(path)) {
        delete mockFiles[key];
      }
    });
  }),
  resetMock: () => {
    Object.keys(mockFiles).forEach((key) => delete mockFiles[key]);
  },
};

