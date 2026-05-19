export type StorageItemValue = any;
export type AssertNoExtras<T> = T;

export class StorageBase {
  // --- ADD THIS MISSING RETRIEVE FUNCTION ---
  retrieve = (raw: string | null, fallback: any) => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      this.warn("Failed to parse storage item:", e);
      return fallback;
    }
  };
  // ------------------------------------------

  warn(...args: any[]) {
    console.warn(...args);
  }
  log(...args: any[]) {
    console.log(...args);
  }
  error(...args: any[]) {
    console.error(...args);
  }
}