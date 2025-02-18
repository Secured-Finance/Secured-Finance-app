import { OrderSide } from '@secured-finance/sf-client';
import { toBytes32 } from '@secured-finance/sf-graph-client';
import queries from '@secured-finance/sf-graph-client/dist/graphclients/';
import { VisibilityState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    AdvancedLendingTopBar,
    Alert,
    AlertSeverity,
    HorizontalTabTable,
    TabSelector,
} from 'src/components/molecules';
import {
    ActiveTradeTable,
    AdvancedLendingOrderCard,
    HistoricalWidget,
    LineChartTab,
    MyTransactionsTable,
    OrderBookWidget,
    OrderHistoryTable,
    OrderTable,
} from 'src/components/organisms';
import { TableType } from 'src/components/pages';
import { ThreeColumnsWithTopBar } from 'src/components/templates';
import {
    CollateralBook,
    baseContracts,
    emptyOrderList,
    useBreakpoint,
    useCurrencies,
    useCurrenciesForOrders,
    useGraphClientHook,
    useIsSubgraphSupported,
    useIsUnderCollateralThreshold,
    useLastPrices,
    useLendingMarkets,
    useMarket,
    useOrderList,
    usePositions,
    useYieldCurveMarketRates,
} from 'src/hooks';
import { useOrderbook } from 'src/hooks/useOrderbook';
import useSF from 'src/hooks/useSecuredFinance';
import {
    resetAmount,
    resetUnitPrice,
    selectLandingOrderForm,
    setCurrency,
    setMaturity,
} from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import {
    DailyMarketInfo,
    MaturityOptionList,
    TransactionList,
} from 'src/types';
import {
    ButtonEvents,
    ButtonProperties,
    CurrencySymbol,
    ZERO_BI,
    checkOrderIsFilled,
    currencyMap,
    formatLoanValue,
    formatOrders,
    formatWithCurrency,
    getMappedOrderStatus,
    hexToCurrencySymbol,
    sortOrders,
    toOptions,
    usdFormat,
} from 'src/utils';
import { LoanValue, Maturity } from 'src/utils/entities';
import { trackButtonEvent } from 'src/utils/events';
import { useAccount } from 'wagmi';

const useTradeHistoryDetails = (
    transactions: TransactionList,
    currency: CurrencySymbol,
    maturity: Maturity
) => {
    return useMemo(() => {
        let min = 10000;
        let max = 0;
        let sum = ZERO_BI;

        if (!transactions.length) {
            min = 0;
            max = 0;
        }

        for (const t of transactions) {
            const price = +t.executionPrice;
            if (price < min) {
                min = price;
            }
            if (price > max) {
                max = price;
            }
            sum += BigInt(t.amount);
        }

        return {
            min: LoanValue.fromPrice(min, maturity.toNumber()),
            max: LoanValue.fromPrice(max, maturity.toNumber()),
            sum: currencyMap[currency].fromBaseUnit(sum),
        };
    }, [currency, maturity, transactions]);
};

