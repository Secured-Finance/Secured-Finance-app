import { OrderSide } from '@secured-finance/sf-client';
import { createColumnHelper } from '@tanstack/react-table';
import classNames from 'classnames';
import { Fragment, useEffect, useMemo, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import WarningCircleIcon from 'src/assets/icons/warning-circle.svg';
import { ColorBar, DropdownSelector, Spinner } from 'src/components/atoms';
import { CoreTable, InfoToolTip, TableHeader } from 'src/components/molecules';
import {
    AggregationFactorType,
    OrderBookEntry,
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
} from 'src/utils';
import { LoanValue } from 'src/utils/entities';
import {
    AGGREGATION_OPTIONS,
    ORDERBOOK_DOUBLE_MAX_LINES,
    ORDERBOOK_SINGLE_MAX_LINES,
} from './constants';

const columnHelper = createColumnHelper<OrderBookEntry>();

const OrderBookCell = ({
    value = '',
    fontWeight = 'normal',
    color = 'neutral',
}: {
    value?: string;
    fontWeight?: 'normal' | 'semibold';
} & ColorFormat) => (
    <span
        className={classNames('typography-caption-2 z-[1] text-right', {
            'text-galacticOrange': color === 'negative',
            'text-nebulaTeal': color === 'positive',
            'text-neutral-6': color === 'neutral',
            'font-semibold': fontWeight === 'semibold',
        })}
    >
        {value ? value : <Fragment>&nbsp;</Fragment>}
    </span>
);

const AmountCell = ({
    value,
    currency,
}: {
    value: bigint;
    currency: CurrencySymbol;
}) => (
    <div className='typography-caption-2 flex justify-end pr-[25%] text-neutral-6'>
        {value === ZERO_BI ? (
            <OrderBookCell />
        ) : (
            <OrderBookCell
                value={ordinaryFormat(
                    currencyMap[currency].fromBaseUnit(value),
                    currencyMap[currency].roundingDecimal,
                    currencyMap[currency].roundingDecimal
                )}
            />
        )}{' '}
    </div>
);

const PriceCell = ({
    value,
    amount,
    totalAmount,
    position,
    align,
    aggregationFactor,
}: {
    value: LoanValue;
    amount: bigint;
    totalAmount: bigint;
    position: 'borrow' | 'lend';
    align: 'left' | 'right';
    aggregationFactor: AggregationFactorType;
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
        <div
            className={classNames(
                'typography-caption-2 relative flex items-center overflow-visible font-bold text-neutral-6',
                {
                    'justify-start': align === 'left',
                    'justify-end': align === 'right',
                }
            )}
        >
            <OrderBookCell value={price} color={color} fontWeight='semibold' />
            <ColorBar
                value={amount}
                total={totalAmount}
                color={color}
                align={align}
                maxWidth={200}
            />
        </div>
    );
};

type VisibilityState = {
    showBorrow: boolean;
    showLend: boolean;
    showTicker: boolean;
};

type VisibilityAction = 'showOnlyBorrow' | 'showOnlyLend' | 'reset';

const initialState: VisibilityState = {
    showBorrow: true,
    showLend: true,
    showTicker: true,
};

const reducer = (
    state: VisibilityState,
    action: VisibilityAction
): VisibilityState => {
    switch (action) {
        case 'showOnlyBorrow':
            if (!state.showLend) {
                return initialState;
            }
            return {
                ...state,
                showBorrow: true,
                showLend: false,
                showTicker: false,
            };
        case 'showOnlyLend':
            if (!state.showBorrow) {
                return initialState;
            }
            return {
                ...state,
                showBorrow: false,
                showLend: true,
                showTicker: false,
            };
        default:
            return initialState;
    }
};

export const CompactOrderBookWidget = ({
    orderbook,
    currency,
    marketPrice,
    onFilterChange,
    onAggregationChange,
    variant = 'default',
    isCurrencyDelisted,
    isLoadingMap,
}: {
    orderbook: Pick<ReturnType<typeof useOrderbook>[0], 'data' | 'isLoading'>;
    currency: CurrencySymbol;
    marketPrice?: LoanValue;
    onFilterChange?: (filter: VisibilityState) => void;
    onAggregationChange?: (multiplier: number) => void;
    variant?: 'default' | 'itayose';
    isCurrencyDelisted: boolean;
    isLoadingMap?: Record<OrderSide, boolean>;
}) => {
    const [state] = useReducer(reducer, initialState);
    useEffect(() => {
        onFilterChange?.(state);
    }, [onFilterChange, state]);

    const [aggregationFactor, setAggregationFactor] =
        useState<AggregationFactorType>(1);

    useEffect(() => {
        onAggregationChange?.(aggregationFactor);
    }, [onAggregationChange, aggregationFactor]);

    const globalDispatch = useDispatch();

    const [limit, setLimit] = useState(ORDERBOOK_DOUBLE_MAX_LINES);
    useEffect(() => {
        setLimit(
            state.showBorrow && state.showLend
                ? ORDERBOOK_DOUBLE_MAX_LINES
                : ORDERBOOK_SINGLE_MAX_LINES
        );
    }, [state]);

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

    const maxBorrowAmount = useMemo(
        () => getMaxAmount(borrowOrders),
        [borrowOrders]
    );

    const maxLendAmount = useMemo(() => getMaxAmount(lendOrders), [lendOrders]);

    const buyColumns = useMemo(
        () => [
            columnHelper.accessor('value', {
                id: 'price',
                cell: info => (
                    <PriceCell
                        value={info.getValue()}
                        amount={info.row.original.amount}
                        totalAmount={maxBorrowAmount}
                        aggregationFactor={aggregationFactor}
                        position='borrow'
                        align='left'
                    />
                ),
                header: () => <TableHeader title='Price' align='left' />,
            }),
            columnHelper.accessor('amount', {
                id: 'amount',
                cell: info => (
                    <AmountCell value={info.getValue()} currency={currency} />
                ),
                header: () => <TableHeader title='Amount' align='center' />,
            }),
        ],
        [aggregationFactor, currency, maxBorrowAmount]
    );

    const sellColumns = useMemo(
        () => [
            columnHelper.accessor('amount', {
                id: 'amount',
                cell: info => (
                    <AmountCell value={info.getValue()} currency={currency} />
                ),
                header: () => <TableHeader title='Amount' align='center' />,
            }),
            columnHelper.accessor('value', {
                id: 'price',
                cell: info => (
                    <PriceCell
                        value={info.getValue()}
                        amount={info.row.original.amount}
                        totalAmount={maxLendAmount}
                        aggregationFactor={aggregationFactor}
                        position='lend'
                        align='left'
                    />
                ),
                header: () => <TableHeader title='Price' align='left' />,
            }),
        ],
        [aggregationFactor, currency, maxLendAmount]
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
        <div className='flex w-full flex-col justify-start gap-y-3 border border-white-10 bg-cardBackground/60 px-[0.625rem] shadow-tab laptop:hidden'>
            {isCurrencyDelisted && (
                <div className='-mx-3 flex h-9 flex-row items-center gap-3 bg-black-20 px-4'>
                    <WarningCircleIcon className='h-4 w-4' />
                    <div className='typography-caption-2 w-full text-planetaryPurple'>
                        {currency} will be delisted
                    </div>
                </div>
            )}
            <div className='h-[470px]'>
                {orderbook.isLoading ? (
                    <div className='flex h-full w-full items-center justify-center'>
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <div
                            className={classNames('flex pb-3', {
                                'h-fit': state.showBorrow && state.showLend,
                                'h-[40px]': !state.showBorrow,
                            })}
                        >
                            <CoreTable
                                data={state.showBorrow ? borrowOrders : []}
                                columns={buyColumns}
                                options={{
                                    responsive: false,
                                    name: 'buyOrders',
                                    border: false,
                                    onLineClick: handleBuyOrdersClick,
                                    hoverRow: handleBuyOrdersHoverRow,
                                    compact: true,
                                    stickyHeader: false,
                                    isLastRowLoading:
                                        isLoadingMap !== undefined
                                            ? isLoadingMap[OrderSide.BORROW]
                                            : false,
                                }}
                            />
                        </div>
                        {state.showTicker && (
                            <div className='-mx-3 flex h-14 flex-row items-center justify-between bg-black-20 px-4 text-[1.125rem]'>
                                <span
                                    className={classNames('font-semibold', {
                                        'flex flex-row items-center gap-2 text-white':
                                            variant === 'itayose',
                                        'text-nebulaTeal':
                                            marketPrice &&
                                            variant === 'default',
                                        'text-slateGray': !marketPrice,
                                    })}
                                    data-testid='current-market-price'
                                >
                                    <p>
                                        {formatLoanValue(marketPrice, 'price')}
                                    </p>
                                    {variant === 'itayose' && (
                                        <InfoToolTip iconColor='white'>
                                            <p className='text-white'>
                                                Overlapping orders are
                                                aggregated to show net amounts.
                                                The price indicates the
                                                estimated opening price.
                                            </p>
                                        </InfoToolTip>
                                    )}
                                </span>

                                <span className='text-xs font-medium text-[#FBFAFC]'>
                                    {formatLoanValue(marketPrice, 'rate')}
                                </span>
                            </div>
                        )}
                        <div
                            className={classNames('flex pt-3', {
                                'h-fit': state.showBorrow && state.showLend,
                                'h-0': !state.showLend,
                            })}
                        >
                            <CoreTable
                                data={state.showLend ? lendOrders : []}
                                columns={[...sellColumns].reverse()}
                                options={{
                                    responsive: false,
                                    name: 'sellOrders',
                                    border: false,
                                    onLineClick: handleSellOrdersClick,
                                    hoverRow: handleSellOrdersHoverRow,
                                    showHeaders: false,
                                    compact: true,
                                    stickyHeader: false,
                                    isFirstRowLoading:
                                        isLoadingMap !== undefined
                                            ? isLoadingMap[OrderSide.LEND]
                                            : false,
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
            <div className='flex items-center justify-end'>
                <div className='w-20'>
                    <DropdownSelector
                        optionList={AGGREGATION_OPTIONS}
                        onChange={v =>
                            setAggregationFactor(
                                Number(v) as AggregationFactorType
                            )
                        }
                        variant='fullWidth'
                    />
                </div>
            </div>
        </div>
    );
};

// const OrderBookIcon = ({
//     Icon,
//     name,
//     active,
//     onClick,
// }: {
//     Icon: React.ReactNode;
//     name: string;
//     active: boolean;
//     onClick: () => void;
// }) => (
//     <button
//         key={name}
//         aria-label={name}
//         className={classNames('px-[10px] py-[11px] hover:bg-universeBlue', {
//             'bg-universeBlue': active,
//         })}
//         onClick={onClick}
//     >
//         {Icon}
//     </button>
// );
