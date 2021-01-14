import { LoggerService } from './logger.service';
import { serializeError } from 'serialize-error';
import { SENSITIVE_REPLACEMENT } from '../utils/sensitive-data';

const NOLOG_PARAM_INDICES_META_KEY = 'noLogParamIndices';
export function NoLog(target: object, propertyKey: string | symbol, index: number) {
    const indexes = Reflect.getOwnMetadata(NOLOG_PARAM_INDICES_META_KEY, target, propertyKey) || [];
    indexes.push(index);
    Reflect.defineMetadata(NOLOG_PARAM_INDICES_META_KEY, indexes, target, propertyKey);
}

export const LogMethodCall = (
    sensitiveKeys?: string[],
    loggerField: 'logger' = 'logger',
) =>
    // tslint:disable-next-line:only-arrow-functions
    function(target: unknown, key: string, descriptor: PropertyDescriptor): void {
        const className = (target as any).constructor.name;
        const method = descriptor.value;
        const fullMethodName = `${className}.${method.name}`;

        function logResult(logger: LoggerService, result?: any, error?: Error) {
            const meta = {
                'class': className,
                method: method.name,
                ...(result && { result } || {}),
                ...(error && { error: serializeError(error) } || {})
            };
            logger[error && 'error' || 'info'](`Finished ${fullMethodName}()`, meta, { sensitiveKeys });
            return error || result;
        }

        descriptor.value = function(...args) {
            const logger = this[loggerField] as LoggerService;
            if (!logger) {
                throw new Error(`Missing logger in ${className}`);
            }

            const noLogParamIndices = Reflect.getOwnMetadata(NOLOG_PARAM_INDICES_META_KEY, target as any, key);
            logger.info(`Invoked ${fullMethodName}()`, {
                'class': className,
                method: method.name,
                args: args.map((val, idx) => noLogParamIndices && noLogParamIndices.includes(idx) ? SENSITIVE_REPLACEMENT : val)
            }, { sensitiveKeys });

            try {
                // eslint-disable-next-line prefer-rest-params
                const result = method.apply(this, arguments);

                if (result?.then) {
                    return result
                        .then(res => logResult(logger, res))
                        .catch(error => Promise.reject(logResult(logger, undefined, error)));
                }

                return logResult(logger, result);
            } catch (error) {
                throw logResult(logger, undefined, error);
            }
        };
    };
