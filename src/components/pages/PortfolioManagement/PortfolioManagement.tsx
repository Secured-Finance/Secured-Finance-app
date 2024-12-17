import { OrderSide } from '@secured-finance/sf-client';
import queries from '@secured-finance/sf-graph-client/dist/graphclients';
import { useMemo, useState } from 'react';
import { Spinner } from 'src/components/atoms';
import {
    Alert,
    AlertSeverity,
    DELISTED_CURRENCIES_KEY,
    HorizontalTabTable,
    StatsBar,
    ZCBond,
} from 'src/components/molecules';
import {
    ActiveTradeTable,
    CollateralOrganism,
    MyTransactionsTable,
    MyWalletWidget,
    OpenOrder,
    OrderHistoryTable,
    OrderTable,
} from 'src/components/organisms';
import { Page, TwoColumns } from 'src/components/templates';
import {
    baseContracts,
    emptyCollateralBook,
    emptyOrderList,
    useCollateralBook,
    useCurrenciesForOrders,
    useCurrencyDelistedStatus,
    useGenesisValues,
    useGraphClientHook,
    useIsSubgraphSupported,
    useIsUnderCollateralThreshold,
    useLastPrices,
    useLendingMarkets,
    useMarketLists,
    useOrderList,
    usePositions,
} from 'src/hooks';
import useSF from 'src/hooks/useSecuredFinance';
import {
    LOAN_MARKET_PLATFORM_GUIDE_LINK,
    Maturity,
    checkOrderIsFilled,
    computeNetValue,
    formatOrders,
    getMappedOrderStatus,
    hexToCurrencySymbol,
    sortOrders,
    usdFormat,
} from 'src/utils';
import { useAccount } from 'wagmi';

export enum TableType {
    ACTIVE_POSITION = 0,
    OPEN_ORDERS,
    ORDER_HISTORY,
    MY_TRANSACTIONS,
}

export const TabSpinner = () => (
    <div className='flex h-full w-full items-center justify-center pt-10'>
        <Spinner />
    </div>
);

