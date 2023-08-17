import { OrderSide } from '@secured-finance/sf-client';
import { composeStories } from '@storybook/react';
import { dec22Fixture, preloadedAssetPrices } from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { fireEvent, render, screen, waitFor } from 'src/test-utils.js';
import { OrderType } from 'src/types';
import { CurrencySymbol, WalletSource } from 'src/utils';
import * as stories from './OrderAction.stories';

const {
    EnoughCollateral,
    NotEnoughCollateral,
    Primary,
    RenderOrderSideButton,
} = composeStories(stories);

const preloadedState = {
    landingOrderForm: {
        currency: CurrencySymbol.USDC,
        maturity: dec22Fixture.toNumber(),
        side: OrderSide.BORROW,
        amount: '500000000',
        unitPrice: 0,
        orderType: OrderType.LIMIT,
        sourceAccount: WalletSource.METAMASK,
    },
    ...preloadedAssetPrices,
};

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('OrderAction component', () => {
    it('should render connect wallet button', async () => {
        await waitFor(() => render(<Primary />, { preloadedState }));
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('should render deposit collateral button when collateral is not sufficient', async () => {
        await waitFor(() =>
            render(<NotEnoughCollateral />, { preloadedState })
        );
        expect(
            await screen.findByTestId('deposit-collateral-button')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Deposit collateral to borrow')
        ).toBeInTheDocument();
        const button = screen.getByTestId('deposit-collateral-button');
        fireEvent.click(button);
        expect(
            screen.getByRole('dialog', { name: 'Deposit Collateral' })
        ).toBeInTheDocument();
    });

    it('should render place order button when collateral is sufficient for order', async () => {
        await waitFor(() => render(<EnoughCollateral />, { preloadedState }));
        expect(
            await screen.findByTestId('place-order-button')
        ).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByText('Place Order')).toBeEnabled()
        );
        const button = screen.getByTestId('place-order-button');
        fireEvent.click(button);
        expect(
            await screen.findByRole('dialog', { name: 'Confirm Order' })
        ).toBeInTheDocument();
    });

    it('should render order side on the place order button if provided as props', async () => {
        await waitFor(() =>
            render(<RenderOrderSideButton />, { preloadedState })
        );
        expect(
            await screen.findByTestId('place-order-button')
        ).toBeInTheDocument();
        expect(screen.getByText('Borrow')).toBeInTheDocument();
    });

    it('should render place order button as it is', async () => {
        await waitFor(() =>
            render(<EnoughCollateral renderSide={false} />, { preloadedState })
        );
        expect(
            await screen.findByTestId('place-order-button')
        ).toBeInTheDocument();
        expect(screen.getByText('Place Order')).toBeInTheDocument();
    });

    it.skip('should render place order button if orderside is lend', async () => {
        await waitFor(() =>
            render(<NotEnoughCollateral />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        side: OrderSide.LEND,
                    },
                },
            })
        );
        expect(
            await screen.findByTestId('place-order-button')
        ).toBeInTheDocument();
        expect(screen.getByText('Place Order')).toBeInTheDocument();
        const button = screen.getByTestId('place-order-button');
        fireEvent.click(button);
        await waitFor(() =>
            expect(
                screen.queryByRole('dialog', { name: 'Confirm Order' })
            ).toBeInTheDocument()
        );
    });

    // it.skip('should disable the button if the market is not open or pre-open', async () => {
    //     await waitFor(() =>
    //         render(<EnoughCollateral />, {
    //             preloadedState: {
    //                 ...preloadedState,
    //                 availableContracts: {
    //                     lendingMarkets: {
    //                         [CurrencySymbol.USDC]: {
    //                             ...preloadedLendingMarkets.availableContracts
    //                                 ?.lendingMarkets[CurrencySymbol.USDC],
    //                             [dec22Fixture.toNumber()]: {
    //                                 ...preloadedLendingMarkets
    //                                     .availableContracts?.lendingMarkets[
    //                                     CurrencySymbol.USDC
    //                                 ][dec22Fixture.toNumber()],
    //                                 isItayosePeriod: true,
    //                                 isPreOrderPeriod: false,
    //                                 isOpened: false,
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         })
    //     );
    //     await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());
    // });
});
