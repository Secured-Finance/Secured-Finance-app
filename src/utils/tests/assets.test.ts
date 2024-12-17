import { CurrencySymbol, toOptions } from 'src/utils';

describe('toOptions', () => {
    it('should return the currencyList as a list of Option for the ComboBox', () => {
        const options = toOptions(
            [
                CurrencySymbol.WBTC,
                CurrencySymbol.ETH,
                CurrencySymbol.WFIL,
                CurrencySymbol.USDC,
            ],
            CurrencySymbol.WBTC
        );
        expect(options).toEqual([
            {
                label: 'USDC',
                value: 'USDC',
            },
            {
                label: 'ETH',
                value: 'ETH',
            },
            {
                label: 'WBTC',
                value: 'WBTC',
            },
            {
                label: 'WFIL',
                value: 'WFIL',
            },
        ]);
    });
});
