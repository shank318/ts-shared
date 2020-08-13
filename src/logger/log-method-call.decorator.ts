import { LoggerService } from './logger.service';
import { serializeError } from 'serialize-error';

export const LogMethodCall = (
    loggerField: 'logger' = 'logger'
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
            logger[error && 'error' || 'info'](`Finished ${fullMethodName}()`, meta);
            return error || result;
        }

        descriptor.value = function(...args) {
            const logger = this[loggerField] as LoggerService;
            if (!logger) {
                throw new Error(`Missing logger in ${className}`);
            }

            logger.info(`Invoked ${fullMethodName}()`, {
                'class': className,
                method: method.name,
                args,
            });

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
