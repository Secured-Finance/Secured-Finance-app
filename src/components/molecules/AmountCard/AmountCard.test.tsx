import { composeStories } from '@storybook/react';
import { render, screen } from 'src/test-utils.js';
import { Amount, CurrencySymbol } from 'src/utils';
import * as stories from './AmountCard.stories';

const { Default } = composeStories(stories);

describe('AmountCard Component', () => {
    it('should render a AmountCard', () => {
        render(<Default />);
    });

    it('should render a AmountCard with the name of the currency', () => {
        render(<Default />);
        expect(screen.getByText('Wrapped Filecoin')).toBeInTheDocument();
    });

    it('should render a AmountCard with the amount of the currency', () => {
        render(<Default />);
        expect(screen.getByText('5,000')).toBeInTheDocument();
    });

    it('should render a AmountCard with the symbol of the currency', () => {
        render(<Default />);
        expect(screen.getByText('WFIL')).toBeInTheDocument();
    });

    it('should render a AmountCard with the amount in USD', () => {
        render(<Default />);
        expect(screen.getByText('~ $41,500')).toBeInTheDocument();
    });

    it('should format text size of amount depending on length of string', () => {
        render(
            <Default
                amount={
                    new Amount(
                        '500000000000000000000000000',
                        CurrencySymbol.WFIL
                    )
                }
            />
        );
        expect(screen.getByText('500,000,000')).toHaveClass(
            'flex justify-end font-semibold text-white typography-body-2'
        );
    });

    describe('Rounding', () => {
        it('should display the amount with no decimals when the number does not have any', () => {
            render(<Default />);
            expect(screen.getByText('5,000')).toBeInTheDocument();
        });

        it('should display the amount with a maximum of 8 decimals', () => {
            render(
                <Default
                    amount={
                        new Amount('1001000000000000000', CurrencySymbol.ETH)
                    }
                />
            );
            expect(screen.getByText('1.001')).toBeInTheDocument();
        });
    });
});
