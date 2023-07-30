// Usage:
// [1, 2, 2].filter(unique) // > [1, 2]
export const unique = <T extends any>(
  item: T,
  index: number,
  array: T[]
): boolean => array.indexOf(item) === index;

// Usage:
// const sameX = (a) => (b) => a.x === b.x;
// [{ x: 1 }, { x: 2 }, { x: 2 }].filter(uniqueBy(sameX)) // > [1, 2]
export const uniqueBy = <T extends any>(
  isEqualTo: (a: T) => (b: T) => boolean
) => (item: T, index: number, array: T[]): boolean =>
  array.findIndex(isEqualTo(item)) === index;

// Usage:
// [{ x: 2 }, { y: 1 }].sort(ascBy(item => item.x)) // [{ x: 1 }, { x: 2 }]
export const ascBy = <T extends any>(getValue: (item: T) => number) => (
  one: T,
  two: T
) => {
  return getValue(one) - getValue(two);
};

// From https://stackoverflow.com/a/75337277/2054731
type ValueOf<T> = T[keyof T];
type Entries<T> = Array<[keyof T, ValueOf<T>]>;

// Usage: Same as `Object.entries()` but with type inference
export function objectEntries<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}
