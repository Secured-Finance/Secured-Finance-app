import type { Meta, StoryFn } from '@storybook/react';
import { dec22Fixture } from 'src/stories/mocks/fixtures';
import { LoanValue } from 'src/utils';
import { PriceYieldItem } from './PriceYieldItem';

export default {
    title: 'Atoms/PriceYieldItem',
    component: PriceYieldItem,
    args: {
        loanValue: LoanValue.fromPrice(9800, dec22Fixture.toNumber()),
        align: 'left',
    },
    argTypes: {
        align: {
            control: {
                type: 'select',
                options: ['left', 'right', 'center'],
            },
        },
    },
} as Meta<typeof PriceYieldItem>;

const Template: StoryFn<typeof PriceYieldItem> = args => (
    <PriceYieldItem {...args} />
);

export const Default = Template.bind({});
export const Compact = Template.bind({});
Compact.args = {
    compact: true,
};
