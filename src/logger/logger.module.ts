import { DynamicModule } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { createLoggerProviders } from './logger.providers';
import { ConfigModule } from '../config';
import { LoggingConfig, loggingConfigProvider } from './logging.config';

export class LoggerModule {
    static forRoot(): DynamicModule {
        const contextLoggerProviders = createLoggerProviders();
        return {
            global: true,
            module: LoggerModule,
            imports: [
                ConfigModule,
                WinstonModule.forRootAsync({
                    inject: [LoggingConfig],
                    useFactory: async (config: LoggingConfig) => {
                        const formats = [
                            winston.format.timestamp(),
                            winston.format.json(),
                        ];
                        if (config.newRelicLoggingFormat) {
                            // eslint-disable-next-line @typescript-eslint/no-var-requires
                            const newRelicFormatter = require('@newrelic/winston-enricher');
                            formats.push(newRelicFormatter());
                        }
                        return {
                            transports: [
                                new winston.transports.Console({
                                    format: winston.format.combine(
                                        ...formats,
                                    ),
                                }),
                            ],
                        };
                    },
                }),
            ],
            providers: [...contextLoggerProviders, loggingConfigProvider],
            exports: [...contextLoggerProviders, LoggingConfig],
        };
    }
}
