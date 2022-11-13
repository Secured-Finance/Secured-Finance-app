import { ComponentMeta, ComponentStory } from '@storybook/react';
import { CurrencySymbol } from 'src/utils';
import { OrderInputBox } from '.';

export default {
    title: 'Atoms/OrderInputBox',
    component: OrderInputBox,
    args: {
        field: 'Fixed Rate',
        unit: '%',
    },
} as ComponentMeta<typeof OrderInputBox>;

const Template: ComponentStory<typeof OrderInputBox> = args => (
    <OrderInputBox {...args} />
);

export const Default = Template.bind({});

export const Amount = Template.bind({});
Amount.args = {
    field: 'Amount',
    unit: 'FIL',
    asset: CurrencySymbol.FIL,
};

export const LimitPrice = Template.bind({});
LimitPrice.args = {
    field: 'Limit Price',
    unit: 'ETH',
    asset: CurrencySymbol.ETH,
};

export const Total = Template.bind({});
Total.args = {
    field: 'Total',
    unit: 'USD',
};
