import { OrderSide } from '@secured-finance/sf-client';
import { toBytes32 } from '@secured-finance/sf-graph-client';
import queries from '@secured-finance/sf-graph-client/dist/graphclients';
import { GetUserDocument } from '@secured-finance/sf-point-client';
import { OrderType, TransactionList } from 'src/types';
import { Maturity } from 'src/utils';
import {
    dailyVolumes,
    dec22Fixture,
    dec24Fixture,
    mar23Fixture,
    orderHistoryList,
    tradesUSDC,
    tradesWFIL,
    transactions,
    usdcBytes32,
    wfilBytes32,
} from './fixtures';
import { mockCandleStickData } from './historicalchart';

const MATURITY_ZERO = new Maturity(0);

const generateMyTransactions = (
    amount: string,
    skip: number,
    maturity = mar23Fixture
) => {
    const myTransactions = [];
    for (let i = 0; i < 20; i++) {
        myTransactions.push({
            id: (skip + i).toString(),
            amount: amount,
            averagePrice: '0.8000',
            side: 1,
            executionPrice: '9543',
            createdAt: '1671080520',
            feeInFV: '3213742117859654893',
            futureValue: '520000000000000000000',
            currency: wfilBytes32,
            maturity: maturity.toString(),
            user: {
                id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
            },
        });
    }
    return myTransactions;
};

const generateMyOrderHistory = (
    amount: string,
    skip: number,
    maturity = dec22Fixture
) =>
    Array(20)
        .fill(null)
        .map((_, index) => ({
            id: (skip + index).toString(),
            orderId: index,
            currency: wfilBytes32,
            side: 1,
            maturity: maturity.toString(),
            inputUnitPrice: BigInt('9800'),
            filledAmount: BigInt('0'),
            inputAmount: BigInt(amount),
            status: 'Open',
            type: OrderType.LIMIT,
            createdAt: BigInt('1'),
            txHash: toBytes32('hash'),
            lendingMarket: {
                id: '1',
                isActive: true,
            },
            user: {
                id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
            },
            isCircuitBreakerTriggered: false,
        }));

export const mockUserTransactionHistory = [
    {
        request: {
            query: queries.UserTransactionHistoryDocument,
            variables: {
                address: '',
                skip: 0,
                first: 1000,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactionCount: 0,
                    transactions: [],
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactionCount: 0,
                        transactions: [],
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserTransactionHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 0,
                first: 1000,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactionCount: 5,
                    transactions: transactions,
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactionCount: 5,
                        transactions: transactions,
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserTransactionHistoryDocument,
            variables: {
                address: '',
                skip: 0,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactionCount: 0,
                    transactions: [],
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactionCount: 0,
                        transactions: [],
                    },
                },
            };
        },
    },

    {
        request: {
            query: queries.UserTransactionHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 0,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactionCount: 80,
                    transactions: generateMyTransactions(
                        '500000000000000000000',
                        0
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactionCount: 80,
                        transactions: generateMyTransactions(
                            '500000000000000000000',
                            0
                        ),
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserTransactionHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 20,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactionCount: 80,
                    transactions: generateMyTransactions(
                        '600000000000000000000',
                        20
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactionCount: 80,
                        transactions: generateMyTransactions(
                            '600000000000000000000',
                            20
                        ),
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserTransactionHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 40,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactionCount: 80,
                    transactions: generateMyTransactions(
                        '700000000000000000000',
                        40
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactionCount: 80,
                        transactions: generateMyTransactions(
                            '700000000000000000000',
                            40
                        ),
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserTransactionHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 60,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactionCount: 80,
                    transactions: generateMyTransactions(
                        '800000000000000000000',
                        60
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactionCount: 80,
                        transactions: generateMyTransactions(
                            '800000000000000000000',
                            60
                        ),
                    },
                },
            };
        },
    },
];

export const mockFullUserTransactionHistory = [
    {
        request: {
            query: queries.FullUserTransactionHistoryDocument,
            variables: {
                address: '',
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactions: [],
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactions: [],
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.FullUserTransactionHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactions: generateMyTransactions(
                        '500000000000000000000',
                        0
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactions: generateMyTransactions(
                            '500000000000000000000',
                            0
                        ),
                    },
                },
            };
        },
    },
];

export const mockFilteredUserTransactionHistory = [
    {
        request: {
            query: queries.FilteredUserTransactionHistoryDocument,
            variables: {
                address: '',
                currency: wfilBytes32,
                maturity: dec22Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactions: [],
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactions: [],
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.FilteredUserTransactionHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                currency: wfilBytes32,
                maturity: dec22Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    transactions: generateMyTransactions(
                        '800000000000000000000',
                        0,
                        dec22Fixture
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        transactions: generateMyTransactions(
                            '800000000000000000000',
                            0,
                            dec22Fixture
                        ),
                    },
                },
            };
        },
    },
];

