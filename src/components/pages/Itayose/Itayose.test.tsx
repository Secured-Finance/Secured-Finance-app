import { OrderSide } from '@secured-finance/sf-client';
import { composeStories } from '@storybook/react';
import { dec22Fixture } from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { fireEvent, render, screen, waitFor } from 'src/test-utils.js';
import { CurrencySymbol } from 'src/utils';
import * as stories from './Itayose.stories';

const { Default } = composeStories(stories);

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
        push: jest.fn(),
        query: { market: 'WBTC-DEC2024' },
    })),
}));

jest.mock(
    'next/link',
    () =>
        ({ children }: { children: React.ReactNode }) =>
            children
);

const preloadedState = {
    landingOrderForm: {
        currency: CurrencySymbol.WBTC,
        maturity: dec22Fixture,
        side: OrderSide.BORROW,
        amount: '0',
        unitPrice: 0,
    },
};

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('Itayose Component', () => {
    it('should render a Itayose', async () => {
        await waitFor(() =>
            render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
            })
        );
    });

    it.skip('should convert the amount to changed currency when the user change the currency', async () => {
        const { store } = await waitFor(() =>
            render(<Default />, {
                preloadedState,
                apolloMocks: Default.parameters?.apolloClient.mocks,
            })
        );
        expect(store.getState().landingOrderForm.amount).toEqual('0');
        const ele = await screen.findByRole('textbox', { name: 'Size' });
        await waitFor(() => {
            fireEvent.change(ele, {
                target: { value: '1' },
            });
        });
        expect(store.getState().landingOrderForm.amount).toEqual('1');

        fireEvent.click(screen.getByRole('button', { name: 'WBTC-DEC2024' }));
        fireEvent.click(screen.getByRole('row', { name: 'WFIL-DEC2024' }));

        await waitFor(() => {
            expect(store.getState().landingOrderForm.amount).toEqual('1');
            expect(screen.getByRole('textbox', { name: 'Size' })).toHaveValue(
                '1'
            );
        });
    }, 8000);

    it('should only show the pre-order orders of the user when they are connected', async () => {
        render(<Default />, {
            apolloMocks: Default.parameters?.apolloClient.mocks,
        });
        fireEvent.click(screen.getByRole('tab', { name: 'Open Orders' }));

        const openOrders = await screen.findAllByRole('row');
        expect(openOrders).toHaveLength(1);
    });

    describe('Dynamic orderbook depth', () => {
        it('should retrieve more data when the user select only one side of the orderbook', async () => {
            render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
            });
            expect(
                mockSecuredFinance.getLendOrderBook
            ).toHaveBeenLastCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                15
            );
            await waitFor(() =>
                fireEvent.click(
                    screen.getByRole('button', {
                        name: 'Show Only Lend Orders',
                    })
                )
            );
            await waitFor(() =>
                expect(
                    mockSecuredFinance.getBorrowOrderBook
                ).toHaveBeenLastCalledWith(
                    expect.anything(),
                    expect.anything(),
                    expect.anything(),
                    30
                )
            );
        });

        it('should retrieve more data when the user select a aggregation factor', async () => {
            render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
            });
            expect(
                mockSecuredFinance.getLendOrderBook
            ).toHaveBeenLastCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                15
            );
            await waitFor(() => {
                fireEvent.click(screen.getByRole('button', { name: '0.01' }));
                fireEvent.click(screen.getByRole('menuitem', { name: '1' }));
            });
            await waitFor(() =>
                expect(
                    mockSecuredFinance.getLendOrderBook
                ).toHaveBeenLastCalledWith(
                    expect.anything(),
                    expect.anything(),
                    expect.anything(),
                    1500
                )
            );
        }, 8000);
    });
});
