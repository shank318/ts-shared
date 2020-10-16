import { transformObject } from './transform-object';

export const SENSITIVE_REPLACEMENT = 'HIDDEN';
export const DEFAULT_SENSITIVE_KEYS = [
    'firstname',
    'first_name',
    'lastname',
    'last_name',
    'name',
    'email',
];

const collator = new Intl.Collator(undefined, {
    sensitivity: 'base'
});

export function maskSensitiveValues<T>(obj: T, keysToMask = DEFAULT_SENSITIVE_KEYS): T {
    return transformObject(obj, (key: string, value: unknown): unknown => {
        return keysToMask.find(k => collator.compare(k, key) === 0)
            ? SENSITIVE_REPLACEMENT
            : value;
    });
}
