import * as analytics from '@amplitude/analytics-browser';
import { OrderSide } from '@secured-finance/sf-client';
import { composeStories } from '@storybook/react';
import { CollateralBook } from 'src/hooks';
import { dec22Fixture } from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { fireEvent, render, screen, waitFor } from 'src/test-utils.js';
import { OrderType } from 'src/types';
import {
    ButtonEvents,
    ButtonProperties,
    CurrencySymbol,
    InteractionEvents,
    InteractionProperties,
} from 'src/utils';
import timemachine from 'timemachine';
import * as stories from './AdvancedLendingOrderCard.stories';

const { Default, WalletNotConnected } = composeStories(stories);

const preloadedState = {
    landingOrderForm: {
        currency: CurrencySymbol.USDC,
        maturity: dec22Fixture,
        side: OrderSide.BORROW,
        amount: '500000000',
        unitPrice: '95',
        orderType: OrderType.LIMIT,
    },
    wallet: {
        address: '0x1',
        balance: '0',
    },
    blockchain: {
        chainError: false,
    },
};

const collateralBook0: CollateralBook = {
    collateral: {
        ETH: BigInt('1000000000000000000'),
        USDC: BigInt('10000000'),
        WBTC: BigInt('20000000'),
    },
    nonCollateral: {
        WFIL: BigInt('100000000000000000000'),
    },
    usdCollateral: 12100.34,
    usdAvailableToBorrow: 9680.27,
    usdNonCollateral: 600,
    coverage: 0,
    collateralThreshold: 80,
    withdrawableCollateral: {
        [CurrencySymbol.USDC]: BigInt(100000),
        [CurrencySymbol.ETH]: BigInt(100000),
    },
    totalPresentValue: 0,
};

