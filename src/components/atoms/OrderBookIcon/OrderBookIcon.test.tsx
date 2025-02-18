import { composeStories } from '@storybook/react';
import { fireEvent, render, screen } from 'src/test-utils.js';
import * as stories from './OrderBookIcon.stories';

const { Default } = composeStories(stories);

describe('OrderBookIcon', () => {
    it('renders with correct aria-label', () => {
        render(<Default />);
        expect(screen.getByLabelText('Show All Orders')).toBeInTheDocument();
    });

    it('applies correct classes when active', () => {
        render(<Default />);
        fireEvent.click(screen.getByLabelText('Show All Orders'));
        expect(screen.getByLabelText('Show All Orders')).toHaveClass(
            'bg-neutral-700'
        );
    });
});
