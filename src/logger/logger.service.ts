import { Logger } from 'winston';
import { Injectable } from '@nestjs/common';
import { LoggingConfig } from './logging.config';

export type LogRecordMeta = Record<string, unknown>;

export type LogConfig = {
    readonly sensitiveKeys?: string[];
};

@Injectable()
export class LoggerService {
    constructor(
        private readonly context: string,
        private readonly logger: Logger,
        private readonly config: LoggingConfig,
    ) {
    }

    info(message: string, meta?: LogRecordMeta, config?: LogConfig): void {
        this.log('info', message, meta, config);
    }

    warn(message: string, meta?: LogRecordMeta, config?: LogConfig): void {
        this.log('warn', message, meta, config);
    }

    error(message: string, meta?: LogRecordMeta, config?: LogConfig): void {
        this.log('error', message, meta, config);
    }

    debug(message: string, meta?: LogRecordMeta, config?: LogConfig): void {
        this.log('debug', message, meta, config);
    }

    private log(type: string, message: string, meta?: LogRecordMeta, config?: LogConfig): void {
        const metaConfig = {
            sensitiveKeys: (config?.sensitiveKeys || this.config.sensitiveKeys) && [
                ...(this.config.sensitiveKeys || []),
                ...(config?.sensitiveKeys || []),
            ] || undefined
        };

        this.logger[type](message, {
            $: metaConfig,
            context: this.context,
            ...meta,
        });
    }
}
