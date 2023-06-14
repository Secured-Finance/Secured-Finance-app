import classNames from 'classnames';
import { BigNumber } from 'ethers';
import {
    AssetInformation,
    Button,
    CollateralInformationTable,
    CollateralManagementConciseTab,
} from 'src/components/atoms';
import { CollateralBook } from 'src/hooks';
import {
    CurrencySymbol,
    amountFormatterFromBase,
    getCurrencyMapAsList,
    usdFormat,
} from 'src/utils';

interface CollateralTabLeftPaneProps {
    account: string | null;
    onClick: (step: 'deposit' | 'withdraw') => void;
    collateralBook: CollateralBook;
}

const getInformationText = () => {
    let article = '';
    let currencyString = '';
    const collateralCurrencies = getCurrencyMapAsList()
        .filter(ccy => ccy.isCollateral)
        .map(ccy => ccy.symbol);

    const length = collateralCurrencies.length;

    if (length === 1) {
        currencyString = collateralCurrencies[0];
        article = 'is';
    } else {
        for (let i = 0; i < length - 1; i++) {
            currencyString += collateralCurrencies[i];
            if (i === length - 2) {
                currencyString += ' and ';
            } else {
                currencyString += ', ';
            }
        }
        currencyString += collateralCurrencies[length - 1];
        article = 'are';
    }
    return `Only ${currencyString} ${article} eligible as collateral.`;
};

export const CollateralTabLeftPane = ({
    account,
    onClick,
    collateralBook,
}: CollateralTabLeftPaneProps) => {
    const collateralBalance = account ? collateralBook.usdCollateral : 0;
    const nonCollateralBalance = account ? collateralBook.usdNonCollateral : 0;

    return (
        <div className='flex min-h-[400px] w-full flex-col border-white-10 tablet:w-64 tablet:border-r'>
            <div className='flex-grow tablet:border-b tablet:border-white-10'>
                <div className='m-6 flex flex-col gap-1'>
                    <span className='typography-body-2 h-6 w-fit text-slateGray'>
                        Collateral Balance
                    </span>
                    <span
                        className={classNames(
                            'w-fit font-secondary font-semibold text-white',
                            {
                                'text-xl':
                                    collateralBalance.toString().length <= 6,
                                'text-xl tablet:text-md':
                                    collateralBalance.toString().length > 6 &&
                                    collateralBalance.toString().length <= 9,
                                'text-md tablet:text-smd':
                                    collateralBalance.toString().length > 9,
                            }
                        )}
                    >
                        {usdFormat(collateralBalance, 2)}
                    </span>
                </div>
                {!account ? (
                    <div className='typography-caption ml-5 w-40 pt-2 text-grayScale'>
                        Connect your wallet to see your deposited collateral
                        balance.
                    </div>
                ) : (
                    <div>
                        <div className='mx-5 my-6 hidden flex-col gap-6 tablet:flex'>
                            {collateralBalance > 0 ? (
                                <AssetInformation
                                    header='Collateral Assets'
                                    informationText={getInformationText()}
                                    collateralBook={collateralBook.collateral}
                                ></AssetInformation>
                            ) : (
                                <div className='typography-caption w-40 text-grayScale'>
                                    Deposit collateral from your connected
                                    wallet to enable lending service on Secured
                                    Finance.
                                </div>
                            )}
                            {nonCollateralBalance > 0 && (
                                <AssetInformation
                                    header='Non-collateral Assets'
                                    informationText='Not eligible as collateral'
                                    collateralBook={
                                        collateralBook.nonCollateral
                                    }
                                ></AssetInformation>
                            )}
                        </div>
                        <div className='mx-3 mt-6 flex flex-col gap-3 tablet:hidden'>
                            <CollateralManagementConciseTab
                                collateralCoverage={
                                    collateralBook.coverage.toNumber() / 100
                                }
                                totalCollateralInUSD={
                                    collateralBook.usdCollateral
                                }
                                collateralThreshold={
                                    collateralBook.collateralThreshold
                                }
                            />
                            {collateralBalance > 0 ? (
                                <CollateralInformationTable
                                    data={(
                                        Object.entries(
                                            collateralBook.collateral
                                        ) as [CurrencySymbol, BigNumber][]
                                    ).map(([asset, quantity]) => {
                                        return {
                                            asset: asset,
                                            quantity:
                                                amountFormatterFromBase[asset](
                                                    quantity
                                                ),
                                        };
                                    })}
                                />
                            ) : (
                                <div className='flex w-full flex-col gap-2 rounded-b bg-black-20'>
                                    <div className='mx-4 my-5 text-grayScale'>
                                        Deposit collateral from your connected
                                        wallet to enable lending service on
                                        Secured Finance.
                                    </div>
                                </div>
                            )}
                            {nonCollateralBalance > 0 && (
                                <CollateralInformationTable
                                    data={(
                                        Object.entries(
                                            collateralBook.nonCollateral
                                        ) as [CurrencySymbol, BigNumber][]
                                    ).map(([asset, quantity]) => {
                                        return {
                                            asset: asset,
                                            quantity:
                                                amountFormatterFromBase[asset](
                                                    quantity
                                                ),
                                        };
                                    })}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className='flex h-24 flex-row items-center justify-center gap-4 px-6'>
                <Button
                    size='sm'
                    onClick={() => onClick('deposit')}
                    disabled={!account}
                    data-testid='deposit-collateral'
                    fullWidth={true}
                >
                    Deposit
                </Button>
                <Button
                    size='sm'
                    disabled={!account || collateralBalance <= 0}
                    onClick={() => onClick('withdraw')}
                    data-testid='withdraw-collateral'
                    fullWidth={true}
                >
                    Withdraw
                </Button>
            </div>
        </div>
    );
};
