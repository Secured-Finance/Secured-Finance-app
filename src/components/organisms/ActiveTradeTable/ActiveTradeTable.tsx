import { OrderSide } from '@secured-finance/sf-client';
import { formatDate, getUTCMonthYear } from '@secured-finance/sf-core';
import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import * as dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { HorizontalListItemTable } from 'src/components/atoms';
import {
    COMPACT_TABLE_DEFAULT_HEIGHT,
    CompactCoreTable,
    MenuItem,
    TableActionMenu,
    TableCardHeader,
} from 'src/components/molecules';
import { UnwindDialog, UnwindDialogType } from 'src/components/organisms';
import { Position, useBreakpoint, useLastPrices } from 'src/hooks';
import {
    resetUnitPrice,
    setCurrency,
    setMaturity,
} from 'src/store/landingOrderForm';
import {
    Amount,
    AmountCell,
    CurrencySymbol,
    Maturity,
    MaturityCell,
    MobileTableWrapper,
    amountColumnDefinition,
    contractColumnDefinition,
    futureValueColumnDefinition,
    hexToCurrencySymbol,
    isMaturityPastDays,
    isPastDate,
    loanTypeFromFVColumnDefinition,
    priceYieldColumnDefinition,
    tableHeaderDefinition,
} from 'src/utils';

const columnHelper = createColumnHelper<
    Position & { underMinimalCollateral?: boolean }
>();

