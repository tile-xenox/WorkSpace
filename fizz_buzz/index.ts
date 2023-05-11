type Minus3<T extends unknown[]> = T extends [unknown, unknown, unknown, ...infer A] ? A : never;
type Minus5<T extends unknown[]> = T extends [unknown, unknown, unknown, unknown, unknown, ...infer A] ? A : never;
type IsFizz<T extends unknown[]> = [T] extends [never] ? false : T['length'] extends 0 ? true : IsFizz<Minus3<T>>;
type IsBuzz<T extends unknown[]> = [T] extends [never] ? false : T['length'] extends 0 ? true : IsBuzz<Minus5<T>>;
type FizzBuzz<T extends number, R extends unknown[] = [], C extends unknown[] = [...R, unknown]> = T extends R['length']
  ? R
  : FizzBuzz<
    T,
    [
      ...R,
      `${IsFizz<C> extends true ? 'Fizz' : ''}${IsBuzz<C> extends true ? 'Buzz' : ''}` extends infer A
        ? A extends ''
          ? C['length']
          : A
        : never 
    ]
  >;

type Check = FizzBuzz<15>;