import { ComponentMeta, ComponentStory } from '@storybook/react';
import { MarketDashboardTable } from './MarketDashboardTable';

export default {
    title: 'Molecules/MarketDashboardTable',
    component: MarketDashboardTable,
    args: {
        values: [
            {
                name: 'Digital Assets',
                value: '4',
                orientation: 'center',
            },
            {
                name: 'Total Value Locked',
                value: '1.2B',
                orientation: 'center',
            },
            {
                name: 'Total Volume',
                value: '356M',
                orientation: 'center',
            },
            {
                name: 'Total Users',
                value: '900K',
                orientation: 'center',
            },
        ],
    },
} as ComponentMeta<typeof MarketDashboardTable>;

const Template: ComponentStory<typeof MarketDashboardTable> = args => (
    <MarketDashboardTable {...args} />
);

export const Default = Template.bind({});

export const NoWalletConnected = Template.bind({});
NoWalletConnected.args = {
    values: [],
};
