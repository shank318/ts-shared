import { LoggerService } from './logger.service';
import { serializeError } from 'serialize-error';
import { SENSITIVE_REPLACEMENT } from '../utils/sensitive-data';

const NOLOG_PARAM_INDICES_META_KEY = 'noLogParamIndices';
export function NoLog(target: Record<string, unknown>, propertyKey: string | symbol, index: number): void {
    const indexes = Reflect.getOwnMetadata(NOLOG_PARAM_INDICES_META_KEY, target, propertyKey) || [];
    indexes.push(index);
    Reflect.defineMetadata(NOLOG_PARAM_INDICES_META_KEY, indexes, target, propertyKey);
}


const LOGGER_FIELD = 'logger';
type LogMethodCallOptions = {
    sensitiveKeys?: string[],
    logReturnValue?: boolean,
}

export const LogMethodCall = (options: LogMethodCallOptions = {}) =>
    // tslint:disable-next-line:only-arrow-functions
    function(target: unknown, key: string, descriptor: PropertyDescriptor): void {
        const { 
            sensitiveKeys = [],
            logReturnValue = true,
        } = options;

        const className = (target as any).constructor.name;
        const method = descriptor.value;
        const fullMethodName = `${className}.${method.name}`;
        const meta = { class: className, method: method.name };

        function logError(logger: LoggerService, error: Error) {
            logger.error(`Finished ${fullMethodName}()`, { ...meta, error: serializeError(error) }, { sensitiveKeys });
            return error;
        }
        function logResult(logger: LoggerService, result: any) {
            logger.info(`Finished ${fullMethodName}()`, { ...meta, result: logReturnValue ? result : SENSITIVE_REPLACEMENT }, { sensitiveKeys });
            return result;
        }

        descriptor.value = function(...args) {
            const logger = this[LOGGER_FIELD] as LoggerService;
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
                        .catch(error => Promise.reject(logError(logger, error)));
                }

                return logResult(logger, result);
            } catch (error) {
                throw logError(logger, error);
            }
        };
    };
