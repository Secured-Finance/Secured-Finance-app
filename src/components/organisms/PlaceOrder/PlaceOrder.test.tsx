import * as analytics from '@amplitude/analytics-browser';
import { OrderSide, WalletSource } from '@secured-finance/sf-client';
import { composeStories } from '@storybook/react';
import { dec22Fixture, dec24Fixture } from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { fireEvent, render, screen, waitFor } from 'src/test-utils.js';
import { OrderType } from 'src/types';
import {
    Amount,
    ButtonEvents,
    ButtonProperties,
    CurrencySymbol,
} from 'src/utils';
import * as stories from './PlaceOrder.stories';

const { Default, Delisted, UnderMinimumCollateralThreshold } =
    composeStories(stories);

const preloadedState = {
    landingOrderForm: {
        currency: CurrencySymbol.USDC,
        maturity: 0,
        side: OrderSide.BORROW,
        amount: '500000000',
        unitPrice: 0,
        orderType: OrderType.LIMIT,
        sourceAccount: WalletSource.METAMASK,
    },
};

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('PlaceOrder component', () => {
    it('should display the Place Order Modal when open', async () => {
        render(<Default />);

        expect(await screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Confirm Borrow')).toBeInTheDocument();
        const button = screen.getByTestId('dialog-action-button');
        expect(button).toHaveTextContent('OK');
    });

    it('should display the borrow remaining and the collateral usage', async () => {
        render(<Default />);

        expect(screen.getByText('Borrow Remaining')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('$5,103.15')).toBeInTheDocument();
        });

        expect(screen.getByText('Bond Price')).toBeInTheDocument();
        expect(screen.getByText('~ 94.10')).toBeInTheDocument();
        expect(screen.getByText('APR')).toBeInTheDocument();
        expect(screen.getByText('~ 6.28%')).toBeInTheDocument();
    });

    it('should render collateral utilization', async () => {
        render(<Default />);

        expect(screen.getByText('Collateral Usage')).toBeInTheDocument();
        expect(screen.getByText('37%')).toBeInTheDocument();
        expect(screen.getByText('37%')).toHaveClass('text-secondary-500');

        await waitFor(() => {
            expect(screen.getByText('55%')).toBeInTheDocument();
            expect(screen.getByText('55%')).toHaveClass('text-warning-500');
        });
    });

    it('should display the circuit breaker disclaimer', async () => {
        render(<Default />);

        await waitFor(() =>
            expect(screen.getByText('Dec 1, 2022')).toBeInTheDocument()
        );
        const button = screen.getByTestId('disclaimer-button');
        expect(button).toHaveTextContent('Circuit Breaker Disclaimer');
        await waitFor(() => fireEvent.click(button));
        const disclaimerText = await screen.findByTestId('disclaimer-text');
        await waitFor(() =>
            expect(disclaimerText).toHaveTextContent(
                'Circuit breaker will be triggered if the order is filled at over 96.72 which is the max slippage level at 1 block.'
            )
        );
    });

    it('should reach success screen when transaction receipt is received', async () => {
        const onClose = jest.fn();
        const onPlaceOrder = jest
            .fn()
            .mockReturnValue(Promise.resolve('0x123'));

        render(<Default onClose={onClose} onPlaceOrder={onPlaceOrder} />, {
            preloadedState,
        });
        fireEvent.click(screen.getByTestId('dialog-action-button'));

        await waitFor(() =>
            expect(screen.getByText('Success!')).toBeInTheDocument()
        );

        await waitFor(() =>
            expect(
                screen.getByText('Your transaction request was successful.')
            ).toBeInTheDocument()
        );

        await waitFor(() => expect(onClose).not.toHaveBeenCalled());
    });

    it('should update the lastActionTimestamp in the store when the transaction receipt is received', async () => {
        const onPlaceOrder = jest
            .fn()
            .mockReturnValue(Promise.resolve('0x123'));
        const { store } = render(<Default onPlaceOrder={onPlaceOrder} />, {
            preloadedState,
        });
        expect(store.getState().blockchain.lastActionTimestamp).toEqual(0);
        fireEvent.click(screen.getByTestId('dialog-action-button'));
        expect(await screen.findByText('Success!')).toBeInTheDocument();
        expect(store.getState().blockchain.lastActionTimestamp).toBeTruthy();
    });

    it('should call the onPlaceOrder function in market order mode if the orderType is MARKET', async () => {
        const onPlaceOrder = jest
            .fn()
            .mockReturnValue(Promise.resolve('0x123'));
        render(
            <Default
                onPlaceOrder={onPlaceOrder}
                orderType={OrderType.MARKET}
            />,
            { preloadedState }
        );
        fireEvent.click(screen.getByTestId('dialog-action-button'));
        await waitFor(() =>
            expect(onPlaceOrder).toHaveBeenCalledWith(
                CurrencySymbol.USDC,
                dec22Fixture,
                OrderSide.BORROW,
                BigInt('100000000'),
                0,
                WalletSource.METAMASK
            )
        );
    });

    it('should call the onPlaceOrder function in limit order mode if the orderType is LIMIT', async () => {
        const onPlaceOrder = jest
            .fn()
            .mockReturnValue(Promise.resolve('0x123'));
        render(
            <Default onPlaceOrder={onPlaceOrder} orderType={OrderType.LIMIT} />,
            { preloadedState }
        );
        fireEvent.click(screen.getByTestId('dialog-action-button'));
        await waitFor(() =>
            expect(onPlaceOrder).toHaveBeenCalledWith(
                CurrencySymbol.USDC,
                dec22Fixture,
                OrderSide.BORROW,
                BigInt('100000000'),
                9410,
                WalletSource.METAMASK
            )
        );
    });

    describe('Delisting', () => {
        it('should display delisting disclaimer if currency is being delisted', () => {
            render(<Delisted />);
            expect(
                screen.getByText(
                    'Please note that USDC will be delisted on Secured Finance.'
                )
            ).toBeInTheDocument();
        });

        it('should not display delisting disclaimer if currency is not being delisted', () => {
            render(<Default />);
            expect(
                screen.queryByText(
                    'Please note that USDC will be delisted on Secured Finance.'
                )
            ).not.toBeInTheDocument();
        });
    });

    describe('Minimum Collateral Threshold', () => {
        describe('when the order price is lower than the min debt price', () => {
            describe('when the user place a pre-order', () => {
                it('should display a warning if the user places a borrow order', async () => {
                    render(
                        <UnderMinimumCollateralThreshold
                            maturity={dec24Fixture}
                        />
                    );
                    expect(
                        await screen.findByRole('alert')
                    ).toBeInTheDocument();
                });

                it('should not display a warning if the user places a lend order', () => {
                    render(
                        <UnderMinimumCollateralThreshold
                            maturity={dec24Fixture}
                            side={OrderSide.LEND}
                            orderAmount={
                                new Amount('100000000', CurrencySymbol.WFIL)
                            }
                        />
                    );
                    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
                });
            });

            describe('when the user place a regular order', () => {
                // in the mock data, the user has a lending position in WFIL, but not in ETH
                describe('when the user already has a lending position', () => {
                    it('should display a warning if the user places a borrow order', async () => {
                        render(
                            <UnderMinimumCollateralThreshold
                                side={OrderSide.BORROW}
                                orderAmount={
                                    new Amount('100000000', CurrencySymbol.WFIL)
                                }
                            />
                        );
                        expect(
                            await screen.findByRole('alert')
                        ).toBeInTheDocument();
                    });

                    it('should not display a warning if the user places a lend order', () => {
                        render(
                            <UnderMinimumCollateralThreshold
                                side={OrderSide.LEND}
                                orderAmount={
                                    new Amount('100000000', CurrencySymbol.WFIL)
                                }
                            />
                        );
                        expect(
                            screen.queryByRole('alert')
                        ).not.toBeInTheDocument();
                    });
                });

                describe('when the user does not have a lending position', () => {
                    it('should display a warning if the user places a borrow order', async () => {
                        render(
                            <UnderMinimumCollateralThreshold
                                side={OrderSide.BORROW}
                                orderAmount={
                                    new Amount('100000000', CurrencySymbol.ETH)
                                }
                            />
                        );
                        expect(
                            await screen.findByRole('alert')
                        ).toBeInTheDocument();
                    });

                    it('should not display a warning if the user places a lend order', () => {
                        render(
                            <UnderMinimumCollateralThreshold
                                side={OrderSide.BORROW}
                                orderAmount={
                                    new Amount('100000000', CurrencySymbol.ETH)
                                }
                            />
                        );
                        expect(
                            screen.queryByRole('alert')
                        ).not.toBeInTheDocument();
                    });
                });
            });
        });

        it('should disable the place order button if the user is under the minimum collateral threshold', async () => {
            render(
                <UnderMinimumCollateralThreshold
                    side={OrderSide.BORROW}
                    orderAmount={new Amount('100000000', CurrencySymbol.ETH)}
                />
            );
            expect(await screen.findByRole('alert')).toBeInTheDocument();
            expect(screen.getByTestId('dialog-action-button')).toBeDisabled();
        });
    });

    it('should show Confirm Borrow as  title when side is BORROW', () => {
        render(<Default />);
        expect(screen.getByText('Confirm Borrow')).toBeInTheDocument();
    });

    it('should show Confirm Lend as  title when side is LEND', () => {
        render(<Default side={OrderSide.LEND} />);
        expect(screen.getByText('Confirm Lend')).toBeInTheDocument();
    });

    it('should call onClose and emit cancel button event when CANCEL_BUTTON is clicked', () => {
        const track = jest.spyOn(analytics, 'track');
        const onClose = jest.fn();
        render(<Default onClose={onClose} />);
        const cancelButton = screen.getByRole('button', {
            name: 'Cancel',
        });
        fireEvent.click(cancelButton);
        expect(onClose).toHaveBeenCalled();
        expect(track).toHaveBeenCalledWith(ButtonEvents.CANCEL_BUTTON, {
            [ButtonProperties.CANCEL_ACTION]: 'Cancel Place Order',
        });
    });

    it('should not show cancel button if dialog is not on first step', async () => {
        render(<Default />, {
            preloadedState,
        });
        const cancelButton = await screen.findByRole('button', {
            name: 'Cancel',
        });
        expect(cancelButton).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('dialog-action-button'));
        expect(cancelButton).not.toBeInTheDocument();
    });
});
