import useLockBodyScroll from '@custom-react-hooks/use-lock-body-scroll';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { SortDescriptor } from '@nextui-org/table';
import { Key } from '@react-types/shared';
import queries from '@secured-finance/sf-graph-client/dist/graphclients';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CurrencyMaturityTable, FilterButtons } from 'src/components/molecules';
import {
    baseContracts,
    useBreakpoint,
    useCurrencies,
    useGraphClientHook,
    useIsSubgraphSupported,
    useLastPrices,
    useLendingMarkets,
} from 'src/hooks';
import useSF from 'src/hooks/useSecuredFinance';
import { SavedMarket } from 'src/types';
import {
    CurrencySymbol,
    LoanValue,
    computeTotalDailyVolumeInUSD,
    currencyMap,
    formatLoanValue,
    isMarketInStore,
    readMarketsFromStore,
    removeMarketFromStore,
    writeMarketInStore,
} from 'src/utils';
import { useAccount } from 'wagmi';
import { CurrencyMaturityDropdownProps, FilteredOption } from './types';

export const CurrencyMaturityDropdown = ({
    currencyList,
    asset = currencyList[0],
    maturityList,
    maturity = maturityList[0],
    onChange,
    isItayosePage,
}: CurrencyMaturityDropdownProps) => {
    const isTablet = useBreakpoint('laptop');
    const [searchValue, setSearchValue] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [isFavorites, setIsFavorites] = useState<boolean>(false);
    const { address } = useAccount();
    const [savedMarkets, setSavedMarkets] = useState(() => {
        return readMarketsFromStore();
    });

    const router = useRouter();
    const { market } = router.query;

    const { data: currencies } = useCurrencies();

    const { data: priceList } = useLastPrices();

    const securedFinance = useSF();
    const currentChainId = securedFinance?.config.chain.id;

    const isSubgraphSupported = useIsSubgraphSupported(currentChainId);

    const dailyVolumes = useGraphClientHook(
        {}, // no variables
        queries.DailyVolumesDocument,
        'dailyVolumes',
        !isSubgraphSupported
    );

    const { volumePerMarket } = computeTotalDailyVolumeInUSD(
        dailyVolumes.data ?? [],
        priceList
    );

    useLockBodyScroll(isTablet && isDropdownOpen);

    const [currentCurrency, setCurrentCurrency] = useState<
        CurrencySymbol | undefined
    >(undefined);
    const [isItayose, setIsItayose] = useState<boolean>(false);
    const [sortState, setSortState] = useState<{
        column?: Key;
        direction?: SortDescriptor['direction'];
    }>({
        column: undefined,
        direction: 'ascending',
    });

    const sortOptions = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options: any[]) => {
            const { column, direction } = sortState;

            return options.sort((a, b) => {
                if (column) {
                    let aValue, bValue;

                    if (column === 'apr') {
                        aValue = parseFloat(a.apr?.replace('%', '')) || 0;
                        bValue = parseFloat(b.apr?.replace('%', '')) || 0;
                    } else if (
                        column === 'maturity' ||
                        column === 'maturity-mobile'
                    ) {
                        aValue = a.maturity;
                        bValue = b.maturity;
                    } else if (column === 'volume') {
                        aValue = a.volume || BigInt(0);
                        bValue = b.volume || BigInt(0);
                    } else {
                        aValue = a[column];
                        bValue = b[column];
                    }

                    if (aValue < bValue) {
                        return direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return direction === 'ascending' ? 1 : -1;
                    }
                }

                return 0;
            });
        },
        [sortState]
    );

    const { data: lendingMarkets = baseContracts } = useLendingMarkets();

    const CcyIcon = currencyMap[asset.value]?.icon;

    const filteredOptions = useMemo(() => {
        let options = currencyList.flatMap(currency => {
            return maturityList
                .map(maturity => {
                    const data =
                        lendingMarkets[currency.value]?.[+maturity.value];

                    const isItayoseOption =
                        data?.isItayosePeriod || data?.isPreOrderPeriod;
                    const preOpeningDate = dayjs(data?.preOpeningDate * 1000);
                    const now = dayjs();

                    if (data?.isMatured || now.isBefore(preOpeningDate)) {
                        return null;
                    }

                    const marketLabel = `${currency.label}-${maturity.label}`;
                    const marketKey = `${currency.value}-${maturity.value}`;

                    const volumeInUSD = volumePerMarket[marketKey];

                    const marketUnitPrice = data?.marketUnitPrice;
                    const openingUnitPrice = data?.openingUnitPrice;

                    const lastPrice =
                        marketUnitPrice || openingUnitPrice
                            ? LoanValue.fromPrice(
                                  marketUnitPrice || openingUnitPrice,
                                  +maturity.value
                              )
                            : undefined;

                    const isFavourite = savedMarkets.some(
                        (savedMarket: SavedMarket) =>
                            savedMarket.market === marketLabel &&
                            savedMarket.address === address &&
                            savedMarket.chainId === currentChainId
                    );

                    if (
                        (currentCurrency &&
                            !currentCurrency.includes(currency.value)) ||
                        (isItayose && !isItayoseOption) ||
                        (searchValue &&
                            !marketLabel
                                .toLowerCase()
                                .includes(searchValue.toLowerCase())) ||
                        (isFavorites && !isFavourite)
                    ) {
                        return null;
                    }

                    return {
                        key: marketLabel,
                        display: marketLabel,
                        currency: currency.value,
                        maturity: maturity.value,
                        lastPrice: formatLoanValue(lastPrice, 'price'),
                        apr: formatLoanValue(lastPrice, 'rate'),
                        volume: volumeInUSD,
                        isItayoseOption,
                        isFavourite,
                    };
                })
                .filter(Boolean);
        });

        options = sortOptions(options);

        return options;
    }, [
        currencyList,
        sortOptions,
        maturityList,
        lendingMarkets,
        currentCurrency,
        isItayose,
        searchValue,
        savedMarkets,
        address,
        isFavorites,
        currentChainId,
        volumePerMarket,
    ]);

    const prevSelectedValue = useRef('');
    useEffect(() => {
        if (
            !prevSelectedValue ||
            prevSelectedValue.current !== maturity.value.toString()
        ) {
            onChange(asset.value, maturity.value);
        }
        prevSelectedValue.current = maturity.value.toString();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maturity, asset]);

    const prevSelectedKey = useRef('');
    useEffect(() => {
        let targetOption = isItayosePage
            ? filteredOptions.find(item => item?.isItayoseOption)
            : filteredOptions[0];

        if (market) {
            targetOption =
                filteredOptions.find(item => item?.key === market) ||
                targetOption;
        }

        if (
            (!prevSelectedKey.current ||
                prevSelectedKey.current !== targetOption?.key) &&
            targetOption
        ) {
            onChange(targetOption.currency, targetOption.maturity);
        }

        prevSelectedKey.current = targetOption?.key as string;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [market, isItayosePage, currencyList, maturityList]);

    const handleOptionClick = (item: FilteredOption) => {
        if (item.currency !== asset.value || item.maturity !== maturity.value) {
            if (item.isItayoseOption) {
                router.push({
                    pathname: '/itayose',
                    query: {
                        market: item.key,
                    },
                });
            } else {
                router.push({
                    pathname: '/',
                    query: {
                        market: item.key,
                    },
                });
            }
        }
    };

    const handleSortChange = (descriptor: SortDescriptor) => {
        const { column, direction } = descriptor;

        setSortState({
            column: column as string,
            direction: direction,
        });
    };

    const handleFavouriteToggle = (market: string) => {
        const targetFavourite: SavedMarket = {
            market,
            address,
            chainId: currentChainId,
        };

        if (isMarketInStore(targetFavourite)) {
            removeMarketFromStore(targetFavourite);
        } else {
            writeMarketInStore(targetFavourite);
        }
        setSavedMarkets(readMarketsFromStore());
    };

    return (
        <Menu>
            {({ open, close }) => (
                <div>
                    <Menu.Button
                        className='flex w-full max-w-[208px] items-center justify-between gap-2 rounded-lg bg-neutral-700 px-2 py-1.5 text-sm font-semibold normal-case leading-6 text-white laptop:max-w-[302px] laptop:py-2.5 laptop:pl-3 laptop:pr-2 laptop:text-base laptop:leading-6 desktop:w-[302px] desktop:text-[22px]'
                        onClick={() => setIsDropdownOpen(!open)}
                    >
                        <div className='flex items-center gap-2 whitespace-nowrap laptop:gap-1'>
                            {!!CcyIcon && (
                                <CcyIcon className='h-5 w-5 laptop:h-6 laptop:w-6' />
                            )}
                            {asset.label}-{maturity.label}
                        </div>
                        <ChevronDownIcon
                            className={`h-4 w-4 flex-shrink-0 text-neutral-300 laptop:h-6 laptop:w-6 ${
                                open ? 'rotate-180' : ''
                            }`}
                        />
                    </Menu.Button>
                    {isDropdownOpen && (
                        <Menu.Items className='absolute -top-3 left-0 z-[25] flex h-full w-full flex-col gap-3 overflow-hidden border-t-4 border-primary-500 bg-neutral-800 px-4 pt-3 laptop:left-auto laptop:top-auto laptop:mt-1.5 laptop:h-auto laptop:w-[779px] laptop:rounded-xl laptop:border laptop:border-neutral-600 laptop:bg-neutral-900 laptop:px-0'>
                            <header className='flex items-center justify-between text-neutral-50 laptop:hidden'>
                                <div className='flex items-center gap-1'>
                                    <MagnifyingGlassIcon className='h-5 w-5' />
                                    <h2 className='typography-mobile-h-6 tracking-normal'>
                                        Search
                                    </h2>
                                </div>
                                <button
                                    className='flex h-8 w-8 items-center justify-center rounded-full border border-neutral-600 tablet:border-[1.75px]'
                                    onClick={() => {
                                        close();
                                        setIsDropdownOpen(false);
                                    }}
                                    data-testid='close-button'
                                    aria-label='Close'
                                >
                                    <XMarkIcon className='h-4 w-4 text-neutral-50' />
                                </button>
                            </header>

                            <div className='flex flex-col gap-3 laptop:px-4'>
                                <input
                                    className='typography-mobile-body-4 laptop:typography-desktop-body-4 rounded-lg border border-neutral-500 bg-neutral-900 px-3 py-2 text-neutral-300 focus:border-[1.5px] focus:border-primary-500 focus:outline-none focus:ring-primary-500'
                                    onChange={e =>
                                        setSearchValue(e.target.value)
                                    }
                                    value={searchValue}
                                    placeholder='Search products...'
                                />
                                <FilterButtons
                                    currencies={currencies}
                                    currentCurrency={currentCurrency}
                                    isItayose={isItayose}
                                    setCurrentCurrency={setCurrentCurrency}
                                    setIsItayose={setIsItayose}
                                    isFavorites={isFavorites}
                                    setIsFavorites={setIsFavorites}
                                />
                            </div>

                            <CurrencyMaturityTable
                                options={filteredOptions as FilteredOption[]}
                                onOptionClick={handleOptionClick}
                                close={() => {
                                    setIsDropdownOpen(false);
                                    close();
                                }}
                                onSortChange={handleSortChange}
                                sortState={sortState}
                                onFavouriteToggle={handleFavouriteToggle}
                            />
                        </Menu.Items>
                    )}
                </div>
            )}
        </Menu>
    );
};
