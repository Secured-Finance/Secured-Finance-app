import { useMemo } from 'react';
import { ContractMap, LendingMarket } from 'src/hooks/useLendingMarkets';
import { Maturity } from 'src/utils';

const passThrough = () => true;
const emptyOption = {
    label: '',
    value: new Maturity(0),
};

function deduplicate<T>(array: T[], getKey: (item: T) => string | number) {
    const seenItems: Record<string, boolean> = {};
    return array.filter(item => {
        const key = getKey(item);
        if (seenItems[key]) {
            return false;
        }
        seenItems[key] = true;
        return true;
    });
}

export const useMaturityOptions = (
    lendingMarkets: ContractMap,
    filterFn: (market: LendingMarket) => unknown = passThrough
) => {
    return useMemo(() => {
        const optionList = Object.entries(lendingMarkets)
            .filter(o => filterFn(o[1]))
            .map(o => ({
                label: o[1].name,
                value: new Maturity(o[1].maturity),
            }));
        return optionList.length
            ? deduplicate(optionList, o => o.value.toNumber())
            : [emptyOption];
    }, [filterFn, lendingMarkets]);
};
