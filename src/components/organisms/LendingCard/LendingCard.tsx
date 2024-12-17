import { OrderSide, WalletSource } from '@secured-finance/sf-client';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorInfo, WalletSourceSelector } from 'src/components/atoms';
import {
    AssetSelector,
    CollateralUsageSection,
    TabGroup,
    TermSelector,
} from 'src/components/molecules';
import { OrderAction } from 'src/components/organisms';
import {
    CollateralBook,
    useBalances,
    useBorrowableAmount,
    useCurrencies,
    useLastPrices,
} from 'src/hooks';
import {
    selectLandingOrderForm,
    setAmount,
    setCurrency,
    setMaturity,
    setSide,
    setSourceAccount,
} from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import { MaturityOptionList, OrderSideMap } from 'src/types';
import {
    ButtonEvents,
    ButtonProperties,
    CurrencySymbol,
    LoanValue,
    Maturity,
    ZERO_BI,
    amountFormatterFromBase,
    amountFormatterToBase,
    formatLoanValue,
    generateWalletSourceInformation,
    getAmountValidation,
    getTransformMaturityOption,
    toOptions,
} from 'src/utils';
import { trackButtonEvent } from 'src/utils/events';
import { useAccount } from 'wagmi';
import { orderSideOptions } from './constants';

