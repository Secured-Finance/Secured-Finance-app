import { OrderSide, WalletSource } from '@secured-finance/sf-client';
import { useCallback } from 'react';
import { CurrencySymbol, Maturity, toCurrency } from 'src/utils';
import useSF from '../useSecuredFinance';

export const useOrders = () => {
    const securedFinance = useSF();

    const cancelOrder = useCallback(
        async (orderId: bigint, ccy: CurrencySymbol, maturity: Maturity) => {
            try {
                if (!securedFinance) return;
                const tx = await securedFinance.cancelLendingOrder(
                    toCurrency(ccy),
                    maturity.toNumber(),
                    Number(orderId)
                );
                return tx;
            } catch (error) {
                console.error(error);
            }
        },
        [securedFinance]
    );

    const placeOrder = useCallback(
        async (
            ccy: CurrencySymbol,
            maturity: Maturity,
            side: OrderSide,
            amount: bigint,
            unitPrice: number,
            sourceWallet: WalletSource
        ) => {
            try {
                if (!securedFinance) return;

                const tx = await securedFinance.placeOrder(
                    toCurrency(ccy),
                    maturity.toNumber(),
                    side,
                    amount,
                    sourceWallet,
                    unitPrice
                );

                return tx;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        [securedFinance]
    );

    const unwindPosition = useCallback(
        async (ccy: CurrencySymbol, maturity: Maturity) => {
            try {
                if (!securedFinance) return;

                const tx = await securedFinance.unwindPosition(
                    toCurrency(ccy),
                    maturity.toNumber()
                );

                return tx;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        [securedFinance]
    );

    const placePreOrder = useCallback(
        async (
            ccy: CurrencySymbol,
            maturity: Maturity,
            side: OrderSide,
            amount: bigint,
            unitPrice: number,
            sourceWallet: WalletSource
        ) => {
            try {
                if (!securedFinance) return;

                const tx = await securedFinance.placePreOrder(
                    toCurrency(ccy),
                    maturity.toNumber(),
                    side,
                    amount,
                    sourceWallet,
                    unitPrice
                );

                return tx;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        [securedFinance]
    );

    const repayPosition = useCallback(
        async (ccy: CurrencySymbol, maturity: Maturity) => {
            try {
                if (!securedFinance) return;

                const tx = await securedFinance.executeRepayment(
                    toCurrency(ccy),
                    maturity.toNumber()
                );

                return tx;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        [securedFinance]
    );

    const redeemPosition = useCallback(
        async (ccy: CurrencySymbol, maturity: Maturity) => {
            try {
                if (!securedFinance) return;

                const tx = await securedFinance.executeRedemption(
                    toCurrency(ccy),
                    maturity.toNumber()
                );

                return tx;
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        [securedFinance]
    );

    return {
        cancelOrder,
        placeOrder,
        unwindPosition,
        placePreOrder,
        repayPosition,
        redeemPosition,
    };
};