export const PortfolioManagement = () => {
    const { address } = useAccount();
    const [selectedTable, setSelectedTable] = useState(
        TableType.ACTIVE_POSITION
    );
    const { data: delistedCurrencySet } = useCurrencyDelistedStatus();
    const { data: lendingMarkets = { ...baseContracts } } = useLendingMarkets();

    const securedFinance = useSF();
    const currentChainId = securedFinance?.config.chain.id;

    const isSubgraphSupported = useIsSubgraphSupported(currentChainId);

    const userOrderHistory = useGraphClientHook(
        {
            address: address?.toLowerCase() ?? '',
        },
        queries.FullUserOrderHistoryDocument,
        'user',
        selectedTable !== TableType.ORDER_HISTORY
    );

    const userTransactionHistory = useGraphClientHook(
        {
            address: address?.toLowerCase() ?? '',
        },
        queries.FullUserTransactionHistoryDocument,
        'user',
        selectedTable !== TableType.MY_TRANSACTIONS
    );

    const { data: usedCurrencies = [] } = useCurrenciesForOrders(address);
    const { data: orderList = emptyOrderList } = useOrderList(
        address,
        usedCurrencies
    );

    const activeOrderList = useMemo(() => {
        const updatedOrderList: OpenOrder[] = [];
        orderList.activeOrderList.forEach(order => {
            const ccy = hexToCurrencySymbol(order.currency);
            if (!ccy) {
                return;
            }
            const maturity = Number(order.maturity);
            const lendingMarket = lendingMarkets[ccy][maturity];
            if (!lendingMarket) {
                return;
            }
            if (
                lendingMarket?.isPreOrderPeriod ||
                lendingMarket?.isItayosePeriod
            ) {
                updatedOrderList.push({
                    ...order,
                    calculationDate: lendingMarket.utcOpeningDate,
                });
            } else {
                updatedOrderList.push(order);
            }
        });
        return updatedOrderList;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(lendingMarkets),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(orderList.activeOrderList),
    ]);

    const { data: positions } = usePositions(address, usedCurrencies);
    const genesisValues = useGenesisValues(
        address,
        positions?.positions || []
    ).map(({ data }) => data);
    const { allMarkets } = useMarketLists();

    const zcBonds = useMemo(() => {
        const lendingPositions = positions?.positions.filter(
            position => position.amount >= 0
        );

        const zcBonds: ZCBond[] = [];

        lendingPositions?.map(position => {
            const currency = hexToCurrencySymbol(position.currency);

            if (currency) {
                const targetMarkets = allMarkets.filter(
                    market => market.currency === position.currency
                );
                const hasGenesisValue =
                    targetMarkets.length > 0 &&
                    targetMarkets[0].maturity.toString() === position.maturity;
                const {
                    amountInPV: genesisValueAmountInPV = BigInt(0),
                    amountInFV: genesisValueAmountInFV = BigInt(0),
                    amount: tokenAmount,
                } = genesisValues.find(
                    genesisValue => genesisValue?.currency === currency
                ) ?? {};

                if (hasGenesisValue && tokenAmount && tokenAmount > 0) {
                    zcBonds.push({
                        currency,
                        amount: genesisValueAmountInPV,
                        tokenAmount: tokenAmount,
                    });
                    const remainingAmount =
                        position.amount - genesisValueAmountInPV;
                    const remainingTokenAmount =
                        position.futureValue - genesisValueAmountInFV;
                    if (remainingAmount > 0) {
                        zcBonds.push({
                            currency,
                            maturity: new Maturity(position.maturity),
                            amount: remainingAmount,
                            tokenAmount: remainingTokenAmount,
                        });
                    }
                } else {
                    zcBonds.push({
                        currency,
                        maturity: new Maturity(position.maturity),
                        amount: position.amount,
                        tokenAmount: position.futureValue,
                    });
                }
            }
        });

        return zcBonds;
    }, [positions, genesisValues, allMarkets]);

    const sortedOrderHistory = useMemo(() => {
        return (userOrderHistory.data?.orders ?? [])
            .map(order => {
                if (checkOrderIsFilled(order, orderList.inactiveOrderList)) {
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
    }, [orderList.inactiveOrderList, userOrderHistory.data?.orders]);

    const { data: priceMap } = useLastPrices();

    const { data: collateralBook = emptyCollateralBook, isPending } =
        useCollateralBook(address);

    const portfolioAnalytics = useMemo(() => {
        if (isPending) {
            return {
                borrowedPV: 0,
                lentPV: 0,
                netAssetValue: 0,
            };
        }
        const borrowedPV = positions
            ? computeNetValue(
                  positions.positions.filter(
                      position => position.futureValue < 0
                  ),
                  priceMap
              )
            : 0;
        const lentPV = positions
            ? computeNetValue(
                  positions.positions.filter(
                      position => position.futureValue > 0
                  ),
                  priceMap
              )
            : 0;
        return {
            borrowedPV,
            lentPV,
            netAssetValue:
                collateralBook.usdCollateral +
                collateralBook.totalPresentValue +
                collateralBook.usdNonCollateral +
                orderList.totalPVOfOpenOrdersInUSD,
        };
    }, [
        collateralBook.totalPresentValue,
        collateralBook.usdCollateral,
        collateralBook.usdNonCollateral,
        isPending,
        orderList.totalPVOfOpenOrdersInUSD,
        positions,
        priceMap,
    ]);

    const myTransactions = useMemo(() => {
        const tradesFromCon = formatOrders(orderList.inactiveOrderList);
        return [
            ...tradesFromCon,
            ...(userTransactionHistory.data?.transactions ?? []),
        ];
    }, [
        orderList.inactiveOrderList,
        userTransactionHistory.data?.transactions,
    ]);

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
        });
    };

    const userDelistedCurrenciesSet = new Set<string>();

    if (positions) {
        positions.positions.forEach(position => {
            const ccy = hexToCurrencySymbol(position.currency);
            if (ccy && delistedCurrencySet.has(ccy)) {
                userDelistedCurrenciesSet.add(ccy);
            }
        });
    }

    const userDelistedCurrenciesArray = Array.from(userDelistedCurrenciesSet);
    const isUnderCollateralThreshold = useIsUnderCollateralThreshold(address);

    return (
        <Page title='Portfolio Management' name='portfolio-management'>
            {userDelistedCurrenciesArray.length > 0 && (
                <div className='px-3 laptop:px-0'>
                    <Alert
                        severity={AlertSeverity.Error}
                        localStorageKey={DELISTED_CURRENCIES_KEY}
                        localStorageValue={Array.from(delistedCurrencySet)
                            .sort()
                            .join()}
                        title={
                            <>
                                <p>
                                    Please note that your contracts for{' '}
                                    {generateDelistedCurrencyText(
                                        userDelistedCurrenciesArray
                                    )}{' '}
                                    will be delisted at maturity on Secured
                                    Finance.{' '}
                                    <a
                                        className='whitespace-nowrap text-secondary7 underline'
                                        href={LOAN_MARKET_PLATFORM_GUIDE_LINK}
                                        target='_blank'
                                        rel='noreferrer'
                                        onClick={e => {
                                            e.preventDefault();
                                            scrollToBottom();
                                        }}
                                    >
                                        Learn more
                                    </a>
                                </p>
                            </>
                        }
                    />
                </div>
            )}

            <TwoColumns>
                <div className='flex flex-col gap-6'>
                    <StatsBar
                        testid='portfolio-management'
                        values={[
                            {
                                name: 'Net Asset Value',
                                value: usdFormat(
                                    portfolioAnalytics.netAssetValue
                                ),
                            },
                            {
                                name: 'Active Contracts',
                                value: positions
                                    ? positions.positions.length.toString()
                                    : '0',
                            },
                            {
                                name: 'Lending PV',
                                value: usdFormat(portfolioAnalytics.lentPV),
                            },
                            {
                                name: 'Borrowing PV',
                                value: usdFormat(portfolioAnalytics.borrowedPV),
                            },
                        ]}
                    />
                    <CollateralOrganism
                        collateralBook={collateralBook}
                        netAssetValue={portfolioAnalytics.netAssetValue}
                        zcBonds={zcBonds}
                    />
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
                    >
                        <ActiveTradeTable
                            data={
                                positions
                                    ? positions.positions.map(position => {
                                          const ccy = hexToCurrencySymbol(
                                              position.currency
                                          );
                                          if (!ccy) return position;
                                          return {
                                              ...position,
                                              underMinimalCollateralThreshold:
                                                  isUnderCollateralThreshold(
                                                      ccy,
                                                      Number(position.maturity),
                                                      Number(
                                                          position.marketPrice
                                                      ),
                                                      position.futureValue > 0
                                                          ? OrderSide.LEND
                                                          : OrderSide.BORROW
                                                  ),
                                          };
                                      })
                                    : []
                            }
                            delistedCurrencySet={delistedCurrencySet}
                            variant='compact'
                        />
                        <OrderTable data={activeOrderList} />
                        <OrderHistoryTable
                            data={sortedOrderHistory}
                            pagination={{
                                totalData: sortedOrderHistory.length,
                                getMoreData: () => {},
                                containerHeight: 300,
                            }}
                            variant='compact'
                            isLoading={userOrderHistory.loading}
                        />
                        <MyTransactionsTable
                            data={myTransactions}
                            pagination={{
                                totalData: myTransactions.length,
                                getMoreData: () => {},
                                containerHeight: 300,
                            }}
                            variant='compact'
                            isLoading={userTransactionHistory.loading}
                        />
                    </HorizontalTabTable>
                    <Disclaimer
                        showDelistedCurrencyDisclaimer={
                            userDelistedCurrenciesArray.length > 0
                        }
                    />
                </div>
                <div className='my-4 laptop:my-0'>
                    <MyWalletWidget />
                </div>
            </TwoColumns>
        </Page>
    );
};

