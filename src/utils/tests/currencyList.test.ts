// import { getUTCMonthYear } from '@secured-finance/sf-core';
import {
    ethBytes32,
    usdcBytes32,
    wbtcBytes32,
    wfilBytes32,
} from 'src/stories/mocks/fixtures';
import {
    CurrencySymbol,
    Maturity,
    amountFormatterFromBase,
    amountFormatterToBase,
    convertFromGvUnit,
    convertToGvUnit,
    convertToZcTokenName,
    convertZCTokenFromBaseAmount,
    convertZCTokenToBaseAmount,
    currencyMap,
    divide,
    hexToCurrencySymbol,
    multiply,
    toCurrency,
    toCurrencySymbol,
} from 'src/utils';

const wfil = currencyMap.WFIL;
const eth = currencyMap.ETH;
const wbtc = currencyMap.WBTC;

describe('currencyList toBaseUnit', () => {
    it('should return the value in wei for ETH', () => {
        expect(eth.toBaseUnit(1).toString()).toEqual('1000000000000000000');
        expect(eth.toBaseUnit(1.23).toString()).toEqual('1230000000000000000');
        expect(eth.toBaseUnit(1.23456789).toString()).toEqual(
            '1234567890000000000'
        );
        expect(eth.toBaseUnit(9999999).toString()).toEqual(
            '9999999000000000000000000'
        );
        expect(eth.toBaseUnit(0.00000001).toString()).toEqual('10000000000');
        expect(eth.toBaseUnit(0.000000000001).toString()).toEqual('1000000');
        expect(eth.toBaseUnit(0.000000000000000001).toString()).toEqual('1');
    });

    it('should return the value in attoFil for FIL', () => {
        expect(wfil.toBaseUnit(1).toString()).toEqual('1000000000000000000');
        expect(wfil.toBaseUnit(1.23).toString()).toEqual('1230000000000000000');
        expect(wfil.toBaseUnit(1.23456789).toString()).toEqual(
            '1234567890000000000'
        );
        expect(wfil.toBaseUnit(0.00000001).toString()).toEqual('10000000000');
        expect(wfil.toBaseUnit(0.000000000001).toString()).toEqual('1000000');
        expect(wfil.toBaseUnit(0.000000000000000001).toString()).toEqual('1');
    });

    it('should return 0 if the input value is inferior to the base blockchain unit', () => {
        expect(wfil.toBaseUnit(0.0000000000000000001).toString()).toEqual('0');
        expect(wfil.toBaseUnit(0.0000000000000000009).toString()).toEqual('0');
        expect(wfil.toBaseUnit(0.000000000000000000001).toString()).toEqual(
            '0'
        );
        expect(eth.toBaseUnit(0.0000000000000000001).toString()).toEqual('0');
        expect(eth.toBaseUnit(0.000000000000000000001).toString()).toEqual('0');
    });

    it('should return the value in satoshi for WBTC', () => {
        expect(wbtc.toBaseUnit(1).toString()).toEqual('100000000');
        expect(wbtc.toBaseUnit(1.23).toString()).toEqual('123000000');
        expect(wbtc.toBaseUnit(1.23456789).toString()).toEqual('123456789');
        expect(wbtc.toBaseUnit(0.00000001).toString()).toEqual('1');
        expect(wbtc.toBaseUnit(0.000000000001).toString()).toEqual('0');
        expect(wbtc.toBaseUnit(0.000000000000000001).toString()).toEqual('0');
    });
});

