import { Mutex } from "async-mutex";

export class QueryResultsCache<T extends Object | undefined> {
  results: Record<string, { data: T; timestamp: number; size?: bigint }>;
  maxSize: number;
  currentCacheSize = BigInt(0);
  mutexLock = new Mutex();

  constructor(props: { maxSize: number }) {
    this.maxSize = props.maxSize;
    this.results = {};
  }

  get(key: string): T {
    return this.results[key]?.data;
  }

  // Sets a value in the cache and ensures the the limits
  // of the cache as defined by the properties are maintained
  async set(key: string, value: T) {
    const release = await this.mutexLock.acquire();
    this.results[key] = { data: value, timestamp: Date.now() };
    release();
    // Do not wait for the value size calculations and cleanup to be performed
    this.setValueSize(key, value);
  }

  // Sets the value property of the cache item to the approximate size of the value
  // If the current cache is too big then clean up some space
  async setValueSize(key: string, value: Record<string, any> | undefined) {
    const valueSize = sizeOf(value);
    if (valueSize + this.currentCacheSize > this.maxSize) {
      await this.makeSpace(valueSize);
    }
    this.currentCacheSize = valueSize + this.currentCacheSize;
    const release = await this.mutexLock.acquire();
    if (this.results[key]) {
      this.results[key].size = valueSize;
    }
    release();
  }

  // Wipe the cache
  async clear() {
    const releaseLock = await this.mutexLock.acquire();
    this.results = {};
    releaseLock();
  }

  // Remove items from the cache by deleting the oldest items
  // until there is enough space.
  async makeSpace(size: bigint) {
    const sortedItems = Object.entries(this.results).sort(
      ([, val1], [, val2]) => val1.timestamp - val2.timestamp
    );
    let recoveredSpace = BigInt(0);
    const releaseLock = await this.mutexLock.acquire();
    for (let ix = 0; ix < sortedItems.length; ix++) {
      const [itemKey, cacheValue] = sortedItems[ix];
      delete this.results[itemKey];
      recoveredSpace += cacheValue.size || BigInt(0);
      if (recoveredSpace > size) {
        break;
      }
    }
    releaseLock();
  }
}

type SupportedTypes =
  | undefined
  | boolean
  | number
  | string
  | Record<string, any>;
// The assumed size in bytes of each data type
const typeSizes = {
  undefined: (item: any) => BigInt(0),
  boolean: (item: boolean) => BigInt(4),
  number: (item: number) => BigInt(8),
  string: (item: string) => BigInt(2 * item.length),
  function: (item: any) => BigInt(0),
  symbol: (item: any) => BigInt(0),
  bigint: (item: any) => BigInt(0),
  object: (item: Record<string, any>): bigint =>
    !item
      ? BigInt(0)
      : Object.keys(item).reduce(
          (total, key) => sizeOf(key) + sizeOf(item[key]) + total,
          BigInt(0)
        ),
};

// Estimate size of a value without iterating through
// the the actual value of the object
export function sizeOf(value: SupportedTypes): bigint {
  return typeSizes[typeof value](value);
}
