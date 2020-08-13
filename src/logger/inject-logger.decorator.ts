import { Inject } from '@nestjs/common';

export const contexts: string[] = [];

export function InjectLogger(context = ''): ReturnType<typeof Inject> {
    if (!contexts.includes(context)) {
        contexts.push(context);
    }
    return Inject(`LoggerService${context}`);
}
