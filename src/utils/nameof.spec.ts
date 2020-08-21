import { nameof } from './nameof';

describe('nameof', () => {
    class Person {
        readonly firstName;

        sayHello(): string {
            return 'Hello!';
        }
    }

    it('returns property name', () => {
        expect(nameof<Person>('firstName')).toBe('firstName');
    });

    it('returns method name', () => {
        expect(nameof<Person>('sayHello')).toBe('sayHello');
    });
});
