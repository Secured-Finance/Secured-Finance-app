import {
    calculateTimeDifference,
    countdown,
    getTimestampRelativeToNow,
    isMaturityPastDays,
    isPastDate,
} from 'src/utils';
import timemachine from 'timemachine';

beforeAll(() => {
    timemachine.reset();
    timemachine.config({
        dateString: '2022-12-15T00:00:00.00Z',
    });
});

const currentTimestamp = 1671062400;

describe('isPastDate', () => {
    it('should returns true for a past date', () => {
        const pastTimestamp = 1647494400; // March 15, 2022 UTC
        const result = isPastDate(pastTimestamp);
        expect(result).toBe(true);
    });

    it('should returns false for a future date', () => {
        const futureTimestamp = 1747494400; // January 15, 2025 UTC
        const result = isPastDate(futureTimestamp);
        expect(result).toBe(false);
    });

    it('should returns true for a current date', () => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const result = isPastDate(currentTimestamp);
        expect(result).toBe(true);
    });
});

describe('countdown', () => {
    it('returns the correct countdown string when there are hours, minutes, and seconds remaining', () => {
        const targetTimestamp = Date.UTC(2023, 4, 1, 12, 0, 0, 0); // May 1, 2023 at 12:00:00 UTC
        const now = Date.UTC(2023, 4, 1, 6, 30, 0, 0); // May 1, 2023 at 06:30:00 UTC
        const expectedCountdown = '00d 05h 30m 00s';

        jest.spyOn(Date, 'now').mockReturnValue(now);
        const countdownString = countdown(targetTimestamp);

        expect(countdownString).toEqual(expectedCountdown);
    });

    it('returns the correct countdown string when there are minutes and seconds remaining', () => {
        const targetTimestamp = Date.UTC(2023, 4, 1, 12, 0, 0, 0); // May 1, 2023 at 12:00:00 UTC
        const now = Date.UTC(2023, 4, 1, 11, 59, 0, 0); // May 1, 2023 at 11:59:00 UTC
        const expectedCountdown = '00d 00h 01m 00s';

        jest.spyOn(Date, 'now').mockReturnValue(now);
        const countdownString = countdown(targetTimestamp);

        expect(countdownString).toEqual(expectedCountdown);
    });

    it('returns the correct countdown string when there are seconds remaining', () => {
        const targetTimestamp = Date.UTC(2023, 4, 1, 12, 0, 0, 0); // May 1, 2023 at 12:00:00 UTC
        const now = Date.UTC(2023, 4, 1, 11, 59, 59, 0); // May 1, 2023 at 11:59:59 UTC
        const expectedCountdown = '00d 00h 00m 01s';

        jest.spyOn(Date, 'now').mockReturnValue(now);
        const countdownString = countdown(targetTimestamp);

        expect(countdownString).toEqual(expectedCountdown);
    });

    it('returns "" when the target timestamp has passed', () => {
        const targetTimestamp = Date.UTC(2023, 4, 1, 12, 0, 0, 0); // May 1, 2023 at 12:00:00 UTC
        const now = Date.UTC(2023, 4, 2, 12, 0, 0, 0); // May 2, 2023 at 12:00:00 UTC
        const expectedCountdown = '';

        jest.spyOn(Date, 'now').mockReturnValue(now);
        const countdownString = countdown(targetTimestamp);

        expect(countdownString).toEqual(expectedCountdown);
    });
});

describe('getTimeStampRelativeToNow function', () => {
    it('should return a future timestamp for if isFuture is true', () => {
        const hours = 3;
        const result = getTimestampRelativeToNow(hours, true);
        const expectedTimestamp = Math.floor(
            currentTimestamp + hours * 60 * 60
        );
        expect(result).toBe(expectedTimestamp);
    });

    it('should return a past timestamp if isFuture is false', () => {
        const hours = 2;
        const isFuture = false;
        const result = getTimestampRelativeToNow(hours, isFuture);
        const expectedTimestamp = Math.floor(
            currentTimestamp - hours * 60 * 60
        );
        expect(result).toBe(expectedTimestamp);
    });
});

describe('calculateTimeDifference', () => {
    it('calculates time difference correctly', () => {
        const timestamp = Math.floor(currentTimestamp - 2 * 60 * 60);
        const timeDifference = calculateTimeDifference(timestamp);
        expect(timeDifference).toBeCloseTo(2 * 60 * 60 * 1000, -2);
    });
});

describe('isMaturityWithinDays', () => {
    it('returns true if maturity is past specified days in the future', () => {
        const maturityDate = getTimestampRelativeToNow(96, true);
        expect(isMaturityPastDays(maturityDate, 2, true)).toBe(true);
    });

    it('returns false if maturity is not past specified days in the future', () => {
        const maturityDate = getTimestampRelativeToNow(96, true);
        expect(isMaturityPastDays(maturityDate, 6, true)).toBe(false);
    });

    it('returns false if maturity is within specified days in the past', () => {
        const maturityDate = getTimestampRelativeToNow(96);
        expect(isMaturityPastDays(maturityDate, 6)).toBe(false);
    });

    it('returns true if maturity is not within specified days in the past', () => {
        const maturityDate = getTimestampRelativeToNow(96);
        expect(isMaturityPastDays(maturityDate, 2)).toBe(true);
    });
});
