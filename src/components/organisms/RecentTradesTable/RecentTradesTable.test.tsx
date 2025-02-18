import { composeStories } from '@storybook/react';
import { fireEvent, render, screen } from 'src/test-utils.js';
import * as stories from './RecentTradesTable.stories';

const { Default, Empty } = composeStories(stories);

const getButton = (name: string) => screen.getByRole('button', { name });

describe('RecentTradesTable component', () => {
    it('should display the Recent Trades Table', () => {
        render(<Default />, {
            apolloMocks: Default.parameters?.apolloClient.mocks,
        });

        expect(
            screen.getByLabelText('Recent trades table')
        ).toBeInTheDocument();
    });

    it('should display the spinner when loading', () => {
        render(<Default />, {
            apolloMocks: Default.parameters?.apolloClient.mocks,
        });
        expect(
            screen.getByRole('alertdialog', { name: 'Loading' })
        ).toBeInTheDocument();
    });

    it('should not display the 100 trades notice if there are no entries', () => {
        render(<Empty />, {
            apolloMocks: Default.parameters?.apolloClient.mocks,
        });
        expect(
            screen.queryByText('Only the last 100 trades are shown.')
        ).not.toBeInTheDocument();
    });

    it('should display the correct table header columns', () => {
        render(<Default />, {
            apolloMocks: Default.parameters?.apolloClient.mocks,
        });

        expect(screen.getByText('Price')).toBeInTheDocument();
        expect(screen.getByText('Size (USDC)')).toBeInTheDocument();
        expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('should render three toggle buttons', () => {
        render(<Default />, {
            apolloMocks: Default.parameters?.apolloClient.mocks,
        });
        expect(getButton('Show All Orders')).toBeInTheDocument();
        expect(getButton('Show Only Lend Orders')).toBeInTheDocument();
        expect(getButton('Show Only Borrow Orders')).toBeInTheDocument();
    });

    it('should render the Show All Orders button as active by default', () => {
        render(<Default />, {
            apolloMocks: Default.parameters?.apolloClient.mocks,
        });
        expect(getButton('Show All Orders')).toHaveClass('bg-neutral-700');
        expect(getButton('Show Only Lend Orders')).not.toHaveClass(
            'bg-neutral-700'
        );
        expect(getButton('Show Only Borrow Orders')).not.toHaveClass(
            'bg-neutral-700'
        );
    });

    it('should toggle side buttons when they are clicked on', () => {
        render(<Default />, {
            apolloMocks: Default.parameters?.apolloClient.mocks,
        });

        fireEvent.click(getButton('Show Only Borrow Orders'));
        expect(getButton('Show All Orders')).not.toHaveClass('bg-neutral-700');
        expect(getButton('Show Only Lend Orders')).not.toHaveClass(
            'bg-neutral-700'
        );
        expect(getButton('Show Only Borrow Orders')).toHaveClass(
            'bg-neutral-700'
        );

        fireEvent.click(getButton('Show Only Lend Orders'));
        expect(getButton('Show All Orders')).not.toHaveClass('bg-neutral-700');
        expect(getButton('Show Only Borrow Orders')).not.toHaveClass(
            'bg-neutral-700'
        );
        expect(getButton('Show Only Lend Orders')).toHaveClass(
            'bg-neutral-700'
        );
    });
});
