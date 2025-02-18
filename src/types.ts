import { OrderSide, WalletSource } from '@secured-finance/sf-client';
import queries from '@secured-finance/sf-graph-client/dist/graphclients';
import { Option } from 'src/components/atoms';
import { LoanValue, Maturity } from 'src/utils/entities';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';
import { CurrencySymbol } from './utils';

export type SvgIcon = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
        title?: string;
        titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
>;

export type MaturityOptionList = Option<Maturity>[];

export type PlaceOrderFunction = (
    ccy: CurrencySymbol,
    maturity: Maturity,
    side: OrderSide,
    amount: bigint,
    unitPrice: number,
    sourceWallet: WalletSource
) => Promise<Hex | undefined>;

type UserOrderHistoryQuery = Awaited<
    ReturnType<
        Awaited<ReturnType<typeof queries.getBuiltGraphSDK>['UserOrderHistory']>
    >
>;

type UserTransactionHistoryQuery = Awaited<
    ReturnType<
        Awaited<
            ReturnType<
                typeof queries.getBuiltGraphSDK
            >['UserTransactionHistory']
        >
    >
>;
type DailyVolumesQuery = Awaited<
    ReturnType<
        Awaited<ReturnType<typeof queries.getBuiltGraphSDK>['DailyVolumes']>
    >
>;

type TransactionsQuery = Awaited<
    ReturnType<
        Awaited<
            ReturnType<typeof queries.getBuiltGraphSDK>['TransactionHistory']
        >
    >
>;

export type OrderHistoryList = NonNullable<
    UserOrderHistoryQuery['user']
>['orders'];
export type Order = OrderHistoryList[0];
export type TransactionHistoryList = NonNullable<
    UserTransactionHistoryQuery['user']
>['transactions'];
export type Transaction = TransactionHistoryList[0];
export type DailyVolumes = DailyVolumesQuery['dailyVolumes'];
export type TransactionList = TransactionsQuery['transactionHistory'];

export interface ColorFormat {
    color?: 'neutral' | 'positive' | 'negative' | 'disabled' | 'warning';
}

export type Alignment = 'left' | 'center' | 'right' | 'top' | 'top-right';

export type IndexOf<T extends unknown[]> = Exclude<
    keyof T,
    keyof unknown[]
> extends `${infer I extends number}`
    ? I
    : never;

export type MarketPhase = 'Closed' | 'PreOrder' | 'Itayose' | 'Open';

export enum OrderType {
    MARKET = 'Market',
    LIMIT = 'Limit',
}

export const OrderTypeOptions = [OrderType.MARKET, OrderType.LIMIT];

export const OrderSideMap = Object.freeze({
    [OrderSide.LEND]: 'Lend',
    [OrderSide.BORROW]: 'Borrow',
});

export type Wallet = 'MetaMask' | 'WalletConnect';

export type UserAccount = ReturnType<typeof useAccount>['address'];
export type AssetPriceMap = Record<CurrencySymbol, number>;

export enum HistoricalDataIntervals {
    '5M' = '300',
    '15M' = '900',
    '30M' = '1800',
    '1H' = '3600',
    '4H' = '14400',
    '1D' = '86400',
    '3D' = '259200',
    '1W' = '604800',
    '1MTH' = '2592000',
}

export type CurrentMarket = {
    value: LoanValue;
    time: number;
    type: 'opening' | 'block';
};
export interface SavedMarket {
    market: string;
    address: `0x${string}` | undefined;
    chainId?: number;
}

export type DailyMarketInfo = {
    high: string;
    low: string;
    volume: string;
    volumeInUSD: string;
};

export type LastPricePerMarket = Record<
    string,
    {
        price: number;
        timestamp: number;
    }
>;