describe('currencyList fromBaseUnit', () => {
    it('should return the value in ETH for wei amount', () => {
        expect(
            eth.fromBaseUnit(BigInt('1000000000000000000')).toString()
        ).toEqual('1');
        expect(
            eth.fromBaseUnit(BigInt('1230000000000000000')).toString()
        ).toEqual('1.23');
        expect(
            eth.fromBaseUnit(BigInt('1234567890000000000')).toString()
        ).toEqual('1.23456789');
        expect(
            eth.fromBaseUnit(BigInt('9999999000000000000000000')).toString()
        ).toEqual('9999999');
        expect(eth.fromBaseUnit(BigInt('10000000000')).toString()).toEqual(
            '1e-8'
        );
        expect(eth.fromBaseUnit(BigInt('1000000')).toString()).toEqual('1e-12');
    });

    it('should return the value in FIL for attoFil amount', () => {
        expect(
            wfil.fromBaseUnit(BigInt('1000000000000000000')).toString()
        ).toEqual('1');
        expect(
            wfil.fromBaseUnit(BigInt('1230000000000000000')).toString()
        ).toEqual('1.23');
        expect(
            wfil.fromBaseUnit(BigInt('1234567890000000000')).toString()
        ).toEqual('1.23456789');
        expect(wfil.fromBaseUnit(BigInt('10000000000')).toString()).toEqual(
            '1e-8'
        );
        expect(wfil.fromBaseUnit(BigInt('1000000')).toString()).toEqual(
            '1e-12'
        );
    });

    it('should return the value in WBTC for satoshi amount', () => {
        expect(wbtc.fromBaseUnit(BigInt('100000000')).toString()).toEqual('1');
        expect(wbtc.fromBaseUnit(BigInt('123000000')).toString()).toEqual(
            '1.23'
        );
        expect(wbtc.fromBaseUnit(BigInt('123456789')).toString()).toEqual(
            '1.23456789'
        );
        expect(wbtc.fromBaseUnit(BigInt('1')).toString()).toEqual('1e-8');
        expect(wbtc.fromBaseUnit(BigInt('0')).toString()).toEqual('0');
    });
});

describe('toCurrency', () => {
    it('should convert currency symbol to Currency object', () => {
        expect(toCurrency(CurrencySymbol.ETH)).toEqual(
            currencyMap.ETH.toCurrency()
        );
        expect(toCurrency(CurrencySymbol.WFIL)).toEqual(
            currencyMap.WFIL.toCurrency()
        );
    });
});

describe('currencyList amountFormatterToBase', () => {
    it('should return the value in wei for ETH', () => {
        const format = amountFormatterToBase[CurrencySymbol.ETH];
        expect(format(1).toString()).toEqual('1000000000000000000');
        expect(format(1.23).toString()).toEqual('1230000000000000000');
        expect(format(1.23456789).toString()).toEqual('1234567890000000000');
        expect(format(0.00000001).toString()).toEqual('10000000000');
        expect(format(0.000000000001).toString()).toEqual('1000000');
        expect(format(0.000000000000000001).toString()).toEqual('1');
    });

    it('should return the value in attoFil for FIL', () => {
        const format = amountFormatterToBase[CurrencySymbol.WFIL];
        expect(format(1).toString()).toEqual('1000000000000000000');
        expect(format(1.23).toString()).toEqual('1230000000000000000');
        expect(format(1.23456789).toString()).toEqual('1234567890000000000');
        expect(format(0.00000001).toString()).toEqual('10000000000');
        expect(format(0.000000000001).toString()).toEqual('1000000');
        expect(format(0.000000000000000001).toString()).toEqual('1');
    });

    it('should return 0 if the input value is inferior to the base blockchain unit', () => {
        const format = amountFormatterToBase[CurrencySymbol.WFIL];
        expect(format(0.0000000000000000001).toString()).toEqual('0');
        expect(format(0.0000000000000000009).toString()).toEqual('0');
        expect(format(0.000000000000000000001).toString()).toEqual('0');
        expect(format(0.0000000000000000001).toString()).toEqual('0');
        expect(format(0.000000000000000000001).toString()).toEqual('0');
    });

    it('should return the value in satoshi for WBTC', () => {
        const format = amountFormatterToBase[CurrencySymbol.WBTC];
        expect(format(1).toString()).toEqual('100000000');
        expect(format(1.23).toString()).toEqual('123000000');
        expect(format(1.23456789).toString()).toEqual('123456789');
        expect(format(0.00000001).toString()).toEqual('1');
        expect(format(0.000000000001).toString()).toEqual('0');
        expect(format(0.000000000000000001).toString()).toEqual('0');
    });
});

