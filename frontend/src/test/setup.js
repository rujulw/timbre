import '@testing-library/jest-dom/vitest';

const memoryStorage = new Map();

const localStorageMock = {
  getItem(key) {
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  },
  setItem(key, value) {
    memoryStorage.set(key, String(value));
  },
  removeItem(key) {
    memoryStorage.delete(key);
  },
  clear() {
    memoryStorage.clear();
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});
