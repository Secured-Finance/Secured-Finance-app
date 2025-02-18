import { CurrencySymbol } from 'src/utils';

export type RecentTradesTableProps = {
    currency: CurrencySymbol;
    maturity: number;
};

export type TradeMetadata = {
    side: number;
    size: string;
    executionPrice: string;
    amount: string;
    createdAt: string;
    txHash: string;
    currency: CurrencySymbol;
    maturity: number;
};
