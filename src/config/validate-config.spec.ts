import * as Joi from '@hapi/joi';
import { validateConfig } from './validate-config';

describe('validateConfig', () => {
    it('throws on invalid config', () => {
        const schema = Joi.object({
            a: Joi.string().valid('valid value'),
        });

        const config = {
            a: 'invalid value',
        };

        expect(() => validateConfig(schema, config)).toThrow(
            '"a" must be [valid value]',
        );
    });

    it('returns config if valid', () => {
        const schema = Joi.object({
            a: Joi.boolean().valid(true),
        });

        const config = {
            a: true,
        };

        expect(validateConfig(schema, config)).toBe(config);
    });
});
