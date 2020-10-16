import { TransformableInfo } from 'logform';
import { maskSensitiveValues } from '../utils/sensitive-data';
import { transformObject } from '../utils/transform-object';
import lodash from 'lodash';

export function sanitizeLogRecord(info: TransformableInfo): TransformableInfo {
    let { sensitiveKeys } = info['$'] || {};
    sensitiveKeys = Array.isArray(sensitiveKeys) && sensitiveKeys || undefined;
    delete info['$'];

    const copy = lodash.cloneDeep(info);

    maskSensitiveValues(copy, sensitiveKeys);

    transformObject(copy, (key, val) => {
        if (val instanceof Buffer) {
            return `Buffer(size: ${val.length})`;
        }
        return val;
    });

    return copy;
}
