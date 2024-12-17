import { OrderSide } from '@secured-finance/sf-client';
import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { HorizontalListItemTable } from 'src/components/atoms';
import {
    CompactCoreTable,
    Pagination,
    TableCardHeader,
} from 'src/components/molecules';
import { useBreakpoint } from 'src/hooks';
import { Transaction, TransactionHistoryList } from 'src/types';
import {
    AmountCell,
    LoanValue,
    Maturity,
    MobileTableWrapper,
    amountColumnDefinition,
    contractColumnDefinition,
    formatLoanValue,
    hexToCurrencySymbol,
    loanTypeColumnDefinition,
    tableHeaderDefinition,
} from 'src/utils';

const columnHelper = createColumnHelper<Transaction>();

const priceYieldColumnDef = (
    headerTitle: string,
    id: string,
    formatType: Parameters<typeof formatLoanValue>[1]
) => {
    return columnHelper.accessor('averagePrice', {
        id: id,
        cell: info => {
            return (
                <div className='flex justify-center'>
                    <span className='typography-caption-2 font-numerical text-white'>
                        {formatLoanValue(
                            LoanValue.fromPrice(
                                Number(info.getValue().toString() * 10000), //TODO: remove this hack
                                Number(info.row.original.maturity)
                            ),
                            formatType
                        )}
                    </span>
                </div>
            );
        },
        header: tableHeaderDefinition(headerTitle),
    });
};

const getFVWithFee = (futureValue: bigint, fee: bigint, side: number) => {
    if (side === 0) {
        return futureValue - fee;
    }
    return futureValue + fee;
};

const MyTransactionsTableMobile = ({
    data,
}: {
    data: TransactionHistoryList;
}) => {
    return (
        <MobileTableWrapper>
            {data.map((row, index) => {
                const ccy = hexToCurrencySymbol(row.currency);
                const maturity = new Maturity(row.maturity);
                const side =
                    row.side.toString() === '1'
                        ? OrderSide.BORROW
                        : OrderSide.LEND;
                const amount = row.amount;
                const averagePrice = row.averagePrice;
                const futureValue = row.futureValue;
                const feeInFV = row.feeInFV;

                return (
                    ccy && (
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
                                price={Number(averagePrice) * 10000}
                            />
                            <div className='flex flex-col'>
                                <HorizontalListItemTable
                                    label='Executed Amount'
                                    value={
                                        <AmountCell ccy={ccy} amount={amount} />
                                    }
                                />
                                <HorizontalListItemTable
                                    label='Future Value (FV)'
                                    value={
                                        <AmountCell
                                            ccy={ccy}
                                            amount={getFVWithFee(
                                                BigInt(futureValue),
                                                BigInt(feeInFV),
                                                side
                                            )}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    )
                );
            })}
        </MobileTableWrapper>
    );
};

export const MyTransactionsTable = ({
    data,
    pagination,
    variant = 'compact',
    isLoading = false,
}: {
    data: TransactionHistoryList;
    pagination?: Pagination;
    variant?: 'contractOnly' | 'compact';
    isLoading?: boolean;
}) => {
    const isTablet = useBreakpoint('laptop');
    const columns = useMemo(
        () => [
            contractColumnDefinition(
                columnHelper,
                'Symbol',
                'contract',
                variant,
                undefined,
                'left',
                'left'
            ),
            loanTypeColumnDefinition(columnHelper, 'Type', 'type'),
            priceYieldColumnDef('Price', 'price', 'price'),
            priceYieldColumnDef('APR%', 'apr', 'rate'),
            amountColumnDefinition(
                columnHelper,
                'Executed Amount',
                'amount',
                row => row.amount,
                {
                    compact: true,
                    color: false,
                    fontSize: 'typography-caption-2 font-numerical',
                },
                '',
                'right'
            ),
            amountColumnDefinition(
                columnHelper,
                'Future Value (FV)',
                'futureValue',
                row =>
                    getFVWithFee(
                        BigInt(row.futureValue),
                        BigInt(row.feeInFV),
                        row.side
                    ),
                {
                    compact: true,
                    color: false,
                    fontSize: 'typography-caption-2 font-numerical',
                },
                '',
                'right'
            ),
        ],
        [variant]
    );

    return isTablet ? (
        <MyTransactionsTableMobile data={data} />
    ) : (
        <CompactCoreTable
            data={data}
            columns={columns}
            options={{
                name: 'my-transactions-table',
                pagination: pagination,
            }}
            isLoading={isLoading}
        />
    );
};
