import { Disclosure } from '@headlessui/react';
import { OrderSide } from '@secured-finance/sf-client';
import { BigNumber } from 'ethers';
import { useCallback, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from 'src/assets/img/gradient-loader.png';
import {
    ExpandIndicator,
    Section,
    SectionWithItems,
} from 'src/components/atoms';
import { AmountCard, Dialog, SuccessPanel } from 'src/components/molecules';
import { getPriceMap } from 'src/store/assetPrices/selectors';
import { selectLandingOrderForm } from 'src/store/landingOrderForm';
import { setLastMessage } from 'src/store/lastError';
import { RootState } from 'src/store/types';
import { PlaceOrderFunction } from 'src/types';
import {
    amountFormatterFromBase,
    CurrencySymbol,
    formatLoanValue,
    handleContractTransaction,
    ordinaryFormat,
} from 'src/utils';
import { LoanValue, Maturity } from 'src/utils/entities';

enum Step {
    orderConfirm = 1,
    orderProcessing,
    orderPlaced,
}

type State = {
    currentStep: Step;
    nextStep: Step;
    title: string;
    description: string;
    buttonText: string;
};

const stateRecord: Record<Step, State> = {
    [Step.orderConfirm]: {
        currentStep: Step.orderConfirm,
        nextStep: Step.orderProcessing,
        title: 'Confirm Order',
        description: '',
        buttonText: 'OK',
    },
    [Step.orderProcessing]: {
        currentStep: Step.orderProcessing,
        nextStep: Step.orderPlaced,
        title: 'Placing Order...',
        description: '',
        buttonText: '',
    },
    [Step.orderPlaced]: {
        currentStep: Step.orderPlaced,
        nextStep: Step.orderConfirm,
        title: 'Success!',
        description: 'Your transaction request was successful.',
        buttonText: 'OK',
    },
};

const reducer = (
    state: State,
    action: {
        type: string;
    }
) => {
    switch (action.type) {
        case 'next':
            return {
                ...stateRecord[state.nextStep],
            };
        default:
            return {
                ...stateRecord[Step.orderConfirm],
            };
    }
};

export const PlaceOrder = ({
    isOpen,
    onClose,
    loanValue,
    onPlaceOrder,
}: {
    isOpen: boolean;
    onClose: () => void;
    loanValue?: LoanValue;
    onPlaceOrder: PlaceOrderFunction;
}) => {
    const [state, dispatch] = useReducer(reducer, stateRecord[1]);
    const globalDispatch = useDispatch();
    const { currency, maturity, amount, side } = useSelector(
        (state: RootState) => selectLandingOrderForm(state.landingOrderForm)
    );

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

    const priceList = useSelector((state: RootState) => getPriceMap(state));
    const price = priceList[currency];

    const handleClose = useCallback(() => {
        dispatch({ type: 'default' });
        onClose();
    }, [onClose]);

    const handlePlaceOrder = useCallback(
        async (
            ccy: CurrencySymbol,
            maturity: Maturity,
            side: OrderSide,
            amount: BigNumber,
            unitPrice?: number
        ) => {
            try {
                const tx = await onPlaceOrder(
                    ccy,
                    maturity,
                    side,
                    amount,
                    unitPrice
                );
                const transactionStatus = await handleContractTransaction(tx);
                if (!transactionStatus) {
                    console.error('Some error occurred');
                    handleClose();
                } else {
                    dispatch({ type: 'next' });
                }
            } catch (e) {
                if (e instanceof Error) {
                    globalDispatch(setLastMessage(e.message));
                }
            }
        },
        [onPlaceOrder, dispatch, handleClose, globalDispatch]
    );

    const onClick = useCallback(
        async (currentStep: Step) => {
            switch (currentStep) {
                case Step.orderConfirm:
                    dispatch({ type: 'next' });
                    handlePlaceOrder(
                        currency,
                        maturity,
                        side,
                        amount,
                        loanValue?.price
                    );
                    break;
                case Step.orderProcessing:
                    break;
                case Step.orderPlaced:
                    handleClose();
                    break;
            }
        },
        [
            amount,
            currency,
            handleClose,
            handlePlaceOrder,
            loanValue?.price,
            maturity,
            side,
        ]
    );

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            title={state.title}
            description={state.description}
            callToAction={state.buttonText}
            onClick={() => onClick(state.currentStep)}
        >
            {(() => {
                switch (state.currentStep) {
                    case Step.orderConfirm:
                        return (
                            <div className='grid w-full grid-cols-1 justify-items-stretch gap-6 text-white'>
                                <Section>
                                    <AmountCard
                                        ccy={currency}
                                        amount={getAmount()}
                                        price={price}
                                    />
                                </Section>
                                <SectionWithItems
                                    itemList={[
                                        [
                                            'Borrow Limit Remaining',
                                            '$3,840 / $8,880',
                                        ],
                                        ['Collateral Usage', '50% → 57%'],
                                        [
                                            'Borrow APR',
                                            loanValue
                                                ? formatLoanValue(
                                                      loanValue,
                                                      'rate'
                                                  )
                                                : 'Market Order',
                                        ],
                                    ]}
                                />
                                <SectionWithItems
                                    itemList={[
                                        ['Borrow Fee %', '0.25 %'],
                                        ['Total', '$601.25'],
                                    ]}
                                />
                                <Disclosure>
                                    {({ open }) => (
                                        <>
                                            <Disclosure.Button className='flex h-6 flex-row items-center justify-between'>
                                                <h2 className='typography-hairline-2 text-neutral-8'>
                                                    Additional Information
                                                </h2>
                                                <ExpandIndicator
                                                    expanded={open}
                                                />
                                            </Disclosure.Button>
                                            <Disclosure.Panel>
                                                <SectionWithItems
                                                    itemList={[
                                                        [
                                                            'Bond Price',
                                                            loanValue
                                                                ? loanValue.price.toString()
                                                                : 'Market Order',
                                                        ],
                                                        [
                                                            'Loan Start Date',
                                                            'June 21, 2022',
                                                        ],
                                                        [
                                                            'Loan Maturity Date',
                                                            'Dec 22, 2022',
                                                        ],
                                                        [
                                                            'Total Interest (USD)',
                                                            '$120.00',
                                                        ],
                                                        [
                                                            'Est. Total Debt (USD)',
                                                            '$720.00',
                                                        ],
                                                    ]}
                                                />
                                            </Disclosure.Panel>
                                        </>
                                    )}
                                </Disclosure>
                            </div>
                        );
                    case Step.orderProcessing:
                        return (
                            <div className='py-9'>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={Loader.src}
                                    alt='Loader'
                                    className='animate-spin'
                                ></img>
                            </div>
                        );
                    case Step.orderPlaced:
                        return (
                            <SuccessPanel
                                itemList={[
                                    ['Status', 'Complete'],
                                    ['Deposit Address', 't1wtz1if6k24XE...'],
                                    [
                                        'Amount',
                                        `${ordinaryFormat(
                                            getAmount()
                                        )} ${currency}`,
                                    ],
                                ]}
                            />
                        );
                    default:
                        return <p>Unknown</p>;
                }
            })()}
        </Dialog>
    );
};
