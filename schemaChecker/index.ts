import { type Schema, type FromSchema, isSchemaUnionValue } from'./type';

const trimBrackets = (str: string) => /^\(.*\)$/.test(str) ? str.slice(1, -1) : str;

const split = (str: string, delimiter: string) => {
  let acc = '';
  const count: [number, number] = [0, 0];
  const result: string[] = [];
  for(const s of str) {
    if (s === delimiter && count[0] === 0 && count[1] === 0) {
      result.push(acc);
      acc = '';
    }
    else {
      acc += s;
      switch (s) {
        case '<': {
          count[0]++;
          break;
        }
        case '>': {
          count[0]--;
          break;
        }
        case '(': {
          count[1]++;
          break;
        }
        case ')': {
          count[1]--;
          break;
        }
        default: {
          break;
        }
      }
    }
  }
  return result;
};

const primitiveChecker: Record<string, (arg: unknown) => boolean> = {
  number: (arg: unknown) => typeof arg === 'number',
  string: (arg: unknown) => typeof arg === 'string',
  boolean: (arg: unknown) => typeof arg === 'boolean',
  Date: (arg: unknown) => arg instanceof Date,
  undefined: (arg: unknown) => typeof arg === 'undefined',
  null: (arg: unknown) => arg === null,
  unknown: () => true,
  never: () => false,
  void: (arg: unknown) => typeof arg === 'undefined',
};

export const schemaChecker = <T extends Schema | [Schema]>(schema: T) => (arg: unknown): arg is FromSchema<T> => {
  if (typeof arg !== 'object' || arg === null) return false;
  if (Array.isArray(schema)) {
    if (!Array.isArray(arg)) return false;
    const checker = schemaChecker(schema[0]);
    return arg.every((v) => checker(v));
  }
  return Object.entries(schema).every(([key, value]) => {
    if (!(key in arg)) return false;
    const argValue: unknown = arg[key];
    if (isSchemaUnionValue(value)) {
      return value.value.some((v) => typeof v === 'object' ? schemaChecker(v)(argValue) : false);
    }
    if (typeof value === 'object') return schemaChecker(value)(argValue);
    const defineStr = value.slice(1);

  });
};
