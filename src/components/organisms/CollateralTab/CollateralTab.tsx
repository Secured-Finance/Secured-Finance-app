import { getUTCMonthYear } from '@secured-finance/sf-core';
import { useMemo, useState } from 'react';
import {
    CollateralTabLeftPane,
    CollateralTabRightPane,
    ZCBond,
} from 'src/components/molecules';
import {
    DepositCollateral,
    DepositZCToken,
    WithdrawCollateral,
    WithdrawZCToken,
} from 'src/components/organisms';
import { CollateralBook, useBalances, useCurrencies } from 'src/hooks';
import {
    CollateralInfo,
    CurrencySymbol,
    Maturity,
    ZERO_BI,
    amountFormatterFromBase,
    currencyMap,
} from 'src/utils';
import { useAccount } from 'wagmi';

export const generateCollateralList = (
    balance: Partial<Record<CurrencySymbol, bigint>>,
    useAllCurrencies: boolean,
    currencies: CurrencySymbol[]
): Record<CurrencySymbol, CollateralInfo> => {
    let collateralRecords: Record<string, CollateralInfo> = {};
    currencies
        ?.map(ccy => currencyMap[ccy])
        .filter(ccy => ccy.isCollateral || useAllCurrencies)
        .forEach(currencyInfo => {
            const ccy = currencyInfo.symbol;
            const collateralInfo = {
                [ccy]: {
                    symbol: ccy,
                    name: ccy,
                    available: balance[ccy]
                        ? amountFormatterFromBase[ccy](balance[ccy] as bigint)
                        : 0,
                    availableFullValue: balance[ccy] ?? ZERO_BI,
                },
            };
            collateralRecords = { ...collateralRecords, ...collateralInfo };
        });

    return collateralRecords;
};

export const CollateralTab = ({
    collateralBook,
    netAssetValue,
    zcBonds,
}: {
    collateralBook: CollateralBook;
    netAssetValue: number;
    zcBonds: ZCBond[];
}) => {
    const { address } = useAccount();
    const [openModal, setOpenModal] = useState<
        '' | 'deposit' | 'withdraw' | 'deposit-zc-tokens' | 'withdraw-zc-tokens'
    >('');

    const balances = useBalances();
    const { data: currencies = [] } = useCurrencies(true);

    const depositCollateralList = useMemo(
        () => generateCollateralList(balances, true, currencies),
        [balances, currencies]
    );

    const withdrawCollateralList = useMemo(
        () =>
            generateCollateralList(
                {
                    ...collateralBook.withdrawableCollateral,
                    ...collateralBook.nonCollateral,
                },
                true,
                currencies
            ),
        [
            collateralBook.nonCollateral,
            collateralBook.withdrawableCollateral,
            currencies,
        ]
    );

    const withdrawZcBondList = zcBonds.reduce(
        (acc, bond) => {
            const key =
                bond.currency +
                (bond.maturity
                    ? `-${getUTCMonthYear(bond.maturity.toNumber())}`
                    : '');

            acc[key] = {
                symbol: bond.currency,
                key: key,
                availableTokenAmount: bond.tokenAmount,
                availableAmount: bond.amount,
                maturity: bond.maturity,
            };
            return acc;
        },
        {} as Record<
            string,
            {
                symbol: CurrencySymbol;
                key: string;
                availableTokenAmount: bigint;
                availableAmount: bigint;
                maturity?: Maturity;
            }
        >
    );

    return (
        <div className='flex w-full flex-row items-center'>
            <CollateralTabLeftPane
                onClick={step => setOpenModal(step)}
                account={address}
                collateralBook={collateralBook}
                netAssetValue={netAssetValue}
                zcBonds={zcBonds}
            />
            <CollateralTabRightPane
                account={address}
                collateralBook={collateralBook}
            />
            <DepositCollateral
                isOpen={openModal === 'deposit'}
                onClose={() => setOpenModal('')}
                collateralList={depositCollateralList}
                source='Collateral Tab'
            ></DepositCollateral>
            <DepositZCToken
                isOpen={openModal === 'deposit-zc-tokens'}
                onClose={() => setOpenModal('')}
                currencyList={currencies}
                source='Collateral Tab'
            ></DepositZCToken>
            <WithdrawCollateral
                isOpen={openModal === 'withdraw'}
                onClose={() => setOpenModal('')}
                collateralList={withdrawCollateralList}
                source='Collateral Tab'
            ></WithdrawCollateral>
            <WithdrawZCToken
                isOpen={openModal === 'withdraw-zc-tokens'}
                onClose={() => setOpenModal('')}
                zcBondList={withdrawZcBondList}
                source='Collateral Tab'
            ></WithdrawZCToken>
        </div>
    );
};
