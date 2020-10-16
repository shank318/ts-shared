// To shut down the config lib complaints
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

import { LogMethodCall } from './log-method-call.decorator';
import { Test } from '@nestjs/testing';
import { LoggerModule } from './logger.module';
import { LoggingConfig } from './logging.config';
import { InjectLogger } from './inject-logger.decorator';
import { LoggerService } from './logger.service';
import { Injectable } from '@nestjs/common';

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
    ) {
    }

    logInfo(meta: any) {
        this.logger.info('Test message', meta, { sensitiveKeys });
    }

    @LogMethodCall(sensitiveKeys)
    loggedMethod(meta: any) {
        return meta;
    }
}

// TODO Properly test what's actually being logged by Winston
describe(LoggerModule.name, () => {
    let tester: Tester;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [LoggerModule.forRoot()],
            providers: [Tester],
            exports: [Tester],
        })
            .overrideProvider(LoggingConfig)
            .useValue({
                newRelicLoggingFormat: false,
            })
            .compile();

        tester = module.get(Tester);
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
    });
});
