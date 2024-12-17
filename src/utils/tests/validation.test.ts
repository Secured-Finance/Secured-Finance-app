import { OrderSide } from '@secured-finance/sf-client';
import { getAmountValidation } from 'src/utils';

describe('getAmountValidation', () => {
    it('should return false for borrow orders', () => {
        expect(
            getAmountValidation(BigInt(100), BigInt(1000), OrderSide.BORROW)
        ).toEqual(false);
    });

    it('should return true if available amount is less than value', () => {
        expect(
            getAmountValidation(BigInt(10000), BigInt(1000), OrderSide.LEND)
        ).toEqual(true);
    });

    it('should return false if available amount is more than value', () => {
        expect(
            getAmountValidation(BigInt(100), BigInt(1000), OrderSide.LEND)
        ).toEqual(false);
    });
});
