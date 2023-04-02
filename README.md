# TypeFunc

TypeScriptの型関連関数をまとめたリポジトリです。

## schemaChecker関数

unknown型などの正確な型情報を持たないオブジェクトに関して、指定したスキーマの型を満たしているか確認する型ガード関数です。

関数の型定義：

```typescript

declare const schemaChecker: <T extends Schema | [Schema]>(schema: T) => (arg: unknown) => arg is FromSchema<T>

type Schema = {
  [key: string]: SchemaValue | SchemaUnionValue;
};

type SchemaValue = `@${string}` | Schema | [Schema];

type SchemaUnionValue = {
  type: 'union',
  value: SchemaValue[],
};

```

スキーマの定義方法の例：

```typescript

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

// 上記のスキーマ定義からは以下の型が生成される
type Result = {
  id: number;
  name: (string | undefined)[] | null;
  address: (string | undefined)[];
  detail: {
    id: number;
    memo: string | undefined;
  }[] | undefined;
}

```
