import * as Joi from '@hapi/joi';

export const validateConfig = <T>(schema: Joi.Schema, config: T): T => {
    const { error } = schema.validate(config);
    if (error) {
        throw error;
    }
    return config;
};
