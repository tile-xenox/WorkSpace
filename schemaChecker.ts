// util type func
type RTrim<S> = S extends `${infer I} ` ? RTrim<I> : S;
type LTrim<S> = S extends ` ${infer I}` ? LTrim<I> : S;
type Trim<S> = LTrim<RTrim<S>>;
type TrimBrackets<S> = S extends `(${infer I})` ? I : S;

type Plus1<T extends unknown[]> = [unknown, ...T];
type Minus1<T extends unknown[]> = T extends [unknown, ...infer R] ? R : []; 
type Split<S, Delimiter, Acc extends string = '', Count extends [unknown[], unknown[]] = [[], []]> = S extends `${infer F}${infer R}`
  ? F extends Delimiter
    ? [Count[0]['length'], Count[1]['length']] extends [0, 0]
      ? [Acc, ...Split<R, Delimiter>]
      : Split<R, Delimiter, `${Acc}${F}`, Count>
    : F extends '<' | '>' | '(' | ')'
      ? {
          '<': Split<R, Delimiter, `${Acc}${F}`, [Plus1<Count[0]>, Count[1]]>,
          '>': Split<R, Delimiter, `${Acc}${F}`, [Minus1<Count[0]>, Count[1]]>,
          '(': Split<R, Delimiter, `${Acc}${F}`, [Count[0], Plus1<Count[1]>]>,
          ')': Split<R, Delimiter, `${Acc}${F}`, [Count[0], Minus1<Count[1]>]>,
        }[F]
      : Split<R, Delimiter, `${Acc}${F}`, Count>
  : [Acc];

// primitive type list
type PrimitiveMap = {
  'number': number,
  'string': string,
  'boolean': boolean,
  'date': Date,
  'undefined': undefined,
  'null': null,
  'unknown': unknown,
  'never': never,
  'void': void,
};

// string -> define object
type ParseDefine<D, S = Trim<D>> = Split<S, '|'> extends infer U extends unknown[]
  ? U['length'] extends 1
    ? S extends `${infer A}[]`
      ? DArray<TrimBrackets<A>>
      : S extends keyof PrimitiveMap
        ? PrimitiveMap[S]
        : S extends `${infer T}<${infer V}>`
          ? {
              Literal: DLiteral<V>,
              Map: DMap<V>,
              Set: DSet<V>,
              Promise: DPromise<V>,
              Function: DFunction<V>,
              Array: DArray<V>,
              Tuple: DTuple<V>,
              [x: string]: unknown,
            }[T]
          : unknown
    : DUnion<U>
  : unknown;
// map(v => ParseDefine(v))
type MapParse<T> = T extends [infer F, ...infer R]
  ? [ParseDefine<F>, ...MapParse<R>]
  : [];

// define object -> type
type FromDefine<D> = D extends { type: `${infer T}` }
  ? {
    literal: CLiteral<D>,
    map: CMap<D>,
    set: CSet<D>,
    promise: CPromise<D>,
    function: CFunction<D>,
    array: CArray<D>,
    tuple: CTuple<D>,
    union: CUnion<D>,
    [x: string]: unknown,
  }[T]
  : D;
// map(v => FromDefine(v))
type MapFrom<T> = T extends [infer F, ...infer R]
  ? [FromDefine<F>, ...MapFrom<R>]
  : [];

// define string literal
// string: Literal<sample>
type DLiteral<L> = {
  type: 'literal',
  value: L,
};
// define -> type
type CLiteral<T> = T extends {
  type: 'literal',
  value: infer L,
} ? L : unknown;

// define Map object
// string: Map<string, boolean>
type DMap<T> = Split<T, ','> extends [infer K, infer V]
  ? {
      type: 'map',
      key: ParseDefine<K>,
      value: ParseDefine<V>,
    }
  : unknown;
// define -> type
type CMap<T> = T extends {
  type: 'map',
  key: infer K,
  value: infer V,
} ? Map<FromDefine<K>, FromDefine<V>> : unknown;

// define Set object
// string: Set<number>
type DSet<T> = {
  type: 'set',
  value: ParseDefine<T>,
};
// define -> type
type CSet<T> = T extends {
  type: 'set',
  value: infer V,
} ? Set<FromDefine<V>> : unknown;

// define Promise object
// string: Promise<void>
type DPromise<T> = {
  type: 'promise',
  resolve: ParseDefine<T>,
};
// define -> type
type CPromise<T> = T extends {
  type: 'promise',
  resolve: infer P,
} ? Promise<FromDefine<P>> : unknown;

// define Function object
// string: Function<never, void>
type DFunction<T> = Split<T, ','> extends [infer A, infer R]
  ? {
    type: 'function',
    args: ParseDefine<A>,
    return: ParseDefine<R>
  }
  : unknown;
// define -> type
type CFunction<T> = T extends {
  type: 'function',
  args: infer A,
  return: infer R,
} ? FromDefine<A> extends infer CA
    // possibly 'never'
    ? [CA] extends [unknown[]]
      ? (...args: CA) => FromDefine<R>
      : (arg: CA) => FromDefine<R>
    : unknown
  : unknown;

// define union object
// string: number | undefined
type DUnion<T> = {
  type: 'union',
  value: MapParse<T>,
};
// define -> type
type CUnion<T> = T extends {
  type: 'union',
  value: infer U
} ? MapFrom<U>[number] : unknown;

// define Array object
// string: Array<number> or number[]
type DArray<T> = {
  type: 'array',
  value: ParseDefine<T>,
};
// define -> type
type CArray<T> = T extends {
  type: 'array',
  value: infer A
} ? FromDefine<A>[] : unknown;

// define tuple
// string: Tuple<number, number>
type DTuple<T> = {
  type: 'tuple',
  value: MapParse<Split<T, ','>>,
};
// define -> type
type CTuple<T> = T extends {
  type: 'tuple',
  value: infer V
} ? MapFrom<V> : unknown;

type SchemaValue = `@${string}` | Schema | [Schema];
type SchemaUnionValue = {
  type: 'union',
  value: SchemaValue[],
};
type Schema = {
  [key: string]: SchemaValue | SchemaUnionValue;
};

type FromSchemaUnionValue<T> = T extends [infer F, ...infer R]
  ? [FromSchemaValue<F>, ...FromSchemaUnionValue<R>]
  : [];
type FromSchemaValue<T> = T extends { type: 'union', value: infer V }
  ? FromSchemaUnionValue<V>[number]
  : T extends `@${infer S}`
    ? FromDefine<ParseDefine<S>>
    : FromSchema<T>;
type FromSchema<T> = T extends [Schema]
  ? FromSchema<T[0]>[]
  : {
      [K in keyof T]: FromSchemaValue<T[K]>;
    };

declare function fromSchema<T extends Schema | [Schema]>(schema: T): FromSchema<T>;
const schema = {
  id: '@number',
  name: '@(string | undefined)[]',
  address: '@Array<string | undefined>',
  detail: {
    type: 'union',
    value: [
      {
        id: '@number',
        memo: '@string | undefined',
      },
      '@undefined',
    ]
  }
} satisfies Schema;
const check = fromSchema(schema);
// const schemaChecker = <T extends Schema>(schema: T) => (arg: unknown): arg is FromSchema<T> => {
//   if (typeof arg !== 'object' || arg === null) return false;
//   return Object.entries(schema).every(([key, value]) => {
//     if (!(key in arg)) return false;
//     const valueType = value.slice(1);

//   });
// };
