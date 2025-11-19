import type { StorageAdapter } from './storage';

export function createMockStorage(initialData: Record<string, unknown> = {}): StorageAdapter {
  const store: Record<string, unknown> = { ...initialData };

  return {
    getItem: (key) => {
      const v = store[key];
      return v ? JSON.parse(JSON.stringify(v)) : null;
    },
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
}

export default createMockStorage;
