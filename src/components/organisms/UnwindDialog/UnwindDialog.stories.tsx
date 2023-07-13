import { RESPONSIVE_PARAMETERS, VIEWPORTS } from '.storybook/constants';
import {
    withAssetPrice,
    withMaturities,
    withWalletProvider,
} from '.storybook/decorators';
import { OrderSide } from '@secured-finance/sf-client';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BigNumber } from 'ethers';
import { dec22Fixture } from 'src/stories/mocks/fixtures';
import { CurrencySymbol } from 'src/utils';
import { Amount } from 'src/utils/entities';
import { UnwindDialog } from './UnwindDialog';
export default {
    title: 'Organism/UnwindDialog',
    component: UnwindDialog,
    args: {
        isOpen: true,
        onClose: () => {},
        maturity: dec22Fixture,
        amount: new Amount(
            BigNumber.from('100000000000000000000'),
            CurrencySymbol.WFIL
        ),
        side: OrderSide.BORROW,
    },
    decorators: [withAssetPrice, withWalletProvider, withMaturities],
    parameters: {
        ...RESPONSIVE_PARAMETERS,
        chromatic: {
            viewports: [VIEWPORTS.MOBILE, VIEWPORTS.TABLET],
        },
        connected: true,
    },
} as ComponentMeta<typeof UnwindDialog>;

const Template: ComponentStory<typeof UnwindDialog> = args => (
    <UnwindDialog {...args} />
);

export const Default = Template.bind({});
