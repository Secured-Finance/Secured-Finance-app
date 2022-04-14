import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWallet } from 'use-wallet';
import { RootState } from '../store/types';
import {
    failSetBorrowingHistory,
    failSetLendingHistory,
    setBorrowingHistory,
    setLendingHistory,
    startSetHistory,
} from '../store/history';
import {
    useBorrowingDeals,
    useLendingDeals,
    useLoanInfo,
} from '@secured-finance/sf-graph-client';
import { HistoryTableData } from 'src/store/history/types';

export const useLoanDeals = (skip = 0) => {
    const { account } = useWallet();
    const lendingHistory = useSelector(
        (state: RootState) => state.history.lendingHistory
    );
    const dispatch = useDispatch();

    dispatch(startSetHistory());
    try {
        const res = useLendingDeals(account ? account : '', skip);
        if (res.length > 0) {
            dispatch(setLendingHistory(res));
        }
    } catch (err) {
        dispatch(failSetLendingHistory());
        console.log(err);
    }

    return lendingHistory;
};

export const useBorrowDeals = (skip = 0) => {
    const { account } = useWallet();
    const borrowingHistory = useSelector(
        (state: RootState) => state.history.borrowingHistory
    );
    const dispatch = useDispatch();

    dispatch(startSetHistory());
    try {
        const res = useBorrowingDeals(account, skip) as HistoryTableData[];
        if (res.length > 0) {
            dispatch(setBorrowingHistory(res));
        }
    } catch (err) {
        dispatch(failSetBorrowingHistory());
        console.log(err);
    }

    return borrowingHistory;
};

export const useLoanInformation = (id: string) => {
    const [loanInfo, setLoanInfo] = useState(null);
    const loan = useLoanInfo(id) as any;

    useMemo(() => {
        if (loan) {
            setLoanInfo(loan);
        }
    }, [loan]);

    return loanInfo;
};