const ActiveTradeTableMobile = ({
    data,
    tableActionMenu,
    delistedCurrencySet,
}: {
    data: (Position & { underMinimalCollateral?: boolean })[];
    tableActionMenu: (
        maturity: number,
        amount: bigint,
        ccy: CurrencySymbol,
        side: OrderSide
    ) => {
        text: string;
        onClick: () => void;
        disabled?: boolean;
    }[];
    delistedCurrencySet: Set<CurrencySymbol>;
}) => {
    return (
        <MobileTableWrapper>
            {data.map((row, index) => {
                const ccy = hexToCurrencySymbol(row.currency);
                if (!ccy) return null;

                const maturity = new Maturity(row.maturity);
                const amount = row.amount;
                const absAmount = amount < 0 ? -amount : amount;
                const futureValue = row.futureValue;
                const marketPrice = row.marketPrice;
                const side =
                    BigInt(futureValue) < 0 ? OrderSide.BORROW : OrderSide.LEND;
                const reversedSide =
                    BigInt(futureValue) < 0 ? OrderSide.LEND : OrderSide.BORROW;

                const items = tableActionMenu(
                    maturity.toNumber(),
                    absAmount,
                    ccy,
                    reversedSide
                );

                return (
                    <div
                        className={clsx(
                            'flex w-full flex-col gap-2.5 bg-neutral-900 px-5 py-4',
                            {
                                'border-b border-neutral-600':
                                    index !== data.length - 1,
                            }
                        )}
                        key={index}
                    >
                        <TableCardHeader
                            currency={ccy}
                            maturity={maturity}
                            side={side}
                            price={Number(marketPrice)}
                        />
                        <div className='flex flex-col'>
                            <HorizontalListItemTable
                                label='Time to Maturity'
                                value={
                                    <MaturityCell
                                        timestamp={maturity.toNumber()}
                                        side={side}
                                        currency={ccy}
                                        delistedCurrencySet={
                                            delistedCurrencySet
                                        }
                                    />
                                }
                            />
                            <HorizontalListItemTable
                                label='Present Value (PV)'
                                value={
                                    <AmountCell
                                        ccy={ccy}
                                        amount={
                                            isPastDate(maturity.toNumber())
                                                ? undefined
                                                : amount
                                        }
                                    />
                                }
                            />
                            <HorizontalListItemTable
                                label='Future Value (FV)'
                                value={
                                    <AmountCell
                                        ccy={ccy}
                                        amount={futureValue}
                                    />
                                }
                            />
                        </div>
                        {items && (
                            <div className='flex gap-2.5'>
                                {items.map((item, index) => {
                                    return (
                                        <MenuItem
                                            key={index}
                                            text={item.text}
                                            disabled={item.disabled}
                                            onClick={item.onClick}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </MobileTableWrapper>
    );
};

export const ActiveTradeTable = ({
    data,
    delistedCurrencySet,
    height,
    variant = 'default',
}: {
    data: (Position & { underMinimalCollateral?: boolean })[];
    delistedCurrencySet: Set<CurrencySymbol>;
    height?: number;
    variant?: 'compact' | 'default';
}) => {
    const [unwindDialogData, setUnwindDialogData] = useState<{
        maturity: Maturity;
        amount: Amount;
        side: OrderSide;
        show: boolean;
        type: 'UNWIND' | 'REDEEM' | 'REPAY';
    }>();
    const { data: priceList } = useLastPrices();
    const router = useRouter();
    const dispatch = useDispatch();
    const isTablet = useBreakpoint('laptop');

    const handleCurrencyChange = useCallback(
        (v: CurrencySymbol) => {
            dispatch(setCurrency(v));
            dispatch(resetUnitPrice());
        },
        [dispatch]
    );

    const getTableActionMenu = useCallback(
        (
            maturity: number,
            amount: bigint,
            ccy: CurrencySymbol,
            side: OrderSide
        ) => {
            const items = [
                {
                    text: 'Add/Reduce',
                    onClick: (): void => {
                        dispatch(setMaturity(maturity));
                        handleCurrencyChange(ccy);

                        const prettyMaturity = getUTCMonthYear(maturity, true);

                        const market = `${ccy}-${prettyMaturity}`;

                        router.push({
                            pathname: '/',
                            query: {
                                market,
                            },
                        });
                    },
                },
                {
                    text: 'Close',
                    onClick: (): void => {
                        setUnwindDialogData({
                            maturity: new Maturity(maturity),
                            amount: new Amount(amount, ccy),
                            show: true,
                            side: side,
                            type: 'UNWIND',
                        });
                    },
                },
            ];
            if (!isPastDate(maturity)) {
                return items;
            }

            let label = 'Close';
            let type: UnwindDialogType;
            let disableAction;

            if (delistedCurrencySet.has(ccy)) {
                if (side === OrderSide.LEND) {
                    label = 'Repay';
                    type = 'REPAY';
                } else {
                    label = 'Redeem';
                    type = 'REDEEM';
                    if (!isMaturityPastDays(maturity, 7)) {
                        disableAction = true;
                    }
                }
            }

            return [
                { ...items[0], disabled: true },
                {
                    text: label,
                    onClick: (): void => {
                        setUnwindDialogData({
                            maturity: new Maturity(maturity),
                            amount: new Amount(amount, ccy),
                            show: true,
                            side: side,
                            type: type,
                        });
                    },
                    disabled: disableAction,
                },
            ];
        },
        [delistedCurrencySet, dispatch, handleCurrencyChange, router]
    );

    const getMaturityDisplayValue = useCallback(
        (
            maturityTimestamp: number,
            side: OrderSide,
            currency: CurrencySymbol | undefined
        ) => {
            const currentTime = Date.now();
            const dayToMaturity = formatMaturity(
                maturityTimestamp,
                'day',
                currentTime
            );

            if (!isPastDate(maturityTimestamp)) {
                const diffHours = formatMaturity(
                    maturityTimestamp,
                    'hours',
                    currentTime
                );
                const diffMinutes =
                    formatMaturity(maturityTimestamp, 'minutes', currentTime) %
                    60;

                if (dayToMaturity > 1) {
                    return <span>{dayToMaturity} days</span>;
                } else if (dayToMaturity === 1) {
                    return <span>{dayToMaturity} day</span>;
                } else {
                    return (
                        <>
                            {diffHours !== 0 && (
                                <span className='mr-1'>{diffHours}h</span>
                            )}
                            {diffMinutes !== 0 && <span>{diffMinutes}m</span>}
                        </>
                    );
                }
            } else {
                if (currency && !delistedCurrencySet.has(currency)) return null;

                if (side === OrderSide.BORROW) {
                    if (isMaturityPastDays(maturityTimestamp, 7))
                        return `Repay`;
                    else return `${7 - Math.abs(dayToMaturity)}d left to repay`;
                } else {
                    if (isMaturityPastDays(maturityTimestamp, 7))
                        return (
                            <span className='text-warning-500'>Redeemable</span>
                        );
                    else return `${7 - Math.abs(dayToMaturity)}d to redeem`;
                }
            }
        },
        [delistedCurrencySet]
    );

    const columns = useMemo(
        () => [
            contractColumnDefinition(
                columnHelper,
                'Symbol',
                'contract',
                variant,
                delistedCurrencySet,
                'left',
                'left'
            ),
            loanTypeFromFVColumnDefinition(
                columnHelper,
                'Type',
                'side',
                'left'
            ),
            columnHelper.accessor('maturity', {
                cell: info => {
                    const ccy = hexToCurrencySymbol(info.row.original.currency);
                    const maturityTimestamp = Number(info.getValue());

                    const side =
                        BigInt(info.row.original.futureValue) < 0
                            ? OrderSide.BORROW
                            : OrderSide.LEND;

                    const maturityValue = getMaturityDisplayValue(
                        maturityTimestamp,
                        side,
                        ccy
                    );

                    return (
                        <div className='flex h-5 w-40 items-center justify-center gap-1 tablet:w-fit'>
                            {maturityValue && (
                                <div
                                    className={clsx(
                                        'typography-desktop-body-6 w-full',
                                        {
                                            'text-galacticOrange':
                                                ccy &&
                                                delistedCurrencySet.has(ccy),
                                            'text-white':
                                                ccy &&
                                                !delistedCurrencySet.has(ccy),
                                        }
                                    )}
                                >
                                    {maturityValue}
                                </div>
                            )}
                            <span className='w-full text-2.5 leading-3 text-neutral-400'>
                                {formatDate(maturityTimestamp)}
                            </span>
                        </div>
                    );
                },
                header: tableHeaderDefinition(
                    'Time to Maturity',
                    'Maturity of a loan contract is the date on which the contract is set to expire.',
                    'left'
                ),
            }),
            priceYieldColumnDefinition(
                columnHelper,
                'Mark Price',
                'marketPrice',
                row =>
                    isPastDate(Number(row.maturity))
                        ? BigInt(10000)
                        : row.marketPrice,
                'compact',
                'price',
                'Mark Price is the volume-weighted average unit price of filled orders at the last block.'
            ),
            priceYieldColumnDefinition(
                columnHelper,
                'APR%',
                'yield',
                row =>
                    isPastDate(Number(row.maturity))
                        ? BigInt(10000)
                        : row.marketPrice,
                'compact',
                'rate'
            ),
            amountColumnDefinition(
                columnHelper,
                'Present Value (PV)',
                'amount',
                row =>
                    isPastDate(Number(row.maturity)) ? undefined : row.amount,
                {
                    color: false,
                    priceList: priceList,
                    compact: true,
                    fontSize: 'typography-desktop-body-5 font-numerical',
                },
                'Present Value (PV) is the current worth of the contract, taking into account the time value of money.',
                'right'
            ),
            futureValueColumnDefinition(
                columnHelper,
                'Future Value (FV)',
                'futureValue',
                row => row.futureValue,
                { color: false, priceList: priceList, compact: true },
                'Future Value (FV) of a loan contract is the obligation value of the contract at time of maturity.',
                'right'
            ),
            columnHelper.display({
                id: 'actions',
                cell: info => {
                    const maturity = Number(info.row.original.maturity);
                    const ccy = hexToCurrencySymbol(info.row.original.currency);
                    const amount = BigInt(info.row.original.amount);
                    const absAmount = amount < 0 ? -amount : amount;
                    const side =
                        BigInt(info.row.original.futureValue) < 0
                            ? OrderSide.LEND
                            : OrderSide.BORROW; // side is reversed as unwind
                    if (!ccy) return null;

                    return (
                        <TableActionMenu
                            items={getTableActionMenu(
                                maturity,
                                absAmount,
                                ccy,
                                side
                            )}
                        />
                    );
                },
                header: () => (
                    <div className='flex justify-start px-2'>Actions</div>
                ),
            }),
        ],
        [
            delistedCurrencySet,
            getMaturityDisplayValue,
            getTableActionMenu,
            priceList,
            variant,
        ]
    );

    return (
        <>
            {isTablet ? (
                <ActiveTradeTableMobile
                    data={data}
                    tableActionMenu={getTableActionMenu}
                    delistedCurrencySet={delistedCurrencySet}
                />
            ) : (
                <CompactCoreTable
                    data={data}
                    columns={columns}
                    options={{
                        name: 'active-trade-table',
                        pagination: {
                            containerHeight:
                                height || COMPACT_TABLE_DEFAULT_HEIGHT,
                            getMoreData: () => {},
                            totalData: data.length,
                        },
                    }}
                />
            )}
            {unwindDialogData && (
                <UnwindDialog
                    isOpen={unwindDialogData.show}
                    onClose={() =>
                        setUnwindDialogData({
                            ...unwindDialogData,
                            show: false,
                        })
                    }
                    maturity={unwindDialogData.maturity}
                    amount={unwindDialogData.amount}
                    side={unwindDialogData.side}
                    type={unwindDialogData.type}
                />
            )}
        </>
    );
};

const formatMaturity = (
    maturityTimeStamp: number,
    timeUnit: 'day' | 'hours' | 'minutes',
    currentTime: number
) => dayjs.unix(maturityTimeStamp).diff(currentTime, timeUnit);
