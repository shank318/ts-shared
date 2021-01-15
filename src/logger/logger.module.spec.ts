// To shut down the config lib complaints
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

import { SENSITIVE_REPLACEMENT } from '../utils/sensitive-data';
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

class Tester {
    constructor(
        private readonly logger: LoggerService,
    ) {}

    logInfo(meta: any) {
        this.logger.info('Test message', meta, { sensitiveKeys });
    }

    @LogMethodCall({ sensitiveKeys })
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

                const enteredMethodLogCall = mockLog.mock.calls[0]
                const loggedArguments = enteredMethodLogCall[1].args;

                expect(loggedArguments).toEqual([
                    'should be logged',
                    SENSITIVE_REPLACEMENT,
                ]);
            });
        });
        describe(`@LogMethodCall`, () => {
            it('does not log the return value when logReturnValue=false', () => {
                class ReturnValueTest {
                    logger = mockLogger;

                    @LogMethodCall({ logReturnValue: false })
                    method() {
                        return 'the return value';
                    }
                }
                new ReturnValueTest().method();

                const finishedMethodLogCall = mockLog.mock.calls[1]
                const returnValue = finishedMethodLogCall[1].result;

                expect(returnValue).toEqual(SENSITIVE_REPLACEMENT);
            });

            it('logs the return value by default', () => {
                class ReturnValueTest {
                    logger = mockLogger;

                    @LogMethodCall()
                    method() {
                        return 'the return value';
                    }
                }
                new ReturnValueTest().method();

                const finishedMethodLogCall = mockLog.mock.calls[1];
                const returnValue = finishedMethodLogCall[1].result;

                expect(returnValue).toEqual('the return value');
            });
            
            it('can log falsy return values (like 0)', () => {
                class ReturnValueTest {
                    logger = mockLogger;

                    @LogMethodCall({ logReturnValue: true })
                    returnsZero() {
                        return 0;
                    }
                }
                new ReturnValueTest().returnsZero();

                const finishedMethodLogCall = mockLog.mock.calls[1];
                const returnValue = finishedMethodLogCall[1].result;

                expect(returnValue).toEqual(0);
            });
        });
    });
});
