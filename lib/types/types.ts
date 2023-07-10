import isPlainObject from "lodash/isObject";
import transform from "lodash/transform";

export type NoId<T> = Omit<T, "id">;

// recursively make all properties optional
export type NestedPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer R>
    ? Array<NestedPartial<R>>
    : NestedPartial<T[K]>;
};

// A utility type for marking a value as nullable.
export type Nullable<T> = T | null | undefined;

// A utility type for removing `undefined | null` from certain properties
export type PickRequired<T, K extends keyof T> = T & Pick<Required<T>, K>;

// Check if a value is a number.
export const isNumber = (value: any): value is number => {
  return typeof value === "number";
};

export const isNull = <T>(value: T | null): value is null => {
  return value === null;
};

export const isUndefined = <T>(value: T | undefined): value is undefined => {
  return value === undefined;
};

export const isNullable = <T>(
  value: T | null | undefined
): value is null | undefined => {
  return isNull(value) || isUndefined(value);
};

export const isNonNullable = <T>(value: T | null | undefined): value is T => {
  return !isNullable(value);
};

// Recursively remove all fields that have `null` or `undefined` values.
export const removeNullable = <T extends any>(obj: Nullable<object>) => {
  if (isNonNullable(obj)) {
    return transform<object, T>(obj, (result: any, value: any, key: any) => {
      if (!isNonNullable(value)) {
        return;
      } else if (isPlainObject(value)) {
        result[key] = removeNullable(value);
      } else {
        result[key] = value;
      }
    });
  }
};

// Recursively remove all empty objects from an object.
export const removeEmpty = (obj: object | null | undefined) => {
  if (obj && !(isPlainObject(obj) && Object.keys(obj).length === 0)) {
    return transform(obj, (result: any, value: any, key: any) => {
      if (isPlainObject(value) && Object.keys(obj).length === 0) {
        return;
      } else if (isPlainObject(value)) {
        result[key] = removeEmpty(value);
      } else {
        result[key] = value;
      }
    });
  }
};

// In cases where you have a variable that can be two types with different properities,
// this function can be used to safely use properties that don't exist on the intersection
// of the two types
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
