import { track } from '@amplitude/analytics-browser';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    AssetInformation,
    AssetInformationValue,
    Button,
    CollateralManagementConciseTab,
} from 'src/components/atoms';
import { HorizontalTab } from 'src/components/molecules';
import {
    CollateralBook,
    useCollateralCurrencies,
    useLastPrices,
} from 'src/hooks';
import { RootState } from 'src/store/types';
import {
    ButtonEvents,
    CurrencySymbol,
    Maturity,
    ZERO_BI,
    amountFormatterFromBase,
    convertFromGvUnit,
    convertToZcTokenName,
    usdFormat,
} from 'src/utils';

export interface ZCBond {
    currency: CurrencySymbol;
    maturity?: Maturity;
    amount: bigint;
    tokenAmount: bigint;
}
interface CollateralTabLeftPaneProps {
    account: string | undefined;
    onClick: (
        step:
            | 'deposit'
            | 'withdraw'
            | 'deposit-zc-tokens'
            | 'withdraw-zc-tokens'
    ) => void;
    collateralBook: CollateralBook;
    netAssetValue: number;
    zcBonds: ZCBond[];
}

const getInformationText = (collateralCurrencies: CurrencySymbol[]) => {
    let article = '';
    let currencyString = '';

    const length = collateralCurrencies.length;

    if (length === 1) {
        currencyString = collateralCurrencies[0];
        article = 'is';
    } else {
        for (let i = 0; i < length - 1; i++) {
            currencyString += collateralCurrencies[i];
            if (i === length - 2) {
                currencyString += ' and ';
            } else {
                currencyString += ', ';
            }
        }
        currencyString += collateralCurrencies[length - 1];
        article = 'are';
    }
    return `Only ${currencyString} ${article} eligible as collateral.`;
};

const checkAssetQuantityExist = (
    collateralBook: CollateralBook['collateral' | 'nonCollateral']
) => {
    let exist = false;
    collateralBook &&
        Object.values(collateralBook).forEach(quantity => {
            if (quantity !== ZERO_BI) {
                exist = true;
            }
        });
    return exist;
};

export enum TableType {
    TOKENS = 0,
    ZC_BONDS,
}

const EMPTY_COLLATERAL_MESSAGE =
    'Deposit collateral from your connected wallet to enable lending service on Secured Finance.';
const PERPETUAL_ZC_BONDS_INFORMATION =
    'Auto-rolled lending positions. These ZC Bonds can be withdrawn as Perpetual ZC Tokens based ERC20 standard. ' +
    'These token amounts are counted with Genesis Value, expressed as the asset value of the Genesis Date.';
const FIXED_MATURITY_ZC_BONDS_INFORMATION =
    'Lending positions in each order book. These ZC Bonds can be withdrawn as fixed maturity ZC Tokens based ERC20 standard. ' +
    'These token amounts are counted with Future Value.';

