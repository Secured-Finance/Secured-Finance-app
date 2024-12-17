import { OrderSide } from '@secured-finance/sf-client';
import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import {
    Button,
    ButtonSizes,
    ButtonVariants,
    HorizontalListItemTable,
} from 'src/components/atoms';
import {
    COMPACT_TABLE_DEFAULT_HEIGHT,
    CompactCoreTable,
    TableActionMenu,
    TableCardHeader,
} from 'src/components/molecules';
import { RemoveOrderDialog } from 'src/components/organisms';
import { Order, useBreakpoint } from 'src/hooks';
import {
    Amount,
    AmountCell,
    Maturity,
    MobileTableWrapper,
    OrderTimeCell,
    amountColumnDefinition,
    contractColumnDefinition,
    dateAndTimeColumnDefinition,
    hexToCurrencySymbol,
    loanTypeColumnDefinition,
    priceYieldColumnDefinition,
} from 'src/utils';

export type OpenOrder = Order & { calculationDate?: number };

const columnHelper = createColumnHelper<OpenOrder>();

type RemoveOrderDialogDataType = {
    orderId: bigint;
    maturity: Maturity;
    amount: Amount;
    side: OrderSide;
    isOpen: boolean;
    orderUnitPrice: number;
};

const OrderTableMobile = ({
    data,
    cancelOrder,
}: {
    data: OpenOrder[];
    cancelOrder: (v: RemoveOrderDialogDataType) => void;
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
                const unitPrice = row.unitPrice;
                const orderId = row.orderId;
                const timestamp = Number(row.createdAt);
                const calculationDate = row.calculationDate;

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
                                price={Number(unitPrice)}
                                calculationDate={calculationDate}
                            />
                            <div className='flex flex-col'>
                                <HorizontalListItemTable
                                    label='Order Amount'
                                    value={
                                        <AmountCell ccy={ccy} amount={amount} />
                                    }
                                />
                                <HorizontalListItemTable
                                    label='Order Time'
                                    value={
                                        <OrderTimeCell timestamp={timestamp} />
                                    }
                                />
                            </div>
                            <Button
                                size={ButtonSizes.sm}
                                fullWidth
                                variant={ButtonVariants.secondary}
                                onClick={() =>
                                    cancelOrder({
                                        orderId: orderId,
                                        maturity: maturity,
                                        amount: new Amount(amount, ccy),
                                        side: side,
                                        isOpen: true,
                                        orderUnitPrice: Number(unitPrice),
                                    })
                                }
                            >
                                Cancel
                            </Button>
                        </div>
                    )
                );
            })}
        </MobileTableWrapper>
    );
};

export const OrderTable = ({
    data,
    height,
}: {
    data: OpenOrder[];
    height?: number;
}) => {
    const isTablet = useBreakpoint('laptop');
    const [removeOrderDialogData, setRemoveOrderDialogData] =
        useState<RemoveOrderDialogDataType>();
    const columns = useMemo(
        () => [
            contractColumnDefinition(
                columnHelper,
                'Symbol',
                'contract',
                'compact',
                undefined,
                'left',
                'left'
            ),
            loanTypeColumnDefinition(columnHelper, 'Type', 'type'),
            priceYieldColumnDefinition(
                columnHelper,
                'Order Price',
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
                'Order Amount',
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

                    const amount = BigInt(info.row.original.amount);
                    const removeOrder = () => {
                        setRemoveOrderDialogData({
                            orderId: info.row.original.orderId,
                            maturity: new Maturity(info.row.original.maturity),
                            amount: new Amount(amount, ccy),
                            side: side,
                            isOpen: true,
                            orderUnitPrice: Number(info.row.original.unitPrice),
                        });
                    };

                    return (
                        <TableActionMenu
                            items={[
                                {
                                    text: 'Cancel',
                                    onClick: removeOrder,
                                },
                            ]}
                        />
                    );
                },
                header: () => (
                    <div className='flex justify-start px-2'>Actions</div>
                ),
            }),
        ],
        []
    );

    return (
        <>
            {isTablet ? (
                <OrderTableMobile
                    data={data}
                    cancelOrder={v => setRemoveOrderDialogData(v)}
                />
            ) : (
                <CompactCoreTable
                    columns={columns}
                    data={data}
                    options={{
                        name: 'open-order-table',
                        pagination: {
                            containerHeight:
                                height || COMPACT_TABLE_DEFAULT_HEIGHT,
                            getMoreData: () => {},
                            totalData: data.length,
                        },
                    }}
                />
            )}
            {removeOrderDialogData && (
                <RemoveOrderDialog
                    {...removeOrderDialogData}
                    onClose={() =>
                        setRemoveOrderDialogData({
                            ...removeOrderDialogData,
                            isOpen: false,
                        })
                    }
                />
            )}
        </>
    );
};
