import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import { CoreTable } from 'src/components/molecules';
import { useBreakpoint } from 'src/hooks';
import { TradeHistory } from 'src/types';
import { formatLoanValue } from 'src/utils';
import { LoanValue } from 'src/utils/entities';
import {
    amountColumnDefinition,
    contractColumnDefinition,
    loanTypeColumnDefinition,
    tableHeaderDefinition,
    dateAndTimeColumnDefinition,
} from 'src/utils/tableDefinitions';

const columnHelper = createColumnHelper<TradeHistory[0]>();

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
                    <span className='typography-caption-2 h-6 text-neutral-6'>
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

export const MyTransactionsTable = ({ data }: { data: TradeHistory }) => {
    const isTablet = useBreakpoint('tablet');
    const columns = useMemo(
        () => [
            loanTypeColumnDefinition(columnHelper, 'Type', 'type'),
            contractColumnDefinition(
                columnHelper,
                'Contract',
                'contract',
                'compact'
            ),
            amountColumnDefinition(
                columnHelper,
                'Amount',
                'amount',
                row => row.amount,
                { compact: true, color: true, fontSize: 'typography-caption-2' }
            ),
            priceYieldColumnDef('Price/DF', 'price', 'price'),
            priceYieldColumnDef('APR%', 'apr', 'rate'),
            amountColumnDefinition(
                columnHelper,
                'F.V.',
                'forwardValue',
                row => row.forwardValue,
                {
                    compact: true,
                    color: false,
                    fontSize: 'typography-caption-2',
                }
            ),
            dateAndTimeColumnDefinition(
                columnHelper,
                'Date and Time',
                'createdAt',
                row => row.createdAt
            ),
        ],
        []
    );

    const columnsForTabletMobile = [
        columns[1],
        columns[0],
        ...columns.slice(2),
    ];

    return (
        <div className='pb-2'>
            <CoreTable
                data={data}
                columns={isTablet ? columnsForTabletMobile : columns}
                options={{
                    name: 'active-trade-table',
                    border: false,
                    stickyColumns: new Set([0, 1]),
                }}
            />
        </div>
    );
};
