import { OrderSide } from '@secured-finance/sf-client';
import { toBytes32 } from '@secured-finance/sf-graph-client';
import queries from '@secured-finance/sf-graph-client/dist/graphclients/';
import { VisibilityState } from '@tanstack/table-core';
import clsx from 'clsx';
import * as dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MarketTab, Option, TextLink, Timer } from 'src/components/atoms';
import {
    Alert,
    CurrencyMaturityDropdown,
    HorizontalTabTable,
    TabSelector,
} from 'src/components/molecules';
import {
    AdvancedLendingOrderCard,
    LineChartTab,
    NewOrderBookWidget,
    OrderHistoryTable,
    OrderTable,
} from 'src/components/organisms';
import { Page, ThreeColumnsWithTopBar } from 'src/components/templates';
import {
    MarketPhase,
    baseContracts,
    emptyCollateralBook,
    useBorrowOrderBook,
    useBreakpoint,
    useCollateralBook,
    useCurrencies,
    useCurrencyDelistedStatus,
    useGraphClientHook,
    useIsSubgraphSupported,
    useItayoseEstimation,
    useLastPrices,
    useLendOrderBook,
    useLendingMarkets,
    useMarket,
    useMarketOrderList,
    useMarketPhase,
    useMaturityOptions,
    useOrderbook,
    useYieldCurveMarketRates,
} from 'src/hooks';
import useSF from 'src/hooks/useSecuredFinance';
import {
    resetAmount,
    selectLandingOrderForm,
    setCurrency,
    setMaturity,
} from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import {
    CurrencySymbol,
    LoanValue,
    Maturity,
    ZERO_BI,
    getMappedOrderStatus,
    getTransformMaturityOption,
    sortOrders,
    toOptions,
    usdFormat,
} from 'src/utils';
import { useAccount } from 'wagmi';

enum TableType {
    OPEN_ORDERS = 0,
    ORDER_HISTORY,
}

