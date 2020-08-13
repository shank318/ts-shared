import * as Joi from '@hapi/joi';
import { createConfigProvider } from '../config';

export class LoggingConfig {
    readonly newRelicLoggingFormat: boolean;
}

const schema = Joi.object<LoggingConfig>({
    newRelicLoggingFormat: Joi.boolean().default(false),
});

export const loggingConfigProvider = createConfigProvider(
    LoggingConfig,
    schema,
    'logging',
);
