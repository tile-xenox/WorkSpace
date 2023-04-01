import { type Schema, type FromSchema } from'./type';
declare const fromSchema: <T extends Schema | [Schema]>(schema: T) => FromSchema<T>;
const schema = {
  id: '@number',
  name: '@(string | undefined)[] | null',
  address: '@Array<string | undefined>',
  detail: {
    type: 'union',
    value: [
      [{
        id: '@number',
        memo: '@string | undefined',
      }],
      '@undefined',
    ]
  }
} satisfies Schema;
const _check = fromSchema(schema);