export const mockFilteredUserOrderHistory = [
    {
        request: {
            query: queries.FilteredUserOrderHistoryDocument,
            variables: {
                address: '',
                currency: wfilBytes32,
                maturity: dec22Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: null,
            },
        },
        newData: () => {
            return {
                data: {
                    user: null,
                },
            };
        },
    },
    {
        request: {
            query: queries.FilteredUserOrderHistoryDocument,
            variables: {
                address: '',
                currency: wfilBytes32,
                maturity: MATURITY_ZERO.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: null,
            },
        },
        newData: () => {
            return {
                data: {
                    user: null,
                },
            };
        },
    },
    {
        request: {
            query: queries.FilteredUserOrderHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                currency: wfilBytes32,
                maturity: dec22Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orders: generateMyOrderHistory('800000000000000000000', 0),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orders: generateMyOrderHistory(
                            '800000000000000000000',
                            0
                        ),
                    },
                },
            };
        },
    },
];

export const mockItayoseFilteredUserOrderHistory = [
    {
        request: {
            query: queries.FilteredUserOrderHistoryDocument,
            variables: {
                address: '',
                currency: wfilBytes32,
                maturity: dec24Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: null,
            },
        },
        newData: () => {
            return {
                data: {
                    user: null,
                },
            };
        },
    },
    {
        request: {
            query: queries.FilteredUserOrderHistoryDocument,
            variables: {
                address: '',
                currency: wfilBytes32,
                maturity: MATURITY_ZERO.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: null,
            },
        },
        newData: () => {
            return {
                data: {
                    user: null,
                },
            };
        },
    },
    {
        request: {
            query: queries.FilteredUserOrderHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                currency: wfilBytes32,
                maturity: dec24Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orders: generateMyOrderHistory(
                        '800000000000000000000',
                        0,
                        dec24Fixture
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orders: generateMyOrderHistory(
                            '800000000000000000000',
                            0,
                            dec24Fixture
                        ),
                    },
                },
            };
        },
    },
];

export const mockUserOrderHistory = [
    {
        request: {
            query: queries.UserOrderHistoryDocument,
            variables: {
                address: '',
                skip: 0,
                first: 1000,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orderCount: 0,
                    orders: [],
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orderCount: 0,
                        orders: [],
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserOrderHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 0,
                first: 1000,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orderCount: 9,
                    orders: orderHistoryList,
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orderCount: 9,
                        orders: orderHistoryList,
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserOrderHistoryDocument,
            variables: {
                address: '',
                skip: 0,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orderCount: 0,
                    orders: [],
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orderCount: 0,
                        orders: [],
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserOrderHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 0,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orderCount: 60,
                    orders: generateMyOrderHistory('1000000000000000000000', 0),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orderCount: 60,
                        orders: generateMyOrderHistory(
                            '1000000000000000000000',
                            0
                        ),
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserOrderHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 20,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orderCount: 60,
                    orders: generateMyOrderHistory(
                        '2000000000000000000000',
                        20
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orderCount: 60,
                        orders: generateMyOrderHistory(
                            '2000000000000000000000',
                            20
                        ),
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.UserOrderHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                skip: 40,
                first: 20,
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orderCount: 60,
                    orders: generateMyOrderHistory(
                        '3000000000000000000000',
                        40
                    ),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orderCount: 60,
                        orders: generateMyOrderHistory(
                            '3000000000000000000000',
                            40
                        ),
                    },
                },
            };
        },
    },
];

export const mockFullUserOrderHistory = [
    {
        request: {
            query: queries.FullUserOrderHistoryDocument,
            variables: {
                address: '',
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orders: [],
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orders: [],
                    },
                },
            };
        },
    },
    {
        request: {
            query: queries.FullUserOrderHistoryDocument,
            variables: {
                address: '0xb98bd7c7f656290071e52d1aa617d9cb4467fd6d',
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                user: {
                    orders: generateMyOrderHistory('1000000000000000000000', 0),
                },
            },
        },
        newData: () => {
            return {
                data: {
                    user: {
                        orders: generateMyOrderHistory(
                            '1000000000000000000000',
                            0
                        ),
                    },
                },
            };
        },
    },
];

export const mockDailyVolumes = [
    {
        request: {
            query: queries.DailyVolumesDocument,
            variables: {
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                dailyVolumes: dailyVolumes,
            },
        },
        newData: () => {
            return {
                data: {
                    dailyVolumes: dailyVolumes,
                },
            };
        },
    },
];

const today = 1643713200;
const yesterday = today - 24 * 3600;
const today2 = 1638356400;
const yesterday2 = today2 - 24 * 3600;

function getTransactionQuery(
    currency: string,
    maturity: Maturity,
    from: number,
    to: number,
    transactions: TransactionList,
    lastTransaction: [TransactionList[0]] | []
) {
    return {
        request: {
            query: queries.TransactionHistoryDocument,
            variables: {
                currency: currency,
                maturity: maturity.toNumber(),
                from: from,
                to: to,
                sides: [OrderSide.LEND, OrderSide.BORROW],
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                transactionHistory: transactions,
                lastTransaction: lastTransaction,
            },
        },
        newData: () => {
            return {
                data: {
                    transactionHistory: transactions,
                    lastTransaction: lastTransaction,
                },
            };
        },
    };
}

