import { FilecoinNumber } from '@glif/filecoin-number';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import { BigNumber } from 'ethers';
import EthIcon from 'src/assets/coins/eth2.svg';
import FilecoinIcon from 'src/assets/coins/fil.svg';
import UsdcIcon from 'src/assets/coins/usdc.svg';
import { Option } from 'src/components/atoms';
import { MAINNET_PATH_CODE } from 'src/services/ledger/constants';
const ETH_CHAIN_ID = 60;
const ETH_TO_WEI = new BigNumberJS(10 ** 18);

export enum Currency {
    ETH = 'ETH',
    FIL = 'FIL',
    USDC = 'USDC',
}

export const currencyMap: Readonly<Record<Currency, Readonly<CurrencyInfo>>> = {
    [Currency.ETH]: {
        indexCcy: 0,
        icon: EthIcon,
        shortName: Currency.ETH,
        name: 'Ethereum',
        chainId: ETH_CHAIN_ID,
        toBaseUnit: (amount: number) => convertEthToWei(amount),
    },
    [Currency.FIL]: {
        indexCcy: 1,
        icon: FilecoinIcon,
        shortName: Currency.FIL,
        name: 'Filecoin',
        chainId: MAINNET_PATH_CODE,
        toBaseUnit: (amount: number) => {
            const filAmount = new FilecoinNumber(amount, 'fil');
            return BigNumber.from(filAmount.toAttoFil());
        },
    },
    [Currency.USDC]: {
        indexCcy: 2,
        shortName: Currency.USDC,
        name: 'USDC',
        icon: UsdcIcon,
        chainId: ETH_CHAIN_ID,
        toBaseUnit: (amount: number) => convertEthToWei(amount),
    },
};

export const getCurrencyMapAsList = () => {
    return Object.values(currencyMap);
};

export const getCurrencyMapAsOptions = () => {
    return getCurrencyMapAsList().map<Option<Currency>>(
        ({ shortName, name, icon }) => ({
            value: shortName,
            label: name,
            iconSVG: icon,
        })
    );
};

export type CurrencyInfo = {
    indexCcy: number;
    shortName: Currency;
    name: string;
    chainId: number;
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    toBaseUnit: (amount: number) => BigNumber;
};

// Do not use this function, as we don't want to use the IndexCcy to identify the currency
export const getCurrencyByIndex = (value: string | number) => {
    const currency = getCurrencyMapAsList().find(
        ({ indexCcy }) =>
            indexCcy.toString().toLowerCase() === value.toString().toLowerCase()
    );

    if (!currency) {
        throw new Error(`Currency ${value} not found`);
    }

    return currency;
};

const convertEthToWei = (amount: number) => {
    const wei = new BigNumberJS(amount).multipliedBy(ETH_TO_WEI);
    if (wei.isLessThan(new BigNumberJS(1))) {
        return BigNumber.from(0);
    }
    return BigNumber.from(wei.toString());
};
