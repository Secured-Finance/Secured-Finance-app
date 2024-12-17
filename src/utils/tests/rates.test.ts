import { Rate } from 'src/utils';

describe('Rate class', () => {
    it('should return the correct rate', () => {
        const rate = new Rate(123);
        expect(rate.toNumber()).toBe(123);
    });

    it('should always be between 0 and 1000%', () => {
        const rate = new Rate(-1);
        expect(rate.toNumber()).toBe(0);

        const rate2 = new Rate(100000000);
        expect(rate2.toNumber()).toBe(10000000);
    });
});
