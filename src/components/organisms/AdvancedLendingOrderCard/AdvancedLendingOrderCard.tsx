import { track } from '@amplitude/analytics-browser';
import { OrderSide, WalletSource } from '@secured-finance/sf-client';
import { VisibilityState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CollateralManagementConciseTab,
    ErrorInfo,
    OrderDisplayBox,
    OrderInputBox,
    Slider,
    TabVariant,
    WalletSourceSelector,
} from 'src/components/atoms';
import { SubtabGroup, TabGroup } from 'src/components/molecules';
import { NewOrderBookWidget, OrderAction } from 'src/components/organisms';
import {
    CollateralBook,
    useBalances,
    useBorrowableAmount,
    useBreakpoint,
    useLastPrices,
    useMarket,
} from 'src/hooks';
import { useOrderbook } from 'src/hooks/useOrderbook';
import {
    resetUnitPrice,
    selectLandingOrderForm,
    setAmount,
    setOrderType,
    setSide,
    setSourceAccount,
    setUnitPrice,
} from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import { OrderSideMap, OrderType, OrderTypeOptions } from 'src/types';
import {
    Amount,
    ButtonEvents,
    ButtonProperties,
    CurrencySymbol,
    LoanValue,
    ZERO_BI,
    amountFormatterFromBase,
    amountFormatterToBase,
    currencyMap,
    divide,
    formatLoanValue,
    generateWalletSourceInformation,
    getAmountValidation,
    multiply,
    ordinaryFormat,
    prefixTilde,
    usdFormat,
} from 'src/utils';
import {
    InteractionEvents,
    InteractionProperties,
    trackButtonEvent,
} from 'src/utils/events';
import { useAccount } from 'wagmi';

const getOrderSideText = (
    side: (typeof OrderSideMap)[OrderSide.LEND | OrderSide.BORROW]
) => {
    if (side === 'Lend') return 'Buy / Lend';
    return 'Sell / Borrow';
};

