import { useEffect, useState } from 'react';
import useSF from 'src/hooks/useSecuredFinance';
import { Currency, currencyMap } from 'src/utils';

export const useCrosschainAddressByChainId = (user: string, ccy: Currency) => {
    const securedFinance = useSF();
    const currency = currencyMap[ccy];
    const [crosschainAddress, setCrosschainAddress] = useState<string>('');

    useEffect(() => {
        const getCrosschainAddress = async () => {
            if (!securedFinance) return;
            setCrosschainAddress(
                await securedFinance.getCrosschainAddress(
                    currency.chainId,
                    user
                )
            );
        };
        getCrosschainAddress();
    }, [securedFinance, user, currency, ccy]);

    return crosschainAddress;
};
