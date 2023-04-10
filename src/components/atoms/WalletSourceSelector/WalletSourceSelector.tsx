import { Listbox, Transition } from '@headlessui/react';
import { WalletSource } from '@secured-finance/sf-client/dist/secured-finance-client';
import classNames from 'classnames';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { ExpandIndicator, Separator } from 'src/components/atoms';
import { AddressUtils, CurrencySymbol, ordinaryFormat } from 'src/utils';

interface WalletSourceSelectorProps {
    optionList: WalletSourceOption[];
    selected: WalletSourceOption;
    account: string;
    onChange: (v: WalletSource) => void;
}

export type WalletSourceOption = {
    source: WalletSource;
    available: number;
    asset: CurrencySymbol;
    iconSVG: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
};

const formatOption = (available: number, asset: CurrencySymbol) => {
    return `${ordinaryFormat(available, 4)} ${asset}`;
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
    const [selectedValue, setSelectedValue] = useState(selected);
    const list = useMemo(
        () =>
            optionList.filter(
                (obj, _index) =>
                    obj.available > 0 || obj.source === WalletSource.METAMASK
            ),
        [optionList]
    );

    const selectedOption = useMemo(
        () => list.find(o => o === selectedValue) || list[0],
        [list, selectedValue]
    );

    useEffect(() => {
        onChange(selectedValue.source);
    }, [selectedValue, onChange]);

    return (
        <div className='flex h-20 w-full flex-col justify-between'>
            <div className='typography-caption-2 flex flex-row justify-between text-planetaryPurple'>
                <span className='ml-2'>Lending Source</span>
                <span className='mr-1'>Available to Lend</span>
            </div>
            <div className='w-full'>
                <Listbox value={selectedOption} onChange={setSelectedValue}>
                    {({ open }) => (
                        <>
                            <div className='relative h-full'>
                                <Listbox.Button
                                    className='flex w-full cursor-default flex-row items-center justify-between rounded-lg bg-black-20 py-2 pl-2 pr-3 ring-starBlue focus-within:ring'
                                    data-testid='wallet-source-selector-button'
                                >
                                    <div className='flex h-10 flex-row items-center gap-2 rounded-lg bg-white-5 px-2'>
                                        <span>
                                            <selectedOption.iconSVG className='h-5 w-5' />
                                        </span>
                                        <span className='typography-caption-2 min-w-[80px] items-center leading-4 text-grayScale'>
                                            {formatSource(
                                                selectedOption.source,
                                                account
                                            )}
                                        </span>
                                        <ExpandIndicator expanded={open} />
                                    </div>
                                    <div className='typography-caption w-fit max-w-[200px] items-center justify-end text-white-60'>
                                        {formatOption(
                                            selectedOption.available,
                                            selectedOption.asset
                                        )}
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
                                                            className={classNames(
                                                                'flex flex-row items-center gap-3 rounded-lg p-2',
                                                                {
                                                                    'bg-horizonBlue':
                                                                        active,
                                                                }
                                                            )}
                                                        >
                                                            <span>
                                                                <assetObj.iconSVG className='h-6 w-6' />
                                                            </span>
                                                            <span className='typography-caption-2 min-w-[100px] leading-4 text-grayScale'>
                                                                {formatSource(
                                                                    assetObj.source,
                                                                    account
                                                                )}
                                                            </span>
                                                            <span className='typography-caption-2 flex w-full max-w-[200px] items-center justify-end leading-4 text-planetaryPurple'>
                                                                {formatOption(
                                                                    assetObj.available,
                                                                    assetObj.asset
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
