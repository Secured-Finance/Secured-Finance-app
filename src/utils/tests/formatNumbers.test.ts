import {
    LoanValue,
    Rate,
    formatAmount,
    formatCollateralRatio,
    formatLoanValue,
    formatTimeStampWithTimezone,
    formatTimestamp,
    formatTimestampDDMMYY,
    formatTimestampWithMonth,
    formatWithCurrency,
    ordinaryFormat,
    usdFormat,
} from 'src/utils';

describe('formatWithCurrency', () => {
    it('should format the number with the given currency and decimals', () => {
        expect(formatWithCurrency(123456789, 'USD')).toEqual('123,456,789 USD');
        expect(formatWithCurrency(123456789, 'USD', 0)).toEqual(
            '123,456,789 USD'
        );
        expect(formatWithCurrency(123456789.123, 'EUR', 3)).toEqual(
            '123,456,789.123 EUR'
        );
        expect(formatWithCurrency(BigInt(123456789), 'JPY')).toEqual(
            '123,456,789 JPY'
        );
    });
});

describe('usdFormat', () => {
    it('formats a number as USD currency with the default parameters', () => {
        const number = 123456.789;
        const result = usdFormat(number);
        expect(result).toBe('$123,457');
    });

    it('formats a number as USD currency with specified number of fraction digits', () => {
        const number = 123456.789;
        const digits = 2;
        const result = usdFormat(number, digits);
        expect(result).toBe('$123,456.79');
    });

    it('formats a number as USD currency with specified notation', () => {
        const number = 123456.789;
        const notation = 'compact';
        const result = usdFormat(number, 0, notation);
        expect(result).toBe('$123K');
    });

    it('formats a bigint as USD currency with the default parameters', () => {
        const number = BigInt('123456789123456789');
        const result = usdFormat(number);
        expect(result).toBe('$123,456,789,123,456,789');
    });

    it('formats a bigint as USD currency with specified number with a compact notation', () => {
        const number = BigInt('123456789123');
        const digits = 0;
        const notation = 'compact';
        const result = usdFormat(number, digits, notation);
        expect(result).toBe('$123B');
    });
});

describe('ordinaryFormat', () => {
    it('should format a regular number with default decimals and notation', () => {
        expect(ordinaryFormat(1234.567)).toEqual('1,234.57');
    });

    it('should format a regular number with custom decimals and standard notation', () => {
        expect(ordinaryFormat(1234.567, 0, 3)).toEqual('1,234.567');
    });

    it('should format a regular number with custom decimals and compact notation', () => {
        expect(ordinaryFormat(1234.567, 0, 2, 'compact')).toEqual('1.23K');
    });

    it('should format a BigInt with default decimals and notation', () => {
        expect(ordinaryFormat(BigInt(123456789))).toEqual('123,456,789');
    });

    it('should format a bigint with default decimals and notation', () => {
        expect(ordinaryFormat(BigInt(1234567))).toEqual('1,234,567');
    });

    it('should format a regular number with min and max decimals', () => {
        expect(ordinaryFormat(1234.567, 0, 2)).toEqual('1,234.57');
        expect(ordinaryFormat(1234.567, 0, 4)).toEqual('1,234.567');
        expect(ordinaryFormat(1234.567, 4, 4)).toEqual('1,234.5670');
        expect(ordinaryFormat(1234.567, 6, 6)).toEqual('1,234.567000');
    });

    it('should throw an error if the min decimals is greater than the max decimals', () => {
        expect(() => ordinaryFormat(1234.567, 4, 2)).toThrow();
    });
});

describe('formatAmount', () => {
    it('should format a number with 8 decimal places', () => {
        expect(formatAmount(1234.56789012)).toBe('1,234.5679');
    });

    it('should format a number only with the decimal places that are present', () => {
        expect(formatAmount(1234.5)).toBe('1,234.5');
    });
});

