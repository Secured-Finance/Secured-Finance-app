import queries from '@secured-finance/sf-graph-client/dist/graphclients';
import { useSelector } from 'react-redux';
import { HorizontalTab, StatsBar } from 'src/components/molecules';
import {
    ActiveTradeTable,
    CollateralOrganism,
    ConnectWalletCard,
    MyTransactionsTable,
    MyWalletCard,
    OrderHistoryTable,
    WalletDialog,
} from 'src/components/organisms';
import { Page, TwoColumns } from 'src/components/templates';
import { useCollateralBook, useGraphClientHook } from 'src/hooks';
import { getPriceMap } from 'src/store/assetPrices/selectors';
import { RootState } from 'src/store/types';
import {
    WalletSource,
    aggregateTrades,
    computeNetValue,
    usdFormat,
} from 'src/utils';
import { useWallet } from 'use-wallet';

export const PortfolioManagement = () => {
    const { account } = useWallet();
    const userHistory = useGraphClientHook(
        { address: account?.toLowerCase() ?? '' },
        queries.UserHistoryDocument,
        'user'
    );

    const tradeHistory = userHistory.data?.transactions ?? [];
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
                    <StatsBar
                        testid='portfolio-management'
                        values={[
                            {
                                name: 'Net Asset Value',
                                value: usdFormat(
                                    borrowedPV +
                                        lentPV +
                                        collateralBook.usdCollateral
                                ),
                            },
                            {
                                name: 'Active Contracts',
                                value: tradeHistory.length.toString(),
                            },
                            {
                                name: 'Lending PV',
                                value: usdFormat(lentPV),
                            },
                            {
                                name: 'Borrowing PV',
                                value: usdFormat(borrowedPV),
                            },
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
                        'My Transactions',
                    ]}
                >
                    <ActiveTradeTable data={aggregateTrades(tradeHistory)} />
                    <OrderHistoryTable data={orderHistory} />
                    <MyTransactionsTable data={tradeHistory} />
                </HorizontalTab>
            </div>
            <WalletDialog />
        </Page>
    );
};
