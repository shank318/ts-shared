import { LoggerService } from './logger.service';

describe(LoggerService.name, () => {
    const logInfo = jest.fn();
    const logger = jest.fn().mockImplementation(() => ({
        info: logInfo,
    }))();

    beforeEach(() => {
        logInfo.mockClear();
    })

    describe('sensitive keys merge', () => {
        it.each`
            keysFromConfig        | keysFromParameter     | expectedKeys
            ${['key11', 'key12']} | ${['key21', 'key22']} | ${['key11', 'key12', 'key21', 'key22']}
            ${undefined}          | ${['key2']}           | ${['key2']}
            ${['key1']}           | ${undefined}          | ${['key1']}
            ${undefined}          | ${undefined}          | ${undefined}
        `(
            'from config: $keysFromConfig, from parameter: $keysFromParameter',
            ({ keysFromParameter, keysFromConfig, expectedKeys }) => {
                const service = new LoggerService('TestContext', logger, {
                    sensitiveKeys: keysFromConfig,
                    newRelicLoggingFormat: false,
                });

                service.info(
                    'Test message',
                    {
                        metaKey: 'meta value',
                    },
                    {
                        sensitiveKeys: keysFromParameter,
                    }
                );

                expect(logInfo).toHaveBeenCalledWith(
                    'Test message',
                    {
                        context: 'TestContext',
                        metaKey: 'meta value',
                        $: {
                            sensitiveKeys: expectedKeys,
                        },
                    },
                );
            }
        );
    });
});
