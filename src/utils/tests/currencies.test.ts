import { WalletSource as Source } from '@secured-finance/sf-client';
import {
    COIN_GECKO_SOURCE,
    currencyMap,
    CurrencySymbol,
    generateWalletInformation,
    generateWalletSourceInformation,
    handlePriceSource,
    WalletSource,
} from 'src/utils';

describe('currencies.generateWalletInformation', () => {
    it('should return walletInformation as AssetDisclosureProps', () => {
        const addressRecord = {
            [WalletSource.METAMASK]: 'ethAccount',
            [WalletSource.UTILWALLET]: 'filAccount',
        };

        const balanceRecord = {
            [CurrencySymbol.ETH]: BigInt('580000000000000000'),
            [CurrencySymbol.USDC]: BigInt('150000000'),
        };

        const options = generateWalletInformation(
            addressRecord,
            balanceRecord,
            {
                [WalletSource.METAMASK]: [
                    CurrencySymbol.WBTC,
                    CurrencySymbol.ETH,
                    CurrencySymbol.WFIL,
                    CurrencySymbol.USDC,
                ],
            }
        );

        expect(options).toHaveLength(1);
        expect(options[0].account).toEqual('ethAccount');
        expect(options[0].walletSource).toEqual(WalletSource.METAMASK);
        expect(options[0].data).toHaveLength(4);

        const dataResult = [
            {
                asset: CurrencySymbol.WBTC,
                quantity: BigInt('0'),
            },
            {
                asset: CurrencySymbol.ETH,
                quantity: BigInt('580000000000000000'),
            },
            {
                asset: CurrencySymbol.WFIL,
                quantity: BigInt('0'),
            },
            {
                asset: CurrencySymbol.USDC,
                quantity: BigInt('150000000'),
            },
        ];

        options[0].data.forEach((data, index) => {
            expect(data.asset).toEqual(dataResult[index].asset);
            expect(data.quantity.toString()).toEqual(
                dataResult[index].quantity.toString()
            );
        });
    });
});

describe('currencies.generateWalletSourceInformation', () => {
    it('should return walletSourceInformation as WalletSourceOption', () => {
        const options = generateWalletSourceInformation(
            CurrencySymbol.USDC,
            BigInt('1000000000'),
            BigInt('500000000')
        );
        expect(options).toHaveLength(2);
        expect(options[0].source).toEqual(Source.METAMASK);
        expect(options[1].source).toEqual(Source.SF_VAULT);
        expect(options[0].available.toString()).toEqual('1000000000');
        expect(options[1].available.toString()).toEqual('500000000');
    });
});

describe('currencies.handlePriceSource', () => {
    it('should return CoinGecko price source specific to currency provided', () => {
        const source = handlePriceSource(CurrencySymbol.USDC);

        expect(source).toEqual(
            COIN_GECKO_SOURCE.concat(
                currencyMap[CurrencySymbol.USDC].coinGeckoId
            )
        );
    });
});
