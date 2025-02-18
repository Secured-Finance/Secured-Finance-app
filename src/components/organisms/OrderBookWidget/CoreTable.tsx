/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OrderBookEntry } from 'src/hooks';

type CoreTableOptions = {
    name: string;
    hoverDirection: 'up' | 'down';
    onLineClick?: (rowId: string) => void;
    hoverRow?: (rowId: string) => boolean;
    hideColumnIds?: string[];
    showHeaders?: boolean;
    isFirstRowLoading?: boolean;
    isLastRowLoading?: boolean;
    flashRowClass?: string;
};

const DEFAULT_OPTIONS: CoreTableOptions = {
    name: 'core-table',
    hoverDirection: 'up',
    onLineClick: undefined,
    hoverRow: undefined,
    hideColumnIds: undefined,
    showHeaders: true,
    flashRowClass: '',
};

export const CoreTable = ({
    data,
    columns,
    options = DEFAULT_OPTIONS,
}: {
    data: OrderBookEntry[];
    columns: ColumnDef<OrderBookEntry, any>[];
    options?: Partial<CoreTableOptions>;
}) => {
    const [changedPrices, setChangedPrices] = useState<Set<number>>(new Set());
    const prevDataRef = useRef<Row<OrderBookEntry>[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [activeRow, setActiveRow] = useState<string>();
    const coreTableOptions: CoreTableOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
    };

    const onHoverBackground = useCallback(
        (rowId: string) => {
            if (coreTableOptions.hoverDirection === 'up') {
                return activeRow && Number(rowId) >= Number(activeRow);
            } else if (coreTableOptions.hoverDirection === 'down') {
                return activeRow && Number(rowId) <= Number(activeRow);
            }
        },
        [activeRow, coreTableOptions.hoverDirection]
    );

    const filteredColumns = columns.filter(column => {
        if (
            coreTableOptions.hideColumnIds === undefined ||
            column.id === undefined
        ) {
            return true;
        }
        return !coreTableOptions.hideColumnIds.includes(column.id);
    });

    const configuration = {
        data: data,
        columns: filteredColumns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
    };

    const table = useReactTable<OrderBookEntry>(configuration);
    const rows = table.getRowModel().rows;

    useEffect(() => {
        if (!rows) return;

        const updatedPrices = new Set<number>();

        if (prevDataRef.current) {
            const prevRowsMap = new Map(
                prevDataRef.current.map(row => [row.original.value.price, row])
            );

            rows.forEach(row => {
                const currentPrice = row.original.value.price;
                if (currentPrice === undefined) return;

                const prevRow = prevRowsMap.get(currentPrice);

                if (!prevRow && currentPrice !== 0) {
                    updatedPrices.add(currentPrice);
                } else if (
                    prevRow &&
                    prevRow.original.amount !== row.original.amount
                ) {
                    updatedPrices.add(currentPrice);
                }
            });
        }

        prevDataRef.current = rows;

        setChangedPrices(updatedPrices);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(
            () => setChangedPrices(new Set()),
            5000
        );
    }, [rows]);

    const isLoading = (rowIndex: number, dataRows: number) =>
        (options.isFirstRowLoading && rowIndex === 0) ||
        (options.isLastRowLoading && rowIndex === dataRows - 1);

    return (
        <table
            className={'w-full table-fixed overflow-hidden'}
            data-testid={coreTableOptions.name}
        >
            {coreTableOptions.showHeaders ? (
                <thead className='font-tertiary text-xs leading-[14px] text-neutral-400 laptop:h-[22px] laptop:py-1'>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr
                            key={headerGroup.id}
                            data-testid={`${coreTableOptions.name}-header`}
                        >
                            {headerGroup.headers.map(header => (
                                <th
                                    data-testid={`${coreTableOptions.name}-header-cell`}
                                    key={header.id}
                                    className='whitespace-nowrap pb-1 text-center font-normal laptop:px-4 laptop:pb-0'
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
            ) : null}

            <tbody>
                {rows.map((row, rowIndex) =>
                    isLoading(rowIndex, rows.length) ? (
                        <tr key={rowIndex} className='animate-pulse'>
                            <td colSpan={row.getVisibleCells().length}>
                                <div className='h-[22px] min-w-fit bg-[#808080]/20'></div>
                            </td>
                        </tr>
                    ) : (
                        <tr
                            key={row.id}
                            className={clsx(
                                'h-4 w-full border-transparent laptop:h-[23px]',
                                {
                                    'border-t':
                                        coreTableOptions.hoverDirection ===
                                        'up',
                                    'border-b':
                                        coreTableOptions.hoverDirection ===
                                        'down',
                                    'cursor-pointer bg-neutral-100/10':
                                        coreTableOptions.hoverRow?.(row.id) &&
                                        activeRow &&
                                        coreTableOptions.hoverRow?.(
                                            activeRow
                                        ) &&
                                        onHoverBackground(row.id),
                                    'border-dashed border-z-neutral-100':
                                        coreTableOptions.hoverRow?.(row.id) &&
                                        activeRow &&
                                        coreTableOptions.hoverRow?.(
                                            activeRow
                                        ) &&
                                        Number(row.id) === Number(activeRow),
                                    [`${coreTableOptions.flashRowClass} animate-pulse`]:
                                        changedPrices.has(
                                            row.original.value.price
                                        ),
                                }
                            )}
                            onClick={() =>
                                coreTableOptions.hoverRow?.(row.id) &&
                                coreTableOptions.onLineClick?.(row.id)
                            }
                            onMouseEnter={() => setActiveRow(row.id)}
                            onMouseLeave={() => setActiveRow(undefined)}
                            data-testid={`${coreTableOptions.name}-row`}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    className='min-w-fit whitespace-nowrap font-normal'
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    )
                )}
            </tbody>
        </table>
    );
};
