import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ReactComponent as EthIcon } from 'src/assets/coins/eth2.svg';
import { ReactComponent as FilecoinIcon } from 'src/assets/coins/fil.svg';
import { ReactComponent as UsdcIcon } from 'src/assets/coins/usdc.svg';
import { ReactComponent as UsdtIcon } from 'src/assets/coins/usdt.svg';
import { ReactComponent as BitcoinIcon } from 'src/assets/coins/xbc.svg';
import { Option } from 'src/components/atoms/DropdownSelector/DropdownSelector';
import { AssetSelector } from './AssetSelector';

const options = [
    {
        name: 'Bitcoin',
        Icon: BitcoinIcon,
    },
    {
        name: 'Ethereum',
        Icon: EthIcon,
    },
    {
        name: 'Filecoin',
        Icon: FilecoinIcon,
    },
    {
        name: 'USDC',
        Icon: UsdcIcon,
    },
    {
        name: 'USD Tether',
        Icon: UsdtIcon,
    },
] as Array<Option>;

const shortNames: Record<string, string> = {
    Bitcoin: 'BTC',
    Ethereum: 'ETH',
    Filecoin: 'FIL',
    USDC: 'USDC',
    'USD Tether': 'USDT',
};

const priceList: Record<string, number> = {
    Bitcoin: 20515,
    Ethereum: 1012,
    Filecoin: 4.85,
    USDC: 1.0,
    'USD Tether': 0.99,
};

export default {
    title: 'Molecules/AssetSelector',
    component: AssetSelector,
    args: {
        options,
        transform: (v: string) => shortNames[v],
        priceList,
    },
    parameters: {
        chromatic: { disableSnapshot: false },
    },
} as ComponentMeta<typeof AssetSelector>;

const Template: ComponentStory<typeof AssetSelector> = args => (
    <AssetSelector {...args} />
);

export const Default = Template.bind({});
