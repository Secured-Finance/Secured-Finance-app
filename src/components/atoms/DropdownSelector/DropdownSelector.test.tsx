import { composeStories } from '@storybook/testing-react';
import { fireEvent, render, screen } from 'src/test-utils.js';
import * as stories from './DropdownSelector.stories';

const { AssetDropdown, TermDropdown } = composeStories(stories);

describe('Dropdown Asset Selection Component', () => {
    it('should render', () => {
        render(<AssetDropdown />);
    });

    it('should render a clickable button', () => {
        render(<AssetDropdown />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render a dropdown', () => {
        render(<AssetDropdown />);
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should have an arrow up when the dropdown is not visible, and an arrow down when the dropdown is visible', () => {
        render(<AssetDropdown />);
        expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should change the button when a dropdown item is selected', () => {
        render(<AssetDropdown />);
        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Ethereum'));
        expect(screen.getByRole('button')).toHaveTextContent('Ethereum');
    });

    it('should render a term selector', () => {
        render(<TermDropdown />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should call onChange function when a dropdown item is selected', () => {
        const onChange = jest.fn();
        render(<AssetDropdown onChange={onChange} />);
        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Ethereum'));
        expect(onChange).toHaveBeenCalled();
    });
});
