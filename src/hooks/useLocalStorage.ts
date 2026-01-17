"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  // Create subscribe function for useSyncExternalStore
  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key) {
          callback();
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
    [key]
  );

  // Create getSnapshot function
  const getSnapshot = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ?? null;
    } catch {
      return null;
    }
  }, [key]);

  // Get server snapshot
  const getServerSnapshotFn = useCallback(() => null, []);

  // Use useSyncExternalStore for SSR-safe localStorage reading
  const storedItem = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshotFn
  );

  // Parse the stored value
  const value: T = storedItem ? JSON.parse(storedItem) : initialValue;

  // Track if we're on client (localStorage is available)
  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Save to localStorage
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const currentItem = window.localStorage.getItem(key);
        const currentValue: T = currentItem
          ? JSON.parse(currentItem)
          : initialValue;
        const valueToStore =
          newValue instanceof Function ? newValue(currentValue) : newValue;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch storage event to trigger re-render
        window.dispatchEvent(
          new StorageEvent("storage", { key, newValue: JSON.stringify(valueToStore) })
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [value, setValue, isLoaded];
}
