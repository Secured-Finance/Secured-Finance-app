import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import { CoreTable, OpenOrderActionCell } from 'src/components/molecules';
import { Order } from 'src/hooks/useOrderList';
import { hexToCurrencySymbol } from 'src/utils';
import { Maturity } from 'src/utils/entities';
import {
    amountColumnDefinition,
    contractColumnDefinition,
    loanTypeColumnDefinition,
    priceYieldColumnDefinition,
} from 'src/utils/tableDefinitions';

const columnHelper = createColumnHelper<Order>();

export const OpenOrderTable = ({ data }: { data: Order[] }) => {
    const columns = useMemo(
        () => [
            loanTypeColumnDefinition(columnHelper, 'Type', 'type'),
            contractColumnDefinition(
                columnHelper,
                'Contract',
                'contract',
                'compact'
            ),
            priceYieldColumnDefinition(
                columnHelper,
                'Price',
                'price',
                row => row.unitPrice,
                'compact'
            ),
            priceYieldColumnDefinition(
                columnHelper,
                'APR%',
                'yield',
                row => row.unitPrice,
                'compact',
                'rate'
            ),
            amountColumnDefinition(
                columnHelper,
                'Amount',
                'amount',
                row => row.amount,
                { compact: true, color: false }
            ),
            columnHelper.display({
                id: 'actions',
                cell: info => {
                    const ccy = hexToCurrencySymbol(info.row.original.currency);
                    if (!ccy) return null;

                    return (
                        <OpenOrderActionCell
                            ccy={ccy}
                            maturity={new Maturity(info.row.original.maturity)}
                            orderId={info.row.original.orderId}
                        />
                    );
                },
                header: () => <div>Actions</div>,
            }),
        ],
        []
    );

    return (
        <CoreTable
            columns={columns}
            data={data}
            name='open-order-table'
            border={false}
        />
    );
};
