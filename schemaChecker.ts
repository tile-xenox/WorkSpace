type Schema = {
  [key: string]: `@${string}`;
};

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

type RTrim<S> = S extends `${infer I} ` ? RTrim<I> : S;
type LTrim<S> = S extends ` ${infer I}` ? LTrim<I> : S;
type Trim<S> = LTrim<RTrim<S>>;

type Split<S, Delimiter, Acc extends string = '', Count extends unknown[] = []> = S extends `${infer F}${infer R}`
  ? F extends Delimiter
    ? Count['length'] extends 0
      ? [Acc, ...Split<R, Delimiter>]
      : Split<R, Delimiter, `${Acc}${F}`, Count>
    : F extends '<'
      ? Split<R, Delimiter, `${Acc}${F}`, [unknown, ...Count]>
      : F extends '>'
        ? Split<R, Delimiter, `${Acc}${F}`, Count extends [unknown, ...infer CR] ? CR : []>
        : Split<R, Delimiter, `${Acc}${F}`, Count>
  : [Acc];

type ParseDefinition<D, S = Trim<D>> = Split<S, '|'> extends infer U extends unknown[]
  ? U['length'] extends 1
    ? S extends keyof PrimitiveMap
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

type MapParse<T> = T extends [infer F, ...infer R]
  ? [ParseDefinition<F>, ...MapParse<R>]
  : [];

type FromDefinition<D> = D extends { type: `${infer T}` }
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

type MapFrom<T> = T extends [infer F, ...infer R]
  ? [FromDefinition<F>, ...MapFrom<R>]
  : [];

type DLiteral<L> = {
  type: 'literal',
  value: L,
};
type CLiteral<T> = T extends {
  type: 'literal',
  value: infer L,
} ? L : unknown;

type DMap<T> = Split<T, ','> extends [infer K, infer V]
  ? {
      type: 'map',
      key: ParseDefinition<K>,
      value: ParseDefinition<V>,
    }
  : unknown;
type CMap<T> = T extends {
  type: 'map',
  key: infer K,
  value: infer V,
} ? Map<FromDefinition<K>, FromDefinition<V>> : unknown;

type DSet<T> = {
  type: 'set',
  value: ParseDefinition<T>,
};
type CSet<T> = T extends {
  type: 'set',
  value: infer V,
} ? Set<FromDefinition<V>> : unknown;

type DPromise<T> = {
  type: 'promise',
  resolve: ParseDefinition<T>,
};
type CPromise<T> = T extends {
  type: 'promise',
  resolve: infer P,
} ? Promise<FromDefinition<P>> : unknown;

type DFunction<T> = Split<T, ','> extends [infer A, infer R]
  ? {
    type: 'function',
    args: ParseDefinition<A>,
    return: ParseDefinition<R>
  }
  : unknown;
type CFunction<T> = T extends {
  type: 'function',
  args: infer A,
  return: infer R,
} ? FromDefinition<A> extends infer CA
    ? CA extends unknown[]
      ? (...args: CA) => FromDefinition<R>
      : (arg: CA) => FromDefinition<R>
    : unknown
  : unknown;

type DUnion<T> = {
  type: 'union',
  value: MapParse<T>,
};
type CUnion<T> = T extends {
  type: 'union',
  value: infer U
} ? MapFrom<U>[number] : unknown;

type DArray<T> = {
  type: 'array',
  value: ParseDefinition<T>,
};
type CArray<T> = T extends {
  type: 'array',
  value: infer A
} ? Array<FromDefinition<A>> : unknown;

type DTuple<T> = {
  type: 'tuple',
  value: MapParse<Split<T, ','>>,
};
type CTuple<T> = T extends {
  type: 'tuple',
  value: infer V
} ? MapFrom<V> : unknown;

type Check = FromDefinition<ParseDefinition<'Promise<Literal<sample> | Map<number, Map<string, Array<number | null> | undefined>>> | Function<Tuple<Function<never, boolean>, number>, Set<number>'>>

const schemaChecker = <T extends Schema>(schema: T) => (arg: unknown) => {
  if (typeof arg !== 'object' || arg === null) return false;
  return Object.entries(schema).every(([key, value]) => {
    if (!(key in arg)) return false;
    const valueType = value.slice(1);

  });
};
