import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { getUTCMonthYear } from '@secured-finance/sf-core';
import { useCallback, useMemo, useReducer, useState } from 'react';
import { Selector, Spinner } from 'src/components/atoms';
import {
    Dialog,
    DialogState,
    FailurePanel,
    SuccessPanel,
    Tooltip,
} from 'src/components/molecules';
import { ZCTokenInput } from 'src/components/organisms';
import {
    useBlockExplorerUrl,
    useDepositZCToken,
    useERC20TokenBalance,
    useHandleContractTransaction,
    useLastPrices,
    useMaturities,
    useZCToken,
} from 'src/hooks';
import {
    AddressUtils,
    CurrencySymbol,
    Maturity,
    ZCTokenEvents,
    convertToZcTokenName,
    convertZCTokenFromBaseAmount,
    formatAmount,
    handleContractError,
    ordinaryFormat,
} from 'src/utils';
import {
    ButtonEvents,
    ButtonProperties,
    trackButtonEvent,
    trackZCTokenEvent,
} from 'src/utils/events';

enum Step {
    depositZCToken = 1,
    depositing,
    deposited,
    error,
}

type State = {
    currentStep: Step;
    nextStep: Step;
    title: string;
    description: string;
    buttonText: string;
};

const stateRecord: Record<Step, State> = {
    [Step.depositZCToken]: {
        currentStep: Step.depositZCToken,
        nextStep: Step.depositing,
        title: 'Deposit ZC Bonds',
        description: '',
        buttonText: 'OK',
    },
    [Step.depositing]: {
        currentStep: Step.depositing,
        nextStep: Step.deposited,
        title: 'Depositing...',
        description: '',
        buttonText: '',
    },
    [Step.deposited]: {
        currentStep: Step.deposited,
        nextStep: Step.depositZCToken,
        title: 'Success!',
        description:
            'You have successfully deposited ZC Bonds on Secured Finance.',
        buttonText: 'OK',
    },
    [Step.error]: {
        currentStep: Step.error,
        nextStep: Step.depositZCToken,
        title: 'Failed!',
        description: '',
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
        case 'error':
            return {
                ...stateRecord[Step.error],
            };
        default:
            return {
                ...stateRecord[Step.depositZCToken],
            };
    }
};

const CopyTokenAddressButton = ({
    symbol,
    maturity,
}: {
    symbol: CurrencySymbol;
    maturity?: Maturity;
}) => {
    const { data: address } = useZCToken(symbol, maturity || new Maturity(0));

    return (
        <Tooltip
            placement='bottom'
            iconElement={
                <button
                    className='flex h-7 w-7 items-center justify-center rounded-2xl bg-gunMetal'
                    onClick={e => {
                        address && navigator.clipboard.writeText(address);
                        e.stopPropagation();
                    }}
                >
                    <ClipboardDocumentIcon className='h-4 w-4 text-slateGray hover:text-planetaryPurple' />
                </button>
            }
        >
            Copy Token Address
        </Tooltip>
    );
};

