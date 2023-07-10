import { LRUMap } from "lru_map";

type Entry<V> = {
  value: V;
  size: number;
};

export class LRUCache<K, V> {
  map: LRUMap<K, Entry<V>>;
  totalSize: number;
  maxSize: number;
  sizeCalculation: (value: V, key: K) => number;

  constructor(options: {
    limit: number;
    maxSize: number;
    sizeCalculation: (value: V, key: K) => number;
  }) {
    this.map = new LRUMap(options.limit);
    this.totalSize = 0;
    this.maxSize = options.maxSize;
    this.sizeCalculation = options.sizeCalculation;
  }

  get(key: K) {
    return this.map.get(key)?.value;
  }

  set(key: K, value: V) {
    const size = this.sizeCalculation(value, key);

    if (size > this.maxSize) {
      return;
    }

    while (this.totalSize + size > this.maxSize) {
      const oldest = this.map.oldest;
      this.map.delete(oldest.key);
      this.totalSize -= oldest.value.size;
    }

    this.map.set(key, { value, size });
    this.totalSize += size;
  }

  clear() {
    this.map.clear();
    this.totalSize = 0;
  }

  *keys() {
    for (const [key, _] of this.map) {
      yield key;
    }
  }
}
