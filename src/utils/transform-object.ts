import traverse from 'traverse';

export type TransformFunction = (key: string, value: unknown) => unknown;

export function transformObject<T>(obj: T, transform: TransformFunction): T {
    traverse(obj).forEach(function(val) {
        if (this.key !== undefined) {
            this.update(transform(this.key, val));
        }
    });
    return obj;
}