export const DepositZCToken = ({
    isOpen,
    onClose,
    source,
    currencyList,
}: {
    currencyList: CurrencySymbol[];
} & DialogState) => {
    const { blockExplorerUrl } = useBlockExplorerUrl();
    const [currencySymbol, setCurrencySymbol] = useState(currencyList[0]);
    const [maturity, setMaturity] = useState(new Maturity(0));
    const [collateral, setCollateral] = useState<bigint>();
    const [state, dispatch] = useReducer(reducer, stateRecord[1]);
    const [errorMessage, setErrorMessage] = useState(
        'Your deposit transaction has failed.'
    );
    const [txHash, setTxHash] = useState<string | undefined>();

    const { data: priceList } = useLastPrices();
    const handleContractTransaction = useHandleContractTransaction();
    const { data: maturities } = useMaturities(currencySymbol, 1);
    const { data: zcToken } = useZCToken(currencySymbol, maturity);
    const { data: availableTokenAmount = BigInt(0) } =
        useERC20TokenBalance(zcToken);
    const { onDepositZCToken } = useDepositZCToken(
        currencySymbol,
        maturity,
        collateral ?? BigInt(0)
    );

    const handleClose = useCallback(() => {
        dispatch({ type: 'default' });
        if (state.currentStep === Step.depositZCToken) {
            trackButtonEvent(
                ButtonEvents.CANCEL_BUTTON,
                ButtonProperties.CANCEL_ACTION,
                'Cancel Deposit ZC Bonds'
            );
        }
        setCollateral(undefined);
        onClose();
    }, [onClose, state.currentStep]);

    const maturityOptionList = useMemo(() => {
        return [
            {
                label: 'Perpetual',
                value: 0,
            },
            ...maturities.map(maturity => ({
                label: getUTCMonthYear(maturity, true),
                value: maturity,
            })),
        ];
    }, [maturities]);

    const isDisabled = useCallback(() => {
        return (
            state.currentStep === Step.depositZCToken &&
            (!collateral || collateral > availableTokenAmount)
        );
    }, [state.currentStep, collateral, availableTokenAmount]);

    const handleDepositZCToken = useCallback(async () => {
        try {
            const tx = await onDepositZCToken();
            const transactionStatus = await handleContractTransaction(tx);
            if (!transactionStatus) {
                dispatch({ type: 'error' });
            } else {
                setTxHash(tx);
                trackZCTokenEvent(
                    ZCTokenEvents.DEPOSIT_ZC_TOKEN,
                    currencySymbol,
                    maturity.toNumber(),
                    collateral ?? BigInt(0),
                    source ?? ''
                );
                dispatch({ type: 'next' });
            }
        } catch (e) {
            handleContractError(e, setErrorMessage, dispatch);
        }
    }, [
        collateral,
        currencySymbol,
        handleContractTransaction,
        maturity,
        onDepositZCToken,
        source,
    ]);

    const onClick = useCallback(
        async (currentStep: Step) => {
            switch (currentStep) {
                case Step.depositZCToken:
                    dispatch({ type: 'next' });
                    handleDepositZCToken();
                    break;
                case Step.depositing:
                    break;
                case Step.deposited:
                    handleClose();
                    break;
                case Step.error:
                    handleClose();
                    break;
            }
        },
        [handleClose, handleDepositZCToken]
    );

    const handleCurrencyChange = useCallback(
        (currencySymbol: CurrencySymbol) => {
            setCurrencySymbol(currencySymbol);
            setCollateral(undefined);
        },
        []
    );

    const handleMaturityChange = useCallback((maturity: Maturity) => {
        setMaturity(maturity);
        setCollateral(undefined);
    }, []);

    const handleCollateral = useCallback((v: bigint | undefined) => {
        setCollateral(v);
    }, []);

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            title={state.title}
            description={state.description}
            callToAction={state.buttonText}
            onClick={() => onClick(state.currentStep)}
            disableActionButton={isDisabled()}
            showCancelButton={state.currentStep === Step.depositZCToken}
        >
            {(() => {
                switch (state.currentStep) {
                    case Step.depositZCToken:
                        return (
                            <div className='flex w-full flex-col gap-6'>
                                <div className='grid grid-cols-2 gap-2'>
                                    <Selector
                                        headerText='Select Asset'
                                        optionList={currencyList.map(
                                            currency => ({
                                                label: currency,
                                                value: currency,
                                            })
                                        )}
                                        onChange={v => {
                                            if (v.value !== currencySymbol) {
                                                handleCurrencyChange(
                                                    v.value as CurrencySymbol
                                                );
                                            }
                                        }}
                                        testid='asset'
                                    />
                                    <Selector
                                        headerText=''
                                        optionList={maturityOptionList}
                                        onChange={v => {
                                            if (
                                                v.value !== maturity.toNumber()
                                            ) {
                                                handleMaturityChange(
                                                    new Maturity(v.value)
                                                );
                                            }
                                        }}
                                        testid='maturity'
                                    />
                                </div>
                                <div className='typography-caption-2 flex items-center gap-2 rounded-lg bg-neutral-700 px-4 py-3 text-slateGray'>
                                    <CopyTokenAddressButton
                                        symbol={currencySymbol}
                                        maturity={maturity}
                                    />
                                    <div className='typography-caption-2 min-w-[120px] truncate text-left text-neutral-300'>
                                        {convertToZcTokenName(
                                            currencySymbol,
                                            maturity
                                        )}
                                    </div>
                                    <div className='w-full text-right text-neutral-300'>
                                        {`${ordinaryFormat(
                                            convertZCTokenFromBaseAmount(
                                                currencySymbol,
                                                availableTokenAmount,
                                                maturity
                                            ) || 0,
                                            0,
                                            4
                                        )} Available`}
                                    </div>
                                </div>
                                <ZCTokenInput
                                    price={priceList[currencySymbol]}
                                    availableTokenAmount={availableTokenAmount}
                                    onAmountChange={handleCollateral}
                                    symbol={currencySymbol}
                                    amount={collateral}
                                    maturity={maturity}
                                />
                                <div className='typography-caption-2 h-fit rounded-xl border border-warning-300 px-3 py-2 text-slateGray'>
                                    Fixed maturity ZC bonds that have already
                                    matured will be automatically converted into
                                    perpetual ZC tokens upon deposit.
                                </div>
                            </div>
                        );
                    case Step.depositing:
                        return (
                            <div className='flex h-full w-full items-center justify-center py-9'>
                                <Spinner />
                            </div>
                        );
                        break;
                    case Step.deposited:
                        return (
                            <SuccessPanel
                                itemList={[
                                    ['Status', 'Complete'],
                                    [
                                        'Transaction hash',
                                        AddressUtils.format(txHash ?? '', 8),
                                    ],
                                    [
                                        'Amount',
                                        `${formatAmount(
                                            convertZCTokenFromBaseAmount(
                                                currencySymbol,
                                                collateral || BigInt(0),
                                                maturity
                                            )
                                        )}`,
                                    ],
                                ]}
                                txHash={txHash}
                                blockExplorerUrl={blockExplorerUrl}
                            />
                        );
                    case Step.error:
                        return <FailurePanel errorMessage={errorMessage} />;

                    default:
                        return <p>Unknown</p>;
                }
            })()}
        </Dialog>
    );
};
