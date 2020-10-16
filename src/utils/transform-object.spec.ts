import { transformObject } from './transform-object';

describe(transformObject.name, () => {
    it('transforms values on different nesting levels', () => {
        const obj = {
            key1: 'value 1',
            key2: 'value 2',
            key3: {
                key11: 'value 11',
                key12: 'value 12'
            }
        };

        transformObject(obj, (key, val) => {
            if (key === 'key11') {
                return `key11 value transformed`;
            }

            if (val === 'value 2') {
                return `value 2 transformed`;
            }

            return val;
        });

        expect(obj.key2).toEqual('value 2 transformed');
        expect(obj.key3.key11).toEqual('key11 value transformed');
    });

    it.each`
        type           | value
        ${'string'}    | ${'something'}
        ${'number'}    | ${123}
        ${'null'}      | ${null}
        ${'undefined'} | ${undefined}
    `('ignores primitive of type $type', ({ value }) => {
        expect(transformObject(value, (key, val) => val)).toEqual(value);
    });

    it('works with reference loops', () => {
        const inner: any = {
            keyToTransform: 123
        };
        const outer = {
            inner,
            keyToTransform: '123123'
        };
        inner.outer = outer;

        transformObject(outer, (key, val) => key === 'keyToTransform' && 'TRANSFORMED' || val);

        expect(inner.keyToTransform).toEqual('TRANSFORMED');
        expect(outer.keyToTransform).toEqual('TRANSFORMED');
        expect(outer.inner).toBe(inner);
    });
});
