/* eslint @typescript-eslint/strict-boolean-expressions: off */

export const assert = (condition: any, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};
