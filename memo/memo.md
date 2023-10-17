```ts
import { effectScope } from 'vue';

const createGlobalComposable = <P, U extends (...arg: never[]) => unknown>(arg: {
    provide: () => P,
    use: (param: { inject: () => P }) => U
}): U => {
    const {
        provide,
        use,
    } = arg;

    let pValue: P;
    let isProvided = false;
    const provide_ = () => {
        if (isProvided) return;
        pValue = effectScope(true).run(() => provide());
        isProvided = true;
    };

    const inject = () => {
        if (!isProvided) {
            provide_();
        }
        return pValue;
    };

    return use({ inject });
};

const useSharingContext = createGlobalComposable({
    provide: () => ({ repository: new WeakMap<() => unknown, unknown>() }),
    use: ({ inject }) => {
        function innerFunc<C>(compose: () => C): C;
        function innerFunc(compose: () => unknown) {
            const { repository } = inject();
            if (!repository.has(compose)) {
                repository.set(compose, effectScope(true).run(() => compose()));
            }
            return repository.get(compose);
        }
        return innerFunc;
    }
});

```