const Disclaimer = ({
    showDelistedCurrencyDisclaimer,
}: {
    showDelistedCurrencyDisclaimer: boolean;
}) => {
    return (
        <div className='typography-dropdown-selection-label mt-4 w-fit rounded-xl text-justify text-secondary7 '>
            {showDelistedCurrencyDisclaimer && (
                <p className='p-3'>
                    <span className='inline-flex items-baseline gap-1 text-galacticOrange'>
                        Delisting Contracts
                    </span>{' '}
                    - Auto-rolls are discontinued after the contract&apos;s
                    maturity. Borrowers are advised to repay within 7 days of
                    maturity to avoid 7% penalty. Lenders can redeem their funds
                    starting 7 days post-maturity. Note that some order books
                    might necessitate up to 2 years to reach full maturity.
                </p>
            )}

            <p className='p-3'>
                <span className='inline-flex items-baseline gap-1 text-white'>
                    Standard Contracts
                </span>{' '}
                - Secured Finance lending contract includes an auto-roll
                feature. If no action is taken by the user prior to the
                contract&apos;s maturity date, it will automatically roll over
                into the next closest expiration date. This convenience comes
                with a 0.25% fee for the auto-roll transaction.
            </p>
            <p className='p-3'>
                It is the user&apos;s responsibility to take action to unwind
                the contract prior to its maturity date. Failure to do so will
                result in the contract being automatically rolled over,
                incurring the aforementioned fee.
            </p>
            <p className='p-3'>
                For an in-depth understanding of our protocol, please refer to{' '}
                <a
                    href={LOAN_MARKET_PLATFORM_GUIDE_LINK}
                    className='whitespace-nowrap text-planetaryPurple underline'
                    target='_blank'
                    rel='noreferrer'
                >
                    Docs.Secured.Finance.
                </a>
            </p>
        </div>
    );
};

export const generateDelistedCurrencyText = (currencies: string[]) => {
    const numberOfCurrencies = currencies.length;

    if (numberOfCurrencies === 1) {
        return currencies[0];
    }

    return currencies.reduce((acc, ccy: string, index: number) => {
        if (index === numberOfCurrencies - 1) {
            return acc + `and ${ccy}`;
        } else if (index === numberOfCurrencies - 2) {
            return acc + `${ccy} `;
        } else {
            return acc + `${ccy}, `;
        }
    }, '');
};
