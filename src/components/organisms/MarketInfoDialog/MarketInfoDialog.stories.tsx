import { RESPONSIVE_PARAMETERS, VIEWPORTS } from '.storybook/constants';
import type { Meta } from '@storybook/react';
import { StoryFn } from '@storybook/react';
import { dailyMarketStats, maturityOptions } from 'src/stories/mocks/fixtures';
import { CurrencySymbol, LoanValue } from 'src/utils';
import { MarketInfoDialog } from './MarketInfoDialog';

const lastTradePrice = 8000;

export default {
    title: 'Organism/MarketInfoDialog',
    component: MarketInfoDialog,
    args: {
        isOpen: true,
        onClose: () => {},
        currency: CurrencySymbol.WFIL,
        currentMarket: {
            value: LoanValue.fromPrice(
                9600,
                maturityOptions[0].value.toNumber()
            ),
            time: 1646920200,
            type: 'block',
        },
        currencyPrice: '20',
        marketInfo: dailyMarketStats,
        lastLoanValue: LoanValue.fromPrice(
            lastTradePrice,
            maturityOptions[0].value.toNumber()
        ),
    },
    parameters: {
        ...RESPONSIVE_PARAMETERS,
        chromatic: {
            viewports: [VIEWPORTS.MOBILE, VIEWPORTS.TABLET],
        },
    },
} as Meta<typeof MarketInfoDialog>;

const Template: StoryFn<typeof MarketInfoDialog> = args => {
    return <MarketInfoDialog {...args} />;
};

export const Default = Template.bind({});
