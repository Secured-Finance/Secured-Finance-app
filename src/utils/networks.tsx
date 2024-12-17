import Arbitrum from 'src/assets/icons/arbitrum-network.svg';
import Avalanche from 'src/assets/icons/avalanche-network.svg';
import Ethereum from 'src/assets/icons/ethereum-network.svg';
import Filecoin from 'src/assets/icons/filecoin-network.svg';
import Polygon from 'src/assets/icons/polygon-network.svg';
import { isProdEnv } from 'src/utils';
import {
    Chain,
    arbitrum,
    arbitrumSepolia,
    avalanche,
    avalancheFuji,
    filecoin,
    filecoinCalibration,
    mainnet,
    polygonZkEvm,
    sepolia,
} from 'viem/chains';

type ChainInformation = {
    chain: Chain;
    icon: React.ReactNode;
};

// it is important to keep sepolia as first chain in this list
// arbitrumSepolia used as a temporary first chain
const testnetNetworks: Chain[] = [
    arbitrumSepolia,
    sepolia,
    avalancheFuji,
    filecoinCalibration,
];

// it is important to keep mainnet as first chain in this list
// arbitrum used as a temporary first chain
const mainnetNetworks: Chain[] = [
    arbitrum,
    mainnet,
    avalanche,
    polygonZkEvm,
    filecoin,
];

export const getSupportedNetworks = () => {
    return isProdEnv()
        ? mainnetNetworks.concat(testnetNetworks)
        : testnetNetworks;
};

export const SupportedChainsList: ChainInformation[] = [
    {
        chain: arbitrum,
        icon: (
            <Arbitrum className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
    {
        chain: mainnet,
        icon: (
            <Ethereum className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
    {
        chain: avalanche,
        icon: (
            <Avalanche className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
    {
        chain: polygonZkEvm,
        icon: (
            <Polygon className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
    {
        chain: arbitrumSepolia,
        icon: (
            <Arbitrum className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
    {
        chain: sepolia,
        icon: (
            <Ethereum className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
    {
        chain: avalancheFuji,
        icon: (
            <Avalanche className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
    {
        chain: filecoin,
        icon: (
            <Filecoin className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
    {
        chain: filecoinCalibration,
        icon: (
            <Filecoin className='h-4 w-4 rounded-full tablet:h-5 tablet:w-5' />
        ),
    },
];