const Toolbar = ({
    selectedAsset,
    assetList,
    options,
    selected,
    date,
    nextMarketPhase,
    currency,
    handleAssetChange,
    handleTermChange,
}: {
    selectedAsset: Option<CurrencySymbol> | undefined;
    assetList: Array<Option<CurrencySymbol>>;
    options: Array<Option<Maturity>>;
    selected: Option<Maturity>;
    date: number;
    nextMarketPhase: string;
    currency: CurrencySymbol;
    handleAssetChange: (v: CurrencySymbol) => void;
    handleTermChange: (v: Maturity) => void;
}) => {
    const { data: priceList } = useLastPrices();
    const selectedTerm = useMemo(
        () => options.find(o => o.value === selected.value),
        [options, selected]
    );

    const onHandleTermChange = useCallback(
        (v: Maturity) => handleTermChange(v),
        [handleTermChange]
    );

    const onChange = (asset: CurrencySymbol, maturity: Maturity) => {
        onHandleTermChange(maturity);
        handleAssetChange(asset);
    };

    return (
        <div>
            <div className='h-1 bg-starBlue'></div>
            <div
                className={clsx(
                    'border-b border-l border-r border-white-10 bg-neutral-900'
                )}
            >
                <div className='flex min-w-fit flex-row items-center justify-start gap-10 px-6 py-3 tablet:justify-between'>
                    <div className='w-full tablet:w-1/2'>
                        <div className='grid grid-cols-1 gap-x-3 gap-y-1 text-neutral-4 desktop:gap-x-5'>
                            <div className='flex flex-col items-start'>
                                <div className='flex w-full flex-col gap-1'>
                                    <CurrencyMaturityDropdown
                                        asset={selectedAsset}
                                        currencyList={assetList}
                                        maturity={selectedTerm}
                                        maturityList={options}
                                        onChange={onChange}
                                        isItayosePage
                                    />
                                    <p className='whitespace-nowrap pl-1 text-[11px] leading-4 tablet:text-xs laptop:text-xs'>
                                        {`Maturity ${
                                            selectedTerm &&
                                            getTransformMaturityOption(
                                                options.map(o => ({
                                                    ...o,
                                                    value: o.value.toString(),
                                                }))
                                            )(selectedTerm.label)
                                        }`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='hidden w-full flex-row items-center justify-start gap-40 tablet:flex'>
                        <div className='typography-caption w-40 text-nebulaTeal'>
                            <p className=' typography-caption-2 text-slateGray'>
                                {nextMarketPhase}
                            </p>
                            <Timer targetTime={date * 1000} />
                        </div>
                        <div>
                            <MarketTab
                                name={`${currency} Price`}
                                value={usdFormat(priceList[currency], 2)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Itayose = () => {
    const { address } = useAccount();
    const isTablet = useBreakpoint('laptop');

    const { currency, maturity } = useSelector((state: RootState) =>
        selectLandingOrderForm(state.landingOrderForm)
    );
    const [selectedTable, setSelectedTable] = useState(TableType.OPEN_ORDERS);

    const { data: delistedCurrencySet } = useCurrencyDelistedStatus();

    const { data: lendingMarkets = baseContracts } = useLendingMarkets();
    const { data: itayoseEstimation } = useItayoseEstimation(
        currency,
        maturity
    );
    const lendingContracts = lendingMarkets[currency];

    const securedFinance = useSF();
    const currentChainId = securedFinance?.config.chain.id;
    const isSubgraphSupported = useIsSubgraphSupported(currentChainId);

    const marketPhase = useMarketPhase(currency, maturity);
    const data = useMarket(currency, maturity);

    const maturityOptionList = useMaturityOptions(
        lendingContracts,
        market => !market.isMatured
    );

    const {
        rates,
        maturityList,
        itayoseMarketIndexSet,
        maximumRate,
        marketCloseToMaturityOriginalRate,
    } = useYieldCurveMarketRates();

    const selectedTerm = useMemo(() => {
        return (
            maturityOptionList.find(option =>
                option.value.equals(new Maturity(maturity))
            ) || maturityOptionList[0]
        );
    }, [maturity, maturityOptionList]);

    const { data: currencies } = useCurrencies();
    const assetList = useMemo(
        () =>
            toOptions(currencies, currency).filter(
                ccy => !delistedCurrencySet.has(ccy.label as CurrencySymbol)
            ),
        [currencies, currency, delistedCurrencySet]
    );
    const userOrderHistory = useGraphClientHook(
        {
            address: address?.toLowerCase() ?? '',
            currency: toBytes32(currency),
            maturity: maturity,
        },
        queries.FilteredUserOrderHistoryDocument,
        'user',
        selectedTable !== TableType.ORDER_HISTORY
    );

    const sortedOrderHistory = useMemo(() => {
        return (userOrderHistory.data?.orders || [])
            .map(order => {
                return {
                    ...order,
                    status: getMappedOrderStatus(order),
                } as typeof order & { status: string };
            })
            .sort((a, b) => sortOrders(a, b));
    }, [userOrderHistory.data?.orders]);

    const estimatedOpeningUnitPrice = lendingMarkets[currency][maturity]
        ?.openingUnitPrice
        ? LoanValue.fromPrice(
              lendingMarkets[currency][maturity]?.openingUnitPrice ?? 0,
              maturity,
              lendingContracts[selectedTerm.value.toNumber()]?.utcOpeningDate
          )
        : undefined;

    const selectedAsset = useMemo(() => {
        return assetList.find(option => option.value === currency);
    }, [currency, assetList]);

    const {
        data: borrowAmount,
        isPending: isPendingBorrow,
        fetchStatus: borrowFetchStatus,
    } = useBorrowOrderBook(
        currency,
        maturity,
        Number(itayoseEstimation?.lastBorrowUnitPrice ?? ZERO_BI)
    );

    const {
        data: lendAmount,
        isPending: isPendingLend,
        fetchStatus: lendFetchStatus,
    } = useLendOrderBook(
        currency,
        maturity,
        Number(itayoseEstimation?.lastLendUnitPrice ?? ZERO_BI)
    );

    const [orderBook, setMultiplier, setIsShowingAll] = useOrderbook(
        currency,
        maturity,
        lendingContracts[selectedTerm.value.toNumber()]?.utcOpeningDate,
        itayoseEstimation?.lastBorrowUnitPrice,
        borrowAmount,
        itayoseEstimation?.lastLendUnitPrice,
        lendAmount
    );

    const { data: collateralBook = emptyCollateralBook } =
        useCollateralBook(address);

    const filteredOrderList = useMarketOrderList(
        address,
        currency,
        maturity,
        o => o.isPreOrder
    ).map(o => {
        return {
            ...o,
            calculationDate: lendingContracts[maturity]?.utcOpeningDate,
        };
    });

    const dispatch = useDispatch();

    const handleAssetChange = useCallback(
        (v: CurrencySymbol) => {
            dispatch(resetAmount());
            dispatch(setCurrency(v));
        },
        [dispatch]
    );

    const isLoadingMap = {
        [OrderSide.BORROW]: isPendingBorrow && borrowFetchStatus !== 'idle',
        [OrderSide.LEND]: isPendingLend && lendFetchStatus !== 'idle',
    };

    const preOrderDays = useMemo(() => {
        const contract = lendingContracts[selectedTerm.value.toNumber()];
        const openingDate = contract?.utcOpeningDate;
        const preOpeningDate = contract?.preOpeningDate;
        return openingDate && preOpeningDate
            ? dayjs.unix(openingDate).diff(preOpeningDate * 1000, 'days')
            : undefined;
    }, [lendingContracts, selectedTerm.value]);

    const handleFilterChange = useCallback(
        (state: VisibilityState) => {
            setIsShowingAll(state.showBorrow && state.showLend);
        },
        [setIsShowingAll]
    );

    return (
        <Page title='Pre-Open Order Book'>
            {preOrderDays && (
                <div className='px-3 laptop:px-0'>
                    <Alert
                        title={
                            <>
                                Secure your market position by placing limit
                                orders up to {preOrderDays} days before trading
                                begins with no fees. Opt for either a lend or
                                borrow during pre-open, not both. No new
                                pre-orders will be accepted within 1 hour prior
                                to the start of trading. Learn more at&nbsp;
                                <TextLink
                                    href='https://docs.secured.finance/platform-guide/unique-features/fair-price-discovery/'
                                    text='Secured Finance Docs'
                                />
                            </>
                        }
                    />
                </div>
            )}
            <ThreeColumnsWithTopBar
                topBar={
                    <Toolbar
                        date={
                            lendingContracts[selectedTerm.value.toNumber()]
                                ?.utcOpeningDate
                        }
                        nextMarketPhase={
                            marketPhase === MarketPhase.PRE_ORDER
                                ? 'Pre-Open'
                                : 'Open in'
                        }
                        assetList={assetList}
                        selectedAsset={selectedAsset}
                        options={maturityOptionList}
                        selected={{
                            label: selectedTerm.label,
                            value: selectedTerm.value,
                        }}
                        currency={currency}
                        handleAssetChange={handleAssetChange}
                        handleTermChange={v => {
                            dispatch(setMaturity(Number(v)));
                        }}
                    />
                }
            >
                <TabSelector tabDataArray={[{ text: 'Yield Curve' }]}>
                    <div className='h-[410px] w-full px-6 py-4'>
                        <LineChartTab
                            rates={rates}
                            maturityList={maturityList}
                            itayoseMarketIndexSet={itayoseMarketIndexSet}
                            maximumRate={maximumRate}
                            marketCloseToMaturityOriginalRate={
                                marketCloseToMaturityOriginalRate
                            }
                        />
                    </div>
                </TabSelector>

                <>
                    <div className='col-span-1 hidden w-[calc(100%-284px)] laptop:block desktop:w-[calc(100%-312px)]'>
                        <div className='flex h-full flex-grow flex-col gap-4'>
                            <TabSelector
                                tabDataArray={[{ text: 'Yield Curve' }]}
                            >
                                <div className='h-[410px] w-full px-6 py-4'>
                                    <LineChartTab
                                        rates={rates}
                                        maturityList={maturityList}
                                        itayoseMarketIndexSet={
                                            itayoseMarketIndexSet
                                        }
                                        maximumRate={maximumRate}
                                        marketCloseToMaturityOriginalRate={
                                            marketCloseToMaturityOriginalRate
                                        }
                                    />
                                </div>
                            </TabSelector>
                        </div>
                    </div>
                    <div className='hidden laptop:block laptop:w-[272px] desktop:w-[300px]'>
                        {!isTablet && (
                            <NewOrderBookWidget
                                orderbook={orderBook}
                                currency={currency}
                                marketPrice={estimatedOpeningUnitPrice}
                                maxLendUnitPrice={data?.maxLendUnitPrice}
                                minBorrowUnitPrice={data?.minBorrowUnitPrice}
                                onFilterChange={handleFilterChange}
                                onAggregationChange={setMultiplier}
                                isLoadingMap={isLoadingMap}
                                isItayose
                            />
                        )}
                    </div>
                    <div className='col-span-12 laptop:w-full'>
                        <HorizontalTabTable
                            tabTitles={
                                isSubgraphSupported
                                    ? ['Open Orders', 'Order History']
                                    : ['Open Orders']
                            }
                            onTabChange={setSelectedTable}
                            useCustomBreakpoint={true}
                        >
                            <OrderTable data={filteredOrderList} height={350} />
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
                        </HorizontalTabTable>
                    </div>
                </>

                <AdvancedLendingOrderCard
                    collateralBook={collateralBook}
                    isItayose
                    calculationDate={
                        lendingContracts[selectedTerm.value.toNumber()]
                            ?.utcOpeningDate
                    }
                    preOrderPosition={
                        filteredOrderList.length > 0
                            ? filteredOrderList[0].side === OrderSide.BORROW
                                ? 'borrow'
                                : 'lend'
                            : 'none'
                    }
                    delistedCurrencySet={delistedCurrencySet}
                />
            </ThreeColumnsWithTopBar>
        </Page>
    );
};
