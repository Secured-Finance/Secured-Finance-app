import { track } from '@amplitude/analytics-browser';
import { OrderSide } from '@secured-finance/sf-client';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonSizes } from 'src/components/atoms';
import {
    DepositCollateral,
    PlaceOrder,
    generateCollateralList,
} from 'src/components/organisms';
import {
    CollateralBook,
    MarketPhase,
    useBorrowableAmount,
    useCollateralCurrencies,
    useLastPrices,
    useMarketPhase,
    useOrders,
} from 'src/hooks';
import { useCollateralBalances } from 'src/hooks/useBalances';
import { setWalletDialogOpen } from 'src/store/interactions';
import { selectLandingOrderForm } from 'src/store/landingOrderForm';
import { RootState } from 'src/store/types';
import { Amount, ButtonEvents, LoanValue, Maturity } from 'src/utils';
import { useAccount } from 'wagmi';

interface OrderActionProps {
    loanValue: LoanValue;
    collateralBook: CollateralBook;
    renderSide?: boolean;
    validation: boolean; // true to disable button
    isCurrencyDelisted: boolean;
}

export const OrderAction = ({
    loanValue,
    collateralBook,
    renderSide = false,
    validation,
    isCurrencyDelisted,
}: OrderActionProps) => {
    const { address, isConnected } = useAccount();
    const dispatch = useDispatch();
    const { placeOrder, placePreOrder } = useOrders();
    const chainError = useSelector(
        (state: RootState) => state.blockchain.chainError
    );

    const [openDepositCollateralDialog, setOpenDepositCollateralDialog] =
        useState(false);
    const [openPlaceOrderDialog, setOpenPlaceOrderDialog] = useState(false);

    const { currency, amount, side, maturity, orderType, sourceAccount } =
        useSelector((state: RootState) =>
            selectLandingOrderForm(state.landingOrderForm)
        );

    const marketPhase = useMarketPhase(currency, maturity);

    const collateralBalances = useCollateralBalances();

    const { data: priceList } = useLastPrices();
    const { data: collateralCurrencies = [] } = useCollateralCurrencies();
    const price = priceList[currency];

    const depositCollateralList = useMemo(
        () =>
            generateCollateralList(
                collateralBalances,
                false,
                collateralCurrencies
            ),
        [collateralBalances, collateralCurrencies]
    );

    const { data: availableToBorrow } = useBorrowableAmount(address, currency);

    const canBorrow = useMemo(
        () => availableToBorrow >= amount,
        [amount, availableToBorrow]
    );

    const getButtonText = () => {
        if (!renderSide) {
            return 'Place Order';
        }

        if (side === OrderSide.BORROW) {
            return 'Borrow';
        } else {
            return 'Lend';
        }
    };

    const isPlaceOrderDisabled =
        validation ||
        !amount ||
        (marketPhase !== MarketPhase.PRE_ORDER &&
            marketPhase !== MarketPhase.OPEN);

    return (
        <>
            {isConnected &&
                (canBorrow || side === OrderSide.LEND ? (
                    <Button
                        disabled={isPlaceOrderDisabled || chainError}
                        fullWidth
                        onClick={() => {
                            setOpenPlaceOrderDialog(true);
                            track(ButtonEvents.PLACE_ORDER_BUTTON);
                        }}
                        data-testid='place-order-button'
                        mobileText='Order'
                        aria-label={getButtonText()}
                        size={ButtonSizes.lg}
                    >
                        {getButtonText()}
                    </Button>
                ) : (
                    <Button
                        disabled={chainError}
                        fullWidth
                        onClick={() => {
                            setOpenDepositCollateralDialog(true);
                            track(ButtonEvents.DEPOSIT_COLLATERAL_BUTTON);
                        }}
                        data-testid='deposit-collateral-button'
                        size={ButtonSizes.lg}
                    >
                        Deposit collateral
                    </Button>
                ))}
            {!isConnected && (
                <Button
                    fullWidth
                    onClick={() => dispatch(setWalletDialogOpen(true))}
                    size={ButtonSizes.lg}
                >
                    Connect Wallet
                </Button>
            )}

            <PlaceOrder
                onPlaceOrder={
                    marketPhase === MarketPhase.OPEN
                        ? placeOrder
                        : placePreOrder
                }
                isOpen={openPlaceOrderDialog}
                onClose={() => setOpenPlaceOrderDialog(false)}
                loanValue={loanValue}
                collateral={collateralBook}
                assetPrice={price}
                maturity={new Maturity(maturity)}
                orderAmount={new Amount(amount, currency)}
                side={side}
                orderType={orderType}
                walletSource={sourceAccount}
                isCurrencyDelisted={isCurrencyDelisted}
            />

            <DepositCollateral
                isOpen={openDepositCollateralDialog}
                onClose={() => setOpenDepositCollateralDialog(false)}
                collateralList={depositCollateralList}
                source='Order Action Button'
            ></DepositCollateral>
        </>
    );
};
