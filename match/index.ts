type IsUnion<T, U = T> = T extends U ? [U] extends [T] ? false : true : never;
type GetUnionParts<U, K extends keyof U, V> = U extends { [S in K]: V } ? U : never;
function match<
  U extends string,
  M extends { [K in U]: (arg: K) => unknown }
>(param: {union: IsUnion<U> extends true ? U : never, matcher: M}): ReturnType<M[U]>;
function match<
  K extends string,
  U extends { [S in K]: string },
  M extends { [P in U[K]]: (arg: GetUnionParts<U, K, P>) => unknown }
>(param: {union: IsUnion<U[K]> extends true ? U : never, key: K, matcher: M}): ReturnType<M[U[K]]>;
function match(param: {union: string | { [key: string]: string }, key?: string, matcher: { [key: string]: (arg: never) => unknown }}): unknown {
  return void 0;
}


type Ok<T> = {
  type: 'ok',
  value: T
}

type Err<E> = {
  type: 'err',
  value: E
}

type Result<T, E> = Ok<T> | Err<E>;

const sample = {
  type: 'ok',
  value: 1
} as Result<number, number>;

match({ union: sample, key: 'type', matcher: { ok: (arg) => arg, err: (arg) => arg }});
