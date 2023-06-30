import { OrderSide, WalletSource } from '@secured-finance/sf-client';
import { BigNumber } from 'ethers';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    BorrowLendSelector,
    ErrorInfo,
    WalletSourceSelector,
} from 'src/components/atoms';
import {
    AssetSelector,
    CollateralUsageSection,
    TermSelector,
} from 'src/components/molecules';
import { OrderAction } from 'src/components/organisms';
import { CollateralBook } from 'src/hooks';
import { getPriceMap } from 'src/store/assetPrices/selectors';
import {
    selectLandingOrderForm,
    setAmount,
    setCurrency,
    setMaturity,
    setSide,
    setSourceAccount,
} from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import { selectAllBalances } from 'src/store/wallet';
import { MaturityOptionList } from 'src/types';
import {
    CurrencySymbol,
    amountFormatterToBase,
    formatLoanValue,
    generateWalletSourceInformation,
    getCurrencyMapAsList,
    getCurrencyMapAsOptions,
    getTransformMaturityOption,
    amountFormatterFromBase,
} from 'src/utils';
import { LoanValue, Maturity } from 'src/utils/entities';
import { useWallet } from 'use-wallet';

export const LendingCard = ({
    collateralBook,
    marketValue,
    maturitiesOptionList,
}: {
    collateralBook: CollateralBook;
    marketValue: LoanValue;
    maturitiesOptionList: MaturityOptionList;
}) => {
    const { currency, maturity, side, sourceAccount } = useSelector(
        (state: RootState) => selectLandingOrderForm(state.landingOrderForm)
    );

    const [lendAmountValidation, setLendAmountValidation] = useState(false);

    const dispatch = useDispatch();
    const { account } = useWallet();

    const shortNames = useMemo(
        () =>
            getCurrencyMapAsList().reduce<Record<string, CurrencySymbol>>(
                (acc, ccy) => ({
                    ...acc,
                    [ccy.name]: ccy.symbol,
                }),
                {}
            ),
        []
    );

    const assetPriceMap = useSelector((state: RootState) => getPriceMap(state));
    const assetList = useMemo(() => getCurrencyMapAsOptions(), []);

    const balanceRecord = useSelector((state: RootState) =>
        selectAllBalances(state)
    );

    const selectedTerm = useMemo(() => {
        return (
            maturitiesOptionList.find(option =>
                option.value.equals(maturity)
            ) || maturitiesOptionList[0]
        );
    }, [maturity, maturitiesOptionList]);

    const walletSourceList = useMemo(() => {
        return generateWalletSourceInformation(
            currency,
            balanceRecord[currency],
            collateralBook.nonCollateral[currency] ?? BigNumber.from(0)
        );
    }, [balanceRecord, collateralBook.nonCollateral, currency]);

    const selectedWalletSource = useMemo(() => {
        return (
            walletSourceList.find(w => w.source === sourceAccount) ||
            walletSourceList[0]
        );
    }, [sourceAccount, walletSourceList]);

    const selectedAsset = useMemo(() => {
        return assetList.find(option => option.value === currency);
    }, [currency, assetList]);

    const balanceToLend = useMemo(() => {
        return selectedWalletSource.source === WalletSource.METAMASK
            ? balanceRecord[currency]
            : amountFormatterFromBase[currency](
                  collateralBook.nonCollateral[currency] ?? BigNumber.from(0)
              );
    }, [
        balanceRecord,
        collateralBook.nonCollateral,
        currency,
        selectedWalletSource.source,
    ]);

    const validateAmount = (value: number | undefined): void => {
        setLendAmountValidation(!!value && value > balanceToLend);
    };

    const handleAmountChange = (v: BigNumber) => {
        dispatch(setAmount(v));
        validateAmount(amountFormatterFromBase[currency](v));
    };

    return (
        <div className='w-80 flex-col space-y-6 rounded-b-xl border border-panelStroke bg-transparent pb-6 shadow-deep'>
            <BorrowLendSelector
                handleClick={side => {
                    dispatch(setSide(side));
                    dispatch(setSourceAccount(WalletSource.METAMASK));
                }}
                side={side}
                variant='simple'
            />

            <div className='grid justify-center space-y-6 px-4'>
                <div className='flex flex-col text-center'>
                    <span
                        className='typography-amount-large text-white'
                        data-testid='market-rate'
                    >
                        {formatLoanValue(marketValue, 'rate')}
                    </span>
                    <span className='typography-caption uppercase text-planetaryPurple'>
                        Fixed Rate APR
                    </span>
                </div>

                <AssetSelector
                    options={assetList}
                    selected={selectedAsset}
                    transformLabel={(v: string) => shortNames[v]}
                    priceList={assetPriceMap}
                    onAmountChange={handleAmountChange}
                    amountFormatterMap={amountFormatterToBase}
                    onAssetChange={(v: CurrencySymbol) => {
                        dispatch(setCurrency(v));
                    }}
                />

                <TermSelector
                    options={maturitiesOptionList.map(o => ({
                        ...o,
                        value: o.value.toString(),
                    }))}
                    selected={{
                        ...selectedTerm,
                        value: selectedTerm.value.toString(),
                    }}
                    onTermChange={v => dispatch(setMaturity(new Maturity(v)))}
                    transformLabel={getTransformMaturityOption(
                        maturitiesOptionList.map(o => ({
                            ...o,
                            value: o.value.toString(),
                        }))
                    )}
                />

                {account && side === OrderSide.LEND && (
                    <>
                        <WalletSourceSelector
                            optionList={walletSourceList}
                            selected={selectedWalletSource}
                            account={account ?? ''}
                            onChange={v => dispatch(setSourceAccount(v))}
                        />
                        <ErrorInfo
                            showError={lendAmountValidation}
                            errorMessage='Insufficient amount'
                        />
                    </>
                )}

                {side === OrderSide.BORROW && (
                    <CollateralUsageSection
                        usdCollateral={collateralBook.usdCollateral}
                        collateralCoverage={collateralBook.coverage.toNumber()}
                        currency={currency}
                        collateralThreshold={collateralBook.collateralThreshold}
                    />
                )}

                <OrderAction
                    collateralBook={collateralBook}
                    renderSide
                    validation={lendAmountValidation}
                />
            </div>
        </div>
    );
};
