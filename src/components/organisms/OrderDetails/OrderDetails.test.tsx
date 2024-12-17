import { composeStories } from '@storybook/react';
import { mar23Fixture } from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { fireEvent, render, screen, waitFor } from 'src/test-utils.js';
import { Amount, CurrencySymbol } from 'src/utils';
import * as stories from './OrderDetails.stories';

const {
    Default,
    Delisted,
    UnderMinimumCollateralThreshold,
    RemoveOrder,
    MarketOrder,
} = composeStories(stories);

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('OrderDetails Component', () => {
    it('should display the borrow remaining and the collateral usage', async () => {
        render(<Default />);

        expect(screen.getByText('Borrow Remaining')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('$5,103.15')).toBeInTheDocument();
        });

        expect(screen.getByText('Bond Price')).toBeInTheDocument();
        expect(screen.getByText('~ 96.10')).toBeInTheDocument();
        expect(screen.getByText('APR')).toBeInTheDocument();
        expect(screen.getByText('~ 4.06%')).toBeInTheDocument();
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

    it('should display delisting disclaimer if order currency is being delisted', async () => {
        render(<Delisted />);
        await waitFor(() => {
            expect(
                screen.getByText(
                    'Please note that USDC will be delisted on Secured Finance.'
                )
            ).toBeInTheDocument();
        });
    });

    it('should not display delisting disclaimer if currency is not being delisted', () => {
        render(<Default />);
        expect(
            screen.queryByText(
                'Please note that USDC will be delisted on Secured Finance.'
            )
        ).not.toBeInTheDocument();
    });

    describe('Minimum Collateral Threshold', () => {
        it('should display a warning when specified with the market currentMinDebtUnitPrice', async () => {
            render(<UnderMinimumCollateralThreshold />);
            expect(await screen.findByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('95.00')).toBeInTheDocument();
        });

        it('should display the adjusted PV', async () => {
            render(<UnderMinimumCollateralThreshold />);
            expect(await screen.findByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('9,500 USDC')).toBeInTheDocument();
        });
    });

    it('should not show collateral info when isRemoveOrder is true', () => {
        render(<RemoveOrder />);
        expect(screen.queryByText('Collateral Usage')).not.toBeInTheDocument();
        expect(screen.queryByText('Borrow Remaining')).not.toBeInTheDocument();
    });

    it('should display ZC usage', async () => {
        render(
            <Default
                amount={new Amount('50000000000000000000', CurrencySymbol.WFIL)}
                maturity={mar23Fixture}
            />
        );
        expect(screen.getByText('ZC Usage')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('0%')).toBeInTheDocument();
            expect(screen.getByText('80%')).toBeInTheDocument();
        });
    });

    it('should display bond price as Market if orderType is Market', async () => {
        render(<MarketOrder />);
        expect(screen.getByText('Market')).toBeInTheDocument();
    });
});
