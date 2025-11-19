export type StorageAdapter = {
  getItem<T = unknown>(key: string): T | null;
  setItem<T = unknown>(key: string, value: T): void;
  removeItem(key: string): void;
};

const localStorageAdapter: StorageAdapter = {
  getItem: (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      // Log and return null on parse/access errors
      // Don't throw to avoid breaking UI on browsers that restrict storage
      // (e.g., private mode)
    console.error(`storage.getItem failed for key=${key}:`, error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
    console.error(`storage.setItem failed for key=${key}:`, error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
    console.error(`storage.removeItem failed for key=${key}:`, error);
    }
  },
};

export const storage: StorageAdapter = localStorageAdapter;
