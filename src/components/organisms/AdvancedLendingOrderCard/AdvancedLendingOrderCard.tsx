import { RadioGroup } from '@headlessui/react';
import { OrderSide } from '@secured-finance/sf-client';
import { BigNumber } from 'ethers';
import Link from 'next/link';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CollateralManagementConciseTab,
    NavTab,
    OrderDisplayBox,
    OrderInputBox,
    Separator,
    Slider,
} from 'src/components/atoms';
import { BorrowLendSelector } from 'src/components/atoms/BorrowLendSelector';
import { CollateralBook, OrderType } from 'src/hooks';
import { getPriceMap } from 'src/store/assetPrices/selectors';
import {
    selectLandingOrderForm,
    setAmount,
    setOrderType,
    setSide,
    setUnitPrice,
} from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import {
    amountFormatterFromBase,
    amountFormatterToBase,
    percentFormat,
    usdFormat,
} from 'src/utils';
import { LoanValue } from 'src/utils/entities';
import { OrderAction } from '../OrderAction';

export const AdvancedLendingOrderCard = ({
    collateralBook,
}: {
    collateralBook: CollateralBook;
}) => {
    const {
        currency,
        amount,
        side,
        orderType,
        unitPrice,
        maturity,
        availableToBorrow,
    } = useSelector((state: RootState) =>
        selectLandingOrderForm(state.landingOrderForm)
    );

    const loanValue = useMemo(() => {
        if (unitPrice && maturity) {
            return LoanValue.fromPrice(unitPrice, maturity.toNumber());
        }

        return LoanValue.ZERO;
    }, [unitPrice, maturity]);

    const dispatch = useDispatch();

    const collateralUsagePercent = useMemo(() => {
        return collateralBook.coverage.toNumber() / 100.0;
    }, [collateralBook]);

    const priceList = useSelector((state: RootState) => getPriceMap(state));
    const price = priceList[currency];

    const getAmount = () => {
        let format = (x: BigNumber) => x.toNumber();
        if (
            currency &&
            amountFormatterFromBase &&
            amountFormatterFromBase[currency]
        ) {
            format = amountFormatterFromBase[currency];
        }
        return format(amount);
    };

    const handleAmountChange = (percentage: number) => {
        if (side === OrderSide.BORROW) {
            dispatch(
                setAmount(
                    amountFormatterToBase[currency](
                        Math.floor(percentage * availableToBorrow) / 100.0
                    )
                )
            );
        } else {
            dispatch(setAmount(BigNumber.from(0)));
        }
    };

    return (
        <div className='h-fit w-[350px] rounded-b-xl border border-white-10 bg-cardBackground bg-opacity-60 pb-7 shadow-tab'>
            <RadioGroup
                value={orderType}
                onChange={(v: OrderType) => {
                    dispatch(setOrderType(v));
                }}
                as='div'
                className='flex h-[60px] flex-row items-center justify-around'
            >
                <RadioGroup.Option
                    value={OrderType.MARKET}
                    className='h-full w-1/2'
                    as='button'
                >
                    {({ checked }) => (
                        <NavTab text={OrderType.MARKET} active={checked} />
                    )}
                </RadioGroup.Option>
                <RadioGroup.Option
                    value={OrderType.LIMIT}
                    as='button'
                    className='h-full w-1/2'
                >
                    {({ checked }) => (
                        <NavTab text={OrderType.LIMIT} active={checked} />
                    )}
                </RadioGroup.Option>
            </RadioGroup>

            <div className='flex w-full flex-col justify-center gap-6 px-4 pt-5'>
                <BorrowLendSelector
                    handleClick={side => dispatch(setSide(side))}
                    side={side}
                    variant='advanced'
                />
                <div className='flex flex-col gap-[10px]'>
                    <OrderInputBox
                        field='Bond Price'
                        disabled={orderType === OrderType.MARKET}
                        initialValue={unitPrice / 100.0}
                        onValueChange={v =>
                            dispatch(setUnitPrice((v as number) * 100.0))
                        }
                        informationText='Input value from 0 to 100'
                        decimalPlacesAllowed={2}
                        maxLimit={100}
                    />
                    <div className='mx-[10px]'>
                        <OrderDisplayBox
                            field='Fixed Rate (APY)'
                            value={percentFormat(
                                LoanValue.fromPrice(
                                    unitPrice,
                                    maturity.toNumber()
                                ).apy.toNormalizedNumber()
                            )}
                        />
                    </div>
                </div>
                <Slider onChange={handleAmountChange} />
                <OrderInputBox
                    field='Amount'
                    unit={currency}
                    asset={currency}
                    initialValue={getAmount()}
                    onValueChange={v => dispatch(setAmount(v as BigNumber))}
                />
                <div className='mx-[10px] flex flex-col gap-6'>
                    <OrderDisplayBox
                        field='Est. Present Value'
                        value={usdFormat(getAmount() * price, 2)}
                    />
                    <OrderDisplayBox
                        field='Future Value'
                        value='1,049.86 SF_FIL'
                        informationText='Future Value is the expected return value of the contract at time of maturity.'
                    />
                </div>
                {/* <OrderInputBox
                    field='Total'
                    unit='USD'
                    disabled={true}
                    initialValue={ordinaryFormat(getAmount() * price, 4)}
                /> */}

                <OrderAction
                    loanValue={loanValue}
                    collateralBook={collateralBook}
                />

                <Separator color='neutral-3'></Separator>

                <div className='typography-nav-menu-default flex flex-row justify-between'>
                    <div className='text-neutral-8'>Collateral Management</div>
                    <Link href='/history' passHref>
                        <a
                            className='text-planetaryPurple'
                            href='_'
                            role='button'
                        >
                            Manage &gt;&gt;
                        </a>
                    </Link>
                </div>

                <CollateralManagementConciseTab
                    collateralCoverage={collateralUsagePercent}
                    totalCollateralInUSD={collateralBook.usdCollateral}
                />
            </div>
        </div>
    );
};
