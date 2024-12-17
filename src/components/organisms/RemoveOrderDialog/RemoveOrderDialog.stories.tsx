import { RESPONSIVE_PARAMETERS, VIEWPORTS } from '.storybook/constants';
import { withWalletProvider } from '.storybook/decorators';
import { OrderSide } from '@secured-finance/sf-client';
import type { Meta, StoryFn } from '@storybook/react';
import { dec22Fixture } from 'src/stories/mocks/fixtures';
import { Amount, CurrencySymbol } from 'src/utils';
import { RemoveOrderDialog } from './RemoveOrderDialog';

export default {
    title: 'Organism/RemoveOrderDialog',
    component: RemoveOrderDialog,
    args: {
        isOpen: true,
        onClose: () => {},
        orderId: BigInt(1234),
        maturity: dec22Fixture,
        amount: new Amount('100000000000000000000', CurrencySymbol.WFIL),
        side: OrderSide.BORROW,
        orderUnitPrice: 9814,
    },
    decorators: [withWalletProvider],
    parameters: {
        ...RESPONSIVE_PARAMETERS,
        chromatic: {
            viewports: [VIEWPORTS.MOBILE, VIEWPORTS.TABLET],
        },
        connected: true,
    },
} as Meta<typeof RemoveOrderDialog>;

const Template: StoryFn<typeof RemoveOrderDialog> = args => (
    <RemoveOrderDialog {...args} />
);

export const Default = Template.bind({});
