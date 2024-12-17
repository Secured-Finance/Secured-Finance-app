import { renderHook } from 'src/test-utils';
import { LoanValue, ZERO_BI } from 'src/utils';
import { usePrepareOrderbookData } from './usePrepareOrderbookData';

const maturity = 1675252800;
const data = {
    borrowOrderbook: [
        {
            amount: BigInt('1'),
            value: LoanValue.fromPrice(9850, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('1'),
            value: LoanValue.fromPrice(9851, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('1'),
            value: LoanValue.fromPrice(9852, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('1'),
            value: LoanValue.fromPrice(9853, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('1'),
            value: LoanValue.fromPrice(9854, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('0'),
            value: LoanValue.fromPrice(9855, maturity),
            cumulativeAmount: ZERO_BI,
        },
    ],
    lendOrderbook: [
        {
            amount: BigInt('1'),
            value: LoanValue.fromPrice(9200, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('2'),
            value: LoanValue.fromPrice(9110, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('3'),
            value: LoanValue.fromPrice(9050, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('4'),
            value: LoanValue.fromPrice(9010, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('1'),
            value: LoanValue.fromPrice(8980, maturity),
            cumulativeAmount: ZERO_BI,
        },
        {
            amount: BigInt('1'),
            value: LoanValue.fromPrice(8960, maturity),
            cumulativeAmount: ZERO_BI,
        },
    ],
};

const sortedResults = [
    {
        amount: BigInt('0'),
        value: LoanValue.fromPrice(9855, maturity),
        cumulativeAmount: ZERO_BI,
    },
    {
        amount: BigInt('1'),
        value: LoanValue.fromPrice(9854, maturity),
        cumulativeAmount: BigInt('5'),
    },
    {
        amount: BigInt('1'),
        value: LoanValue.fromPrice(9853, maturity),
        cumulativeAmount: BigInt('4'),
    },
    {
        amount: BigInt('1'),
        value: LoanValue.fromPrice(9852, maturity),
        cumulativeAmount: BigInt('3'),
    },
    {
        amount: BigInt('1'),
        value: LoanValue.fromPrice(9851, maturity),
        cumulativeAmount: BigInt('2'),
    },
    {
        amount: BigInt('1'),
        value: LoanValue.fromPrice(9850, maturity),
        cumulativeAmount: BigInt('1'),
    },
];

describe('usePrepareOrderbookData', () => {
    it('should return an empty array when no data is provided', () => {
        const { result } = renderHook(() =>
            usePrepareOrderbookData(undefined, 'borrowOrderbook', 6, 1)
        );
        expect(result.current).toEqual([]);
    });

    describe('aggregation', () => {
        it('should return the correct data when provided with valid data', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'borrowOrderbook', 6, 10)
            );
            expect(result.current).toEqual([
                {
                    amount: BigInt('0'),
                    value: LoanValue.fromPrice(9855, maturity),
                    cumulativeAmount: BigInt('0'),
                },
                {
                    value: LoanValue.fromPrice(9860, maturity),
                    amount: BigInt('4'),
                    cumulativeAmount: BigInt('5'),
                },
                {
                    value: LoanValue.fromPrice(9850, maturity),
                    amount: BigInt('1'),
                    cumulativeAmount: BigInt('1'),
                },
            ]);
        });

        it('should not aggregate the data when provided with an aggregation factor of 1 but still sort it and order the zeros', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'borrowOrderbook', 6, 1)
            );
            expect(result.current).toEqual(sortedResults);
        });

        it('should aggregate the data by 1000 when provided with an aggregation factor of 1000', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'lendOrderbook', 6, 1000)
            );
            expect(result.current).toEqual([
                {
                    amount: BigInt('10'),
                    value: LoanValue.fromPrice(9000, maturity),
                    cumulativeAmount: BigInt('10'),
                },
                {
                    amount: BigInt('2'),
                    value: LoanValue.fromPrice(8000, maturity),
                    cumulativeAmount: BigInt('12'),
                },
            ]);
        });
    });

    describe('sorting', () => {
        const withZeros = [
            {
                amount: BigInt('1'),
                value: LoanValue.fromPrice(9200, maturity),
                cumulativeAmount: ZERO_BI,
            },
            {
                amount: BigInt('0'),
                value: LoanValue.fromPrice(9200, maturity),
                cumulativeAmount: ZERO_BI,
            },
            {
                amount: BigInt('0'),
                value: LoanValue.fromPrice(9200, maturity),
                cumulativeAmount: ZERO_BI,
            },
            {
                amount: BigInt('2'),
                value: LoanValue.fromPrice(9110, maturity),
                cumulativeAmount: ZERO_BI,
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
                    4,
                    1
                )
            );
            expect(result.current).toEqual([
                {
                    amount: BigInt('1'),
                    value: LoanValue.fromPrice(9200, maturity),
                    cumulativeAmount: BigInt('1'),
                },
                {
                    amount: BigInt('2'),
                    value: LoanValue.fromPrice(9110, maturity),
                    cumulativeAmount: BigInt('3'),
                },
                {
                    amount: BigInt('0'),
                    value: LoanValue.fromPrice(9200, maturity),
                    cumulativeAmount: ZERO_BI,
                },
                {
                    amount: BigInt('0'),
                    value: LoanValue.fromPrice(9200, maturity),
                    cumulativeAmount: ZERO_BI,
                },
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
                    4,
                    1
                )
            );
            expect(result.current).toEqual([
                {
                    amount: BigInt('0'),
                    value: LoanValue.fromPrice(9200, maturity),
                    cumulativeAmount: ZERO_BI,
                },
                {
                    amount: BigInt('0'),
                    value: LoanValue.fromPrice(9200, maturity),
                    cumulativeAmount: ZERO_BI,
                },
                {
                    amount: BigInt('1'),
                    value: LoanValue.fromPrice(9200, maturity),
                    cumulativeAmount: BigInt('3'),
                },
                {
                    amount: BigInt('2'),
                    value: LoanValue.fromPrice(9110, maturity),
                    cumulativeAmount: BigInt('2'),
                },
            ]);
        });
    });

    describe('limit', () => {
        it('should limit the data to the provided limit for lend orderbook to the biggest prices', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'lendOrderbook', 3, 1)
            );
            expect(result.current).toEqual([
                {
                    amount: BigInt('1'),
                    value: LoanValue.fromPrice(9200, maturity),
                    cumulativeAmount: BigInt('1'),
                },
                {
                    amount: BigInt('2'),
                    value: LoanValue.fromPrice(9110, maturity),
                    cumulativeAmount: BigInt('3'),
                },
                {
                    amount: BigInt('3'),
                    value: LoanValue.fromPrice(9050, maturity),
                    cumulativeAmount: BigInt('6'),
                },
            ]);
        });

        it('should limit the data to the provided limit for borrow orderbook to the smallest prices', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'borrowOrderbook', 3, 1)
            );
            expect(result.current).toEqual([
                {
                    amount: BigInt('1'),
                    value: LoanValue.fromPrice(9852, maturity),
                    cumulativeAmount: BigInt('3'),
                },
                {
                    amount: BigInt('1'),
                    value: LoanValue.fromPrice(9851, maturity),
                    cumulativeAmount: BigInt('2'),
                },
                {
                    amount: BigInt('1'),
                    value: LoanValue.fromPrice(9850, maturity),
                    cumulativeAmount: BigInt('1'),
                },
            ]);
        });

        it('should return all the data if limit is zero', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'borrowOrderbook', 0, 1)
            );
            expect(result.current).toEqual(sortedResults);
        });

        it('should return all the data if limit is bigger than the length of the data', () => {
            const { result } = renderHook(() =>
                usePrepareOrderbookData(data, 'borrowOrderbook', 10, 1)
            );
            expect(result.current).toEqual(sortedResults);
        });
    });
});
