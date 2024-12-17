import type { Meta, StoryFn } from '@storybook/react';
import { Amount, CurrencySymbol } from 'src/utils';
import { AmountCard } from './AmountCard';

export default {
    title: 'Molecules/AmountCard',
    component: AmountCard,
    args: {
        amount: new Amount('5000000000000000000000', CurrencySymbol.WFIL),
        price: 8.3,
    },
} as Meta<typeof AmountCard>;

const Template: StoryFn<typeof AmountCard> = args => <AmountCard {...args} />;

export const Default = Template.bind({});
