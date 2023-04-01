# TypeFunc

TypeScriptで利用できる型のための関数をまとめたリポジトリです。

## schemaChecker関数

unknown型などの正確な型情報を持たないオブジェクトに関して、指定したスキーマの型を満たしているか確認する型ガード関数です。

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
