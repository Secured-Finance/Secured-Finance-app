import { OrderSide } from '@secured-finance/sf-client';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Spinner } from 'src/components/atoms';
import {
    Dialog,
    DialogState,
    FailurePanel,
    SuccessPanel,
} from 'src/components/molecules';
import { OrderDetails } from 'src/components/organisms';
import {
    emptyCollateralBook,
    useBlockExplorerUrl,
    useHandleContractTransaction,
    useLastPrices,
    useOrders,
} from 'src/hooks';
import { setLastMessage } from 'src/store/lastError';
import {
    AddressUtils,
    Amount,
    ButtonEvents,
    ButtonProperties,
    LoanValue,
    Maturity,
} from 'src/utils';
import { trackButtonEvent } from 'src/utils/events';

enum Step {
    remove = 1,
    processing,
    removed,
    error,
}

type State = {
    currentStep: Step;
    nextStep: Step;
    title: string;
    description: string;
    buttonText: string;
};

export const RemoveOrderDialog = ({
    isOpen,
    onClose,
    amount,
    orderId,
    maturity,
    side,
    orderUnitPrice,
}: {
    amount: Amount;
    maturity: Maturity;
    orderId: bigint;
    side: OrderSide;
    orderUnitPrice: number;
} & DialogState) => {
    const stateRecord: Record<Step, State> = {
        [Step.remove]: {
            currentStep: Step.remove,
            nextStep: Step.processing,
            title: side === OrderSide.BORROW ? 'Remove Borrow' : 'Remove Lend',
            description: '',
            buttonText: 'OK',
        },
        [Step.processing]: {
            currentStep: Step.processing,
            nextStep: Step.removed,
            title: 'Removing Order...',
            description: '',
            buttonText: '',
        },
        [Step.removed]: {
            currentStep: Step.removed,
            nextStep: Step.remove,
            title: 'Removed!',
            description: 'Your order was successfully removed.',
            buttonText: 'OK',
        },
        [Step.error]: {
            currentStep: Step.error,
            nextStep: Step.remove,
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
            case 'updateSide':
                const title =
                    side === OrderSide.BORROW ? 'Remove Borrow' : 'Remove Lend';
                return {
                    ...stateRecord[Step.remove],
                    title: title,
                };
            default:
                return {
                    ...stateRecord[Step.remove],
                };
        }
    };

    const { blockExplorerUrl } = useBlockExplorerUrl();
    const handleContractTransaction = useHandleContractTransaction();
    const [state, dispatch] = useReducer(reducer, stateRecord[1]);
    const [txHash, setTxHash] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState(
        'Your order could not be removed.'
    );
    const globalDispatch = useDispatch();

    const { data: priceList } = useLastPrices();
    const price = priceList[amount.currency];

    const marketValue = LoanValue.fromPrice(
        orderUnitPrice,
        maturity.toNumber()
    );

    useEffect(() => {
        if (state.currentStep === Step.remove) {
            dispatch({ type: 'updateSide' });
        }
    }, [side, state.currentStep]);

    const { cancelOrder } = useOrders();

    const handleClose = useCallback(() => {
        dispatch({ type: 'default' });
        if (state.currentStep === Step.remove) {
            trackButtonEvent(
                ButtonEvents.CANCEL_BUTTON,
                ButtonProperties.CANCEL_ACTION,
                'Cancel Remove Order'
            );
        }
        onClose();
    }, [onClose, state.currentStep]);

    const handleCancelOrder = useCallback(async () => {
        try {
            const tx = await cancelOrder(orderId, amount.currency, maturity);
            const transactionStatus = await handleContractTransaction(tx);
            if (!transactionStatus) {
                dispatch({ type: 'error' });
            } else {
                setTxHash(tx);
                dispatch({ type: 'next' });
            }
        } catch (e) {
            if (e instanceof Error) {
                setErrorMessage(e.message);
                globalDispatch(setLastMessage(e.message));
            }
            dispatch({ type: 'error' });
        }
    }, [
        cancelOrder,
        orderId,
        amount.currency,
        maturity,
        handleContractTransaction,
        globalDispatch,
    ]);

    const onClick = useCallback(
        async (currentStep: Step) => {
            switch (currentStep) {
                case Step.remove:
                    dispatch({ type: 'next' });
                    handleCancelOrder();
                    break;
                case Step.processing:
                    break;
                case Step.removed:
                    handleClose();
                    break;
                case Step.error:
                    handleClose();
                    break;
            }
        },
        [handleCancelOrder, handleClose]
    );

    const renderSelection = () => {
        switch (state.currentStep) {
            case Step.remove:
                return (
                    <OrderDetails
                        amount={amount}
                        maturity={maturity}
                        side={side}
                        assetPrice={price}
                        collateral={emptyCollateralBook}
                        loanValue={marketValue}
                        isRemoveOrder={true}
                    />
                );
            case Step.processing:
                return (
                    <div className='flex h-full w-full items-center justify-center py-9'>
                        <Spinner />
                    </div>
                );
            case Step.removed:
                return (
                    <SuccessPanel
                        itemList={[
                            ['Status', 'Complete'],
                            [
                                'Transaction Hash',
                                AddressUtils.format(txHash ?? '', 8),
                            ],
                        ]}
                        txHash={txHash}
                        blockExplorerUrl={blockExplorerUrl}
                    />
                );
            case Step.error:
                return <FailurePanel errorMessage={errorMessage} />;
        }
    };

    return (
        <Dialog
            title={state.title}
            description={state.description}
            callToAction={state.buttonText}
            onClose={handleClose}
            isOpen={isOpen}
            onClick={() => onClick(state.currentStep)}
            showCancelButton={state.currentStep === Step.remove}
        >
            {renderSelection()}
        </Dialog>
    );
};
