import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  try {
    return value ? JSON.parse(value) || null : null;
  } catch (error) {
    // Handle the error here
    console.error("Error parsing JSON:", error);
    return null;
  }
}

export function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(key: string) {
  storage.remove(key);
}
