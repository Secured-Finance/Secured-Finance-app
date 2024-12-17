import { CurrentMarket, DailyMarketInfo } from 'src/types';
import { CurrencySymbol, LoanValue } from 'src/utils';

export interface MarketInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currency: CurrencySymbol;
    currentMarket?: CurrentMarket;
    currencyPrice: string;
    marketInfo?: DailyMarketInfo;
    lastLoanValue?: LoanValue;
}
