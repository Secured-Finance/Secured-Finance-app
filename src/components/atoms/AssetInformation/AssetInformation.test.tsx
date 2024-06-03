import { composeStories } from '@storybook/react';
import userEvent from '@testing-library/user-event';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { render, screen } from 'src/test-utils.js';
import * as stories from './AssetInformation.stories';

const { Default, ZeroUsdcCollateral } = composeStories(stories);

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('test AssetInformation component', () => {
    it('should render AssetInformation', async () => {
        render(<Default />);
        expect(screen.getByText('Collateral Assets')).toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();

        expect(await screen.findByText('$2,000.34')).toBeInTheDocument();
        expect(screen.getByText('1.200')).toBeInTheDocument();
        expect(screen.getByText('$2,400.41')).toBeInTheDocument();

        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('$1.00')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('$10.00')).toBeInTheDocument();
    });

    it('should display the information popover on mouse enter', async () => {
        render(<Default />);
        const information = screen.getByTestId('information-circle');
        await userEvent.unhover(information);
        await userEvent.hover(information);
        const tooltip = await screen.findByText(
            'Only USDC and ETH are eligible as collateral.'
        );
        expect(tooltip).toBeInTheDocument();
    });

    it('should not render currencies with zero collateral', async () => {
        render(<ZeroUsdcCollateral />);
        expect(screen.getByText('Collateral Assets')).toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();
        expect(await screen.findByText('$2,000.34')).toBeInTheDocument();
        expect(screen.getByText('1.200')).toBeInTheDocument();
        expect(screen.getByText('$2,400.41')).toBeInTheDocument();

        expect(screen.queryByText('USDC')).not.toBeInTheDocument();
        expect(screen.queryByText('$1')).not.toBeInTheDocument();
        expect(screen.queryByText('10 USDC')).not.toBeInTheDocument();
        expect(screen.queryByText('$10')).not.toBeInTheDocument();
    });
});