export const LendingCard = ({
    collateralBook,
    maturitiesOptionList,
    marketPrice,
    delistedCurrencySet,
}: {
    collateralBook: CollateralBook;
    maturitiesOptionList: MaturityOptionList;
    marketPrice: number | undefined;
    delistedCurrencySet: Set<CurrencySymbol>;
}) => {
    const { currency, maturity, side, sourceAccount, amount, amountExists } =
        useSelector((state: RootState) =>
            selectLandingOrderForm(state.landingOrderForm)
        );

    const dispatch = useDispatch();
    const { address } = useAccount();

    const { data: assetPriceMap } = useLastPrices();
    const { data: currencies } = useCurrencies();
    const assetList = toOptions(currencies, currency);

    const balanceRecord = useBalances();

    const selectedTerm = useMemo(() => {
        return (
            maturitiesOptionList.find(option =>
                option.value.equals(new Maturity(maturity))
            ) || maturitiesOptionList[0]
        );
    }, [maturity, maturitiesOptionList]);

    const walletSourceList = useMemo(() => {
        return generateWalletSourceInformation(
            currency,
            balanceRecord[currency],
            collateralBook.withdrawableCollateral[currency] ||
                collateralBook.nonCollateral[currency]
        );
    }, [
        balanceRecord,
        collateralBook.nonCollateral,
        collateralBook.withdrawableCollateral,
        currency,
    ]);

    const selectedWalletSource = useMemo(() => {
        return (
            walletSourceList.find(w => w.source === sourceAccount) ||
            walletSourceList[0]
        );
    }, [sourceAccount, walletSourceList]);

    const selectedAsset = useMemo(() => {
        return assetList.find(option => option.value === currency);
    }, [currency, assetList]);

    const balanceToLend = useMemo(() => {
        return selectedWalletSource.source === WalletSource.METAMASK
            ? balanceRecord[currency]
            : collateralBook.nonCollateral[currency] ||
                  collateralBook.withdrawableCollateral[currency] ||
                  ZERO_BI;
    }, [
        balanceRecord,
        collateralBook.nonCollateral,
        collateralBook.withdrawableCollateral,
        currency,
        selectedWalletSource.source,
    ]);

    const marketValue = useMemo(
        () => LoanValue.fromPrice(marketPrice ?? 0, maturity),
        [marketPrice, maturity]
    );

    const handleCurrencyChange = useCallback(
        (v: CurrencySymbol) => {
            dispatch(setCurrency(v));
        },
        [dispatch]
    );

    const handleWalletSourceChange = (source: WalletSource) => {
        dispatch(setSourceAccount(source));
        const available =
            source === WalletSource.METAMASK
                ? balanceRecord[currency]
                : collateralBook.nonCollateral[currency] ||
                  collateralBook.withdrawableCollateral[currency] ||
                  ZERO_BI;
        const inputAmount = amount > available ? available : amount;
        dispatch(setAmount(inputAmount.toString()));
    };

    const { data: availableToBorrow } = useBorrowableAmount(address, currency);

    return (
        <div className='w-[345px] flex-shrink-0 space-y-6 rounded-b-xl border border-panelStroke bg-transparent pb-7 shadow-deep'>
            <TabGroup
                options={orderSideOptions}
                selectedOption={OrderSideMap[side]}
                handleClick={option => {
                    dispatch(
                        setSide(
                            option === 'Borrow'
                                ? OrderSide.BORROW
                                : OrderSide.LEND
                        )
                    );
                    dispatch(setSourceAccount(WalletSource.METAMASK));
                    trackButtonEvent(
                        ButtonEvents.ORDER_SIDE,
                        ButtonProperties.ORDER_SIDE,
                        option
                    );
                }}
            />

            <div className='flex h-[480px] flex-col justify-between px-4'>
                <div className='flex flex-col gap-6'>
                    <div className='flex flex-col gap-1 pb-1 text-center'>
                        <span
                            className='typography-amount-large text-white'
                            data-testid='market-rate'
                        >
                            {formatLoanValue(marketValue, 'rate')}
                        </span>
                        <span className='typography-caption uppercase text-secondary7'>
                            Fixed Rate APR
                        </span>
                    </div>

                    <div className='space-y-1'>
                        <AssetSelector
                            options={assetList}
                            selected={selectedAsset}
                            priceList={assetPriceMap}
                            onAmountChange={v =>
                                dispatch(
                                    setAmount(
                                        v === ''
                                            ? ''
                                            : amountFormatterToBase[currency](
                                                  Number(v)
                                              ).toString()
                                    )
                                )
                            }
                            initialValue={
                                amountExists
                                    ? amountFormatterFromBase[currency](
                                          amount
                                      ).toString()
                                    : ''
                            }
                            onAssetChange={v => {
                                handleCurrencyChange(v);
                                trackButtonEvent(
                                    ButtonEvents.CURRENCY_CHANGE,
                                    ButtonProperties.CURRENCY,
                                    v
                                );
                            }}
                        />
                        {side === OrderSide.LEND && (
                            <ErrorInfo
                                showError={getAmountValidation(
                                    amount,
                                    balanceToLend,
                                    side
                                )}
                                errorMessage='Insufficient amount in source'
                            />
                        )}
                    </div>

                    <TermSelector
                        options={maturitiesOptionList.map(o => ({
                            ...o,
                            value: o.value.toString(),
                        }))}
                        selected={{
                            ...selectedTerm,
                            value: selectedTerm.value.toString(),
                        }}
                        onTermChange={v => {
                            dispatch(setMaturity(Number(v)));
                            trackButtonEvent(
                                ButtonEvents.TERM_CHANGE,
                                ButtonProperties.TERM,
                                selectedTerm.label
                            );
                        }}
                        transformLabel={getTransformMaturityOption(
                            maturitiesOptionList.map(o => ({
                                ...o,
                                value: o.value.toString(),
                            }))
                        )}
                    />

                    {side === OrderSide.LEND && (
                        <WalletSourceSelector
                            optionList={walletSourceList}
                            selected={selectedWalletSource}
                            account={address ?? ''}
                            onChange={handleWalletSourceChange}
                        />
                    )}

                    {side === OrderSide.BORROW && (
                        <div className='px-2'>
                            <CollateralUsageSection
                                collateralCoverage={collateralBook.coverage}
                                currency={currency}
                                availableToBorrow={availableToBorrow}
                            />
                        </div>
                    )}
                </div>
                <OrderAction
                    collateralBook={collateralBook}
                    loanValue={marketValue}
                    renderSide
                    validation={getAmountValidation(
                        amount,
                        balanceToLend,
                        side
                    )}
                    isCurrencyDelisted={delistedCurrencySet.has(currency)}
                />
            </div>
        </div>
    );
};
