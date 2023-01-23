import { composeStories } from '@storybook/testing-react';
import { fireEvent, render, screen } from 'src/test-utils.js';
import * as stories from './SimpleAdvancedView.stories';

const { Default } = composeStories(stories);

describe('SimpleAdvancedView Component', () => {
    it('should render a SimpleAdvancedView', () => {
        render(<Default />);
    });

    it('should change the view when the user clicks on the selector', () => {
        render(<Default />);
        expect(screen.getByText('Simple')).toBeInTheDocument();
        expect(screen.getByText('Advanced')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Simple'));
        expect(screen.getByText('Simple Component')).toBeInTheDocument();
        expect(
            screen.queryByText('Advanced Component')
        ).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('Advanced'));
        expect(screen.getByText('Advanced Component')).toBeInTheDocument();
        expect(screen.queryByText('Simple Component')).not.toBeInTheDocument();
    });

    it('should call the onModeChange function when the user change the mode', () => {
        const onModeChange = jest.fn();
        render(<Default onModeChange={onModeChange} />);
        fireEvent.click(screen.getByText('Simple'));
        expect(onModeChange).not.toHaveBeenCalled();
        fireEvent.click(screen.getByText('Advanced'));
        expect(onModeChange).toHaveBeenCalled();
        fireEvent.click(screen.getByText('Simple'));
        expect(onModeChange).toHaveBeenCalled();
    });

    it('should display the title', () => {
        render(<Default title='My Title' />);
        expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('should display the simple component by default', () => {
        render(<Default />);
        expect(screen.getByText('Simple Component')).toBeInTheDocument();
    });
});