export const CollateralTabLeftPane = ({
    account,
    onClick,
    collateralBook,
    netAssetValue,
    zcBonds,
}: CollateralTabLeftPaneProps) => {
    const [selectedTable, setSelectedTable] = useState(TableType.TOKENS);
    const chainError = useSelector(
        (state: RootState) => state.blockchain.chainError
    );

    const { data: collateralCurrencies = [] } = useCollateralCurrencies();
    const { data: priceList } = useLastPrices();

    const collateralQuantityExist = useMemo(() => {
        return checkAssetQuantityExist(collateralBook.collateral);
    }, [collateralBook.collateral]);
    const nonCollateralQuantityExist = useMemo(() => {
        return checkAssetQuantityExist(collateralBook.nonCollateral);
    }, [collateralBook.nonCollateral]);

    const [collateralInformation, nonCollateralInformation] = useMemo(() => {
        return [collateralBook.collateral, collateralBook.nonCollateral].map(
            collateral =>
                Object.entries(collateral).reduce<AssetInformationValue[]>(
                    (acc, [key, quantity]) => {
                        const symbol = key as CurrencySymbol;
                        const amount =
                            amountFormatterFromBase[symbol](quantity);
                        const price = priceList[symbol];
                        acc.push({
                            currency: symbol,
                            label: key,
                            amount,
                            price,
                            totalPrice: amount * price,
                        });
                        return acc;
                    },
                    []
                )
        );
    }, [collateralBook, priceList]);

    const [perpetualZcBonds, nonPerpetualZcBonds] = useMemo(() => {
        const perpetualZcBonds: AssetInformationValue[] = [];
        const nonPerpetualZcBonds: AssetInformationValue[] = [];

        for (const zcBond of zcBonds) {
            if (zcBond.maturity) {
                nonPerpetualZcBonds.push({
                    currency: zcBond.currency,
                    label: convertToZcTokenName(
                        zcBond.currency,
                        zcBond.maturity
                    ),
                    amount: amountFormatterFromBase[zcBond.currency](
                        zcBond.tokenAmount
                    ),
                    price: priceList[zcBond.currency],
                    totalPrice:
                        amountFormatterFromBase[zcBond.currency](
                            zcBond.amount
                        ) * priceList[zcBond.currency],
                });
            } else {
                perpetualZcBonds.push({
                    currency: zcBond.currency,
                    label: convertToZcTokenName(zcBond.currency),
                    amount: convertFromGvUnit(zcBond.tokenAmount),
                    price: priceList[zcBond.currency],
                    totalPrice:
                        amountFormatterFromBase[zcBond.currency](
                            zcBond.amount
                        ) * priceList[zcBond.currency],
                });
            }
        }
        return [perpetualZcBonds, nonPerpetualZcBonds];
    }, [zcBonds, priceList]);

    const totalCollateralInUSD = account ? collateralBook.usdCollateral : 0;

    return (
        <div className='flex min-h-[400px] w-full flex-col border-white-10 tablet:w-80 tablet:border-r'>
            <div className='flex-grow border-b border-white-10'>
                <div className='flex flex-col gap-1 border-b border-white-10 p-4'>
                    <span className='typography-body-2 h-6 w-fit text-slateGray'>
                        Net Asset Value
                    </span>
                    <span
                        data-testid='vault-balance'
                        className={clsx(
                            'w-fit font-secondary font-semibold text-white',
                            {
                                'text-xl': netAssetValue.toString().length <= 6,
                                'text-xl tablet:text-md':
                                    netAssetValue.toString().length > 6 &&
                                    netAssetValue.toString().length <= 9,
                                'text-md tablet:text-smd':
                                    netAssetValue.toString().length > 9,
                            }
                        )}
                    >
                        {usdFormat(netAssetValue, 2)}
                    </span>
                </div>
                {!account ? (
                    <div className='typography-caption ml-5 w-40 pt-2 text-grayScale'>
                        Connect your wallet to see your deposited collateral
                        balance.
                    </div>
                ) : (
                    <>
                        <div className='flex flex-col gap-3 border-b border-white-10 px-3 py-6 tablet:hidden'>
                            <CollateralManagementConciseTab
                                collateralCoverage={
                                    collateralBook.coverage / 100
                                }
                                availableToBorrow={
                                    collateralBook.usdAvailableToBorrow
                                }
                                collateralThreshold={
                                    collateralBook.collateralThreshold
                                }
                                account={account}
                                totalCollateralInUSD={totalCollateralInUSD}
                            />
                        </div>
                        <HorizontalTab
                            className='border-hidden'
                            tabTitles={['Tokens', 'ZC Bonds']}
                            onTabChange={setSelectedTable}
                        >
                            {/* Tokens Tab */}
                            <div className='mx-4 my-1 flex-col gap-2 tablet:flex'>
                                {collateralQuantityExist && (
                                    <AssetInformation
                                        header='Collateral'
                                        informationText={getInformationText(
                                            collateralCurrencies
                                        )}
                                        values={collateralInformation}
                                    ></AssetInformation>
                                )}
                                {nonCollateralQuantityExist && (
                                    <AssetInformation
                                        header='Non-collateral'
                                        informationText='Not eligible as collateral'
                                        values={nonCollateralInformation}
                                    ></AssetInformation>
                                )}
                                {!collateralQuantityExist && (
                                    <div className='typography-caption pt-2 text-grayScale'>
                                        {EMPTY_COLLATERAL_MESSAGE}
                                    </div>
                                )}
                            </div>
                            {/* ZC Bonds Tab */}
                            <div className='mx-4 my-1 flex-col gap-2 tablet:flex'>
                                {Object.keys(perpetualZcBonds).length > 0 && (
                                    <AssetInformation
                                        header='Perpetual'
                                        informationText={
                                            PERPETUAL_ZC_BONDS_INFORMATION
                                        }
                                        values={perpetualZcBonds}
                                        isZC
                                    />
                                )}
                                {Object.keys(nonPerpetualZcBonds).length >
                                    0 && (
                                    <AssetInformation
                                        header='Fixed Maturity'
                                        informationText={
                                            FIXED_MATURITY_ZC_BONDS_INFORMATION
                                        }
                                        values={nonPerpetualZcBonds}
                                        isZC
                                    />
                                )}
                                {Object.keys(perpetualZcBonds).length === 0 &&
                                    Object.keys(nonPerpetualZcBonds).length ===
                                        0 && (
                                        <div className='typography-caption pt-2 text-grayScale'>
                                            No ZC Bonds Found.
                                        </div>
                                    )}
                            </div>
                        </HorizontalTab>
                    </>
                )}
            </div>
            <div className='flex h-16 flex-row items-center justify-center gap-4 px-4'>
                <Button
                    onClick={() => {
                        if (selectedTable === TableType.TOKENS) {
                            onClick('deposit');
                            track(ButtonEvents.DEPOSIT_COLLATERAL_BUTTON);
                        } else {
                            onClick('deposit-zc-tokens');
                            track(ButtonEvents.DEPOSIT_ZC_TOKEN_BUTTON);
                        }
                    }}
                    disabled={!account || chainError}
                    data-testid='deposit-collateral'
                    fullWidth={true}
                >
                    Deposit
                </Button>
                <Button
                    disabled={
                        !account ||
                        (selectedTable === TableType.TOKENS &&
                            netAssetValue <= 0) ||
                        (selectedTable === TableType.ZC_BONDS &&
                            zcBonds.length === 0) ||
                        chainError
                    }
                    onClick={() => {
                        if (selectedTable === TableType.TOKENS) {
                            onClick('withdraw');
                            track(ButtonEvents.WITHDRAW_COLLATERAL_BUTTON);
                        } else {
                            onClick('withdraw-zc-tokens');
                            track(ButtonEvents.WITHDRAW_ZC_TOKEN_BUTTON);
                        }
                    }}
                    data-testid='withdraw-collateral'
                    fullWidth={true}
                >
                    Withdraw
                </Button>
            </div>
        </div>
    );
};
