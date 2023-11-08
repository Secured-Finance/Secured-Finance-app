import { OrderSide } from '@secured-finance/sf-client';
import { createColumnHelper } from '@tanstack/react-table';
import { BigNumber } from 'ethers';
import { useMemo, useState } from 'react';
import { CoreTable, TableActionMenu } from 'src/components/molecules';
import { Order } from 'src/hooks';
import { CurrencySymbol, hexToCurrencySymbol } from 'src/utils';
import { Amount, Maturity } from 'src/utils/entities';
import {
    amountColumnDefinition,
    contractColumnDefinition,
    dateAndTimeColumnDefinition,
    loanTypeColumnDefinition,
    priceYieldColumnDefinition,
} from 'src/utils/tableDefinitions';
import { CancelDialog } from '../CancelDialog';

type OpenOrder = Order & { calculationDate?: number };

const columnHelper = createColumnHelper<OpenOrder>();

const DEFAULT_HEIGHT = 300;

export const OrderTable = ({
    data,
    variant = 'default',
    height,
}: {
    data: OpenOrder[];
    variant?: 'compact' | 'default';
    height?: number;
}) => {
    const [cancelDialogData, setCancelDialogData] = useState<{
        orderId: BigNumber;
        currency: CurrencySymbol;
        maturity: Maturity;
        amount: Amount;
        side: OrderSide;
        isOpen: boolean;
    }>();
    const columns = useMemo(
        () => [
            loanTypeColumnDefinition(columnHelper, 'Type', 'type'),
            contractColumnDefinition(
                columnHelper,
                'Contract',
                'contract',
                variant === 'default' ? 'compact' : 'contractOnly'
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
                {
                    compact: true,
                    color: false,
                    fontSize: 'typography-caption-2',
                }
            ),
            dateAndTimeColumnDefinition(
                columnHelper,
                'Order Time',
                'createdAt',
                row => row.createdAt
            ),
            columnHelper.display({
                id: 'actions',
                cell: info => {
                    const ccy = hexToCurrencySymbol(info.row.original.currency);
                    if (!ccy) return null;

                    const side =
                        info.row.original.side === 0
                            ? OrderSide.LEND
                            : OrderSide.BORROW;

                    const amount = BigNumber.from(
                        info.row.original.amount
                    ).abs();

                    return (
                        <div className='flex justify-center'>
                            <TableActionMenu
                                items={[
                                    {
                                        text: 'Cancel Order',
                                        onClick: () => {
                                            setCancelDialogData({
                                                orderId:
                                                    info.row.original.orderId,
                                                currency: ccy,
                                                maturity: new Maturity(
                                                    info.row.original.maturity
                                                ),
                                                amount: new Amount(amount, ccy),
                                                side: side,
                                                isOpen: true,
                                            });
                                        },
                                    },
                                ]}
                            />
                        </div>
                    );
                },
                header: () => <div className='p-2'>Actions</div>,
            }),
        ],
        [variant]
    );

    return (
        <>
            <CoreTable
                columns={
                    variant === 'compact'
                        ? columns.filter(column => column.id !== 'createdAt')
                        : columns
                }
                data={data}
                options={{
                    name: 'open-order-table',
                    stickyColumns: new Set([6]),
                    pagination: {
                        containerHeight: height || DEFAULT_HEIGHT,
                        getMoreData: () => {},
                        totalData: data.length,
                    },
                }}
            />
            {cancelDialogData && (
                <CancelDialog
                    {...cancelDialogData}
                    onClose={() =>
                        setCancelDialogData({
                            ...cancelDialogData,
                            isOpen: false,
                        })
                    }
                />
            )}
        </>
    );
};
