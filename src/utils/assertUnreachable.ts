export function assertUnreachable(_x: never): never {
  throw new Error("Unreachable code reached");
}
