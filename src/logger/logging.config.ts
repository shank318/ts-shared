import * as Joi from '@hapi/joi';
import { createConfigProvider } from '../config';

export class LoggingConfig {
    readonly newRelicLoggingFormat: boolean;
    readonly sensitiveKeys?: string[];
}

const schema = Joi.object<LoggingConfig>({
    newRelicLoggingFormat: Joi.boolean().default(false),
    sensitiveKeys: Joi.array().items(Joi.string()).optional(),
});

export const loggingConfigProvider = createConfigProvider(
    LoggingConfig,
    schema,
    'logging',
);
