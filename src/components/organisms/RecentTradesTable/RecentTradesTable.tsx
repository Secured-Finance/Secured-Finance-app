import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@nextui-org/table';
import { OrderSide } from '@secured-finance/sf-client';
import { toBytes32 } from '@secured-finance/sf-graph-client';
import queries from '@secured-finance/sf-graph-client/dist/graphclients';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import ArrowUpSquare from 'src/assets/icons/arrow-up-square.svg';
import ShowFirstIcon from 'src/assets/icons/orderbook-first.svg';
import ShowAllIcon from 'src/assets/icons/orderbook-full.svg';
import ShowLastIcon from 'src/assets/icons/orderbook-last.svg';
import { OrderBookIcon, Spinner } from 'src/components/atoms';
import {
    useBlockExplorerUrl,
    useGraphClientHook,
    useIsSubgraphSupported,
} from 'src/hooks';
import useSF from 'src/hooks/useSecuredFinance';
import { currencyMap, formatLoanValue, ordinaryFormat } from 'src/utils';
import { LoanValue } from 'src/utils/entities';
import { columns } from './constants';
import { RecentTradesTableProps, TradeMetadata } from './types';

export const RecentTradesTable = ({
    currency,
    maturity,
}: RecentTradesTableProps) => {
    const [timestamp, setTimestamp] = useState<number>(0);
    const { blockExplorerUrl } = useBlockExplorerUrl();
    const [showSide, setShowSide] = useState<OrderSide | null>(null);

    useEffect(() => {
        setTimestamp(Math.round(new Date().getTime() / 1000));
    }, []);

    const securedFinance = useSF();
    const currentChainId = securedFinance?.config.chain.id;

    const isSubgraphSupported = useIsSubgraphSupported(currentChainId);

    const { data: transactionHistory, loading } = useGraphClientHook(
        {
            currency: toBytes32(currency),
            maturity: maturity,
            from: -1,
            to: timestamp,
            first: 100,
            sides:
                showSide === null
                    ? [OrderSide.LEND, OrderSide.BORROW]
                    : [showSide],
        },
        queries.TransactionHistoryDocument,
        'transactionHistory',
        !isSubgraphSupported
    );

    const data = useMemo(() => {
        return transactionHistory
            ?.map(transaction => {
                const sizeActual = currencyMap[currency].fromBaseUnit(
                    BigInt(+transaction.amount)
                );
                const size = ordinaryFormat(
                    sizeActual,
                    currencyMap[currency].roundingDecimal,
                    currencyMap[currency].roundingDecimal
                );

                if (Math.abs(Number(sizeActual)) > 0) {
                    return {
                        ...transaction,
                        size,
                    } as TradeMetadata;
                }
                return null;
            })
            .filter((item): item is TradeMetadata => item !== null)
            .sort(
                (a, b) =>
                    new Date(+b.createdAt).getTime() -
                    new Date(+a.createdAt).getTime()
            );
    }, [currency, transactionHistory]);

    return (
        <div>
            <div className='flex flex-row items-center justify-end gap-1 border-neutral-600 laptop:border-b laptop:px-3 laptop:py-1.5'>
                <div className='flex flex-row items-start gap-3'>
                    <OrderBookIcon
                        name='Show All Orders'
                        Icon={<ShowAllIcon className='h-[10px] w-3' />}
                        onClick={() => setShowSide(null)}
                        active={showSide === null}
                    />
                    <OrderBookIcon
                        name='Show Only Lend Orders'
                        Icon={<ShowLastIcon className='h-[10px] w-3' />}
                        onClick={() => setShowSide(OrderSide.LEND)}
                        active={showSide === OrderSide.LEND}
                    />
                    <OrderBookIcon
                        name='Show Only Borrow Orders'
                        Icon={<ShowFirstIcon className='h-[10px] w-3' />}
                        onClick={() => setShowSide(OrderSide.BORROW)}
                        active={showSide === OrderSide.BORROW}
                    />
                </div>
            </div>
            <Table
                classNames={{
                    base: 'laptop:h-full overflow-auto laptop:max-h-[371px]',
                    wrapper:
                        'p-0 font-numerical text-xs leading-4 scrollbar-table',
                    table: 'laptop:border-separate laptop:border-spacing-y-0',
                }}
                aria-label='Recent trades table'
                isHeaderSticky
                bottomContent={
                    !loading &&
                    !!data?.length && (
                        <div className='relative -top-2.5 text-center text-neutral-50'>
                            Only the last 100 trades are shown.
                        </div>
                    )
                }
            >
                <TableHeader>
                    {columns.map(column => (
                        <TableColumn
                            key={column.key}
                            className={clsx(
                                'h-8 !rounded-none border-b border-neutral-600 bg-neutral-900 pr-0 font-normal text-neutral-300 first:pl-4 last:pr-4 laptop:h-6',
                                column.className
                            )}
                        >
                            <span className='relative top-[1px]'>
                                {column.label}{' '}
                                {column.key === 'size' && `(${currency})`}
                            </span>
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody
                    items={data ?? []}
                    loadingContent={<Spinner />}
                    isLoading={loading}
                    emptyContent={
                        <span className='text-xs text-neutral-300'>
                            No transactions found
                        </span>
                    }
                >
                    {(item: TradeMetadata) => {
                        const loanValue = LoanValue.fromPrice(
                            +item.executionPrice,
                            maturity
                        );
                        return (
                            <TableRow
                                key={`${item.currency}-${item.maturity}-${item.createdAt}`}
                                className='py-0 text-white laptop:h-6'
                            >
                                <TableCell
                                    className={clsx(
                                        'border-b border-neutral-600 py-0 pl-4 laptop:h-6',
                                        {
                                            'text-secondary-300':
                                                item.side === OrderSide.LEND,
                                            'text-error-300':
                                                item.side === OrderSide.BORROW,
                                        }
                                    )}
                                >
                                    {formatLoanValue(loanValue, 'price')}
                                </TableCell>
                                <TableCell className='border-b border-neutral-600 py-0 laptop:h-6'>
                                    {item.size}
                                </TableCell>
                                <TableCell className='border-b border-neutral-600 py-0 pl-0 pr-3 laptop:h-6'>
                                    <a
                                        href={
                                            blockExplorerUrl
                                                ? `${blockExplorerUrl}/tx/${item.txHash}`
                                                : ''
                                        }
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        <span className='flex items-center justify-end gap-1 whitespace-nowrap'>
                                            {dayjs
                                                .unix(+item.createdAt)
                                                .format('DD/MM/YY, HH:mm')}
                                            <ArrowUpSquare className='relative -top-[1px] h-[15px] w-[15px]' />
                                        </span>
                                    </a>
                                </TableCell>
                            </TableRow>
                        );
                    }}
                </TableBody>
            </Table>
        </div>
    );
};
