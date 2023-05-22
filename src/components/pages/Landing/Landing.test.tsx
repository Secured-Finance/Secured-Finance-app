import { OrderSide } from '@secured-finance/sf-client';
import { composeStories } from '@storybook/testing-react';
import {
    preloadedBalances,
    preloadedLendingMarkets,
} from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { fireEvent, render, screen, waitFor } from 'src/test-utils.js';
import { OrderType } from 'src/types';
import { CurrencySymbol } from 'src/utils';
import * as stories from './Landing.stories';

const { Default } = composeStories(stories);

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
        push: jest.fn(),
    })),
}));

jest.mock(
    'next/link',
    () =>
        ({ children }: { children: React.ReactNode }) =>
            children
);

const mock = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mock);

const preloadedState = { ...preloadedBalances, ...preloadedLendingMarkets };

describe('Landing Component', () => {
    it('should render a Landing', async () => {
        await waitFor(() => {
            render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
                preloadedState,
            });
        });
    });

    it('should change the rate when the user changes the maturity', async () => {
        await waitFor(() => {
            render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        currency: CurrencySymbol.EFIL,
                        maturity: 1669852800,
                        side: OrderSide.BORROW,
                        amount: '500000000',
                        unitPrice: 9500,
                        orderType: OrderType.LIMIT,
                        marketPhase: 'Open',
                    },
                },
            });
        });
        expect(screen.getByTestId('market-rate')).toHaveTextContent('3.26%');

        await waitFor(() => {
            fireEvent.click(screen.getByRole('button', { name: 'DEC22' }));
            fireEvent.click(screen.getByText('MAR23'));
        });

        expect(screen.getByTestId('market-rate')).toHaveTextContent('2.62%');
    });

    it('should select the market order type when the user change to advance mode', async () => {
        waitFor(() => {
            render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
                preloadedState,
            });
            fireEvent.click(screen.getByText('Advanced'));
        });

        expect(screen.getByRole('radio', { name: 'Limit' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Market' })).not.toBeChecked();
    });

    it('should open the landing page with the mode set in the store', async () => {
        await waitFor(() => {
            render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
                preloadedState: {
                    ...preloadedState,
                    landingOrderForm: {
                        currency: CurrencySymbol.EFIL,
                        maturity: 0,
                        side: OrderSide.BORROW,
                        amount: '0',
                        unitPrice: 0,
                        orderType: OrderType.MARKET,
                        lastView: 'Advanced',
                    },
                },
            });
        });
        expect(screen.getByRole('radio', { name: 'Advanced' })).toBeChecked();
    });

    it('should save in the store the last view used', async () => {
        await waitFor(() => {
            const { store } = render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
                preloadedState,
            });
            expect(store.getState().landingOrderForm.lastView).toBe('Simple');
            fireEvent.click(screen.getByText('Advanced'));
            expect(store.getState().landingOrderForm.lastView).toBe('Advanced');
        });
    });

    it('should filter out non ready markets', async () => {
        await waitFor(() => {
            render(<Default />, {
                apolloMocks: Default.parameters?.apolloClient.mocks,
                preloadedState,
            });
        });

        expect(screen.getByText('DEC22')).toBeInTheDocument();
        fireEvent.click(screen.getByText('DEC22'));
        expect(screen.getByText('MAR23')).toBeInTheDocument();
        expect(screen.queryByText('DEC24')).not.toBeInTheDocument();
    });
});
