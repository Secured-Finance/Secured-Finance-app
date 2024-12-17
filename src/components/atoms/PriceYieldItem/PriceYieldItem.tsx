import clsx from 'clsx';
import { Alignment } from 'src/types';
import { LoanValue, formatLoanValue } from 'src/utils';

export const PriceYieldItem = ({
    loanValue,
    align = 'right',
    compact = false,
    firstLineType = 'price',
}: {
    loanValue: LoanValue;
    align?: Alignment;
    compact?: boolean;
    firstLineType?: Parameters<typeof formatLoanValue>[1];
}) => {
    return (
        <div
            className={clsx('flex flex-col', {
                'text-right': align === 'right',
                'text-center': align === 'center',
                'text-left': align === 'left',
                'w-12': !compact,
                'w-fit': compact,
            })}
        >
            <span
                className={clsx({
                    'typography-caption-2 font-numerical text-white': compact,
                    'typography-caption h-6 text-neutral-6': !compact,
                })}
            >
                {formatLoanValue(loanValue, firstLineType)}
            </span>
            {compact === false ? (
                <span className='typography-caption-2 h-5 text-neutral-4'>
                    {formatLoanValue(loanValue, 'rate')}
                </span>
            ) : null}
        </div>
    );
};
