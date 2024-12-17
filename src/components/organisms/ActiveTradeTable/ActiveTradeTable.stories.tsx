import { RESPONSIVE_PARAMETERS, VIEWPORTS } from '.storybook/constants';
import type { Meta, StoryFn } from '@storybook/react';
import { withWalletProvider } from 'src/../.storybook/decorators';
import { defaultDelistedStatusSet } from 'src/hooks';
import {
    dec22Fixture,
    positions,
    usdcBytes32,
    wfilBytes32,
} from 'src/stories/mocks/fixtures';
import { CurrencySymbol, Maturity, getTimestampRelativeToNow } from 'src/utils';
import { ActiveTradeTable } from './ActiveTradeTable';

export default {
    title: 'Organism/ActiveTradeTable',
    component: ActiveTradeTable,
    args: {
        data: positions,
        delistedCurrencySet: defaultDelistedStatusSet,
        variant: 'compact',
    },
    parameters: {
        ...RESPONSIVE_PARAMETERS,
        chromatic: {
            viewports: [VIEWPORTS.MOBILE, VIEWPORTS.TABLET],
        },
    },
    decorators: [withWalletProvider],
} as Meta<typeof ActiveTradeTable>;

const Template: StoryFn<typeof ActiveTradeTable> = args => {
    args.data = [
        ...args.data,
        {
            amount: BigInt('500000000000000000000'),
            currency: wfilBytes32,
            futureValue: BigInt('500000000000000000000'),
            maturity: new Maturity(
                getTimestampRelativeToNow(22, true)
            ).toString(),
            marketPrice: BigInt(10000),
        },
        {
            amount: BigInt('500000000000000000000'),
            currency: wfilBytes32,
            futureValue: BigInt('500000000000000000000'),
            maturity: new Maturity(
                getTimestampRelativeToNow(28, true)
            ).toString(),
            marketPrice: BigInt(10000),
        },
        {
            amount: BigInt('-500000000000000000000'),
            currency: wfilBytes32,
            futureValue: BigInt('-500000000000000000000'),
            maturity: new Maturity(getTimestampRelativeToNow(120)).toString(),
            marketPrice: BigInt(10000),
        },
        {
            amount: BigInt('-500000000000000000000'),
            currency: wfilBytes32,
            futureValue: BigInt('-500000000000000000000'),
            maturity: new Maturity(getTimestampRelativeToNow(200)).toString(),
            marketPrice: BigInt(10000),
        },
        {
            amount: BigInt('500000000000000000000'),
            currency: wfilBytes32,
            futureValue: BigInt('500000000000000000000'),
            maturity: new Maturity(getTimestampRelativeToNow(160)).toString(),
            marketPrice: BigInt(10000),
        },
        {
            amount: BigInt('500000000000000000000'),
            currency: wfilBytes32,
            futureValue: BigInt('500000000000000000000'),
            maturity: new Maturity(getTimestampRelativeToNow(200)).toString(),
            marketPrice: BigInt(10000),
        },
    ];

    return <ActiveTradeTable {...args} />;
};

export const Default = Template.bind({});

export const Delisted = Template.bind({});
Delisted.args = {
    delistedCurrencySet: new Set([CurrencySymbol.WFIL]),
    height: 700,
};

export const UnderMinimumCollateralThreshold = Template.bind({});
UnderMinimumCollateralThreshold.args = {
    data: [
        {
            amount: BigInt('-500000000'),
            currency: usdcBytes32,
            futureValue: BigInt('-50000000'),
            maturity: dec22Fixture.toString(),
            marketPrice: BigInt(5000),
            underMinimalCollateral: true,
        },
        ...positions,
    ],
};
