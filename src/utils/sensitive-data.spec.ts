import { maskSensitiveValues, SENSITIVE_REPLACEMENT } from './sensitive-data';

describe(maskSensitiveValues.name, () => {
    const test = (key: string, value: unknown, expectedValue: unknown, keysToMask?: string[]) => {
        const obj = {
            [key]: value,
            inArray: [
                {
                    [key]: value,
                },
            ],
            nested: {
                [key]: value,
                inArray: [
                    {
                        [key]: value,
                    },
                ],
            },
        };

        maskSensitiveValues(obj, keysToMask);

        expect(obj[key]).toEqual(expectedValue);
        expect(obj.inArray[0][key]).toEqual(expectedValue);
        expect(obj.nested[key]).toEqual(expectedValue);
        expect(obj.nested.inArray[0][key]).toEqual(expectedValue);
    };

    it.each`
        key             | value                 | keysToMask          | expectedValue
        ${'firstName'}  | ${'Gordon'}           | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'FirstName'}  | ${'Gordon'}           | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'firstname'}  | ${'Gordon'}           | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'first_name'} | ${'Gordon'}           | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'LastName'}   | ${'Freeman'}          | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'lastName'}   | ${'Freeman'}          | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'lastname'}   | ${'Freeman'}          | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'last_name'}  | ${'Freeman'}          | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'name'}       | ${'Gordon Freeman'}   | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'email'}      | ${'freeman@mesa.gov'} | ${undefined}        | ${SENSITIVE_REPLACEMENT}
        ${'customKey'}  | ${'test value'}       | ${['customKey']}    | ${SENSITIVE_REPLACEMENT}
        ${'customKey'}  | ${'test value'}       | ${['customkey']}    | ${SENSITIVE_REPLACEMENT}
        ${'customKey'}  | ${'test value'}       | ${['CUSTOMKEY']}    | ${SENSITIVE_REPLACEMENT}
        ${'customKey'}  | ${'test value'}       | ${['someOtherKey']} | ${'test value'}
    `(
        'key "$key" with value "$value" transforms to "$expectedValue" (keys to mask: $keysToMask)',
        ({ key, value, keysToMask, expectedValue }) => {
            test(key, value, expectedValue, keysToMask);
        }
    );
});
