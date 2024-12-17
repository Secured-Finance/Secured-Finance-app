import { calculatePercentage, computeAvailableToBorrow } from 'src/utils';

const ONE_ETH = BigInt('1000000000000000000');
const TWO_ETH = BigInt('2000000000000000000');
const ZERO_ETH = BigInt('0');

describe('collateral.computeAvailableToBorrow', () => {
    it('should compute the available amount to borrow with a collateral threshold of 80%', () => {
        expect(computeAvailableToBorrow(1000, 1000, 0, 80)).toEqual(800);
        expect(computeAvailableToBorrow(1000, 900, 10, 80)).toEqual(700);
        expect(computeAvailableToBorrow(1000, 800, 20, 80)).toEqual(600);
        expect(computeAvailableToBorrow(1000, 700, 30, 80)).toEqual(500);
        expect(computeAvailableToBorrow(1000, 600, 40, 80)).toEqual(400);
        expect(computeAvailableToBorrow(1000, 500, 50, 80)).toEqual(300);
        expect(computeAvailableToBorrow(1000, 400, 60, 80)).toEqual(200);
        expect(computeAvailableToBorrow(1000, 300, 70, 80)).toEqual(100);
        expect(computeAvailableToBorrow(1000, 200, 80, 80)).toEqual(0);
    });

    it('should return 0 if coverage is over threshold', () => {
        expect(computeAvailableToBorrow(1000, 150, 85, 80)).toEqual(0);
    });
});

describe('collateral.calculatePercentage', () => {
    it('should compute the percentage', () => {
        expect(calculatePercentage(ONE_ETH, TWO_ETH)).toEqual(BigInt(50));
    });

    it('should return 0 when total is zero', () => {
        expect(calculatePercentage(ONE_ETH, ZERO_ETH)).toEqual(ZERO_ETH);
    });
});
