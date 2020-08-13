import { Logger } from 'winston';
import { Injectable } from '@nestjs/common';

export type LogRecordMeta = Record<string, unknown>;

@Injectable()
export class LoggerService {
    constructor(
        private readonly context: string,
        private readonly logger: Logger,
    ) {
    }

    info(message: string, meta?: LogRecordMeta): void {
        this.log('info', message, meta);
    }

    warn(message: string, meta?: LogRecordMeta): void {
        this.log('warn', message, meta);
    }

    error(message: string, meta?: LogRecordMeta): void {
        this.log('error', message, meta);
    }

    debug(message: string, meta?: LogRecordMeta): void {
        this.log('debug', message, meta);
    }

    private log(type: string, message: string, meta?: LogRecordMeta): void {
        this.logger[type](message, { context: this.context, ...meta });
    }
}
