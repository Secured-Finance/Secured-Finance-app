import { RESPONSIVE_PARAMETERS, VIEWPORTS } from '.storybook/constants';
import { withAssetPrice, withWalletProvider } from '.storybook/decorators';
import { OrderSide } from '@secured-finance/sf-client';
import type { Meta, StoryFn } from '@storybook/react';
import { dec22Fixture } from 'src/stories/mocks/fixtures';
import { CurrencySymbol } from 'src/utils';
import { Amount } from 'src/utils/entities';
import { CancelOrderDialog } from './CancelOrderDialog';

export default {
    title: 'Organism/CancelOrderDialog',
    component: CancelOrderDialog,
    args: {
        isOpen: true,
        onClose: () => {},
        orderId: BigInt(1234),
        maturity: dec22Fixture,
        amount: new Amount('100000000000000000000', CurrencySymbol.WFIL),
        side: OrderSide.BORROW,
        orderUnitPrice: 9814,
    },
    decorators: [withAssetPrice, withWalletProvider],
    parameters: {
        ...RESPONSIVE_PARAMETERS,
        chromatic: {
            viewports: [VIEWPORTS.MOBILE, VIEWPORTS.TABLET],
        },
        connected: true,
    },
} as Meta<typeof CancelOrderDialog>;

const Template: StoryFn<typeof CancelOrderDialog> = args => (
    <CancelOrderDialog {...args} />
);

export const Default = Template.bind({});
