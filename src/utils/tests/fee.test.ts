import { calculateFee } from 'src/utils';

const getMaturity = (days: number) => {
    return (Date.now() + days * 24 * 60 * 60 * 1000) / 1000;
};

describe('fee', () => {
    it('should calculate fees according to maturity', () => {
        let maturity = getMaturity(365);
        expect(calculateFee(maturity, 1)).toEqual('1%');
        maturity = getMaturity(0);
        expect(calculateFee(maturity, 1)).toEqual('0%');
        maturity = getMaturity(60);
        expect(calculateFee(maturity, 1)).toEqual('0.16%');
        maturity = getMaturity(90);
        expect(calculateFee(maturity, 1)).toEqual('0.25%');
        maturity = getMaturity(183);
        expect(calculateFee(maturity, 1)).toEqual('0.5%');
    });

    it('should calculate fees according to annual fee', () => {
        let maturity = getMaturity(365);
        expect(calculateFee(maturity, 2)).toEqual('2%');
        maturity = getMaturity(183);
        expect(calculateFee(maturity, 2)).toEqual('1%');
    });

    it('should not return negative fees if maturity has passed', () => {
        const maturity = getMaturity(-365);
        expect(calculateFee(maturity, 1)).toEqual('0%');
        expect(calculateFee(maturity, 2)).toEqual('0%');
    });
});