beforeEach(() => {
    timemachine.reset();
    timemachine.config({
        dateString: '2022-02-01T11:00:00.00Z',
    });
});

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('AdvancedLendingOrderCard Component', () => {
    const changeInputValue = (label: string, value: string) => {
        const input = screen.getByLabelText(label);
        fireEvent.change(input, { target: { value } });
    };

    it('should render an AdvancedLendingOrderCard', async () => {
        render(<Default />, { preloadedState });
        await waitFor(() =>
            expect(screen.getByTestId('place-order-button')).toHaveTextContent(
                'Place Order'
            )
        );
        expect(screen.getAllByRole('radio')).toHaveLength(4);
        expect(screen.getAllByRole('radiogroup')).toHaveLength(2);
    });

    it('should show the rate computed from the bond price', async () => {
        render(<Default />, { preloadedState });
        expect(await screen.findByText('6.35%')).toBeInTheDocument();
    });

    it('should render CollateralManagementConciseTab', async () => {
        render(<Default />, { preloadedState });
        expect(screen.getByText('Collateral Utilization')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('37%')).toBeInTheDocument();
            expect(
                screen.getByTestId('collateral-progress-bar-track')
            ).toHaveStyle('width: calc(100% * 0.37)');
            expect(screen.getByText('$5,203.15')).toBeInTheDocument();
            expect(
                screen.getByText('of $12,100.34 available')
            ).toBeInTheDocument();
        });

        expect(screen.getByText('Liquidation Risk')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();
        expect(screen.getByText('Low')).toHaveClass('text-secondary-500');
        expect(screen.getByText('43%')).toBeInTheDocument();
        expect(screen.getByTestId('liquidation-progress-bar-tick')).toHaveStyle(
            'width: calc(100% * 0.37 + 4px )'
        );
    });

    it('should render order form', async () => {
        render(<Default />, { preloadedState });
        await waitFor(() => {
            const inputs = screen.getAllByRole('textbox');
            expect(screen.getByText('Bond Price')).toBeInTheDocument();
            expect(inputs[0].getAttribute('value')).toBe('95');

            expect(screen.getByText('Size')).toBeInTheDocument();
            expect(inputs[1].getAttribute('value')).toBe('500');
            expect(screen.getByText('USDC')).toBeInTheDocument();
        });

        expect(screen.getByText('Present Value (PV)')).toBeInTheDocument();
        expect(
            await screen.findByText('500 USDC ($500.00)')
        ).toBeInTheDocument();
        expect(screen.getByText('Future Value (FV)')).toBeInTheDocument();
        expect(
            await screen.findByText('526 USDC ($526.00)')
        ).toBeInTheDocument();
    });

    it('should display the PlaceOrder Dialog when clicking on the Place Order button', async () => {
        render(<Default />, { preloadedState });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(
            await screen.findByTestId('place-order-button')
        ).toBeInTheDocument();
        expect(await screen.findByText('Place Order')).toBeEnabled();
        fireEvent.click(screen.getByTestId('place-order-button'));
        expect(
            screen.getByRole('dialog', {
                name: 'Confirm Borrow',
            })
        ).toBeInTheDocument();
    });

    it('should show both market and limit order when in default mode', async () => {
        render(<Default />, { preloadedState });
        await waitFor(() =>
            expect(
                screen.getByRole('radio', { name: 'Market' })
            ).not.toHaveClass('hidden')
        );
        expect(screen.getByRole('radio', { name: 'Market' })).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'Limit' })).not.toHaveClass(
            'hidden'
        );
        expect(screen.getByRole('radio', { name: 'Limit' })).toBeChecked();
    });

    it('place order button should be disabled if amount is zero', async () => {
        render(<Default />, { preloadedState });

        await waitFor(() => {
            const button = screen.getByTestId('place-order-button');
            expect(button).toBeInTheDocument();
            expect(screen.getByText('Place Order')).toBeInTheDocument();
            const input = screen.getByRole('textbox', { name: 'Size' });
            fireEvent.change(input, { target: { value: '0' } });
            expect(button).toBeDisabled();
        });
    });

    it('should render wallet source when side is lend', async () => {
        render(<Default />, { preloadedState });
        const lendTab = screen.getByText('Lend/Buy');
        fireEvent.click(lendTab);
        expect(await screen.findByText('4,000')).toBeInTheDocument();

        const walletSourceButton = screen.getByTestId(
            'wallet-source-selector-button'
        );
        fireEvent.click(walletSourceButton);

        expect(screen.getByText('SF Vault')).toBeInTheDocument();
        const option = screen.getByTestId('option-1');
        fireEvent.click(option);
        expect(screen.getByText('0.1')).toBeInTheDocument();
    });

    it('should change amount when slider is moved and trigger SLIDER event for Amplitude', async () => {
        const track = jest.spyOn(analytics, 'track');
        render(<Default />, {
            preloadedState,
        });

        await waitFor(() => {
            expect(screen.getByText('$5,203.15')).toBeInTheDocument();
            expect(
                screen.getByText('of $12,100.34 available')
            ).toBeInTheDocument();
        });

        const slider = screen.getByRole('slider');
        const input = screen.getByRole('textbox', { name: 'Size' });

        await waitFor(() => {
            fireEvent.change(slider, { target: { value: 50 } });
            expect(input).toHaveValue('2,601.575');
        });

        expect(track).toHaveBeenCalledWith(InteractionEvents.SLIDER, {
            [InteractionProperties.SLIDER_VALUE]: 50,
        });
        fireEvent.change(slider, { target: { value: 100 } });
        expect(input).toHaveValue('5,203.15');
        expect(track).toHaveBeenCalledWith(InteractionEvents.SLIDER, {
            [InteractionProperties.SLIDER_VALUE]: 100,
        });
    });

    it('should not reset amount and slider to 0 when wallet source is changed', async () => {
        await waitFor(() => {
            render(<Default />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        currency: CurrencySymbol.WFIL,
                        side: OrderSide.LEND,
                        amount: '500000000000000000000',
                    },
                },
            });
        });

        const slider = screen.getByRole('slider');
        const input = screen.getByRole('textbox', { name: 'Size' });
        fireEvent.change(input, { target: { value: '50' } });

        expect(
            await screen.findByTestId('wallet-source-selector-button')
        ).toBeInTheDocument();

        const walletSourceButton = screen.getByTestId(
            'wallet-source-selector-button'
        );
        fireEvent.click(walletSourceButton);
        const option = screen.getByTestId('option-1');
        fireEvent.click(option);

        expect(input).toHaveValue('50');
        expect(slider).toHaveValue('50');
    });

    it('slider should move according to source balance', async () => {
        await waitFor(() =>
            render(<Default />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        currency: CurrencySymbol.WFIL,
                        side: OrderSide.LEND,
                        amount: '500000000000000000000',
                    },
                },
            })
        );

        expect(await screen.findByText('10,000')).toBeInTheDocument();
        const slider = screen.getByRole('slider');
        const input = screen.getByRole('textbox', { name: 'Size' });

        expect(await screen.findByText('0xB98b...Fd6D')).toBeInTheDocument();
        expect(input).toHaveValue('500');
        fireEvent.change(slider, { target: { value: 100 } });
        await waitFor(() => expect(input).toHaveValue('10,000'));
        fireEvent.change(slider, { target: { value: 1 } });
        expect(input).toHaveValue('100');

        const walletSourceButton = screen.getByTestId(
            'wallet-source-selector-button'
        );
        fireEvent.click(walletSourceButton);

        expect(screen.getByText('SF Vault')).toBeInTheDocument();
        const option = screen.getByTestId('option-1');
        fireEvent.click(option);
        expect(input).toHaveValue('100');
        expect(slider).toHaveValue('100');
        fireEvent.change(slider, { target: { value: 10 } });
        expect(input).toHaveValue('10');
        fireEvent.change(slider, { target: { value: 50 } });
        expect(input).toHaveValue('50');
    });

    it('amount should be set to max wallet amount if input amount is greater than wallet amount and wallet source is changed', async () => {
        await waitFor(() =>
            render(<Default />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        currency: CurrencySymbol.WFIL,
                        side: OrderSide.LEND,
                        amount: '500000000000000000000',
                    },
                },
            })
        );

        expect(await screen.findByText('10,000')).toBeInTheDocument();
        const slider = screen.getByRole('slider');
        const input = screen.getByRole('textbox', { name: 'Size' });

        expect(await screen.findByText('0xB98b...Fd6D')).toBeInTheDocument();
        expect(input).toHaveValue('500');
        fireEvent.change(slider, { target: { value: 100 } });
        expect(input).toHaveValue('10,000');

        const walletSourceButton = screen.getByTestId(
            'wallet-source-selector-button'
        );
        fireEvent.click(walletSourceButton);

        expect(screen.getByText('SF Vault')).toBeInTheDocument();
        const option = screen.getByTestId('option-1');
        fireEvent.click(option);
        expect(input).toHaveValue('100');
        expect(slider).toHaveValue('100');
    });

    it('it should disable the action button and show error hint if amount is greater than available amount', async () => {
        render(<Default />, {
            preloadedState: {
                ...preloadedState,
                landingOrderForm: {
                    ...preloadedState.landingOrderForm,
                    currency: CurrencySymbol.WFIL,
                    side: OrderSide.LEND,
                    amount: '500000000000000000000',
                },
            },
        });
        await waitFor(() => {
            const input = screen.getByRole('textbox', { name: 'Size' });
            fireEvent.change(input, { target: { value: '200' } });

            const button = screen.getByTestId('place-order-button');
            expect(button).not.toBeDisabled();
            expect(
                screen.queryByText('Insufficient amount in source')
            ).not.toBeInTheDocument();

            fireEvent.change(input, { target: { value: '20000' } });

            expect(button).toBeDisabled();
            expect(
                screen.queryByText('Insufficient amount in source')
            ).toBeInTheDocument();
        });
    });

    it('should not disable button in Borrow orders when input is less than available to borrow amount', async () => {
        // SF vault has 100 WFIL
        // test asserts that the validation condition for Lend orders i.e (input amount< balance to lend) is not applicable to borrow orders

        render(<Default collateralBook={collateralBook0} />, {
            preloadedState: {
                ...preloadedState,
                landingOrderForm: {
                    ...preloadedState.landingOrderForm,
                    currency: CurrencySymbol.WFIL,
                    amount: '500000000000000000000',
                },
            },
        });
        await waitFor(() => {
            const input = screen.getByRole('textbox', { name: 'Size' });
            fireEvent.change(input, { target: { value: '100' } });
        });
        await waitFor(() => {
            expect(screen.getByText('~ 867.19')).toBeInTheDocument();
        });

        await waitFor(() =>
            expect(screen.getByTestId('place-order-button')).not.toBeDisabled()
        );
    });

    it('should show available to borrow on borrow screen', async () => {
        render(<Default />, {
            preloadedState: {
                ...preloadedState,
                landingOrderForm: {
                    ...preloadedState.landingOrderForm,
                    side: OrderSide.BORROW,
                    currency: CurrencySymbol.WFIL,
                    amount: '500000000000000000000',
                },
            },
        });
        expect(
            screen.getByText('Available To Borrow (WFIL)')
        ).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('~ 867.19')).toBeInTheDocument();
        });
    });

    it('should not show available to borrow on lend screen', async () => {
        render(<Default />, {
            preloadedState: {
                ...preloadedState,
                landingOrderForm: {
                    ...preloadedState.landingOrderForm,
                    side: OrderSide.LEND,
                    currency: CurrencySymbol.WFIL,
                    amount: '500000000000000000000',
                },
            },
        });
        expect(
            screen.queryByText('Available To Borrow (WFIL)')
        ).not.toBeInTheDocument();
    });

    it('should disable elements and hide order inputs when wallet is not connected', async () => {
        render(<WalletNotConnected />, { preloadedState });

        // lending side
        fireEvent.click(screen.getByRole('radio', { name: 'Lend/Buy' }));
        expect(
            screen.getByTestId('wallet-source-selector-button')
        ).toBeDisabled();
        expect(
            screen.queryByRole('input', { name: 'Bond Price' })
        ).not.toBeInTheDocument();

        // borrow side
        fireEvent.click(screen.getByRole('radio', { name: 'Borrow/Sell' }));

        expect(
            screen.queryByRole('textbox', { name: 'Size' })
        ).not.toBeInTheDocument();
    });

    describe('Itayose Order Card', () => {
        it('should hide both market and limit order when in onlyLimitOrder mode', async () => {
            render(<Default isItayose preOrderPosition='none' />);
            expect(
                screen.queryByRole('radio', { name: 'Market' })
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('radio', { name: 'Limit' })
            ).not.toBeInTheDocument();
        });

        it('should display an error message if the user select lend but already has borrow pre-orders', async () => {
            render(
                <Default
                    collateralBook={collateralBook0}
                    isItayose
                    preOrderPosition='borrow'
                />,
                {
                    preloadedState: {
                        ...preloadedState,
                        landingOrderForm: {
                            ...preloadedState.landingOrderForm,
                            currency: CurrencySymbol.WFIL,
                            amount: '500000000000000000000',
                        },
                    },
                }
            );

            expect(
                screen.queryByText(
                    'Simultaneous borrow and lend orders are not allowed during the pre-open market period.'
                )
            ).not.toBeInTheDocument();
            await waitFor(() =>
                expect(
                    screen.getByTestId('place-order-button')
                ).not.toBeDisabled()
            );

            fireEvent.click(screen.getByRole('radio', { name: 'Lend/Buy' }));
            expect(
                screen.queryByText(
                    'Simultaneous borrow and lend orders are not allowed during the pre-open market period.'
                )
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Place Order' })
            ).toBeDisabled();
        });
    });

    describe('Error handling for invalid bond price in different order types and sides', () => {
        const assertPlaceOrderButtonIsDisabled = async () => {
            const button = await screen.findByTestId('place-order-button');
            expect(button).toBeInTheDocument();
            await waitFor(() => expect(button).toBeDisabled());
        };

        const assertPlaceOrderButtonIsEnabled = async () => {
            const button = await screen.findByTestId('place-order-button');
            expect(button).toBeInTheDocument();
            expect(button).not.toBeDisabled();
        };

        const assertInvalidBondPriceErrorIsShown = () => {
            expect(screen.getByText('Invalid bond price')).toBeInTheDocument();
        };

        const assertInvalidBondPriceErrorIsNotShown = () => {
            expect(
                screen.queryByText('Invalid bond price')
            ).not.toBeInTheDocument();
        };

        describe('LIMIT orders', () => {
            it('should show error, place order button should be disabled if bond price is 0 for borrow order', async () => {
                render(<Default />, {
                    preloadedState: {
                        ...preloadedState,
                        landingOrderForm: {
                            ...preloadedState.landingOrderForm,
                            side: OrderSide.BORROW,
                            orderType: OrderType.LIMIT,
                        },
                    },
                });
                expect(
                    await screen.findByText('Place Order')
                ).toBeInTheDocument();

                changeInputValue('Bond Price', '0');
                changeInputValue('Size', '10');
                await assertPlaceOrderButtonIsDisabled();
                assertInvalidBondPriceErrorIsShown();

                changeInputValue('Bond Price', '10');
                await assertPlaceOrderButtonIsEnabled();
                assertInvalidBondPriceErrorIsNotShown();
            });

            it('should show error, place order button should be disabled if bond price is 0 for lend order', async () => {
                render(<Default />, {
                    preloadedState: {
                        ...preloadedState,
                        landingOrderForm: {
                            ...preloadedState.landingOrderForm,
                            side: OrderSide.LEND,
                            orderType: OrderType.LIMIT,
                        },
                    },
                });
                expect(await screen.findByText('4,000')).toBeInTheDocument();
                changeInputValue('Bond Price', '0');
                changeInputValue('Size', '10');
                await assertPlaceOrderButtonIsDisabled();
                assertInvalidBondPriceErrorIsShown();

                changeInputValue('Bond Price', '10');
                await assertPlaceOrderButtonIsEnabled();
                assertInvalidBondPriceErrorIsNotShown();
            });

            it.skip('should not show error, place order button should be disabled if bond price is undefined for borrow orders', async () => {
                render(<Default />, {
                    preloadedState: {
                        ...preloadedState,
                        landingOrderForm: {
                            ...preloadedState.landingOrderForm,
                            unitPrice: undefined,
                        },
                    },
                });

                changeInputValue('Size', '10');

                await assertPlaceOrderButtonIsDisabled();
                assertInvalidBondPriceErrorIsNotShown();

                changeInputValue('Bond Price', '0');
                await assertPlaceOrderButtonIsDisabled();
                assertInvalidBondPriceErrorIsShown();
            });

            it('should not show error, place order button should be disabled if bond price is undefined for lend orders', async () => {
                render(<Default />, {
                    preloadedState: {
                        ...preloadedState,
                        landingOrderForm: {
                            ...preloadedState.landingOrderForm,
                            side: OrderSide.LEND,
                            unitPrice: undefined,
                        },
                    },
                });

                changeInputValue('Size', '10');
                await assertPlaceOrderButtonIsDisabled();
                assertInvalidBondPriceErrorIsNotShown();

                changeInputValue('Bond Price', '0');
                await assertPlaceOrderButtonIsDisabled();
                assertInvalidBondPriceErrorIsShown();
            });
        });

        describe('MARKET orders', () => {
            it('should not show error, place order button should not be disabled if bond price is 0 for borrow orders', async () => {
                render(<Default />, {
                    preloadedState: {
                        ...preloadedState,
                        landingOrderForm: {
                            ...preloadedState.landingOrderForm,
                            orderType: OrderType.MARKET,
                        },
                    },
                });
                expect(
                    await screen.findByText('Place Order')
                ).toBeInTheDocument();

                changeInputValue('Size', '10');
                await assertPlaceOrderButtonIsEnabled();
                assertInvalidBondPriceErrorIsNotShown();
            });

            it('should not show error, place order button should not be disabled if bond price is 0 for lend orders', async () => {
                render(<Default />, {
                    preloadedState: {
                        ...preloadedState,
                        landingOrderForm: {
                            ...preloadedState.landingOrderForm,
                            side: OrderSide.LEND,
                            orderType: OrderType.MARKET,
                        },
                    },
                });
                expect(await screen.findByText('4,000')).toBeInTheDocument();
                changeInputValue('Size', '10');
                await assertPlaceOrderButtonIsEnabled();
                assertInvalidBondPriceErrorIsNotShown();
            });

            it('should not show error, place order button should not be disabled if bond price is undefined in MARKET orders', async () => {
                render(<Default />, {
                    preloadedState: {
                        ...preloadedState,
                        landingOrderForm: {
                            ...preloadedState.landingOrderForm,
                            orderType: OrderType.MARKET,
                            unitPrice: undefined,
                        },
                    },
                });
                expect(
                    await screen.findByText('Place Order')
                ).toBeInTheDocument();
                changeInputValue('Size', '10');
                await assertPlaceOrderButtonIsEnabled();
                assertInvalidBondPriceErrorIsNotShown();
            });
        });
    });

    describe('bond price input', () => {
        const assertBondPriceInputValue = (expectedValue: string) => {
            const input = screen.getByLabelText('Bond Price');
            expect(input).toHaveAttribute('value', expectedValue);
        };

        it('should show the market price when market price is defined and unit price is undefined', () => {
            render(<Default marketPrice={9600} />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        orderType: OrderType.LIMIT,
                        unitPrice: undefined,
                    },
                },
            });

            assertBondPriceInputValue('96');
        });

        it('should show the bond price as undefined when market price and unit price are undefined', () => {
            render(<Default marketPrice={undefined} />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        orderType: OrderType.LIMIT,
                        unitPrice: undefined,
                    },
                },
            });

            assertBondPriceInputValue('');
        });

        it('should show the unit price when market price and unit price are defined', () => {
            render(<Default marketPrice={9600} />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        orderType: OrderType.LIMIT,
                        unitPrice: '92',
                    },
                },
            });
            assertBondPriceInputValue('92');
        });

        it('should be reset to Market display when changing order type from LIMIT to MARKET', async () => {
            render(<Default marketPrice={9600} />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        orderType: OrderType.LIMIT,
                        unitPrice: '92',
                    },
                },
            });
            assertBondPriceInputValue('92');
            expect(screen.getAllByText('Market')).toHaveLength(1);

            const marketButton = screen.getByRole('radio', {
                name: 'Market',
            });

            fireEvent.click(marketButton);

            const spanInput = screen.getByTestId('disabled-input');
            expect(spanInput).toBeInTheDocument();
            expect(spanInput).toHaveTextContent('Market');
        });

        it('should calculate the APR from the user input bond price', async () => {
            render(<Default marketPrice={9600} />, {
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        ...preloadedState.landingOrderForm,
                        orderType: OrderType.LIMIT,
                    },
                },
            });

            expect(await screen.findByText('6.35%')).toBeInTheDocument();
            changeInputValue('Bond Price', '94');
            expect(screen.getByText('7.70%')).toBeInTheDocument();
        });

        it('should not reset user input value of bond price when switching order side', async () => {
            render(<Default marketPrice={9600} />, { preloadedState });
            changeInputValue('Bond Price', '20');
            assertBondPriceInputValue('20');
            await waitFor(() => {
                fireEvent.click(screen.getByText('Lend/Buy'));
            });
            assertBondPriceInputValue('20');
        });
    });

    describe('Amplitude', () => {
        it('should track ORDER_SIDE and ORDER_TYPE events when changing order side or order type', async () => {
            const track = jest.spyOn(analytics, 'track');
            render(<Default />);
            fireEvent.click(screen.getByText('Limit'));
            expect(track).toHaveBeenCalledWith(ButtonEvents.ORDER_TYPE, {
                [ButtonProperties.ORDER_TYPE]: OrderType.LIMIT,
            });
            fireEvent.click(screen.getByText('Lend/Buy'));
            expect(track).toHaveBeenCalledWith(ButtonEvents.ORDER_SIDE, {
                [ButtonProperties.ORDER_SIDE]: 'Lend/Buy',
            });
        });

        it('should emit BOND_PRICE event when bond price is changed', () => {
            const track = jest.spyOn(analytics, 'track');
            render(<Default marketPrice={9600} />, { preloadedState });
            changeInputValue('Bond Price', '20');
            expect(track).toHaveBeenCalledWith(InteractionEvents.BOND_PRICE, {
                [InteractionProperties.BOND_PRICE]: '20',
            });
        });
    });
});
