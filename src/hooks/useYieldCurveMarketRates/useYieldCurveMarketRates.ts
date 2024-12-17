import { useSelector } from 'react-redux';
import { MaturityListItem } from 'src/components/organisms';
import { selectLandingOrderForm } from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import { LoanValue, Rate, isMaturityPastDays } from 'src/utils';
import { baseContracts, useLendingMarkets } from '../useLendingMarkets';

export const useYieldCurveMarketRates = () => {
    const { currency } = useSelector((state: RootState) =>
        selectLandingOrderForm(state.landingOrderForm)
    );

    const { data: lendingMarkets = baseContracts } = useLendingMarkets();
    const lendingContracts = lendingMarkets[currency];

    const rates: Rate[] = [];
    const maturityList: MaturityListItem[] = [];
    const itayoseMarketIndexSet = new Set<number>();
    let currentIndex = 0;
    let maximumRate = 0;
    let marketCloseToMaturityOriginalRate = 0;
    let isFirstMarketCloseToMaturity = true;

    const sortedLendingContracts = Object.values(lendingContracts)
        .filter(
            obj => obj.isOpened || obj.isItayosePeriod || obj.isPreOrderPeriod
        )
        .sort((a, b) => a.maturity - b.maturity);

    if (isMaturityPastDays(sortedLendingContracts[0]?.maturity, 7, true)) {
        isFirstMarketCloseToMaturity = false;
        maximumRate = Number.MAX_VALUE;
    }

    sortedLendingContracts.forEach(obj => {
        maturityList.push({
            label: obj.name,
            maturity: obj.maturity,
            isPreOrderPeriod: obj.isPreOrderPeriod || obj.isItayosePeriod,
        });

        let rate: Rate;

        if (obj.isItayosePeriod || obj.isPreOrderPeriod) {
            rate = LoanValue.fromPrice(
                obj.openingUnitPrice,
                obj.maturity,
                obj.utcOpeningDate
            ).apr;

            itayoseMarketIndexSet.add(currentIndex);
        } else {
            rate = LoanValue.fromPrice(obj.marketUnitPrice, obj.maturity).apr;
        }

        rates.push(rate);

        if (isFirstMarketCloseToMaturity) {
            if (isMaturityPastDays(obj.maturity, 7, true)) {
                maximumRate = Math.max(maximumRate, rate.toNumber());
            } else {
                marketCloseToMaturityOriginalRate = rate.toNumber();
            }
        }

        currentIndex += 1;
    });

    if (rates[0]?.toNumber() > maximumRate && maximumRate > 0) {
        rates[0] = new Rate(maximumRate * 1.25);
    }

    /*
    In case, the first market is going to mature within a week, we don't want to show the original price on the chart
    since the curve won't look good. We replace the first market's price with a price higher than the highest market
    price on the chart to create a more consistent curve.

    The maximum value of y-scale and the first market's price are calculated relative to the maximum rate to achieve
    a decent looking curve. 1.25(for market rate) and 1.2(for scale) are magic numbers chosen to create the most
    pleasing curve.
    */

    return {
        rates,
        maturityList,
        itayoseMarketIndexSet,
        maximumRate: maximumRate,
        marketCloseToMaturityOriginalRate,
    };
};
