import { MultiCurveChart } from 'src/components/organisms/MultiCurveChart';
import { baseContracts, useCurrencies, useLendingMarkets } from 'src/hooks';
import { CurrencySymbol, LoanValue, Rate } from 'src/utils';

export const GlobalItayoseMultiCurveChart = () => {
    const curves: Record<string, Rate[]> = {};
    const { data: lendingContracts = baseContracts } = useLendingMarkets();
    const { data: currencies } = useCurrencies();

    const defaultCurrency =
        currencies && currencies.length > 0
            ? currencies[0]
            : CurrencySymbol.USDC;

    currencies?.forEach(ccy => {
        Object.keys(lendingContracts[ccy]).forEach(maturity => {
            const contract = lendingContracts[ccy][Number(maturity)];
            if (contract.isItayosePeriod || contract.isPreOrderPeriod) {
                if (ccy in curves) {
                    curves[ccy].push(
                        LoanValue.fromPrice(
                            contract.openingUnitPrice,
                            contract.maturity
                        ).apr
                    );
                } else {
                    curves[ccy] = [
                        LoanValue.fromPrice(
                            contract.openingUnitPrice,
                            contract.maturity
                        ).apr,
                    ];
                }
            }
        });
    });

    return (
        <div className='w-full'>
            <MultiCurveChart
                title='Yield Curve'
                curves={curves}
                labels={Object.values(lendingContracts[defaultCurrency])
                    .filter(o => o.isPreOrderPeriod || o.isItayosePeriod)
                    .map(o => o.name)}
                isGlobalItayose={true}
            />
        </div>
    );
};
