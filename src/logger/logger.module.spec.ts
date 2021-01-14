// To shut down the config lib complaints
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

import { Injectable } from '@nestjs/common';
import { SENSITIVE_REPLACEMENT } from '../utils/sensitive-data';
import { InjectLogger } from './inject-logger.decorator';
import { LogMethodCall, NoLog } from './log-method-call.decorator';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';

const makeMeta = () => ({
    key1: 'key1 value',
    key2: 123123,
    key3: {
        key4: 'test value',
    },
    key5: Buffer.from([1, 2, 3]),
});

const sensitiveKeys = ['key1', 'key2', 'key4'];

@Injectable()
class Tester {
    constructor(
        @InjectLogger(Tester.name)
        private readonly logger: LoggerService,
    ) {}

    logInfo(meta: any) {
        this.logger.info('Test message', meta, { sensitiveKeys });
    }

    @LogMethodCall(sensitiveKeys)
    loggedMethod(meta: any) {
        return meta;
    }

    @LogMethodCall()
    loggedMethodWithNoLog(keyToLog: string, @NoLog keyNotToLog: string) {
        return [keyToLog, keyNotToLog];
    }
}

// TODO Properly test what's actually being logged by Winston
describe(LoggerModule.name, () => {
    let tester: Tester;

    const mockLog = jest.fn();
    const mockLogger: LoggerService = ({
        info: mockLog,
    } as any) as LoggerService;

    beforeEach(async () => {
        tester = new Tester(mockLogger);

        mockLog.mockReset();
    });

    describe('masking', () => {
        describe(`doesn't modify original meta`, () => {
            it('logging methods', () => {
                const meta = makeMeta();
                tester.logInfo(meta);
                expect(meta).toMatchObject(makeMeta());
            });

            it(LogMethodCall.name, () => {
                const meta = makeMeta();
                tester.loggedMethod(meta);
                expect(meta).toMatchObject(makeMeta());
            });
        });

        describe(`@NoLog`, () => {
            it('prevents annotated parameters from being logged by @LogMethodCall', () => {
                tester.loggedMethodWithNoLog(
                    'should be logged',
                    'this should NOT appear in the logger',
                );

                const loggedArguments = mockLog.mock.calls[0][1].args;
                expect(loggedArguments).toEqual([
                    'should be logged',
                    SENSITIVE_REPLACEMENT,
                ]);
            });
        });
    });
});
