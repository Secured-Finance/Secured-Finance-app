import { composeStories } from '@storybook/testing-react';
import { render, screen, waitFor } from 'src/test-utils.js';
import * as stories from './PortfolioTab.stories';

const { Default } = composeStories(stories);

describe('test Portfolio Tab component', () => {
    it('should render Portfolio Tab', async () => {
        render(<Default />);
        expect(screen.getByText('Net APR')).toBeInTheDocument();
        await waitFor(
            () => expect(screen.getByText('$8.02')).toBeInTheDocument(),
            {
                timeout: 3000,
            }
        );
    });
});
