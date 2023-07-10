const typeSizes = {
  undefined: (_item: any) => 0,
  boolean: (_item: boolean) => 4,
  number: (_item: number) => 8,
  string: (item: string) => 2 * item.length,
  function: (_item: any) => 0,
  symbol: (_item: any) => 0,
  bigint: (_item: any) => 0,
  object: (item: Record<string, any> | null) =>
    item === null
      ? 0
      : Object.keys(item).reduce(
          (total, key) => sizeOf(key) + sizeOf(item[key]) + total,
          0
        ),
};

export function sizeOf(value: any): number {
  return typeSizes[typeof value](value);
}
