import { Type } from '@nestjs/common';
import * as Joi from '@hapi/joi';
import { ConfigService } from './config.service';
import { validateConfig } from './validate-config';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';

export const createConfigProvider = <T>(ConfigType: Type<T>, schema: Joi.Schema, key: string): Provider<T> => ({
    provide: ConfigType,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): T => validateConfig(schema, configService.get<T>(key)),
});