describe('currencyList amountFormatterFromBase', () => {
    it('should return the value in ETH for wei amount', () => {
        const format = amountFormatterFromBase[CurrencySymbol.ETH];
        expect(format(BigInt('1000000000000000000000000')).toString()).toEqual(
            '1000000'
        );
        expect(format(BigInt('1000000000000000000')).toString()).toEqual('1');
        expect(format(BigInt('1230000000000000000')).toString()).toEqual(
            '1.23'
        );
        expect(format(BigInt('1234567890000000000')).toString()).toEqual(
            '1.23456789'
        );
        expect(format(BigInt('10000000000')).toString()).toEqual('1e-8');
        expect(format(BigInt('1000000')).toString()).toEqual('1e-12');
    });

    it('should return the value in FIL for attoFil amount', () => {
        const format = amountFormatterFromBase[CurrencySymbol.WFIL];
        expect(format(BigInt('1000000000000000000')).toString()).toEqual('1');
        expect(format(BigInt('1230000000000000000')).toString()).toEqual(
            '1.23'
        );
        expect(format(BigInt('1234567890000000000')).toString()).toEqual(
            '1.23456789'
        );
        expect(format(BigInt('10000000000')).toString()).toEqual('1e-8');
        expect(format(BigInt('1000000')).toString()).toEqual('1e-12');
    });

    it('should return the value in WBTC for satoshi amount', () => {
        const format = amountFormatterFromBase[CurrencySymbol.WBTC];
        expect(format(BigInt('100000000')).toString()).toEqual('1');
        expect(format(BigInt('123000000')).toString()).toEqual('1.23');
        expect(format(BigInt('123456789')).toString()).toEqual('1.23456789');
        expect(format(BigInt('100000000000')).toString()).toEqual('1000');
        expect(format(BigInt('1')).toString()).toEqual('1e-8');
        expect(format(BigInt('0')).toString()).toEqual('0');
    });
});

describe('toCurrencySymbol', () => {
    it('should convert a currency string to a currency symbol', () => {
        expect(toCurrencySymbol('ETH')).toEqual(CurrencySymbol.ETH);
        expect(toCurrencySymbol('WFIL')).toEqual(CurrencySymbol.WFIL);
        expect(toCurrencySymbol('WBTC')).toEqual(CurrencySymbol.WBTC);
        expect(toCurrencySymbol('USDC')).toEqual(CurrencySymbol.USDC);
    });

    it('should return undefined if the currency is not supported', () => {
        expect(toCurrencySymbol('')).toBeUndefined();
        expect(toCurrencySymbol('XRP')).toBeUndefined();
        expect(toCurrencySymbol('EUR')).toBeUndefined();
    });
});

describe('hexToCurrencySymbol', () => {
    it('should convert a hex string to a currency symbol', () => {
        expect(hexToCurrencySymbol(ethBytes32)).toEqual(CurrencySymbol.ETH);
        expect(hexToCurrencySymbol(wfilBytes32)).toEqual(CurrencySymbol.WFIL);
        expect(hexToCurrencySymbol(wbtcBytes32)).toEqual(CurrencySymbol.WBTC);
        expect(hexToCurrencySymbol(usdcBytes32)).toEqual(CurrencySymbol.USDC);
    });

    it('should return undefined if the currency is not supported', () => {
        expect(hexToCurrencySymbol('0x585250')).toBeUndefined();
        expect(hexToCurrencySymbol('0x455552')).toBeUndefined();
    });
});

describe('multiply', () => {
    it('should multiply two numbers with precision', () => {
        expect(multiply(80.6, 100)).toEqual(8060);
        expect(multiply(80.612, 99.12345, 4)).toEqual(7990.5396);
    });

    it('should multiply two bigints with precision', () => {
        expect(multiply(BigInt(806), BigInt(100))).toEqual(80600);
        expect(multiply(BigInt(8012), BigInt(9912), 4)).toEqual(79414944);
    });

    it('should multiply bigint and a number with precision', () => {
        expect(multiply(80.6, BigInt(100))).toEqual(8060);
        expect(multiply(8012, BigInt(9912), 4)).toEqual(79414944);
    });
});

