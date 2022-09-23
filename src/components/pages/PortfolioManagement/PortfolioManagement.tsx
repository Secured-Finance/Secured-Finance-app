import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    AssetDisclosureProps,
    PortfolioManagementTable,
    TradeHistoryTab,
} from 'src/components/molecules';
import {
    ActiveTrade,
    ActiveTradeTable,
    CollateralOrganism,
    ConnectWalletCard,
    MyWalletCard,
} from 'src/components/organisms';
import { useTradeHistory } from 'src/hooks';
import { getPriceMap } from 'src/store/assetPrices/selectors';
import { selectEthereumBalance } from 'src/store/ethereumWallet';
import { RootState } from 'src/store/types';
import {
    computeNetValue,
    computeWeightedAverageRate,
    convertTradeHistoryToTableData,
    CurrencySymbol,
    generateWalletInformation,
    usdFormat,
    WalletSource,
} from 'src/utils';
import { useWallet } from 'use-wallet';

export const PortfolioManagement = () => {
    const { account } = useWallet();
    const tradeHistory = useTradeHistory(account ?? '');

    const balance = useSelector((state: RootState) =>
        selectEthereumBalance(state)
    );

    const priceMap = useSelector((state: RootState) => getPriceMap(state));

    const addressRecord = useMemo(() => {
        return {
            [WalletSource.METAMASK]: account ?? '',
        };
    }, [account]);

    const balanceRecord = useMemo(() => {
        return {
            [CurrencySymbol.ETH]: balance,
        };
    }, [balance]);

    const assetMap: AssetDisclosureProps[] = useMemo(
        () => generateWalletInformation(addressRecord, balanceRecord),
        [addressRecord, balanceRecord]
    );

    const activeTrades: Array<ActiveTrade> = [];
    tradeHistory.forEach(trade => {
        return activeTrades.push(convertTradeHistoryToTableData(trade));
    });

    return (
        <div
            className='mx-40 mt-7 flex flex-col gap-6'
            data-cy='portfolio-management'
        >
            <div className='typography-portfolio-heading w-fit items-center text-white'>
                Portfolio Management
            </div>
            <div className='flex flex-row justify-between gap-6 pt-4'>
                <div className='flex min-w-[800px] flex-grow flex-col gap-6'>
                    <PortfolioManagementTable
                        values={[
                            usdFormat(computeNetValue(tradeHistory, priceMap)),
                            computeWeightedAverageRate(
                                tradeHistory
                            ).toPercent(),
                            tradeHistory.length.toString(),
                            '0',
                        ]}
                    />
                    <CollateralOrganism />
                </div>
                <div className='w-[350px]'>
                    {account ? (
                        <MyWalletCard assetMap={assetMap} />
                    ) : (
                        <ConnectWalletCard />
                    )}
                </div>
            </div>
            <div>
                <TradeHistoryTab
                    tabTitles={['Active Contracts', 'Trade History']}
                >
                    <ActiveTradeTable data={activeTrades} />
                    <div className='px-12 text-white'>Soon</div>
                </TradeHistoryTab>
            </div>
        </div>
    );
};
