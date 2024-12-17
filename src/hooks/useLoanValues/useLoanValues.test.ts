import { dec24Fixture, maturities } from 'src/stories/mocks/fixtures';
import { renderHook } from 'src/test-utils';
import { LoanValue } from 'src/utils';
import { RateType, useLoanValues } from './useLoanValues';

describe('useLoanValues', () => {
    const keys: string[] = Object.keys(maturities);
    it('should return a map of Loan Values of borrow unit prices', async () => {
        const { result } = renderHook(() =>
            useLoanValues(maturities, RateType.Borrow)
        );
        expect(result.current.size).toBe(9);
        for (let i = 0; i < 9; i++) {
            const maturity = Number(keys[i]);
            const loanValue = LoanValue.fromPrice(
                maturities[maturity].bestBorrowUnitPrice,
                maturity
            );
            expect(result.current.get(maturity)).toStrictEqual(loanValue);
        }
    });

    it('should return a map of Loan Values of lend unit prices', async () => {
        const { result } = renderHook(() =>
            useLoanValues(maturities, RateType.Lend)
        );
        expect(result.current.size).toBe(9);
        for (let i = 0; i < 9; i++) {
            const maturity = Number(keys[i]);
            const loanValue = LoanValue.fromPrice(
                maturities[maturity].bestLendUnitPrice,
                maturity
            );
            expect(result.current.get(maturity)).toStrictEqual(loanValue);
        }
    });

    it('should return a map of Loan Values of mid unit prices', async () => {
        const { result } = renderHook(() =>
            useLoanValues(maturities, RateType.Market)
        );
        expect(result.current.size).toBe(9);
        for (let i = 0; i < 9; i++) {
            const maturity = Number(keys[i]);
            const loanValue = LoanValue.fromPrice(
                maturities[maturity].marketUnitPrice,
                maturity
            );
            expect(result.current.get(maturity)).toStrictEqual(loanValue);
        }
    });

    it('should return a map of Loan Values of filtered market borrow unit prices', async () => {
        const { result } = renderHook(() =>
            useLoanValues(
                maturities,
                RateType.Market,
                market => market.isOpened
            )
        );
        expect(result.current.size).toBe(8);
        for (let i = 0; i < 9; i++) {
            const maturity = Number(keys[i]);
            if (maturities[maturity].isOpened) {
                const loanValue = LoanValue.fromPrice(
                    maturities[maturity].marketUnitPrice,
                    maturity
                );
                expect(result.current.get(maturity)).toStrictEqual(loanValue);
            } else {
                expect(maturity).toBe(dec24Fixture.toNumber());
            }
        }
    });
});
