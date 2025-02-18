import clsx from 'clsx';
import { useBreakpoint } from 'src/hooks';
import { ColorFormat } from 'src/types';
import { divide, multiply } from 'src/utils';
import { ZERO_BI, calculatePercentage } from 'src/utils/collateral';

const COLORBAR_MIN_WIDTH = 5;
const COLORBAR_MAX_WIDTH = 302;
const COLORBAR_MAX_WIDTH_MOBILE = 201;

export const ColorBar = ({
    value,
    total,
    color,
}: {
    value: bigint;
    total: bigint;
} & Required<ColorFormat>) => {
    const isTablet = useBreakpoint('laptop');
    const maxWidth = isTablet ? COLORBAR_MAX_WIDTH_MOBILE : COLORBAR_MAX_WIDTH;

    const width = Math.min(
        Math.max(
            multiply(
                divide(Number(calculatePercentage(value, total)), 100),
                maxWidth
            ),
            COLORBAR_MIN_WIDTH
        ),
        maxWidth
    );

    return (
        <div
            className={clsx('absolute h-4 laptop:h-[22px]', {
                'bg-error-300/25': color === 'negative',
                'bg-secondary-300/25': color === 'positive',
            })}
            data-testid='color-bar'
            style={{ width: value === ZERO_BI ? '4px' : `${width}%` }}
        ></div>
    );
};
