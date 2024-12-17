import { useQuery } from '@tanstack/react-query';
import useSF from 'src/hooks/useSecuredFinance';
import { CurrencySymbol, Maturity, toCurrency } from 'src/utils';
import { QueryKeys } from '../queries';

export const useWithdrawableZCTokenAmounts = (
    zcBonds: {
        currency: CurrencySymbol;
        maturity?: Maturity;
    }[],
    account: string
) => {
    const securedFinance = useSF();

    return useQuery({
        queryKey: [QueryKeys.WITHDRAWABLE_ZC_TOKEN_AMOUNTS, account, zcBonds],
        queryFn: async () =>
            Promise.all(
                zcBonds.map(async zcBond => {
                    const withdrawableZCTokenAmount =
                        await securedFinance?.getWithdrawableZCTokenAmount(
                            toCurrency(zcBond.currency),
                            zcBond.maturity?.toNumber() ?? 0,
                            account
                        );

                    return { ...zcBond, withdrawableZCTokenAmount };
                })
            ),
        enabled:
            !!securedFinance && !!account && !!zcBonds && zcBonds.length > 0,
    });
};
