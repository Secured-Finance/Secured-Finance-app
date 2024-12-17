import clsx from 'clsx';
import Link from 'next/link';
import packageJson from 'package.json';
import ExternalLink from 'src/assets/icons/external-link.svg';
import {
    getCommitHash,
    getEnvShort,
    getUsePackageVersion,
    isChipVisibleForEnv,
} from 'src/utils';

const STATUS_PAGE_LINK = 'https://secured-finance.statuspage.io/';

const getVersion = () => {
    if (getUsePackageVersion() && getCommitHash() !== '.storybook') {
        return packageJson.version;
    }

    return getCommitHash();
};

export const Footer = () => {
    return (
        <div
            data-cy='footer'
            className='flex w-full flex-row items-center justify-between px-3 py-1 laptop:px-6'
        >
            <StatusButton />
            <div className='text-center text-[11px] leading-[15px] text-primary-300'>
                <span>{`Secured Finance v${getVersion()} `}</span>
                {isChipVisibleForEnv() && (
                    <span className='capitalize'>{`(${getEnvShort()})`}</span>
                )}
            </div>
        </div>
    );
};

const StatusButton = ({ active = true }) => {
    return (
        <Link
            href={STATUS_PAGE_LINK}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Status Page'
        >
            <div
                className={clsx(
                    'flex flex-row items-center gap-1 rounded-md border-0.5 px-2 py-1',
                    {
                        'border-success-300': active,
                        'border-neutral-300': !active,
                    }
                )}
            >
                <span
                    className={clsx('h-6px w-6px rounded-full', {
                        'bg-success-500': active,
                        'bg-neutral-500': !active,
                    })}
                ></span>
                <span
                    className={clsx(
                        'text-center text-[10px] font-semibold leading-[14px]',
                        {
                            'text-success-300': active,
                            'text-neutral-300': !active,
                        }
                    )}
                >
                    {active ? 'Online' : 'Offline'}
                </span>
                <ExternalLink
                    className={clsx('h-3 w-3', {
                        'text-success-300': active,
                        'text-neutral-300': !active,
                    })}
                />
            </div>
        </Link>
    );
};
