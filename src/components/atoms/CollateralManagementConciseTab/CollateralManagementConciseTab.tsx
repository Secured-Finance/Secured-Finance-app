import clsx from 'clsx';
import Tick from 'src/assets/icons/tick.svg';
import { emptyCollateralBook, useCollateralBook } from 'src/hooks';
import { percentFormat, usdFormat } from 'src/utils';
// import { THRESHOLD_BLOCKS } from './constants';
interface CollateralManagementConciseTabProps {
    collateralCoverage: number;
    availableToBorrow: number;
    collateralThreshold: number;
    account: string | undefined;
}

export const CollateralManagementConciseTab = ({
    collateralCoverage,
    availableToBorrow,
    collateralThreshold,
    account,
}: CollateralManagementConciseTabProps) => {
    let padding = collateralCoverage / 100.0;
    if (padding > 1) {
        padding = 1;
    }

    const { data: collateralBook = emptyCollateralBook } =
        useCollateralBook(account);
    const threshold =
        collateralThreshold && collateralThreshold > collateralCoverage
            ? collateralThreshold - collateralCoverage
            : 0;

    const totalCollateralInUSD = account ? collateralBook.usdCollateral : 0;

    const info = getLiquidationInformation(collateralCoverage);

    return (
        <div className='flex h-fit w-full flex-col gap-3 rounded-b'>
            <div className='flex flex-col gap-3 rounded-xl border border-neutral-600 bg-neutral-900 p-4'>
                <div className='flex flex-row justify-between text-sm leading-6 text-grayScale'>
                    <span>Collateral Utilization</span>
                    <span className='font-semibold text-secondary-500'>
                        {percentFormat(collateralCoverage, 100)}
                    </span>
                </div>
                <div className='h-6px w-full overflow-hidden rounded-full bg-neutral-700'>
                    <div
                        className='h-full rounded-full bg-secondary-500 transition-width duration-700 ease-in'
                        style={{
                            width: `calc(100% * ${padding})`,
                        }}
                        data-testid='collateral-progress-bar-track'
                    />
                </div>
                <div className='block gap-x-1 text-[11px] leading-[15px] text-neutral-300'>
                    {!account && !totalCollateralInUSD ? (
                        'N/A'
                    ) : (
                        <>
                            <span className='text-secondary-300 font-semibold'>
                                {`${usdFormat(availableToBorrow, 2)} `}
                            </span>
                            <span>{`of ${usdFormat(
                                totalCollateralInUSD,
                                2
                            )} available`}</span>
                        </>
                    )}
                </div>
            </div>
            <div className='flex flex-col rounded-xl border border-neutral-600 bg-neutral-900 p-4'>
                <div className='typography-caption mb-1 flex flex-row justify-between'>
                    <span className='text-grayScale'>Liquidation Risk</span>

                    <span
                        className={clsx({
                            [`font-semibold ${info.color}`]:
                                collateralCoverage > 20,
                            'text-primary-300': collateralCoverage <= 20,
                        })}
                    >
                        {collateralCoverage <= 20 ? 'Safe' : info.risk}
                    </span>
                </div>
                <div
                    style={{
                        width: `calc(100% * ${padding} + 4px )`,
                    }}
                    className='transition-width duration-700 ease-in'
                    data-testid='liquidation-progress-bar-tick'
                >
                    <Tick className='float-right h-5px w-2'></Tick>
                </div>
                <div className='mt-2 h-6px w-full rounded-full bg-gradient-to-r from-progressBarStart from-0% via-progressBarVia via-45% to-progressBarEnd to-80%' />
                <div
                    className={clsx('mt-1 text-[11px] leading-6', {
                        'text-neutral-300': !account,
                        'text-planetaryPurple': account,
                    })}
                >
                    {account ? (
                        <>
                            Threshold:{' '}
                            <span className='font-semibold'>
                                {percentFormat(threshold)}
                            </span>
                        </>
                    ) : (
                        'N/A'
                    )}
                </div>
                {account && <Notification percentage={collateralCoverage} />}
            </div>
        </div>
    );
};

export const getLiquidationInformation = (liquidationPercentage: number) => {
    let color: string;
    let risk: string;

    switch (true) {
        case liquidationPercentage <= 40:
            color = 'text-secondary-500';
            risk = 'Low';
            break;
        case liquidationPercentage <= 60:
            color = 'text-warning-500';
            risk = 'Medium';
            break;
        case liquidationPercentage <= 80:
            color = 'text-error-300';
            risk = 'High';
            break;
        default:
            color = 'text-error-500';
            risk = 'Very High';
            break;
    }
    return { color, risk };
};

const Notification = ({ percentage }: { percentage: number }) => {
    const getRiskLevel = () => {
        if (percentage > 80) {
            return {
                text: 'very high risk',
                className: 'text-error5',
            };
        }

        if (percentage > 60) {
            return {
                text: 'high risk',
                className: 'text-error-300',
            };
        }

        if (percentage > 40) {
            return {
                text: 'medium risk',
                className: 'text-yellow',
            };
        }

        return {
            text: 'lower risk',
            className: 'text-neutral-50',
        };
    };

    const riskLevel = getRiskLevel();

    if (percentage >= 20) {
        return (
            <div className='flex flex-col pt-[0.375rem] text-xs text-secondary7'>
                <p>
                    Your funds are currently at{' '}
                    <span className={riskLevel.className}>
                        {riskLevel.text}
                    </span>{' '}
                    of liquidation.
                </p>
                <p>
                    <span className='font-semibold text-neutral-50 underline'>
                        Deposit collateral
                    </span>{' '}
                    to prevent liquidation.
                </p>
            </div>
        );
    }

    return (
        <p className='text-xs text-secondary7'>
            Your funds are currently not at risk of liquidation.
        </p>
    );
};
