import { composeStories } from '@storybook/testing-react';
import { render, screen } from 'src/test-utils.js';
import * as stories from './HamburgerMenu.stories';

const { Default } = composeStories(stories);

describe('HamburgerMenu Component', () => {
    it('should render the hamburger menu button a nothing else', () => {
        render(<Default />);
        expect(
            screen.getByRole('button', { expanded: false })
        ).toBeInTheDocument();
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('should expand the menu when the button is clicked', () => {
        render(<Default />);
        const button = screen.getByRole('button', { expanded: false });
        button.click();
        expect(
            screen.getByRole('button', { expanded: true })
        ).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should open the sub menu when the More button is clicked', () => {
        render(<Default />);
        screen.getByRole('button', { expanded: false }).click();
        expect(screen.queryByText('Documentation')).not.toBeInTheDocument();
        screen.getByRole('button', { name: 'Show More' }).click();
        expect(screen.getByText('Documentation')).toBeInTheDocument();
    });
});
