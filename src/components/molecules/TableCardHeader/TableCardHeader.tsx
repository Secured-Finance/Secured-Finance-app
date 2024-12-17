import { OrderSide } from '@secured-finance/sf-client';
import { getUTCMonthYear } from '@secured-finance/sf-core';
import { Chip, ChipColors, CurrencyIcon } from 'src/components/atoms';
import {
    CurrencySymbol,
    LoanValue,
    Maturity,
    formatLoanValue,
} from 'src/utils';

export const TableCardHeader = ({
    currency,
    maturity,
    side,
    price,
    calculationDate,
    displayMarketPrice = false,
}: {
    currency: CurrencySymbol;
    maturity: Maturity;
    side: OrderSide;
    price: number;
    calculationDate?: number;
    displayMarketPrice?: boolean;
}) => {
    return (
        <div className='flex items-center gap-2'>
            <CurrencyIcon ccy={currency} variant='large' />
            <div className='flex w-full flex-col gap-1'>
                <div className='flex w-full flex-row justify-between'>
                    <span className='typography-mobile-sh-9 text-neutral-50'>
                        {`${currency}-${getUTCMonthYear(
                            maturity.toNumber(),
                            true
                        )}`}
                    </span>
                    {price === 0 && displayMarketPrice ? (
                        <span className='typography-mobile-sh-9 normal-case text-neutral-50'>
                            Market Price
                        </span>
                    ) : (
                        <span className='typography-mobile-sh-9 font-numerical text-neutral-50'>
                            {formatLoanValue(
                                LoanValue.fromPrice(
                                    price,
                                    maturity.toNumber(),
                                    calculationDate
                                ),
                                'price'
                            )}
                        </span>
                    )}
                </div>
                <div className='flex w-full flex-row justify-between'>
                    <Chip
                        label={side === OrderSide.BORROW ? 'Borrow' : 'Lend'}
                        color={
                            side === OrderSide.BORROW
                                ? ChipColors.Red
                                : ChipColors.Teal
                        }
                    />
                    {!(price === 0 && displayMarketPrice) && (
                        <div className='flex items-center gap-1'>
                            <span className='text-3 leading-4 text-neutral-400'>
                                APR
                            </span>
                            <span className='font-numerical text-3.5 font-medium leading-4.5 text-neutral-50'>
                                {formatLoanValue(
                                    LoanValue.fromPrice(
                                        price,
                                        maturity.toNumber(),
                                        calculationDate
                                    ),
                                    'rate'
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
