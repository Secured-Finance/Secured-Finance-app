import { toBytes32 } from '@secured-finance/sf-graph-client';
import { useMemo } from 'react';
import {
    LendingMarket,
    baseContracts,
    useCurrencies,
    useLendingMarkets,
} from 'src/hooks';
import { CurrencySymbol } from 'src/utils';

export const useMarketLists = () => {
    const { data: lendingContracts = baseContracts } = useLendingMarkets();
    const { data: currencies = [] } = useCurrencies();

    const marketLists = useMemo(() => {
        const openMarkets: Market[] = [];
        const itayoseMarkets: Market[] = [];

        for (const ccy of currencies) {
            for (const maturity of Object.keys(lendingContracts[ccy])) {
                const contract = lendingContracts[ccy][Number(maturity)];
                if (contract.isMatured) continue;

                const isItayoseOrPreOrder =
                    contract.isItayosePeriod || contract.isPreOrderPeriod;

                const market = {
                    ...contract,
                    ccy: ccy,
                    currency: toBytes32(ccy),
                };

                if (isItayoseOrPreOrder) {
                    itayoseMarkets.push(market);
                } else if (contract.isOpened) {
                    openMarkets.push(market);
                }
            }
        }

        return { openMarkets, itayoseMarkets };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(lendingContracts)]);

    return marketLists;
};

export type Market = LendingMarket & {
    currency: string;
    ccy: CurrencySymbol;
};
