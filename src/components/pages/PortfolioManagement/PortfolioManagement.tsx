import queries from '@secured-finance/sf-graph-client/dist/graphclients';
import { useSelector } from 'react-redux';
import {
    HorizontalTab,
    PortfolioManagementTable,
} from 'src/components/molecules';
import {
    ActiveTradeTable,
    CollateralOrganism,
    ConnectWalletCard,
    MyTransactionsTable,
    MyWalletCard,
    OrderHistoryTable,
    WalletDialog,
    OpenOrderTable,
} from 'src/components/organisms';
import { Page, TwoColumns } from 'src/components/templates';
import { useGraphClientHook } from 'src/hooks';
import { getPriceMap } from 'src/store/assetPrices/selectors';
import { RootState } from 'src/store/types';
import {
    WalletSource,
    aggregateTrades,
    computeNetValue,
    usdFormat,
} from 'src/utils';
import { useCollateralBook } from 'src/hooks';
import { useWallet } from 'use-wallet';
import { useOrderList } from 'src/hooks/useOrderList';
import { TradeHistory } from 'src/types';
import { OrderList } from 'src/hooks/useOrderList';
import { ethers } from 'ethers';

export type Trade = TradeHistory[0];

const calculateForwardValue = (
    amount: ethers.BigNumber,
    unitPrice: ethers.BigNumber
): ethers.BigNumber => {
    return amount.mul(10000).div(unitPrice);
};

const calculateAveragePrice = (
    amount: ethers.BigNumber,
    unitPrice: ethers.BigNumber
): number => {
    const filledFutureValue = calculateForwardValue(amount, unitPrice);
    const averagePrice = !filledFutureValue.isZero()
        ? amount.mul(100).div(filledFutureValue)
        : ethers.constants.Zero;
    return Number(averagePrice) / 100;
};

const formatOrders = (orders: OrderList): TradeHistory => {
    return orders?.map(order => ({
        amount: order.amount,
        side: order.side,
        orderPrice: order.unitPrice,
        createdAt: order.timestamp,
        currency: order.currency,
        maturity: order.maturity,
        forwardValue: calculateForwardValue(order.amount, order.unitPrice),
        averagePrice: calculateAveragePrice(order.amount, order.unitPrice),
    }));
};

export const PortfolioManagement = () => {
    const { account } = useWallet();
    const userHistory = useGraphClientHook(
        { address: account?.toLowerCase() ?? '' },
        queries.UserHistoryDocument,
        'user'
    );
    const orderList = useOrderList(account);

    const tradesFromCon = formatOrders(orderList.inactiveOrderList);
    const tradeFromSub = userHistory.data?.transactions ?? [];
    const tradeHistory = [...tradeFromSub, ...tradesFromCon];

    const orderHistory = userHistory.data?.orders ?? [];

    const priceMap = useSelector((state: RootState) => getPriceMap(state));

    const borrowedPV = computeNetValue(
        tradeHistory.filter(trade => trade.side === 1), // 1 = borrow
        priceMap
    );

    const lentPV = computeNetValue(
        tradeHistory.filter(trade => trade.side === 0), // 0 = lend
        priceMap
    );

    const collateralBook = useCollateralBook(account);

    return (
        <Page title='Portfolio Management' name='portfolio-management'>
            <TwoColumns>
                <div className='flex flex-col gap-6'>
                    <PortfolioManagementTable
                        values={[
                            usdFormat(
                                borrowedPV +
                                    lentPV +
                                    collateralBook.usdCollateral
                            ),
                            tradeHistory.length.toString(),
                            usdFormat(lentPV),
                            usdFormat(borrowedPV),
                        ]}
                    />
                    <CollateralOrganism collateralBook={collateralBook} />
                </div>
                {account ? (
                    <MyWalletCard
                        addressRecord={{
                            [WalletSource.METAMASK]: account,
                        }}
                    />
                ) : (
                    <ConnectWalletCard />
                )}
            </TwoColumns>
            <div>
                <HorizontalTab
                    tabTitles={[
                        'Active Positions',
                        'Open Orders',
                        'Order History',
                        'My Transactions',
                    ]}
                >
                    <ActiveTradeTable data={aggregateTrades(tradeHistory)} />
                    <OpenOrderTable data={orderList.activeOrderList} />
                    <OrderHistoryTable data={orderHistory} />
                    <MyTransactionsTable data={tradeHistory} />
                </HorizontalTab>
            </div>
            <WalletDialog />
        </Page>
    );
};
