import { Listbox, Transition } from '@headlessui/react';
import { WalletSource } from '@secured-finance/sf-client';
import clsx from 'clsx';
import { Fragment, useMemo } from 'react';
import { ExpandIndicator, Separator } from 'src/components/atoms';
import { SvgIcon } from 'src/types';
import {
    AddressUtils,
    currencyMap,
    CurrencySymbol,
    ordinaryFormat,
} from 'src/utils';
import { AMOUNT_PRECISION } from 'src/utils/entities';

interface WalletSourceSelectorProps {
    optionList: WalletSourceOption[];
    selected: WalletSourceOption;
    account: string;
    onChange: (v: WalletSource) => void;
}

export type WalletSourceOption = {
    source: WalletSource;
    available: bigint;
    asset: CurrencySymbol;
    iconSVG: SvgIcon;
};

const formatOption = (
    available: bigint,
    asset: CurrencySymbol,
    showAssetName = false
) => {
    return `${ordinaryFormat(
        Math.floor(
            currencyMap[asset].fromBaseUnit(available) * AMOUNT_PRECISION
        ) / AMOUNT_PRECISION,
        0,
        6
    )} ${showAssetName ? ` ${asset}` : ''}`;
};

const formatSource = (walletSource: WalletSource, account: string) => {
    return walletSource === WalletSource.METAMASK
        ? AddressUtils.format(account, 6)
        : walletSource;
};

export const WalletSourceSelector = ({
    optionList,
    selected,
    account,
    onChange,
}: WalletSourceSelectorProps) => {
    const list = useMemo(
        () =>
            optionList.filter(
                (obj, _index) =>
                    obj.available > 0 || obj.source === WalletSource.METAMASK
            ),
        [optionList]
    );

    const selectedOption = useMemo(
        () => list.find(o => o === selected) || list[0],
        [list, selected]
    );

    return (
        <div className='flex w-full flex-col justify-between'>
            <div className='w-full'>
                <Listbox
                    value={selectedOption}
                    onChange={v => onChange(v.source)}
                    disabled={!account}
                >
                    {({ open }) => (
                        <>
                            <div className='relative h-full rounded-lg ring-inset ring-starBlue focus-within:ring-2'>
                                <Listbox.Button
                                    className='flex w-full cursor-text flex-row items-center justify-between rounded-lg bg-tabBg py-2 pl-3 pr-4 laptop:pl-2'
                                    data-testid='wallet-source-selector-button'
                                >
                                    <div
                                        className={clsx(
                                            'flex h-7 w-auto flex-row items-center justify-between gap-1 rounded border border-neutral-700 bg-neutral-800 pl-2 pr-1 laptop:h-8 desktop:w-[156px]',
                                            {
                                                'cursor-pointer': account,
                                                'cursor-default': !account,
                                            }
                                        )}
                                    >
                                        <div className='flex flex-row items-center gap-1'>
                                            {account && (
                                                <span>
                                                    <selectedOption.iconSVG className='h-3.5 w-3.5 laptop:h-4 desktop:w-4' />
                                                </span>
                                            )}
                                            <span
                                                className={clsx(
                                                    'desktop:typography-caption-2 text-xs leading-4',
                                                    {
                                                        'text-grayScale':
                                                            account,
                                                        'text-grayScale/50':
                                                            !account,
                                                    }
                                                )}
                                            >
                                                {account
                                                    ? formatSource(
                                                          selectedOption.source,
                                                          account
                                                      )
                                                    : 'Connect'}
                                            </span>
                                        </div>
                                        <ExpandIndicator
                                            expanded={open}
                                            variant={
                                                account ? 'solid' : 'opaque'
                                            }
                                        />
                                    </div>
                                    <div className='flex w-fit max-w-[200px] flex-col gap-0.5 text-right text-xs leading-5 text-neutral-50 laptop:gap-[1px] laptop:text-sm laptop:leading-normal'>
                                        {account
                                            ? formatOption(
                                                  selectedOption.available,
                                                  selectedOption.asset
                                              )
                                            : '--'}
                                    </div>
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave='transition ease-in duration-100'
                                    leaveFrom='opacity-100'
                                    leaveTo='opacity-0'
                                >
                                    <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full gap-1 overflow-auto rounded-xl bg-gunMetal px-2 py-2 pt-2 focus:outline-none'>
                                        {list.map((assetObj, index) => (
                                            <Listbox.Option
                                                key={index}
                                                data-testid={`option-${index}`}
                                                value={assetObj}
                                            >
                                                {({ active }) => (
                                                    <div>
                                                        <div
                                                            className={clsx(
                                                                'flex flex-row items-center justify-between rounded-lg p-2',
                                                                {
                                                                    'bg-horizonBlue':
                                                                        active,
                                                                }
                                                            )}
                                                        >
                                                            <div className='flex items-center gap-3'>
                                                                <span>
                                                                    <assetObj.iconSVG className='h-6 w-6' />
                                                                </span>
                                                                <span className='typography-caption-2 leading-4 text-grayScale'>
                                                                    {formatSource(
                                                                        assetObj.source,
                                                                        account
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <span className='typography-caption-2 leading-4 text-planetaryPurple'>
                                                                {formatOption(
                                                                    assetObj.available,
                                                                    assetObj.asset,
                                                                    true
                                                                )}
                                                            </span>
                                                        </div>
                                                        {index !==
                                                        list.length - 1 ? (
                                                            <div className='py-2'>
                                                                <Separator />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </>
                    )}
                </Listbox>
            </div>
        </div>
    );
};