describe('formatCollateralRatio', () => {
    it('should format the collateral ratio', () => {
        expect(formatCollateralRatio(10000)).toEqual('100%');
        expect(formatCollateralRatio(1000)).toEqual('10%');
        expect(formatCollateralRatio(100)).toEqual('1%');
        expect(formatCollateralRatio(10)).toEqual('0.1%');
        expect(formatCollateralRatio(1)).toEqual('0.01%');
    });
});

describe('formatTimestamp', () => {
    const timestamps = [0, 86400, 1671859344];
    for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i];
        it(`should format ${timestamp} in user timezone`, () => {
            const date = new Date(timestamp * 1000);
            const userTimezone =
                Intl.DateTimeFormat().resolvedOptions().timeZone;
            const formattedDate = new Intl.DateTimeFormat(undefined, {
                timeZone: userTimezone,
                dateStyle: 'short',
                timeStyle: 'short',
            }).format(date);
            expect(formatTimestamp(timestamp)).toEqual(formattedDate);
        });
    }
});

describe('formatTimestampDDMMYY', () => {
    const testCases = [
        { unixTimestamp: 1609459200, expected: '01/01/21, 00:00' },
        { unixTimestamp: 1612137600, expected: '01/02/21, 00:00' },
        { unixTimestamp: 1625097600, expected: '01/07/21, 00:00' },
        { unixTimestamp: 1657964207, expected: '16/07/22, 09:36' },
    ];

    testCases.forEach(({ unixTimestamp, expected }) => {
        expect(formatTimestampDDMMYY(unixTimestamp)).toBe(expected);
    });
});

describe('formatTimestampWithMonth', () => {
    it('should format a timestamp in utc timezone with month details', () => {
        expect(formatTimestampWithMonth(0)).toEqual('Jan 1, 1970 00:00:00');
        expect(formatTimestampWithMonth(86400)).toEqual('Jan 2, 1970 00:00:00');
        expect(formatTimestampWithMonth(1671859344)).toEqual(
            'Dec 24, 2022 05:22:24'
        );
    });
});

describe('formatLoanValue', () => {
    it('should format the price correctly with default max decimals', () => {
        expect(
            formatLoanValue(LoanValue.fromPrice(9698, 100), 'price')
        ).toEqual('96.98');
        expect(
            formatLoanValue(LoanValue.fromPrice(9600, 100), 'price')
        ).toEqual('96.00');
    });

    it('should format the rate correctly with default max decimals', () => {
        expect(
            formatLoanValue(LoanValue.fromApr(new Rate(515000), 100), 'rate')
        ).toEqual('51.50%');
        expect(
            formatLoanValue(LoanValue.fromApr(new Rate(500000), 100), 'rate')
        ).toEqual('50.00%');
    });

    it('should format the price correctly with custom max decimals', () => {
        expect(
            formatLoanValue(LoanValue.fromPrice(9623, 100), 'price', 1)
        ).toEqual('96.2');
        expect(
            formatLoanValue(LoanValue.fromPrice(9600, 100), 'price', 4)
        ).toEqual('96.0000');
    });

    it('should format the rate correctly with custom max decimals', () => {
        expect(
            formatLoanValue(LoanValue.fromApr(new Rate(515000), 100), 'rate', 1)
        ).toEqual('51.5%');
        expect(
            formatLoanValue(LoanValue.fromApr(new Rate(500000), 100), 'rate', 4)
        ).toEqual('50.0000%');
    });

    it('should return "--.--" when value is undefined and type is "price"', () => {
        const result = formatLoanValue(undefined, 'price');
        expect(result).toEqual('--.--');
    });

    it('should return "--.--%" when value is undefined and type is "rate"', () => {
        const result = formatLoanValue(undefined, 'rate');
        expect(result).toEqual('--.--%');
    });
});

describe('formatTimeStampWithTimezone', () => {
    it('should format timestamp with correct time and timezone', () => {
        const timestamp = 1678643696;
        const expectedOutput = '17:54:56 GMT';
        expect(formatTimeStampWithTimezone(timestamp)).toBe(expectedOutput);
    });
});
