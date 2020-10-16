import { Provider } from '@nestjs/common';
import { contexts } from './inject-logger.decorator';
import { LoggerService } from './logger.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoggingConfig } from './logging.config';
import { Logger } from 'winston';

function createLoggerProvider(context: string): Provider<LoggerService> {
    return {
        provide: `LoggerService${context}`,
        useFactory: (logger: Logger, config: LoggingConfig) => new LoggerService(context, logger, config),
        inject: [WINSTON_MODULE_PROVIDER, LoggingConfig],
    };
}

export function createLoggerProviders(): Array<Provider<LoggerService>> {
    return contexts.map(context => createLoggerProvider(context));
}