describe('divide', () => {
    it('should divide two numbers with precision', () => {
        expect(divide(8060, 100)).toEqual(80.6);
        expect(divide(80.612, 99.12345, 4)).toEqual(0.8132);
    });

    it('should divide two bigints with precision', () => {
        expect(divide(BigInt(8060), BigInt(100))).toEqual(80.6);
        expect(divide(BigInt(80612), BigInt(99123), 4)).toEqual(0.8133);
    });

    it('should divide bigint and a number with precision', () => {
        expect(divide(8060, BigInt(100))).toEqual(80.6);
        expect(divide(BigInt(80612), 99123, 4)).toEqual(0.8133);
    });
});

describe('ZC Tokens', () => {
    describe('convertFromGvUnit', () => {
        it('should convert from GV unit correctly', () => {
            expect(convertFromGvUnit(BigInt('1000000000000000000000000'))).toBe(
                1
            );
            expect(convertFromGvUnit(BigInt('500000000000000000000000'))).toBe(
                0.5
            );
        });
    });

    describe('convertToGvUnit', () => {
        it('should convert to GV unit correctly', () => {
            expect(convertToGvUnit(1)).toBe(
                BigInt('1000000000000000000000000')
            );
            expect(convertToGvUnit(0.5)).toBe(
                BigInt('500000000000000000000000')
            );
        });
    });

    describe('convertZCTokenFromBaseAmount', () => {
        it('should convert from base amount when maturity is zero or undefined', () => {
            expect(
                convertZCTokenFromBaseAmount(
                    CurrencySymbol.USDC,
                    BigInt('1000000000000000000000000')
                )
            ).toBe(1);
            expect(
                convertZCTokenFromBaseAmount(
                    CurrencySymbol.USDC,
                    BigInt('1000000000000000000000000'),
                    { isZero: () => true } as Maturity
                )
            ).toBe(1);
        });

        it('should use amountFormatterFromBase when maturity is not zero', () => {
            const mockMaturity = { isZero: () => false } as Maturity;
            const mockAmount = BigInt(1000000); // 1 USD in base units
            expect(
                convertZCTokenFromBaseAmount(
                    CurrencySymbol.USDC,
                    mockAmount,
                    mockMaturity
                )
            ).toBe(1);
        });
    });

    describe('convertZCTokenToBaseAmount', () => {
        it('should convert to base amount when maturity is zero or undefined', () => {
            expect(
                convertZCTokenToBaseAmount(CurrencySymbol.USDC, 1).toString()
            ).toBe('1000000000000000000000000');
            expect(
                convertZCTokenToBaseAmount(CurrencySymbol.USDC, 1, {
                    isZero: () => true,
                } as Maturity).toString()
            ).toBe('1000000000000000000000000');
        });

        it('should use amountFormatterToBase when maturity is not zero', () => {
            const mockMaturity = { isZero: () => false } as Maturity;
            expect(
                convertZCTokenToBaseAmount(
                    CurrencySymbol.USDC,
                    1,
                    mockMaturity
                ).toString()
            ).toBe('1000000');
            expect(
                convertZCTokenToBaseAmount(
                    CurrencySymbol.ETH,
                    2.5,
                    mockMaturity
                ).toString()
            ).toBe('2500000000000000000');
        });
    });

    describe('convertToZcTokenName', () => {
        it('should return correct name when maturity is zero or undefined', () => {
            expect(convertToZcTokenName(CurrencySymbol.USDC)).toBe('ZC USDC');
            expect(
                convertToZcTokenName(CurrencySymbol.USDC, {
                    isZero: () => true,
                } as Maturity)
            ).toBe('ZC USDC');
        });

        it('should return correct name with maturity', () => {
            expect(
                convertToZcTokenName(CurrencySymbol.USDC, {
                    isZero: () => false,
                    toNumber: () => 1623456789,
                } as Maturity)
            ).toBe('ZC USDC JUN2021');
        });
    });
});
