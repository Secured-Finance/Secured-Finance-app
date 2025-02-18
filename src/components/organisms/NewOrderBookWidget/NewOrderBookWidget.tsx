import { OrderSide } from '@secured-finance/sf-client';
import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';
import { useDispatch } from 'react-redux';
import ShowFirstIcon from 'src/assets/icons/orderbook-first.svg';
import ShowAllIcon from 'src/assets/icons/orderbook-full.svg';
import ShowLastIcon from 'src/assets/icons/orderbook-last.svg';
import {
    DropdownSelector,
    Option,
    OrderBookIcon,
    Spinner,
} from 'src/components/atoms';
import { InfoToolTip, TableHeader } from 'src/components/molecules';
import {
    AggregationFactorType,
    OrderBookEntry,
    useBreakpoint,
    useOrderbook,
    usePrepareOrderbookData,
} from 'src/hooks';
import { setOrderType, setUnitPrice } from 'src/store/landingOrderForm';
import { ColorFormat, OrderType } from 'src/types';
import {
    CurrencySymbol,
    ZERO_BI,
    currencyMap,
    divide,
    formatLoanValue,
    getMaxAmount,
    ordinaryFormat,
    percentFormat,
} from 'src/utils';
import { LoanValue } from 'src/utils/entities';
import { ColorBar } from './ColorBar';
import { CoreTable } from './CoreTable';

const AGGREGATION_OPTIONS: (Option<string> & { multiplier: number })[] = [
    { label: '0.01', value: '1', multiplier: 1 },
    { label: '0.1', value: '10', multiplier: 10 },
    { label: '1', value: '100', multiplier: 100 },
    { label: '5', value: '500', multiplier: 500 },
    { label: '10', value: '1000', multiplier: 1000 },
];

const ORDERBOOK_DOUBLE_MAX_LINES = 6;
const ORDERBOOK_SINGLE_MAX_LINES = 12;

const columnHelper = createColumnHelper<OrderBookEntry>();

const OrderBookCell = ({
    value = '',
    color = 'neutral',
}: {
    value?: string;
} & ColorFormat) => (
    <span
        className={clsx(
            'z-[1] font-tertiary text-[11px] font-normal leading-[14px] laptop:px-4 laptop:text-xs laptop:leading-4',
            {
                'text-error-300': color === 'negative',
                'text-secondary-300': color === 'positive',
                'text-neutral-50': color === 'neutral',
                'text-neutral-400': color === 'disabled',
                'text-warning-300': color === 'warning',
            }
        )}
    >
        {value ? value : <Fragment>&nbsp;</Fragment>}
    </span>
);

const AmountCell = ({
    value,
    amount,
    totalAmount,
    position,
    currency,
    cbLimit,
}: {
    value: bigint;
    amount: bigint;
    totalAmount: bigint;
    position: 'borrow' | 'lend';
    currency: CurrencySymbol;
    cbLimit: boolean;
}) => {
    const color = position === 'borrow' ? 'negative' : 'positive';
    let val: string | undefined;
    if (value === ZERO_BI) {
        val = undefined;
    } else {
        val = ordinaryFormat(
            currencyMap[currency].fromBaseUnit(value),
            currencyMap[currency].roundingDecimal,
            currencyMap[currency].roundingDecimal
        );
        if (cbLimit) {
            val += '(CB)';
        }
    }
    return (
        <div className='relative flex items-center justify-end'>
            <OrderBookCell
                value={val}
                color={cbLimit ? 'warning' : 'neutral'}
            />
            <ColorBar value={amount} total={totalAmount} color={color} />
        </div>
    );
};

const PriceCell = ({
    value,
    amount,
    position,
    aggregationFactor,
    cbLimit,
}: {
    value: LoanValue;
    amount: bigint;
    position: 'borrow' | 'lend';
    aggregationFactor: AggregationFactorType;
    cbLimit: boolean;
}) => {
    const color = position === 'borrow' ? 'negative' : 'positive';
    const price = useMemo(() => {
        if (amount === ZERO_BI) {
            return '';
        }

        return formatLoanValue(
            value,
            'price',
            Math.abs(Math.log10(Math.min(aggregationFactor, 100) / 100)) // get the power of 10 of the aggregation factor for the number of decimals, but never more than 2
        );
    }, [aggregationFactor, amount, value]);

    return (
        <div className='flex items-center justify-start'>
            <OrderBookCell value={price} color={cbLimit ? 'disabled' : color} />
        </div>
    );
};

const AprCell = ({
    value,
    display,
}: {
    value: LoanValue;
    display: boolean;
}) => {
    return (
        <div className='flex items-center justify-center'>
            {display ? (
                <OrderBookCell value={formatLoanValue(value, 'rate')} />
            ) : (
                <OrderBookCell />
            )}
        </div>
    );
};

