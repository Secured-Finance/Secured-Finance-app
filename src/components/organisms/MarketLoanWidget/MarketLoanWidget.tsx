import { formatDate, getUTCMonthYear } from '@secured-finance/sf-core';
import { fromBytes32 } from '@secured-finance/sf-graph-client';
import { CellContext, createColumnHelper } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, DropdownSelector, Timer } from 'src/components/atoms';
import {
    CoreTable,
    Tab,
    TabData,
    TabHighlight,
} from 'src/components/molecules';
import {
    Market,
    useCurrencyDelistedStatus,
    useMarketLists,
    useMaturityOptions,
} from 'src/hooks';
import {
    selectLandingOrderForm,
    setAmount,
    setCurrency,
    setMaturity,
} from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import {
    CurrencySymbol,
    amountFormatterFromBase,
    amountFormatterToBase,
    formatLoanValue,
    getCurrencyMapAsOptions,
    toCurrencySymbol,
} from 'src/utils';
import { LoanValue } from 'src/utils/entities';
import {
    contractColumnDefinition,
    tableHeaderDefinition,
} from 'src/utils/tableDefinitions';

const columnHelper = createColumnHelper<Market>();

export const MarketLoanWidget = ({
    isGlobalItayose,
}: {
    isGlobalItayose: boolean;
}) => {
    const { currency, amount } = useSelector((state: RootState) =>
        selectLandingOrderForm(state.landingOrderForm)
    );
    const dispatch = useDispatch();
    const router = useRouter();

    const { openMarkets, itayoseMarkets } = useMarketLists();

    const { data: delistedCurrencySet } = useCurrencyDelistedStatus();

    const filteredItayoseMarkets = itayoseMarkets.filter(
        market => !delistedCurrencySet.has(market.ccy)
    );

    const [selectedCurrency, setSelectedCurrency] = useState<
        CurrencySymbol | ''
    >();
    const [selectedTerm, setSelectedTerm] = useState<number>();

    const getFilteredMarkets = useCallback(
        (markets: Market[]) => {
            if (!selectedCurrency && !selectedTerm) {
                return markets;
            }

            if (markets.length === 0) {
                return [];
            }

            if (markets[0].isItayosePeriod || markets[0].isPreOrderPeriod) {
                return markets.filter(
                    market =>
                        !selectedCurrency || market.ccy === selectedCurrency
                );
            }

            return markets.filter(
                market =>
                    (!selectedCurrency || market.ccy === selectedCurrency) &&
                    (!selectedTerm || market.maturity === selectedTerm)
            );
        },
        [selectedCurrency, selectedTerm]
    );

    const handleClick = useCallback(
        (info: CellContext<Market, string>) => {
            const ccy = fromBytes32(info.getValue()) as CurrencySymbol;
            const fromAmount = amountFormatterFromBase[currency](amount);
            const toAmount = amountFormatterToBase[ccy](fromAmount);
            dispatch(setMaturity(Number(info.row.original.maturity)));
            dispatch(setCurrency(ccy));
            dispatch(setAmount(toAmount));

            info.row.original.isOpened
                ? router.push('/advanced/')
                : router.push('/itayose/');
        },
        [amount, currency, dispatch, router]
    );

    const columns = useMemo(
        () => [
            contractColumnDefinition(
                columnHelper,
                'Asset',
                'contract',
                'currencyOnly',
                undefined,
                'left',
                'left',
                ''
            ),
            columnHelper.accessor('maturity', {
                id: 'maturity',
                cell: info => {
                    return (
                        <div className='flex flex-col justify-center text-left'>
                            <div className='typography-caption text-neutral-8'>
                                {getUTCMonthYear(info.getValue())}
                            </div>
                            <div className='typography-caption text-slateGray'>
                                {formatDate(info.getValue())}
                            </div>
                        </div>
                    );
                },
                header: tableHeaderDefinition('Maturity', '', 'left'),
            }),
            columnHelper.accessor('marketUnitPrice', {
                id: 'apr',
                cell: info => {
                    return (
                        <div className='typography-caption flex justify-center text-neutral-8'>
                            {info.getValue() && info.row.original.maturity
                                ? formatLoanValue(
                                      LoanValue.fromPrice(
                                          info.getValue(),
                                          info.row.original.maturity
                                      ),
                                      'rate'
                                  )
                                : 'N/A'}
                        </div>
                    );
                },
                header: tableHeaderDefinition('APR'),
            }),
            columnHelper.accessor('utcOpeningDate', {
                id: 'openingDate',
                cell: info => {
                    return (
                        <div className='flex justify-center'>
                            <div className='flex w-48 justify-center font-secondary text-xs leading-[14px] text-nebulaTeal'>
                                <Timer
                                    targetTime={info.getValue() * 1000}
                                    text='Ends in'
                                />
                            </div>
                        </div>
                    );
                },
                enableHiding: true,
                header: tableHeaderDefinition('Market Opens'),
            }),
            columnHelper.accessor('currency', {
                id: 'action',
                cell: info => {
                    return (
                        <div className='flex justify-end px-1'>
                            <Button onClick={() => handleClick(info)} size='sm'>
                                {info.row.original.isOpened
                                    ? 'Open Order'
                                    : 'GO'}
                            </Button>
                        </div>
                    );
                },
                header: tableHeaderDefinition('Actions', '', 'right'),
            }),
        ],
        [handleClick]
    );

    const itayoseHighlight: TabHighlight = {
        text: 'NEW',
        size: 'small',
        visible: filteredItayoseMarkets.length !== 0,
    };

    const openMarketUtil = (
        <div className=' flex flex-row items-center justify-center gap-4 px-3 py-2 tablet:justify-end'>
            <AssetDropdown
                handleSelectedCurrency={(ccy: CurrencySymbol | undefined) =>
                    setSelectedCurrency(ccy)
                }
            />
            <MaturityDropdown
                markets={openMarkets}
                handleSelectedTerm={(term: number) => setSelectedTerm(term)}
            />
        </div>
    );

    const itayoseMarketUtil = (
        <div className='hidden flex-row items-center justify-end px-3 py-2 tablet:flex'>
            <AssetDropdown
                handleSelectedCurrency={(ccy: CurrencySymbol | undefined) =>
                    setSelectedCurrency(ccy)
                }
            />
        </div>
    );

    const tabDataArray: TabData[] = [
        {
            text: 'Pre-Open',
            highlight: itayoseHighlight,
            util: itayoseMarketUtil,
            disabled: filteredItayoseMarkets.length === 0,
        },
    ];

    if (!isGlobalItayose) {
        tabDataArray.unshift({ text: 'Loans', util: openMarketUtil });
    }

    return (
        <div className='h-fit rounded-b-2xl border border-white-10 shadow-tab'>
            <Tab tabDataArray={tabDataArray}>
                {!isGlobalItayose && (
                    <div className='min-h-[300px] rounded-b-2xl bg-black-20 px-7 pb-3'>
                        <CoreTable
                            columns={columns}
                            data={getFilteredMarkets(openMarkets)}
                            options={{
                                hideColumnIds: ['openingDate'],
                                stickyColumns: new Set([3]),
                            }}
                        />
                    </div>
                )}

                <div className='min-h-[300px] rounded-b-2xl bg-black-20 px-7 pb-3'>
                    <CoreTable
                        columns={columns}
                        data={getFilteredMarkets(filteredItayoseMarkets)}
                        options={{
                            hideColumnIds: ['apr'],
                            stickyColumns: new Set([3]),
                        }}
                    />
                </div>
            </Tab>
        </div>
    );
};

const MaturityDropdown = ({
    markets,
    handleSelectedTerm,
}: {
    markets: Market[];
    handleSelectedTerm: (term: number) => void;
}) => {
    const maturityOptionList = useMaturityOptions(markets);

    return (
        <DropdownSelector
            optionList={[
                { label: 'All', value: '' },
                ...maturityOptionList.map(o => ({
                    label: o.label,
                    value: o.value.toString(),
                })),
            ]}
            selected={{
                ...maturityOptionList[0],
                value: maturityOptionList[0].value.toString(),
            }}
            onChange={v => {
                const maturity = parseInt(v);
                handleSelectedTerm(maturity);
            }}
        />
    );
};

const AssetDropdown = ({
    handleSelectedCurrency,
}: {
    handleSelectedCurrency: (ccy: CurrencySymbol | undefined) => void;
}) => {
    return (
        <DropdownSelector<string>
            optionList={[
                { label: 'All Assets', value: '' },
                //TODO: add delisting
                ...getCurrencyMapAsOptions(),
            ]}
            onChange={v => handleSelectedCurrency(toCurrencySymbol(v))}
        />
    );
};
