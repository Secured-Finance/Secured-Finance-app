import { OrderList, Position } from 'src/hooks';
import {
    AssetPriceMap,
    Order,
    Transaction,
    TransactionHistoryList,
} from 'src/types';
import {
    LoanValue,
    Rate,
    ZERO_BI,
    currencyMap,
    hexToCurrencySymbol,
} from 'src/utils';

export const computeWeightedAverageRate = (trades: TransactionHistoryList) => {
    if (!trades.length) {
        return new Rate(0);
    }

    const totalAmount = trades.reduce(
        (acc: number, trade: Transaction) => acc + trade.amount,
        0
    );
    const total = trades.reduce(
        (acc: number, trade: Transaction) =>
            acc +
            LoanValue.fromPrice(
                Number(trade.averagePrice),
                Number(trade.maturity)
            ).apr.toNumber() *
                trade.amount,
        0
    );
    return new Rate(total / totalAmount);
};

export const computeNetValue = (
    positions: Pick<Position, 'amount' | 'currency'>[],
    priceList: AssetPriceMap
) => {
    return positions.reduce((acc, { amount, currency }) => {
        const ccy = hexToCurrencySymbol(currency);
        if (!ccy) return acc;
        return (
            acc +
            currencyMap[ccy].fromBaseUnit(amount) * (priceList?.[ccy] ?? 0)
        );
    }, 0);
};

export type TradeSummary = {
    currency: string;
    maturity: string;
    amount: bigint;
    futureValue: bigint;
    averagePrice: bigint;
};

export const calculateFutureValue = (
    amount: bigint,
    unitPrice: bigint
): bigint => {
    return (amount * BigInt(10000)) / unitPrice;
};

export const calculateAveragePrice = (unitPrice: bigint): number => {
    return Number(unitPrice) / 10000;
};

export const formatOrders = (orders: OrderList): TransactionHistoryList => {
    return orders?.map(order => ({
        id: '0',
        amount: order.amount,
        side: order.side,
        executionPrice: order.unitPrice,
        createdAt: order.createdAt,
        currency: order.currency,
        maturity: order.maturity,
        futureValue: calculateFutureValue(order.amount, order.unitPrice),
        averagePrice: calculateAveragePrice(order.unitPrice),
        feeInFV: ZERO_BI,
        user: {
            id: order.user ?? '',
        },
    }));
};

export const checkOrderIsFilled = (
    order: Order,
    orders: OrderList
): boolean => {
    for (let i = 0; i < orders.length; i++) {
        if (checkOrdersAreSame(order, orders[i])) {
            return true;
        }
    }
    return false;
};

export const checkOrdersAreSame = (order1: Order, order2: OrderList[0]) => {
    return (
        BigInt(order1.orderId) === BigInt(order2.orderId) &&
        order1.currency === order2.currency &&
        order1.maturity.toString() === order2.maturity
    );
};

export const sortOrders = (a: Order, b: Order) => {
    return Number(b.createdAt - a.createdAt);
};

export const getMaxAmount = (orders: { cumulativeAmount: bigint }[]) => {
    if (!orders.length) {
        return ZERO_BI;
    }
    return orders.reduce(
        (prev, current) =>
            prev > current.cumulativeAmount ? prev : current.cumulativeAmount,
        orders[0].cumulativeAmount
    );
};

export const getMappedOrderStatus = (order: Order): string => {
    let status = '';
    switch (order.status) {
        case 'Open':
            status = order.lendingMarket.isActive ? 'Open' : 'Expired';
            break;
        case 'PartiallyFilled':
            status = order.lendingMarket.isActive
                ? 'Partially Filled'
                : 'Partially Filled & Expired';
            break;
        case 'Killed':
            if (order.isCircuitBreakerTriggered) {
                status =
                    Number(order.filledAmount) === 0
                        ? 'Blocked'
                        : 'Partially Filled & Blocked';
            } else {
                status =
                    Number(order.filledAmount) === 0
                        ? 'Killed'
                        : 'Partially Filled & Killed';
            }
            break;
        case 'Cancelled':
            status =
                Number(order.filledAmount) === 0
                    ? 'Cancelled'
                    : 'Partially Filled & Cancelled';
            break;
        default:
            status = order.status;
    }
    return status;
};
