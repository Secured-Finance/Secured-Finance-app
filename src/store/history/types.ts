export interface HistoryStore {
    lendingHistory: Array<HistoryTableData>;
    borrowingHistory: Array<HistoryTableData>;
    isLoading: boolean;
}

export interface HistoryTableData {
    id: string;
    lender: string;
    borrower: string;
    rate: string;
    currency: string;
    term: string;
    presentValue: string;
    notional: string;
    couponPayment: string;
    state: number;
    startTimestamp: string;
    endTimestamp: string;
}

export interface Schedule {
    amounts: any[];
    end: any;
    notices: any;
    payments: any;
    start: any;
}

export const emptyLoan: any = {
    loanId: '0',
    lender: '0x0000000000000000000000000000000000000000',
    borrower: '0x0000000000000000000000000000000000000000',
    side: '0',
    ccy: '0',
    term: '0',
    amount: '0',
    rate: '0',
    start: '1613926013',
    end: '1771606013',
    schedule: [
        ['1644252413', '1675788413', '1707324413', '1738860413', '1770396413'],
        ['1645462013', '1676998013', '1708534013', '1740070013', '1771606013'],
        ['0', '0', '0', '0', '0'],
        [false, false, false, false, false],
        [
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
        ],
    ],
    pv: '0',
    asOf: '1613926013',
    isAvailable: false,
    startTxHash: '0x0000000000000000000000000000000000000000',
    state: '0',
};