export function AdvancedLendingOrderCard({
    collateralBook,
    isItayose = false,
    calculationDate,
    preOrderPosition = 'none',
    marketPrice,
    delistedCurrencySet,
}: {
    collateralBook: CollateralBook;
    isItayose?: boolean;
    calculationDate?: number;
    preOrderPosition?: 'borrow' | 'lend' | 'none';
    marketPrice?: number;
    delistedCurrencySet: Set<CurrencySymbol>;
}): JSX.Element {
    const {
        currency,
        amount,
        side,
        orderType,
        unitPrice,
        maturity,
        sourceAccount,
        amountExists,
        unitPriceExists,
    } = useSelector((state: RootState) =>
        selectLandingOrderForm(state.landingOrderForm)
    );

    const [orderBook, setMultiplier, setIsShowingAll] = useOrderbook(
        currency,
        maturity
    );

    const { address, isConnected } = useAccount();

    const [sliderValue, setSliderValue] = useState(0.0);

    const balanceRecord = useBalances();
    const isTablet = useBreakpoint('laptop');

    const loanValue = useMemo(() => {
        if (!maturity) return LoanValue.ZERO;
        if (unitPrice !== undefined && unitPriceExists) {
            return LoanValue.fromPrice(
                unitPrice * 100.0,
                maturity,
                calculationDate
            );
        }
        if (!marketPrice) return LoanValue.ZERO;
        return LoanValue.fromPrice(marketPrice, maturity, calculationDate);
    }, [maturity, unitPrice, unitPriceExists, marketPrice, calculationDate]);

    const unitPriceValue = useMemo(() => {
        if (!maturity) return undefined;
        if (!unitPriceExists) {
            return undefined;
        } else if (unitPrice !== undefined) {
            return unitPrice.toString();
        }
        if (!marketPrice) return undefined;
        if (!isConnected) return undefined;
        return (marketPrice / 100.0).toString();
    }, [maturity, marketPrice, unitPrice, isConnected, unitPriceExists]);

    const dispatch = useDispatch();

    const collateralUsagePercent = useMemo(() => {
        return collateralBook.coverage / 100.0;
    }, [collateralBook]);

    const totalCollateralInUSD = address ? collateralBook.usdCollateral : 0;

    const { data: priceList } = useLastPrices();
    const price = priceList[currency];

    const market = useMarket(currency, maturity);
    const marketUnitPrice = market?.marketUnitPrice;
    const openingUnitPrice = market?.openingUnitPrice;

    const currentMarket = useMemo(() => {
        if (marketUnitPrice) {
            return {
                value: LoanValue.fromPrice(marketUnitPrice, maturity),
                time: market?.lastBlockUnitPriceTimestamp ?? 0,
                type: 'block' as const,
            };
        }
        if (openingUnitPrice) {
            return {
                value: LoanValue.fromPrice(openingUnitPrice, maturity),
                time: 0,
                type: 'opening' as const,
            };
        }
    }, [
        market?.lastBlockUnitPriceTimestamp,
        marketUnitPrice,
        maturity,
        openingUnitPrice,
    ]);

    const slippage = useMemo(() => {
        if (!market) {
            return 0;
        }

        return side === OrderSide.BORROW
            ? market.minBorrowUnitPrice
            : market.maxLendUnitPrice;
    }, [market, side]);

    const orderAmount = amount > 0 ? new Amount(amount, currency) : undefined;

    const { data: availableToBorrow } = useBorrowableAmount(address, currency);

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

    const handleSliderChange = (percentage: number) => {
        const available =
            side === OrderSide.BORROW ? availableToBorrow : balanceToLend;
        track(InteractionEvents.SLIDER, {
            [InteractionProperties.SLIDER_VALUE]: percentage,
        });
        dispatch(
            setAmount(
                ((BigInt(percentage) * available) / BigInt(100)).toString()
            )
        );
        setSliderValue(percentage);
    };

    const handleInputChange = (v: string) => {
        const inputValue = amountFormatterToBase[currency](Number(v));

        dispatch(setAmount(v === '' ? '' : inputValue.toString()));
        const available =
            side === OrderSide.BORROW ? availableToBorrow : balanceToLend;
        if (available > 0) {
            const percentage = (inputValue * BigInt(100)) / available;
            setSliderValue(
                Number(percentage > BigInt(100) ? BigInt(100) : percentage)
            );
        } else {
            setSliderValue(0);
        }
    };

    useEffect(() => {
        if (isItayose) {
            dispatch(setOrderType(OrderType.LIMIT));
        }
    }, [dispatch, isItayose]);

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
        const percentage = (inputAmount * BigInt(100)) / available;
        available
            ? setSliderValue(
                  Number(percentage > BigInt(100) ? BigInt(100) : percentage)
              )
            : setSliderValue(0);
    };

    const isInvalidBondPrice = unitPrice === 0 && orderType === OrderType.LIMIT;

    const showPreOrderError =
        isItayose &&
        ((preOrderPosition === 'borrow' && side === OrderSide.LEND) ||
            (preOrderPosition === 'lend' && side === OrderSide.BORROW));

    const shouldDisableActionButton =
        getAmountValidation(amount, balanceToLend, side) ||
        isInvalidBondPrice ||
        showPreOrderError;

    const isMarketOrderType = orderType === OrderType.MARKET;

    const isBondPriceFieldDisabled = isMarketOrderType || !isConnected;

    const rowsToRenderMobile = useMemo(() => {
        switch (side) {
            case OrderSide.LEND:
                switch (isMarketOrderType) {
                    case true:
                        return 18;
                    case false:
                        return 18;
                }
            case OrderSide.BORROW:
                switch (isMarketOrderType) {
                    case true:
                        return 16;
                    case false:
                        return 14;
                }
        }
    }, [side, isMarketOrderType]);

    const handleFilterChange = useCallback(
        (state: VisibilityState) => {
            setIsShowingAll(state.showBorrow && state.showLend);
        },
        [setIsShowingAll]
    );

    const orderSideOptions = Object.values(OrderSideMap).map(option => ({
        text: getOrderSideText(option),
        variant: TabVariant[option],
    }));
    return (
        <div className='h-full rounded-b-xl border-white-10 bg-neutral-900 pb-7 laptop:border'>
            <div className='h-11 border-b border-neutral-600 laptop:h-[60px]'>
                <TabGroup
                    options={orderSideOptions}
                    selectedOption={getOrderSideText(OrderSideMap[side])}
                    handleClick={option => {
                        dispatch(
                            setSide(
                                option === 'Sell / Borrow'
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
                    isFullHeight
                />
            </div>

            <div className='grid w-full grid-cols-12 gap-5  px-4 pb-8 pt-4 laptop:gap-0 laptop:pb-4 laptop:pt-5'>
                <div className='col-span-7 flex flex-col justify-start gap-2 laptop:col-span-12 laptop:gap-4'>
                    {!isItayose && (
                        <SubtabGroup
                            options={OrderTypeOptions}
                            selectedOption={orderType}
                            handleClick={option => {
                                dispatch(setOrderType(option as OrderType));
                                dispatch(resetUnitPrice());
                                trackButtonEvent(
                                    ButtonEvents.ORDER_TYPE,
                                    ButtonProperties.ORDER_TYPE,
                                    option
                                );
                            }}
                        />
                    )}
                    {side === OrderSide.LEND && (
                        <div className='space-y-1'>
                            <WalletSourceSelector
                                optionList={walletSourceList}
                                selected={selectedWalletSource}
                                account={address ?? ''}
                                onChange={handleWalletSourceChange}
                            />

                            <ErrorInfo
                                showError={getAmountValidation(
                                    amount,
                                    balanceToLend,
                                    side
                                )}
                                errorMessage='Insufficient amount in source'
                            />
                        </div>
                    )}
                    <div className='flex flex-col gap-3 laptop:gap-2.5'>
                        <OrderInputBox
                            field='Bond Price'
                            disabled={isBondPriceFieldDisabled}
                            initialValue={
                                isMarketOrderType ? 'Market' : unitPriceValue
                            }
                            onValueChange={v => {
                                v !== undefined
                                    ? dispatch(setUnitPrice(v.toString()))
                                    : dispatch(setUnitPrice(''));
                                track(InteractionEvents.BOND_PRICE, {
                                    [InteractionProperties.BOND_PRICE]:
                                        v?.toString(),
                                });
                            }}
                            informationText='Input value greater than or equal to 0.01 and up to and including 100.'
                            decimalPlacesAllowed={2}
                            maxLimit={100}
                            bgClassName={
                                isBondPriceFieldDisabled
                                    ? 'bg-neutral-700'
                                    : undefined
                            }
                        />
                        <ErrorInfo
                            errorMessage='Invalid bond price'
                            showError={isInvalidBondPrice}
                        />
                        {isMarketOrderType && (
                            <div className='mx-2 laptop:mx-10px'>
                                <OrderDisplayBox
                                    field='Max Slippage'
                                    value={divide(slippage, 100)}
                                    informationText='A bond price limit, triggering a circuit breaker if exceeded within a single block due to price fluctuations.'
                                />
                            </div>
                        )}
                        <div className='mx-2 mb-1 laptop:mx-10px laptop:mb-0'>
                            <OrderDisplayBox
                                field='Fixed Rate'
                                value={formatLoanValue(loanValue, 'rate')}
                            />
                        </div>
                    </div>
                    {side === OrderSide.BORROW && (
                        <div className='laptop:typography-caption mx-2 flex flex-row justify-between text-[11px] laptop:mx-10px'>
                            <div className='text-slateGray'>{`Available To Borrow (${currency.toString()})`}</div>
                            <div className='text-right text-planetaryPurple'>
                                {prefixTilde(
                                    ordinaryFormat(
                                        amountFormatterFromBase[currency](
                                            availableToBorrow
                                        ),
                                        0,
                                        6
                                    )
                                )}
                            </div>
                        </div>
                    )}
                    <OrderInputBox
                        field='Amount'
                        unit={currency}
                        initialValue={
                            amountExists
                                ? amountFormatterFromBase[currency](
                                      amount
                                  ).toString()
                                : ''
                        }
                        onValueChange={v =>
                            handleInputChange((v as string) ?? '')
                        }
                        disabled={!isConnected}
                        bgClassName={
                            !isConnected ? 'bg-neutral-700' : undefined
                        }
                    />
                    <div className='mx-10px'>
                        <Slider
                            onChange={handleSliderChange}
                            value={sliderValue}
                            disabled={!isConnected}
                        />
                    </div>
                    <div className='mx-2 flex flex-col gap-2 laptop:mx-10px'>
                        <OrderDisplayBox
                            field='Est. Present Value'
                            value={usdFormat(orderAmount?.toUSD(price) ?? 0, 2)}
                        />
                        <OrderDisplayBox
                            field='Future Value'
                            value={
                                unitPriceValue &&
                                unitPriceValue !== '' &&
                                unitPriceValue !== '0'
                                    ? divide(
                                          multiply(
                                              amountFormatterFromBase[currency](
                                                  amount
                                              ),
                                              100,
                                              currencyMap[currency]
                                                  .roundingDecimal
                                          ),
                                          Number(unitPriceValue),
                                          currencyMap[currency].roundingDecimal
                                      )
                                    : 0
                            }
                            informationText='Future Value is the expected return value of the contract at time of maturity.'
                        />
                    </div>

                    <OrderAction
                        loanValue={loanValue}
                        collateralBook={collateralBook}
                        validation={shouldDisableActionButton}
                        isCurrencyDelisted={delistedCurrencySet.has(currency)}
                    />

                    <ErrorInfo
                        errorMessage='Simultaneous borrow and lend orders are not allowed during the pre-open market period.'
                        align='left'
                        showError={showPreOrderError}
                    />
                </div>
                <div className='col-span-5 laptop:hidden'>
                    {isTablet && (
                        <NewOrderBookWidget
                            orderbook={orderBook}
                            currency={currency}
                            marketPrice={currentMarket?.value}
                            maxLendUnitPrice={market?.maxLendUnitPrice}
                            minBorrowUnitPrice={market?.minBorrowUnitPrice}
                            onFilterChange={handleFilterChange}
                            onAggregationChange={setMultiplier}
                            rowsToRenderMobile={rowsToRenderMobile}
                            isItayose
                        />
                    )}
                </div>
            </div>
            <section className='px-4'>
                <div className='border-neutral-3 laptop:border-t laptop:pt-4'>
                    <CollateralManagementConciseTab
                        collateralCoverage={collateralUsagePercent}
                        availableToBorrow={collateralBook.usdAvailableToBorrow}
                        collateralThreshold={collateralBook.collateralThreshold}
                        account={address}
                        totalCollateralInUSD={totalCollateralInUSD}
                    />
                </div>
            </section>
        </div>
    );
}
