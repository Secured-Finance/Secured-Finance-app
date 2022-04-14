import { utils } from '@secured-finance/sf-client';
import { client } from '@secured-finance/sf-graph-client';
import { useCallback, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import {
    OPEN_LOANS,
    OPEN_ORDERS,
    TRADE_HISTORY,
} from '../services/apollo/userQueries';

export const useOpenOrders = (ccy: string, term: string) => {
    const { account, chainId }: { account: string; chainId: number | null } =
        useWallet();
    const lendingMarketAddress = utils.getLendingMarketAddressByCcyAndTerm(
        ccy,
        term,
        chainId
    );

    const [openOrders, setOpenOrders] = useState([]);

    const fetchOpenOrders = useCallback(async () => {
        const res = await client.query({
            query: OPEN_ORDERS,
            variables: {
                account: account.toLowerCase(),
                market: lendingMarketAddress,
            },
            fetchPolicy: 'cache-first',
        });
        try {
            if (res.data.user?.openOrders) {
                setOpenOrders(res.data.user.openOrders);
            }
        } catch (err) {
            console.log(err);
        }
    }, [ccy, term, lendingMarketAddress, account]);

    useEffect(() => {
        let isMounted = true;
        if (lendingMarketAddress != null && account) {
            fetchOpenOrders();
        }
        return () => {
            isMounted = false;
        };
    }, [ccy, term, lendingMarketAddress, account]);

    return openOrders;
};

export const useTradeHistoryOrders = (ccy: string, term: string) => {
    const { account, chainId }: { account: string; chainId: number | null } =
        useWallet();
    const lendingMarketAddress = utils.getLendingMarketAddressByCcyAndTerm(
        ccy,
        term,
        chainId
    );

    const [tradeHistory, setTradeHistory] = useState([]);

    const fetchTradeHistoryOrders = useCallback(async () => {
        const res = await client.query({
            query: TRADE_HISTORY,
            variables: {
                account: account.toLowerCase(),
                market: lendingMarketAddress,
            },
            fetchPolicy: 'cache-first',
        });
        try {
            if (res.data.user?.madeOrders && res?.data.user.takenOrders) {
                const parsedHistory: Array<any> = [];

                res.data.user.madeOrders.map(function (
                    item: any,
                    index: number
                ) {
                    const counterparty = res.data.user.madeOrders[index].taker;
                    const historyItem = Object.assign(
                        {},
                        res.data.user.madeOrders[index],
                        { counterparty: counterparty }
                    );
                    parsedHistory.push(historyItem);
                });

                res.data.user.takenOrders.map(function (
                    item: any,
                    index: number
                ) {
                    const counterparty = res.data.user.takenOrders[index].maker;
                    const historyItem = Object.assign(
                        {},
                        res.data.user.takenOrders[index],
                        { counterparty: counterparty }
                    );
                    parsedHistory.push(historyItem);
                });

                parsedHistory.sort(function (x, y) {
                    return y.createdAtTimestamp - x.createdAtTimestamp;
                });

                setTradeHistory(parsedHistory);
            }
        } catch (err) {
            console.log(err);
        }
    }, [ccy, term, lendingMarketAddress, account]);

    useEffect(() => {
        let isMounted = true;
        if (lendingMarketAddress !== null && account) {
            fetchTradeHistoryOrders();
        }
        return () => {
            isMounted = false;
        };
    }, [ccy, term, lendingMarketAddress, account]);

    return tradeHistory;
};

export const useOpenLoans = (ccy: string, term: string) => {
    const { account, chainId }: { account: string; chainId: number | null } =
        useWallet();
    const lendingMarketAddress = utils.getLendingMarketAddressByCcyAndTerm(
        ccy,
        term,
        chainId
    );

    const [loans, setLoans] = useState([]);

    const fetchMadeOrders = useCallback(async () => {
        const res = await client.query({
            query: OPEN_LOANS,
            variables: {
                account: account.toLowerCase(),
                market: lendingMarketAddress,
            },
            fetchPolicy: 'cache-first',
        });

        try {
            if (res.data.user?.loans) {
                setLoans(res.data.user.loans);
            }
        } catch (err) {
            console.log(err);
        }
    }, [ccy, term, lendingMarketAddress, account]);

    useEffect(() => {
        let isMounted = true;
        if (lendingMarketAddress != null && account) {
            fetchMadeOrders();
        }
        return () => {
            isMounted = false;
        };
    }, [ccy, term, lendingMarketAddress, account]);

    return loans;
};