export const emptyTransaction = [
    getTransactionQuery(wfilBytes32, dec22Fixture, yesterday, today, [], []),
    getTransactionQuery(wfilBytes32, dec22Fixture, yesterday2, today2, [], []),
    getTransactionQuery(wfilBytes32, MATURITY_ZERO, yesterday, today, [], []),
    getTransactionQuery(wfilBytes32, MATURITY_ZERO, yesterday2, today2, [], []),
];

function getQueryForCurrency(currency: string, transactions: TransactionList) {
    return [
        getTransactionQuery(
            currency,
            dec22Fixture,
            yesterday,
            today,
            transactions,
            [transactions[0]]
        ),
        getTransactionQuery(
            currency,
            dec22Fixture,
            yesterday2,
            today2,
            transactions,
            [transactions[0]]
        ),
        getTransactionQuery(
            currency,
            mar23Fixture,
            yesterday,
            today,
            transactions,
            [transactions[0]]
        ),
        getTransactionQuery(
            currency,
            mar23Fixture,
            yesterday2,
            today2,
            transactions,
            [transactions[0]]
        ),
        getTransactionQuery(
            currency,
            MATURITY_ZERO,
            yesterday,
            today,
            transactions,
            [transactions[0]]
        ),
        getTransactionQuery(
            currency,
            MATURITY_ZERO,
            yesterday2,
            today2,
            transactions,
            [transactions[0]]
        ),
    ];
}

export const mockTrades = [
    ...getQueryForCurrency(usdcBytes32, tradesUSDC),
    ...getQueryForCurrency(wfilBytes32, tradesWFIL),
];

export const mockTransactionCandleStick = [
    {
        request: {
            query: queries.TransactionCandleStickDocument,
            variables: {
                interval: '300',
                currency: wfilBytes32,
                maturity: dec22Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                transactionCandleSticks: mockCandleStickData,
            },
        },
        newData: () => {
            return {
                data: {
                    transactionCandleSticks: mockCandleStickData,
                },
            };
        },
    },
    {
        request: {
            query: queries.TransactionCandleStickDocument,
            variables: {
                interval: '3600',
                currency: wfilBytes32,
                maturity: dec22Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                transactionCandleSticks: mockCandleStickData,
            },
        },
        newData: () => {
            return {
                data: {
                    transactionCandleSticks: mockCandleStickData,
                },
            };
        },
    },
    {
        request: {
            query: queries.TransactionCandleStickDocument,
            variables: {
                interval: '21600',
                currency: wfilBytes32,
                maturity: dec22Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                transactionCandleSticks: mockCandleStickData,
            },
        },
        newData: () => {
            return {
                data: {
                    transactionCandleSticks: mockCandleStickData,
                },
            };
        },
    },
    {
        request: {
            query: queries.TransactionCandleStickDocument,
            variables: {
                interval: '86400',
                currency: wfilBytes32,
                maturity: dec22Fixture.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                transactionCandleSticks: mockCandleStickData,
            },
        },
        newData: () => {
            return {
                data: {
                    transactionCandleSticks: mockCandleStickData,
                },
            };
        },
    },
    {
        request: {
            query: queries.TransactionCandleStickDocument,
            variables: {
                interval: '300',
                currency: wfilBytes32,
                maturity: MATURITY_ZERO.toNumber(),
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                transactionCandleSticks: [],
            },
        },
        newData: () => {
            return {
                data: {
                    transactionCandleSticks: [],
                },
            };
        },
    },
];

export const userPoints = [
    {
        request: {
            query: GetUserDocument,
        },
        result: {
            data: {
                user: {
                    id: '1',
                    walletAddress: '0x123',
                    point: 164,
                    rank: 1,
                    joindAt: '2024-05-30T13:39:49.165Z',
                    referralCode: 'ABCDEFG123',
                    pointDetails: {
                        deposit: 100,
                        referral: 50,
                    },
                    boostPercentage: 500,
                },
            },
        },
    },
];

export const mockRecentTrades = [
    {
        request: {
            query: queries.TransactionHistoryDocument,
            variables: {
                currency: usdcBytes32,
                maturity: dec22Fixture.toNumber(),
                from: -1,
                to: today,
                first: 100,
                sides: [OrderSide.LEND, OrderSide.BORROW],
                awaitRefetchQueries: true,
            },
        },
        result: {
            data: {
                transactionHistory: tradesUSDC,
                lastTransaction: [tradesUSDC[0]],
            },
        },
        newData: () => {
            return {
                data: {
                    transactionHistory: tradesUSDC,
                    lastTransaction: [tradesUSDC[0]],
                },
            };
        },
    },
    getTransactionQuery(wfilBytes32, MATURITY_ZERO, -1, today, [], []),
    getTransactionQuery(wfilBytes32, MATURITY_ZERO, -1, today2, [], []),
];
