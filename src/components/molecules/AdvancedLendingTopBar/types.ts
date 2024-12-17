import { Option } from 'src/components/atoms';
import { CurrentMarket, DailyMarketInfo } from 'src/types';
import { CurrencySymbol, Maturity } from 'src/utils';

export type AdvancedLendingTopBarProp = {
    selectedAsset: Option<CurrencySymbol>;
    assetList: Array<Option<CurrencySymbol>>;
    options: Array<Option<Maturity>>;
    selected: Option<Maturity>;
    onAssetChange: (v: CurrencySymbol) => void;
    onTermChange: (v: Maturity) => void;
    currentMarket: CurrentMarket | undefined;
    currencyPrice: string;
    marketInfo?: DailyMarketInfo;
};
