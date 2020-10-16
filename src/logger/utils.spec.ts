import { sanitizeLogRecord } from './utils';
import { SENSITIVE_REPLACEMENT } from '../utils/sensitive-data';

describe(sanitizeLogRecord.name, () => {
    it('masks default sensitive keys if custom not specified', () => {
        const info = sanitizeLogRecord({
            level: 'info',
            message: 'Test message',
            firstName: 'Donald',
        });
        expect(info.firstName).toEqual(SENSITIVE_REPLACEMENT);
    });

    it('masks only custom sensitive keys if specified', () => {
        const info = sanitizeLogRecord({
            level: 'info',
            message: 'Test message',
            firstName: 'Donald',
            someKey: 'Some value',
            $: {
                sensitiveKeys: ['someKey']
            }
        });
        expect(info.firstName).toEqual('Donald');
        expect(info.someKey).toEqual(SENSITIVE_REPLACEMENT);
    });

    it('removes config key', () => {
        const info = sanitizeLogRecord({
            level: 'info',
            message: 'Test message',
            $: {
                sensitiveKeys: ['test']
            }
        });
        expect(info).not.toMatchObject({
            $: expect.any(Object)
        });
    });

    it('masks buffer content', () => {
        const info = sanitizeLogRecord({
            level: 'info',
            message: 'Test message',
            buffer: Buffer.from([1, 2, 3])
        });
        expect(info.buffer).toEqual('Buffer(size: 3)');
    });
});
