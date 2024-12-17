import { useCallback } from 'react';
import useSF from 'src/hooks/useSecuredFinance';
import { CurrencySymbol, Maturity, toCurrency } from 'src/utils';

export const useDepositZCToken = (
    ccy: CurrencySymbol,
    maturity: Maturity,
    amount: bigint
) => {
    const securedFinance = useSF();

    const handleDepositZCToken = useCallback(async () => {
        if (!securedFinance) {
            return;
        }
        const tx = await securedFinance.depositZCToken(
            toCurrency(ccy),
            maturity.toNumber(),
            amount
        );
        return tx;
    }, [securedFinance, ccy, maturity, amount]);

    return { onDepositZCToken: handleDepositZCToken };
};

export const useWithdrawZCToken = (
    ccy: CurrencySymbol,
    maturity: Maturity,
    amount: bigint
) => {
    const securedFinance = useSF();

    const handleWithdrawZCToken = useCallback(async () => {
        if (!securedFinance) {
            return;
        }
        const tx = await securedFinance.withdrawZCToken(
            toCurrency(ccy),
            maturity.toNumber(),
            amount
        );
        return tx;
    }, [securedFinance, ccy, maturity, amount]);

    return { onWithdrawZCToken: handleWithdrawZCToken };
};
