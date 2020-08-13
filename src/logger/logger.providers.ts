import { Provider } from '@nestjs/common';
import { contexts } from './inject-logger.decorator';
import { LoggerService } from './logger.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// sample for s3 client
// create a mock for s3 client
function createLoggerProvider(context: string): Provider<LoggerService> {
    return {
        provide: `LoggerService${context}`,
        useFactory: logger => new LoggerService(context, logger),
        inject: [WINSTON_MODULE_PROVIDER],
    };
}

export function createLoggerProviders(): Array<Provider<LoggerService>> {
    return contexts.map(context => createLoggerProvider(context));
}