export const AdvancedLending = ({
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
    const isTablet = useBreakpoint('laptop');
    const { currency, maturity } = useSelector((state: RootState) =>
        selectLandingOrderForm(state.landingOrderForm)
    );
    const [timestamp, setTimestamp] = useState<number>(1643713200);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedTable, setSelectedTable] = useState(
        TableType.ACTIVE_POSITION
    );

    const dispatch = useDispatch();
    const { address } = useAccount();
    const { data: priceList } = useLastPrices();
    const { data: usedCurrencies = [] } = useCurrenciesForOrders(address);
    const { data: fullPositions } = usePositions(address, usedCurrencies);

    const positions = isChecked
        ? fullPositions?.positions
        : fullPositions?.positions.filter(
              position =>
                  position.maturity === maturity.toString() &&
                  hexToCurrencySymbol(position.currency) === currency
          );

    const { data: fullOrderList = emptyOrderList } = useOrderList(
        address,
        usedCurrencies
    );
    const orderList = isChecked
        ? fullOrderList.activeOrderList
        : fullOrderList.activeOrderList.filter(
              o =>
                  o.maturity === maturity.toString() &&
                  hexToCurrencySymbol(o.currency) === currency
          );

    const currencyPrice = priceList[currency];
    const { data: currencies } = useCurrencies();
    const assetList = toOptions(currencies, currency);

    const securedFinance = useSF();
    const currentChainId = securedFinance?.config.chain.id;
    const isSubgraphSupported = useIsSubgraphSupported(currentChainId);

    useEffect(() => {
        setTimestamp(Math.round(new Date().getTime() / 1000));
    }, []);

    const filteredInactiveOrderList = useMemo(() => {
        return isChecked
            ? fullOrderList.inactiveOrderList
            : fullOrderList.inactiveOrderList.filter(
                  o =>
                      o.maturity === maturity.toString() &&
                      hexToCurrencySymbol(o.currency) === currency
              );
    }, [isChecked, fullOrderList.inactiveOrderList, maturity, currency]);

    const isUnderCollateralThreshold = useIsUnderCollateralThreshold(address);

    const filteredUserOrderHistory = useGraphClientHook(
        {
            address: address?.toLowerCase() ?? '',
            currency: toBytes32(currency),
            maturity: maturity,
        },
        queries.FilteredUserOrderHistoryDocument,
        'user',
        selectedTable !== TableType.ORDER_HISTORY || isChecked
    );

    const fullUserOrderHistory = useGraphClientHook(
        {
            address: address?.toLowerCase() ?? '',
        },
        queries.FullUserOrderHistoryDocument,
        'user',
        selectedTable !== TableType.ORDER_HISTORY || !isChecked
    );

    const userOrderHistory = isChecked
        ? fullUserOrderHistory
        : filteredUserOrderHistory;

    const filteredUserTransactionHistory = useGraphClientHook(
        {
            address: address?.toLowerCase() ?? '',
            currency: toBytes32(currency),
            maturity: maturity,
        },
        queries.FilteredUserTransactionHistoryDocument,
        'user',
        selectedTable !== TableType.MY_TRANSACTIONS || isChecked
    );

    const fullUserTransactionHistory = useGraphClientHook(
        {
            address: address?.toLowerCase() ?? '',
        },
        queries.FullUserTransactionHistoryDocument,
        'user',
        selectedTable !== TableType.MY_TRANSACTIONS || !isChecked
    );

    const userTransactionHistory = isChecked
        ? fullUserTransactionHistory
        : filteredUserTransactionHistory;

    const sortedOrderHistory = useMemo(() => {
        return (userOrderHistory.data?.orders || [])
            .map(order => {
                if (checkOrderIsFilled(order, filteredInactiveOrderList)) {
                    return {
                        ...order,
                        status: 'Filled' as const,
                        filledAmount: order.inputAmount,
                    };
                } else {
                    return {
                        ...order,
                        status: getMappedOrderStatus(order),
                    } as typeof order & { status: string };
                }
            })
            .sort((a, b) => sortOrders(a, b));
    }, [filteredInactiveOrderList, userOrderHistory.data?.orders]);

    const myTransactions = useMemo(() => {
        const tradesFromCon = formatOrders(filteredInactiveOrderList);
        return [
            ...tradesFromCon,
            ...(userTransactionHistory.data?.transactions || []),
        ];
    }, [filteredInactiveOrderList, userTransactionHistory.data?.transactions]);

    const selectedTerm = useMemo(() => {
        return (
            maturitiesOptionList.find(option =>
                option.value.equals(new Maturity(maturity))
            ) || maturitiesOptionList[0]
        );
    }, [maturity, maturitiesOptionList]);

    const data = useMarket(currency, maturity);

    const marketUnitPrice = data?.marketUnitPrice;
    const openingUnitPrice = data?.openingUnitPrice;

    const [orderBook, setMultiplier, setIsShowingAll] = useOrderbook(
        currency,
        maturity
    );

    const { data: transactionHistory } = useGraphClientHook(
        {
            currency: toBytes32(currency),
            maturity: maturity,
            from: timestamp - 24 * 3600,
            to: timestamp,
            sides: [OrderSide.LEND, OrderSide.BORROW],
        },
        queries.TransactionHistoryDocument,
        'transactionHistory',
        !isSubgraphSupported
    );

    const selectedAsset = useMemo(() => {
        return (
            assetList.find(option => option.value === currency) || assetList[0]
        );
    }, [currency, assetList]);

    const tradeHistoryDetails = useTradeHistoryDetails(
        transactionHistory ?? [],
        currency,
        selectedTerm.value
    );

    const dailyMarketInfo = {
        high: formatLoanValue(tradeHistoryDetails.max, 'price'),
        low: formatLoanValue(tradeHistoryDetails.min, 'price'),
        volume: formatWithCurrency(
            tradeHistoryDetails.sum || 0,
            selectedAsset?.value as CurrencySymbol,
            currencyMap[selectedAsset?.value as CurrencySymbol]?.roundingDecimal
        ),
        volumeInUSD: usdFormat(currencyPrice * tradeHistoryDetails.sum),
    } as DailyMarketInfo;

    const {
        rates,
        maturityList,
        itayoseMarketIndexSet,
        maximumRate,
        marketCloseToMaturityOriginalRate,
    } = useYieldCurveMarketRates();

    const currentMarket = useMemo(() => {
        if (marketUnitPrice) {
            return {
                value: LoanValue.fromPrice(marketUnitPrice, maturity),
                time: data?.lastBlockUnitPriceTimestamp ?? 0,
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
        data?.lastBlockUnitPriceTimestamp,
        marketUnitPrice,
        maturity,
        openingUnitPrice,
    ]);

    const handleCurrencyChange = useCallback(
        (v: CurrencySymbol) => {
            dispatch(setCurrency(v));
            dispatch(resetUnitPrice());
            dispatch(resetAmount());
            trackButtonEvent(
                ButtonEvents.CURRENCY_CHANGE,
                ButtonProperties.CURRENCY,
                v
            );
        },
        [dispatch]
    );

    const handleTermChange = useCallback(
        (v: Maturity) => {
            dispatch(setMaturity(Number(v)));
            dispatch(resetUnitPrice());
            trackButtonEvent(
                ButtonEvents.TERM_CHANGE,
                ButtonProperties.TERM,
                selectedTerm.label
            );
        },
        [dispatch, selectedTerm.label]
    );

    const handleFilterChange = useCallback(
        (state: VisibilityState) => {
            setIsShowingAll(state.showBorrow && state.showLend);
        },
        [setIsShowingAll]
    );

    const maximumOpenOrderLimit =
        fullOrderList.activeOrderList.filter(
            o => hexToCurrencySymbol(o.currency) === currency
        ).length >= 20;

    const tooltipMap: Record<number, string> = {};

    if (maximumOpenOrderLimit)
        tooltipMap[1] =
            'You have too many open orders. Please ensure that you have fewer than 20 orders to place more orders.';

    return (
        <div className='grid gap-2'>
            {maximumOpenOrderLimit && (
                <div className='px-3 laptop:px-0'>
                    <Alert
                        severity={AlertSeverity.Warning}
                        title='You will not be able to place additional orders as
                            you currently have the maximum number of 20 orders.
                            Please wait for your order to be filled or cancel
                            existing orders before adding more.'
                    />
                </div>
            )}
            <MovingTape
                nonMaturedMarketOptionList={maturitiesOptionList}
            ></MovingTape>
            <ThreeColumnsWithTopBar
                topBar={
                    <AdvancedLendingTopBar
                        selectedAsset={selectedAsset}
                        assetList={assetList}
                        options={maturitiesOptionList}
                        selected={{
                            label: selectedTerm.label,
                            value: selectedTerm.value,
                        }}
                        onAssetChange={handleCurrencyChange}
                        onTermChange={handleTermChange}
                        currencyPrice={usdFormat(currencyPrice, 2)}
                        currentMarket={currentMarket}
                        marketInfo={
                            isSubgraphSupported ? dailyMarketInfo : undefined
                        }
                    />
                }
            >
                <TabSelector
                    tabDataArray={
                        isSubgraphSupported
                            ? [
                                  { text: 'Yield Curve' },
                                  { text: 'Historical Chart' },
                              ]
                            : [{ text: 'Yield Curve' }]
                    }
                >
                    <div className='h-[410px] w-full px-2 py-4'>
                        <LineChartTab
                            rates={rates}
                            maturityList={maturityList}
                            itayoseMarketIndexSet={itayoseMarketIndexSet}
                            followLinks={false}
                            maximumRate={maximumRate}
                            marketCloseToMaturityOriginalRate={
                                marketCloseToMaturityOriginalRate
                            }
                        />
                    </div>
                    {isSubgraphSupported && <HistoricalWidget />}
                </TabSelector>

                <>
                    <div className='col-span-1 hidden w-[calc(100%-284px)] laptop:block desktop:w-[calc(100%-312px)]'>
                        <div className='flex h-full flex-grow flex-col gap-4'>
                            <TabSelector
                                tabDataArray={
                                    isSubgraphSupported
                                        ? [
                                              { text: 'Yield Curve' },
                                              { text: 'Historical Chart' },
                                          ]
                                        : [{ text: 'Yield Curve' }]
                                }
                                tabGroupClassName='laptop:w-full laptop:max-w-[400px] desktop:max-w-[450px]'
                            >
                                <div className='h-[410px] w-full px-2 py-4'>
                                    <LineChartTab
                                        rates={rates}
                                        maturityList={maturityList}
                                        itayoseMarketIndexSet={
                                            itayoseMarketIndexSet
                                        }
                                        followLinks={false}
                                        maximumRate={maximumRate}
                                        marketCloseToMaturityOriginalRate={
                                            marketCloseToMaturityOriginalRate
                                        }
                                    />
                                </div>
                                {isSubgraphSupported && <HistoricalWidget />}
                            </TabSelector>
                        </div>
                    </div>

                    <div className='hidden laptop:block laptop:w-[272px] desktop:w-[300px]'>
                        {!isTablet && (
                            <OrderBookWidget
                                orderbook={orderBook}
                                currency={currency}
                                marketPrice={currentMarket?.value}
                                maxLendUnitPrice={data?.maxLendUnitPrice}
                                minBorrowUnitPrice={data?.minBorrowUnitPrice}
                                onFilterChange={handleFilterChange}
                                onAggregationChange={setMultiplier}
                            />
                        )}
                    </div>
                    <div className='col-span-12 laptop:w-full'>
                        <HorizontalTabTable
                            tabTitles={
                                isSubgraphSupported
                                    ? [
                                          'Active Positions',
                                          'Open Orders',
                                          'Order History',
                                          'My Transactions',
                                      ]
                                    : ['Active Positions', 'Open Orders']
                            }
                            onTabChange={setSelectedTable}
                            useCustomBreakpoint={true}
                            tooltipMap={tooltipMap}
                            showAllPositions={true}
                            isChecked={isChecked}
                            setIsChecked={setIsChecked}
                        >
                            <ActiveTradeTable
                                data={
                                    positions
                                        ? positions.map(position => {
                                              const ccy = hexToCurrencySymbol(
                                                  position.currency
                                              );
                                              if (!ccy) return position;
                                              return {
                                                  ...position,
                                                  underMinimalCollateralThreshold:
                                                      isUnderCollateralThreshold(
                                                          ccy,
                                                          Number(
                                                              position.maturity
                                                          ),
                                                          Number(
                                                              position.marketPrice
                                                          ),
                                                          position.futureValue >
                                                              0
                                                              ? OrderSide.LEND
                                                              : OrderSide.BORROW
                                                      ),
                                              };
                                          })
                                        : []
                                }
                                height={350}
                                delistedCurrencySet={delistedCurrencySet}
                                variant='compact'
                            />
                            <OrderTable data={orderList} height={350} />
                            <OrderHistoryTable
                                data={sortedOrderHistory}
                                pagination={{
                                    totalData: sortedOrderHistory.length,
                                    getMoreData: () => {},
                                    containerHeight: 350,
                                }}
                                variant='compact'
                                isLoading={userOrderHistory.loading}
                            />
                            <MyTransactionsTable
                                data={myTransactions}
                                pagination={{
                                    totalData: myTransactions.length,
                                    getMoreData: () => {},
                                    containerHeight: 350,
                                }}
                                variant='compact'
                                isLoading={userTransactionHistory.loading}
                            />
                        </HorizontalTabTable>
                    </div>
                </>
                <AdvancedLendingOrderCard
                    collateralBook={collateralBook}
                    marketPrice={marketPrice}
                    delistedCurrencySet={delistedCurrencySet}
                />
            </ThreeColumnsWithTopBar>
        </div>
    );
};

const MovingTape = ({
    nonMaturedMarketOptionList,
}: {
    nonMaturedMarketOptionList: MaturityOptionList;
}) => {
    const router = useRouter();
    const { data: lendingMarkets = baseContracts } = useLendingMarkets();
    const { data: currencies = [] } = useCurrencies();

    const handleClick = (item: string) => {
        router.push({
            pathname: '/',
            query: {
                market: item,
            },
        });
    };

    const result = useMemo(() => {
        return currencies.flatMap(asset =>
            nonMaturedMarketOptionList.map(maturity => {
                const data = lendingMarkets[asset]?.[+maturity.value];
                const preOpeningDate = dayjs(data?.preOpeningDate * 1000);
                const now = dayjs();
                const isNotReady =
                    data?.isMatured || now.isBefore(preOpeningDate);

                const marketUnitPrice = data?.marketUnitPrice;
                const openingUnitPrice = data?.openingUnitPrice;
                const lastPrice =
                    marketUnitPrice || openingUnitPrice
                        ? LoanValue.fromPrice(
                              marketUnitPrice || openingUnitPrice,
                              +maturity.value
                          )
                        : undefined;

                return {
                    asset: `${asset}-${maturity.label}`,
                    apr: formatLoanValue(lastPrice, 'rate'),
                    isNotReady,
                };
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(lendingMarkets),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(nonMaturedMarketOptionList),
    ]);

    return (
        <div className='relative ml-3 mr-3 flex items-center overflow-hidden text-neutral-50'>
            <div className='inline-block animate-scroll-left whitespace-nowrap text-xs leading-5 hover:[animation-play-state:paused]'>
                {result
                    .filter(res => !res.isNotReady)
                    .map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleClick(item.asset)}
                            aria-label={`Select ${item.asset} market. APR is ${item.apr}`}
                            className='rounded-sm px-2 py-1 hover:cursor-pointer hover:bg-white/10 hover:shadow-md'
                        >
                            {item.asset}
                            <span
                                className={`ml-1 ${
                                    Number(item.apr) < 0 ||
                                    item.apr === '--.--%'
                                        ? 'text-error-300'
                                        : 'text-success-300'
                                }`}
                            >
                                {item.apr} APR
                            </span>
                        </button>
                    ))}
            </div>
        </div>
    );
};