type VisibilityState = {
    showBorrow: boolean;
    showLend: boolean;
};

type VisibilityAction = 'showOnlyBorrow' | 'showOnlyLend' | 'reset';

const initialState: VisibilityState = {
    showBorrow: true,
    showLend: true,
};

const reducer = (
    state: VisibilityState,
    action: VisibilityAction
): VisibilityState => {
    switch (action) {
        case 'showOnlyBorrow':
            return {
                ...state,
                showBorrow: true,
                showLend: false,
            };
        case 'showOnlyLend':
            return {
                ...state,
                showBorrow: false,
                showLend: true,
            };
        default:
            return initialState;
    }
};

export const NewOrderBookWidget = ({
    orderbook,
    currency,
    maxLendUnitPrice,
    minBorrowUnitPrice,
    marketPrice,
    onFilterChange,
    onAggregationChange,
    isLoadingMap,
    rowsToRenderMobile = 10,
    isItayose = false,
}: {
    orderbook: Pick<ReturnType<typeof useOrderbook>[0], 'data' | 'isPending'>;
    currency: CurrencySymbol;
    maxLendUnitPrice: number;
    minBorrowUnitPrice: number;
    marketPrice?: LoanValue;
    onFilterChange?: (filter: VisibilityState) => void;
    onAggregationChange?: (multiplier: number) => void;
    isLoadingMap?: Record<OrderSide, boolean>;
    rowsToRenderMobile?: 10 | 12 | 14 | 16 | 18 | 20 | 22;
    isItayose?: boolean;
}) => {
    const isTablet = useBreakpoint('laptop');
    const singleMaxLines = isTablet
        ? rowsToRenderMobile
        : ORDERBOOK_SINGLE_MAX_LINES;
    const doubleMaxLines = isTablet
        ? rowsToRenderMobile / 2
        : ORDERBOOK_DOUBLE_MAX_LINES;

    const [state, dispatch] = useReducer(reducer, initialState);
    const [aggregationFactor, setAggregationFactor] =
        useState<AggregationFactorType>(1);

    useEffect(() => {
        onAggregationChange?.(aggregationFactor);
    }, [onAggregationChange, aggregationFactor]);

    useEffect(() => {
        onFilterChange?.(state);
    }, [onFilterChange, state]);

    const globalDispatch = useDispatch();

    const [limit, setLimit] = useState(doubleMaxLines);
    useEffect(() => {
        setLimit(
            state.showBorrow && state.showLend ? doubleMaxLines : singleMaxLines
        );
    }, [doubleMaxLines, singleMaxLines, state]);

    const borrowOrders = usePrepareOrderbookData(
        orderbook.data,
        'borrowOrderbook',
        limit,
        aggregationFactor
    );

    const lendOrders = usePrepareOrderbookData(
        orderbook.data,
        'lendOrderbook',
        limit,
        aggregationFactor
    );

    const spread =
        lendOrders.length > 0 && borrowOrders.length > 0
            ? ordinaryFormat(
                  Math.abs(
                      borrowOrders[borrowOrders.length - 1].value.price -
                          lendOrders[0].value.price
                  ) / 100.0,
                  2,
                  2
              )
            : '0.00';

    const aprSpread =
        lendOrders.length > 0 && borrowOrders.length > 0
            ? percentFormat(
                  Math.abs(
                      borrowOrders[
                          borrowOrders.length - 1
                      ].value.apr.toNormalizedNumber() -
                          lendOrders[0].value.apr.toNormalizedNumber()
                  ),
                  100,
                  2,
                  2
              )
            : '0.00%';

    const maxLendAmount = useMemo(() => {
        return getMaxAmount(lendOrders);
    }, [lendOrders]);

    const maxBorrowAmount = useMemo(() => {
        return getMaxAmount(borrowOrders);
    }, [borrowOrders]);

    const buyColumns = useMemo(
        () => [
            columnHelper.accessor('value', {
                id: 'price',
                cell: info => (
                    <PriceCell
                        value={info.getValue()}
                        amount={info.row.original.amount}
                        aggregationFactor={aggregationFactor}
                        position='borrow'
                        cbLimit={info.getValue().price > maxLendUnitPrice}
                    />
                ),
                header: () => (
                    <TableHeader
                        title='Price'
                        align='left'
                        horizontalPadding={false}
                    />
                ),
            }),
            columnHelper.accessor('value', {
                id: 'apr',
                cell: info => (
                    <AprCell
                        value={info.getValue()}
                        display={info.row.original.amount !== ZERO_BI}
                    />
                ),
                header: () => (
                    <TableHeader
                        title='APR'
                        align='center'
                        horizontalPadding={false}
                    />
                ),
            }),
            columnHelper.accessor('amount', {
                id: 'amount',
                cell: info => (
                    <AmountCell
                        value={info.getValue()}
                        amount={info.row.original.cumulativeAmount}
                        totalAmount={maxBorrowAmount}
                        position='borrow'
                        currency={currency}
                        cbLimit={
                            info.row.original.value.price > maxLendUnitPrice
                        }
                    />
                ),
                header: () => (
                    <TableHeader
                        title='Amount'
                        align='right'
                        horizontalPadding={false}
                    />
                ),
            }),
        ],
        [aggregationFactor, currency, maxBorrowAmount, maxLendUnitPrice]
    );

    const sellColumns = useMemo(
        () => [
            columnHelper.accessor('amount', {
                id: 'amount',
                cell: info => (
                    <AmountCell
                        value={info.getValue()}
                        amount={info.row.original.cumulativeAmount}
                        totalAmount={maxLendAmount}
                        position='lend'
                        currency={currency}
                        cbLimit={
                            info.row.original.value.price < minBorrowUnitPrice
                        }
                    />
                ),
                header: () => (
                    <TableHeader
                        title='Amount'
                        align='right'
                        horizontalPadding={false}
                    />
                ),
            }),
            columnHelper.accessor('value', {
                id: 'apr',
                cell: info => (
                    <AprCell
                        value={info.getValue()}
                        display={info.row.original.amount !== ZERO_BI}
                    />
                ),
                header: () => (
                    <TableHeader
                        title='APR'
                        align='center'
                        horizontalPadding={false}
                    />
                ),
            }),
            columnHelper.accessor('value', {
                id: 'price',
                cell: info => (
                    <PriceCell
                        value={info.getValue()}
                        amount={info.row.original.amount}
                        aggregationFactor={aggregationFactor}
                        position='lend'
                        cbLimit={info.getValue().price < minBorrowUnitPrice}
                    />
                ),
                header: () => (
                    <TableHeader
                        title='Price'
                        align='left'
                        horizontalPadding={false}
                    />
                ),
            }),
        ],
        [aggregationFactor, currency, maxLendAmount, minBorrowUnitPrice]
    );

    const handleClick = (rowId: string, side: OrderSide): void => {
        const rowData =
            side === OrderSide.BORROW
                ? lendOrders[parseInt(rowId)]
                : borrowOrders[parseInt(rowId)];
        globalDispatch(setOrderType(OrderType.LIMIT));
        globalDispatch(
            setUnitPrice(divide(rowData.value.price, 100).toString())
        );
    };

    const handleMobileToggleClick = useCallback(() => {
        if (state.showBorrow && state.showLend) {
            dispatch('showOnlyLend');
        } else if (!state.showBorrow && state.showLend) {
            dispatch('showOnlyBorrow');
        } else if (state.showBorrow && !state.showLend) {
            dispatch('reset');
        }
    }, [state.showBorrow, state.showLend]);

    const handleSellOrdersClick = (rowId: string) => {
        handleClick(rowId, OrderSide.BORROW);
    };

    const handleBuyOrdersClick = (rowId: string) => {
        handleClick(rowId, OrderSide.LEND);
    };

    const handleSellOrdersHoverRow = (rowId: string) => {
        const rowData = lendOrders[parseInt(rowId)];
        return rowData.amount !== ZERO_BI;
    };

    const handleBuyOrdersHoverRow = (rowId: string) => {
        const rowData = borrowOrders[parseInt(rowId)];
        return rowData.amount !== ZERO_BI;
    };

    return (
        <div className='flex h-full w-full flex-col justify-start gap-y-1 overflow-hidden laptop:flex-col-reverse laptop:gap-y-0 laptop:rounded-b-xl laptop:bg-neutral-900 laptop:shadow-tab'>
            <div className='h-full'>
                {orderbook.isPending ? (
                    <div className='table h-full w-full'>
                        <div className='table-cell text-center align-middle'>
                            <div className='inline-block'>
                                <Spinner />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col gap-1 laptop:gap-y-0'>
                        <div
                            className={clsx('flex', {
                                'h-fit': state.showBorrow && state.showLend,
                                'h-[14px] laptop:h-[22px]': !state.showBorrow,
                            })}
                        >
                            <CoreTable
                                data={state.showBorrow ? borrowOrders : []}
                                columns={buyColumns}
                                options={{
                                    name: 'buyOrders',
                                    onLineClick: handleBuyOrdersClick,
                                    hoverRow: handleBuyOrdersHoverRow,
                                    isLastRowLoading:
                                        isLoadingMap !== undefined
                                            ? isLoadingMap[OrderSide.BORROW]
                                            : false,
                                    hideColumnIds: isTablet ? ['apr'] : [],
                                    hoverDirection: 'up',
                                }}
                            />
                        </div>
                        <div
                            className={clsx(
                                'flex h-6 flex-row items-center py-1 font-secondary font-semibold laptop:h-fit laptop:bg-black-20 laptop:px-4 laptop:py-1'
                            )}
                        >
                            <span
                                className='flex w-full items-center gap-2 text-base font-semibold leading-6 text-neutral-50'
                                data-testid='current-market-price'
                            >
                                <p>{formatLoanValue(marketPrice, 'price')}</p>
                                {isItayose && (
                                    <InfoToolTip
                                        iconColor='white'
                                        placement='bottom'
                                    >
                                        Overlapping orders are aggregated to
                                        show net amounts. The price indicates
                                        the estimated opening price.
                                    </InfoToolTip>
                                )}
                            </span>
                            <span className='flex w-full justify-end text-xs font-semibold leading-5 text-neutral-200 laptop:justify-center laptop:text-sm laptop:leading-[22px]'>
                                {formatLoanValue(marketPrice, 'rate')}
                            </span>
                            <div className='typography-desktop-body-6 hidden w-full flex-col justify-end text-right text-neutral-200 laptop:flex'>
                                <span>Spread</span>
                                <span>{`${spread}/${aprSpread}`}</span>
                            </div>
                        </div>
                        <div
                            className={clsx('flex', {
                                'h-fit': state.showBorrow && state.showLend,
                                'h-0': !state.showLend,
                            })}
                        >
                            <CoreTable
                                data={state.showLend ? lendOrders : []}
                                columns={[...sellColumns].reverse()}
                                options={{
                                    name: 'sellOrders',
                                    showHeaders: false,
                                    onLineClick: handleSellOrdersClick,
                                    hoverRow: handleSellOrdersHoverRow,
                                    isFirstRowLoading:
                                        isLoadingMap !== undefined
                                            ? isLoadingMap[OrderSide.LEND]
                                            : false,
                                    hideColumnIds: isTablet ? ['apr'] : [],
                                    hoverDirection: 'down',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className='flex flex-col laptop:flex-col-reverse'>
                <div className='flex flex-row items-center justify-between gap-1 border-neutral-600 laptop:border-b laptop:px-3 laptop:py-1.5'>
                    <div className='w-full laptop:w-fit'>
                        <DropdownSelector
                            optionList={AGGREGATION_OPTIONS}
                            onChange={v =>
                                setAggregationFactor(
                                    Number(v) as AggregationFactorType
                                )
                            }
                            variant='orderBook'
                        />
                    </div>
                    {isTablet ? (
                        <OrderBookIconMobile
                            name='Toggle'
                            showBorrow={state.showBorrow}
                            showLend={state.showLend}
                            onClick={handleMobileToggleClick}
                        />
                    ) : (
                        <div className='flex flex-row items-start gap-3'>
                            <OrderBookIcon
                                name='Show All Orders'
                                Icon={<ShowAllIcon className='h-[10px] w-3' />}
                                onClick={() => dispatch('reset')}
                                active={state.showBorrow && state.showLend}
                            />
                            <OrderBookIcon
                                name={`${
                                    isTablet ? 'Mobile ' : ''
                                }Show Only Lend Orders`}
                                Icon={<ShowLastIcon className='h-[10px] w-3' />}
                                onClick={() => dispatch('showOnlyLend')}
                                active={!state.showBorrow && state.showLend}
                            />
                            <OrderBookIcon
                                name={`${
                                    isTablet ? 'Mobile ' : ''
                                }Show Only Borrow Orders`}
                                Icon={
                                    <ShowFirstIcon className='h-[10px] w-3' />
                                }
                                onClick={() => dispatch('showOnlyBorrow')}
                                active={!state.showLend && state.showBorrow}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const OrderBookIconMobile = ({
    name,
    showBorrow,
    showLend,
    onClick,
}: {
    name: string;
    showBorrow: boolean;
    showLend: boolean;
    onClick: () => void;
}) => (
    <button
        key={name}
        aria-label={name}
        className={clsx(
            'flex h-6 w-6 items-center justify-center rounded border-0.5 border-neutral-500 bg-neutral-800'
        )}
        onClick={onClick}
    >
        {showBorrow && showLend ? (
            <div className='flex flex-col gap-[2px]'>
                <span className='h-6px w-14px rounded-sm bg-error-300'></span>
                <span className='h-6px w-14px rounded-sm bg-secondary-300'></span>
            </div>
        ) : (
            <span
                className={clsx('h-14px w-14px rounded-sm', {
                    'bg-secondary-300': !showBorrow && showLend,
                    'bg-error-300': showBorrow && !showLend,
                })}
            ></span>
        )}
    </button>
);
