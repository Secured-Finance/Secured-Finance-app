import { composeStories } from '@storybook/testing-react';
import { preloadedAssetPrices } from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { fireEvent, render, screen, waitFor } from 'src/test-utils.js';
import * as stories from './DepositCollateral.stories';

const { Default } = composeStories(stories);

const preloadedState = { ...preloadedAssetPrices };

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('DepositCollateral component', () => {
    it('should display the DepositCollateral Modal when open', () => {
        render(<Default />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Deposit Collateral')).toBeInTheDocument();

        const button = screen.getByTestId('dialog-action-button');
        expect(button).toHaveTextContent('Continue');

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should open with collateral amount 0', () => {
        render(<Default />);
        expect(screen.getByRole('textbox').getAttribute('value')).toBe('');
        expect(screen.getByRole('textbox').getAttribute('placeholder')).toBe(
            '0'
        );
    });

    it('should select asset and update amount', () => {
        render(<Default />, { preloadedState });
        fireEvent.click(screen.getByTestId('collateral-selector-button'));
        fireEvent.click(screen.getByTestId('option-0'));
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('50 USDC Available')).toBeInTheDocument();

        const tab = screen.getByTestId(75);
        fireEvent.click(tab);
        expect(screen.getByText('$37.50')).toBeInTheDocument();
    });

    it('should reach success screen when transaction receipt is received', async () => {
        const onClose = jest.fn();
        render(<Default onClose={onClose} />, { preloadedState });
        fireEvent.click(screen.getByTestId('collateral-selector-button'));
        fireEvent.click(screen.getByTestId('option-0'));
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('50 USDC Available')).toBeInTheDocument();

        const tab = screen.getByTestId(75);
        fireEvent.click(tab);
        expect(screen.getByText('$37.50')).toBeInTheDocument();

        const button = screen.getByTestId('dialog-action-button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Success!')).toBeInTheDocument();
            expect(
                screen.getByText(
                    'You have successfully deposited collateral on Secured Finance.'
                )
            ).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Complete')).toBeInTheDocument();
            expect(screen.getByText('Deposit Address')).toBeInTheDocument();
            expect(screen.getByText('0xb98b...fd6d')).toBeInTheDocument();
            expect(screen.getByText('Amount')).toBeInTheDocument();
            expect(screen.getByText('37.5')).toBeInTheDocument();

            expect(
                screen.getByTestId('dialog-action-button')
            ).toHaveTextContent('OK');
        });

        await waitFor(() => expect(onClose).not.toHaveBeenCalled());
    });

    it('should open with USDC as default currency', () => {
        render(<Default />, { preloadedState });
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('50 USDC Available')).toBeInTheDocument();
        expect(screen.queryByText('ETH')).not.toBeInTheDocument();
        expect(screen.queryByText('ETH Available')).not.toBeInTheDocument();
        expect(screen.queryByText('FIL')).not.toBeInTheDocument();
        expect(screen.queryByText('FIL Available')).not.toBeInTheDocument();
        expect(screen.queryByText('BTC')).not.toBeInTheDocument();
        expect(screen.queryByText('BTC Available')).not.toBeInTheDocument();
    });

    it('should reach failure screen when transaction fails', async () => {
        mockSecuredFinance.depositCollateral.mockRejectedValueOnce(
            new Error('error')
        );
        const onClose = jest.fn();
        render(<Default onClose={onClose} />, { preloadedState });
        fireEvent.click(screen.getByTestId('collateral-selector-button'));
        fireEvent.click(screen.getByTestId('option-0'));
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('50 USDC Available')).toBeInTheDocument();

        const tab = screen.getByTestId(75);
        fireEvent.click(tab);
        expect(screen.getByText('$37.50')).toBeInTheDocument();

        const button = screen.getByTestId('dialog-action-button');
        fireEvent.click(button);
        await waitFor(() => {
            expect(screen.getByText('Failed!')).toBeInTheDocument();
            expect(screen.getByText('error')).toBeInTheDocument();
        });
    });

    it('should disable the button when collateral amount is greater than available amount and continue button is clicked', () => {
        const onClose = jest.fn();
        render(<Default onClose={onClose} />);
        const input = screen.getByRole('textbox');
        fireEvent.click(screen.getByTestId('collateral-selector-button'));
        fireEvent.click(screen.getByTestId('option-0'));
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('50 USDC Available')).toBeInTheDocument();
        fireEvent.change(input, { target: { value: '100' } });
        const button = screen.getByTestId('dialog-action-button');
        expect(button).toBeDisabled();
    });

    it('should disable the button when collateral is zero', () => {
        const onClose = jest.fn();
        render(<Default onClose={onClose} />);

        const button = screen.getByTestId('dialog-action-button');
        expect(button).toBeDisabled();
    });
});
