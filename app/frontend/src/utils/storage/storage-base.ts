export type StorageItemValue = any;
export type AssertNoExtras<T> = T;

export class StorageBase {
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