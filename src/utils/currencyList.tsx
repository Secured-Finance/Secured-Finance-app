import { FilecoinNumber } from '@glif/filecoin-number';
import { Currency as CurrencyInterface, Ether } from '@secured-finance/sf-core';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import { BigNumber } from 'ethers';
import BTCIcon from 'src/assets/coins/btc.svg';
import EthIcon from 'src/assets/coins/eth2.svg';
import FilecoinIcon from 'src/assets/coins/fil.svg';
import UsdcIcon from 'src/assets/coins/usdc.svg';
import { Option } from 'src/components/atoms';
import { Filecoin } from './currencies/filecoin';
import { USDC } from './currencies/usdc';
import { WBTC } from './currencies/wbtc';

const ETH_TO_WEI = new BigNumberJS(10 ** 18);

const ETH = Ether.onChain(
    Number(process.env.NEXT_PUBLIC_ETHEREUM_CHAIN_ID ?? 1)
);

export enum CurrencySymbol {
    ETH = 'ETH',
    FIL = 'FIL',
    USDC = 'USDC',
    WBTC = 'WBTC',
}

export const currencyMap: Readonly<
    Record<CurrencySymbol, Readonly<CurrencyInfo>>
> = {
    [CurrencySymbol.FIL]: {
        index: 0,
        icon: FilecoinIcon,
        symbol: CurrencySymbol.FIL,
        name: Filecoin.onChain().name,
        coinGeckoId: 'filecoin',
        toBaseUnit: (amount: number) => {
            const filAmount = new FilecoinNumber(amount, 'fil');
            return BigNumber.from(filAmount.toAttoFil());
        },
        toCurrency: () => Filecoin.onChain(),
    },
    [CurrencySymbol.ETH]: {
        index: 1,
        icon: EthIcon,
        symbol: CurrencySymbol.ETH,
        name: ETH.name,
        coinGeckoId: 'ethereum',
        toBaseUnit: (amount: number) => convertEthToWei(amount),
        toCurrency: () => ETH,
    },
    [CurrencySymbol.USDC]: {
        index: 2,
        symbol: CurrencySymbol.USDC,
        name: USDC.onChain().name,
        icon: UsdcIcon,
        coinGeckoId: 'usd-coin',
        toBaseUnit: (amount: number) => convertEthToWei(amount),
        toCurrency: () => USDC.onChain(),
    },
    [CurrencySymbol.WBTC]: {
        index: 3,
        symbol: CurrencySymbol.WBTC,
        name: WBTC.onChain().name,
        icon: BTCIcon,
        coinGeckoId: 'bitcoin',
        toBaseUnit: (amount: number) => convertEthToWei(amount),
        toCurrency: () => WBTC.onChain(),
    },
};

export const getCurrencyMapAsList = () => {
    return Object.values(currencyMap).sort((a, b) => a.index - b.index);
};

export const getCurrencyMapAsOptions = () => {
    return getCurrencyMapAsList().map<Option<CurrencySymbol>>(
        ({ symbol, name, icon }) => ({
            value: symbol,
            label: name,
            iconSVG: icon,
        })
    );
};

export type CurrencyInfo = {
    index: number;
    symbol: CurrencySymbol;
    name: string;
    coinGeckoId: string;
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    toBaseUnit: (amount: number) => BigNumber;
    toCurrency: () => CurrencyInterface;
};

export const toCurrency = (ccy: CurrencySymbol) => {
    return currencyMap[ccy].toCurrency();
};

const convertEthToWei = (amount: number) => {
    const wei = new BigNumberJS(amount).multipliedBy(ETH_TO_WEI);
    if (wei.isLessThan(new BigNumberJS(1))) {
        return BigNumber.from(0);
    }
    return BigNumber.from(wei.toString());
};
