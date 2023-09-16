import { renderHook } from '@testing-library/react-hooks';
import { BigNumber } from 'ethers';
import { LoanValue } from 'src/utils/entities';
import { usePrepareOrderbookData } from './usePrepareOrderbookData';

const maturity = 1675252800;
const data = {
    borrowOrderbook: [
        {
            amount: BigNumber.from('1'),
            value: LoanValue.fromPrice(9850, maturity),
        },
        {
            amount: BigNumber.from('1'),
            value: LoanValue.fromPrice(9851, maturity),
        },
        {
            amount: BigNumber.from('1'),
            value: LoanValue.fromPrice(9852, maturity),
        },
        {
            amount: BigNumber.from('1'),
            value: LoanValue.fromPrice(9853, maturity),
        },
        {
            amount: BigNumber.from('1'),
            value: LoanValue.fromPrice(9854, maturity),
        },
        {
            amount: BigNumber.from('0'),
            value: LoanValue.fromPrice(9855, maturity),
        },
    ],
    lendOrderbook: [
        {
            amount: BigNumber.from('1'),
            value: LoanValue.fromPrice(9200, maturity),
        },
        {
            amount: BigNumber.from('2'),
            value: LoanValue.fromPrice(9110, maturity),
        },
        {
            amount: BigNumber.from('3'),
            value: LoanValue.fromPrice(9050, maturity),
        },
        {
            amount: BigNumber.from('4'),
            value: LoanValue.fromPrice(9010, maturity),
        },
        {
            amount: BigNumber.from('1'),
            value: LoanValue.fromPrice(8980, maturity),
        },
        {
            amount: BigNumber.from('1'),
            value: LoanValue.fromPrice(8960, maturity),
        },
    ],
};

describe('usePrepareOrderbookData', () => {
    it('should return an empty array when no data is provided', () => {
        const { result } = renderHook(() =>
            usePrepareOrderbookData(undefined, 'borrowOrderbook', 1)
        );
        expect(result.current).toEqual([]);
    });

    describe('aggregation', () => {
        it('should return the correct data when provided with valid data', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'borrowOrderbook', 10)
            );
            expect(result.current).toEqual([
                {
                    amount: BigNumber.from('0'),
                    value: LoanValue.fromPrice(9855, maturity),
                },
                {
                    value: LoanValue.fromPrice(9850, maturity),
                    amount: BigNumber.from(5),
                },
            ]);
        });

        it('should not aggregate the data when provided with an aggregation factor of 1 but still sort it and order the zeros', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'borrowOrderbook', 1)
            );
            expect(result.current).toEqual([
                {
                    amount: BigNumber.from('0'),
                    value: LoanValue.fromPrice(9855, maturity),
                },
                {
                    amount: BigNumber.from('1'),
                    value: LoanValue.fromPrice(9854, maturity),
                },
                {
                    amount: BigNumber.from('1'),
                    value: LoanValue.fromPrice(9853, maturity),
                },
                {
                    amount: BigNumber.from('1'),
                    value: LoanValue.fromPrice(9852, maturity),
                },
                {
                    amount: BigNumber.from('1'),
                    value: LoanValue.fromPrice(9851, maturity),
                },
                {
                    amount: BigNumber.from('1'),
                    value: LoanValue.fromPrice(9850, maturity),
                },
            ]);
        });

        it('should aggregate the data by 1000 when provided with an aggregation factor of 1000', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'lendOrderbook', 1000)
            );
            expect(result.current).toEqual([
                {
                    amount: BigNumber.from('10'),
                    value: LoanValue.fromPrice(9000, maturity),
                },
                {
                    amount: BigNumber.from('2'),
                    value: LoanValue.fromPrice(8000, maturity),
                },
            ]);
        });
    });

    describe('sorting', () => {
        const withZeros = [
            {
                amount: BigNumber.from('1'),
                value: LoanValue.fromPrice(9200, maturity),
            },
            {
                amount: BigNumber.from('0'),
                value: LoanValue.fromPrice(9200, maturity),
            },
            {
                amount: BigNumber.from('0'),
                value: LoanValue.fromPrice(9200, maturity),
            },
            {
                amount: BigNumber.from('2'),
                value: LoanValue.fromPrice(9110, maturity),
            },
        ];

        it('should move the zeros to the end of the array for lend orderbook', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(
                    {
                        ...data,
                        lendOrderbook: withZeros,
                    },
                    'lendOrderbook',
                    1
                )
            );
            expect(result.current).toEqual([
                withZeros[0],
                withZeros[3],
                withZeros[1],
                withZeros[2],
            ]);
        });

        it('should move the zeros to the beginning of the array for borrow orderbook', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(
                    {
                        ...data,
                        borrowOrderbook: withZeros,
                    },
                    'borrowOrderbook',
                    1
                )
            );
            expect(result.current).toEqual([
                withZeros[2],
                withZeros[1],
                withZeros[0],
                withZeros[3],
            ]);
        });
    });
});
