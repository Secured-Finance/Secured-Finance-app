import { withWalletProvider } from '.storybook/decorators';
import type { Meta, StoryFn } from '@storybook/react';
import { collateralBook37 } from 'src/stories/mocks/fixtures';
import { CurrencySymbol } from 'src/utils';
import { Amount } from 'src/utils/entities';
import { CollateralSimulationSection } from './CollateralSimulationSection';

export default {
    title: 'Organism/CollateralSimulationSection',
    component: CollateralSimulationSection,
    decorators: [withWalletProvider],
    args: {
        collateral: collateralBook37,
        tradeAmount: new Amount('50000000000000000000', CurrencySymbol.WFIL),
        assetPrice: 10,
    },
    parameters: {
        connected: true,
    },
} as Meta<typeof CollateralSimulationSection>;

const Template: StoryFn<typeof CollateralSimulationSection> = args => (
    <CollateralSimulationSection {...args} />
);

export const Trade = Template.bind({});
