import { BigNumber } from 'ethers';
import { useEffect, useState, useCallback } from 'react';
import useSF from '../useSecuredFinance';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/types';
import { Currency } from '@secured-finance/sf-core';
import { toCurrency, hexToCurrencySymbol } from 'src/utils';

export type Position = {
    currency: string;
    maturity: string;
    amount: BigNumber;
    forwardValue: BigNumber;
};

export type Positions = Array<Position>;

export const usePositions = (account: string | null) => {
    const securedFinance = useSF();

    const block = useSelector(
        (state: RootState) => state.blockchain.latestBlock
    );

    const [positions, setPositions] = useState<Positions>([]);

    const fetchPositions = useCallback(async () => {
        if (!securedFinance || !account) {
            return;
        }

        const usedCurrenciesListInHex =
            await securedFinance.getUsedCurrenciesForOrders(account);
        const convertedCurrencies = usedCurrenciesListInHex
            .map(currency => {
                const symbol = hexToCurrencySymbol(currency);
                const convertedCurrency = symbol ? toCurrency(symbol) : null;
                return convertedCurrency;
            })
            .filter((currency): currency is Currency => currency !== null);

        const positions = await securedFinance.getPositions(
            account,
            convertedCurrencies
        );
        const mappedPositions = positions.map(position => ({
            currency: position.ccy,
            maturity: position.maturity.toString(),
            amount: position.presentValue,
            forwardValue: position.futureValue,
        }));
        setPositions(mappedPositions);
    }, [account, securedFinance]);

    useEffect(() => {
        fetchPositions();
    }, [block, fetchPositions]);

    return positions;
};
