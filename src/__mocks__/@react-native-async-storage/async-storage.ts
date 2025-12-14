/**
 * Mock for AsyncStorage in tests
 */

const storage: Record<string, string> = {};

export default {
  getItem: jest.fn((key: string): Promise<string | null> => {
    return Promise.resolve(storage[key] || null);
  }),
  setItem: jest.fn((key: string, value: string): Promise<void> => {
    storage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string): Promise<void> => {
    delete storage[key];
    return Promise.resolve();
  }),
  clear: jest.fn((): Promise<void> => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    return Promise.resolve();
  }),
  getAllKeys: jest.fn((): Promise<string[]> => {
    return Promise.resolve(Object.keys(storage));
  }),
  multiGet: jest.fn((keys: string[]): Promise<[string, string | null][]> => {
    return Promise.resolve(keys.map((key) => [key, storage[key] || null]));
  }),
  multiSet: jest.fn((keyValuePairs: [string, string][]): Promise<void> => {
    keyValuePairs.forEach(([key, value]) => {
      storage[key] = value;
    });
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: string[]): Promise<void> => {
    keys.forEach((key) => delete storage[key]);
    return Promise.resolve();
  }),
};

