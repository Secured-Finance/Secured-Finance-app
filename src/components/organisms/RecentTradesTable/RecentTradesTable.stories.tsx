import { RESPONSIVE_PARAMETERS, VIEWPORTS } from '.storybook/constants';
import type { Meta, StoryFn } from '@storybook/react';
import { dec22Fixture } from 'src/stories/mocks/fixtures';
import { mockRecentTrades } from 'src/stories/mocks/queries';
import { CurrencySymbol } from 'src/utils';
import { RecentTradesTable } from './RecentTradesTable';

export default {
    title: 'Organism/RecentTradesTable',
    component: RecentTradesTable,
    args: {
        currency: CurrencySymbol.USDC,
        maturity: dec22Fixture.toNumber(),
    },
    parameters: {
        ...RESPONSIVE_PARAMETERS,
        apolloClient: {
            mocks: mockRecentTrades,
        },
        chromatic: {
            viewports: [VIEWPORTS.MOBILE, VIEWPORTS.TABLET],
        },
        connected: true,
    },
} as Meta<typeof RecentTradesTable>;

const Template: StoryFn<typeof RecentTradesTable> = args => {
    return (
        <div className='w-[300px]'>
            <RecentTradesTable {...args} />
        </div>
    );
};

export const Default = Template.bind({});

export const Empty = Template.bind({});
Empty.args = {
    currency: CurrencySymbol.WBTC,
    maturity: dec22Fixture.toNumber(),
};
