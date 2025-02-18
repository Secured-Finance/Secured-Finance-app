import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import ArrowDownSimple from 'src/assets/icons/arrow-down-simple.svg';

export const ExpandIndicator = ({
    expanded,
    variant = 'solid',
}: {
    expanded: boolean;
    variant?: 'solid' | 'opaque' | 'tab';
}) => {
    return variant === 'tab' ? (
        <ArrowDownSimple
            className={clsx('h-6 w-6', { 'rotate-180': expanded })}
        />
    ) : (
        <ChevronDownIcon
            className={clsx({
                'rotate-180': expanded,
                'h-3.5 w-3.5 text-white laptop:h-4 laptop:w-4':
                    variant === 'solid',
                'h-3 w-3 text-white opacity-50': variant === 'opaque',
            })}
            data-testid='chevron-down-icon'
        />
    );
};
