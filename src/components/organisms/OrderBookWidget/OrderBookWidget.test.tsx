import { composeStories } from '@storybook/react';
import { fireEvent, render, screen, within } from 'src/test-utils.js';
import { OrderType } from 'src/types';
import * as stories from './OrderBookWidget.stories';

const { Default, Loading, Bitcoin, Itayose } = composeStories(stories);

describe.skip('OrderBookWidget Component', () => {
    it('should render two tables', () => {
        render(<Default />);
        expect(screen.getByTestId('buyOrders')).toBeInTheDocument();
        expect(screen.getByTestId('sellOrders')).toBeInTheDocument();
    });

    it('should render colorbar of correct length', () => {
        render(<Default />);
        const bars = screen.getAllByTestId('color-bar');
        expect(bars[0]).toHaveStyle('width: 2px');
        expect(bars[1]).toHaveStyle('width: 55.44%');
        expect(bars[2]).toHaveStyle('width: 308%');
        expect(bars[3]).toHaveStyle('width: 18.48%');
        expect(bars[4]).toHaveStyle('width: 15.4%');
        expect(bars[5]).toHaveStyle('width: 5%');
        expect(bars[6]).toHaveStyle('width: 55.44%');
        expect(bars[7]).toHaveStyle('width: 70.84%');
        expect(bars[8]).toHaveStyle('width: 5%');
        expect(bars[9]).toHaveStyle('width: 18.48%');
        expect(bars[10]).toHaveStyle('width: 27.72%');
        expect(bars[11]).toHaveStyle('width: 67.76%');
    });

    describe('Mid Price', () => {
        it('should display the market price', () => {
            render(<Default />);
            expect(
                screen.getByTestId('current-market-price')
            ).toHaveTextContent('93.00');
        });

        it('should display the market price in the correct color', () => {
            render(<Default />);
            expect(screen.getByTestId('current-market-price')).toHaveClass(
                'text-nebulaTeal'
            );
        });

        it('should show a placeholder when the market price is not available', () => {
            render(<Default marketPrice={undefined} />);
            expect(
                screen.getByTestId('current-market-price')
            ).toHaveTextContent('--.--');
            expect(screen.getByTestId('current-market-price')).toHaveClass(
                'text-slateGray'
            );
        });
    });

    it('should update store when Sell order row is clicked', () => {
        const { store } = render(<Default />);
        const row = screen.getAllByTestId('sellOrders-row')[0];
        fireEvent.click(row);
        expect(store.getState().landingOrderForm.orderType).toEqual(
            OrderType.LIMIT
        );
        expect(store.getState().landingOrderForm.unitPrice).toEqual('92');
    });

    it('should update store when Lend order row is clicked', async () => {
        const { store } = render(<Default />);
        const row = screen.getAllByTestId('buyOrders-row')[5];
        fireEvent.click(row);

        expect(store.getState().landingOrderForm.orderType).toEqual(
            OrderType.LIMIT
        );
        expect(store.getState().landingOrderForm.unitPrice).toEqual('94');
    });

    it('should display the spinner when loading', () => {
        render(<Loading />);
        expect(
            screen.getByRole('alertdialog', { name: 'Loading' })
        ).toBeInTheDocument();
    });

    // it('should display delisting disclaimer if currency is being delisted', () => {
    //     render(<Delisted />);
    //     expect(screen.getByText('WFIL will be delisted')).toBeInTheDocument();
    // });

    // it('should display delisting disclaimer only if currency selected currency is being delisted', () => {
    //     render(<Delisted currency={CurrencySymbol.USDC} />);
    //     expect(
    //         screen.queryByText('WFIL will be delisted')
    //     ).not.toBeInTheDocument();
    // });

    it('should not display delisting disclaimer if no currency is being delisted', () => {
        render(<Default />);
        expect(
            screen.queryByText('WFIL will be delisted')
        ).not.toBeInTheDocument();
    });

    describe('Visibility toggles', () => {
        const getButton = (name: string) =>
            screen.getByRole('button', { name });

        const expectToHaveRows = (name: string) =>
            within(screen.getByTestId(name)).getAllByRole('row').length > 0;
        const expectNotToHaveRows = (name: string) =>
            within(screen.getByTestId(name)).queryAllByRole('row').length === 0;

        it('should render three toggle buttons', () => {
            render(<Default />);
            expect(getButton('Show All Orders')).toBeInTheDocument();
            expect(getButton('Show Only Lend Orders')).toBeInTheDocument();
            expect(getButton('Show Only Borrow Orders')).toBeInTheDocument();
        });

        it('should render the Show All Orders button as active by default', () => {
            render(<Default />);
            expect(getButton('Show All Orders')).toHaveClass('bg-neutral-900');
            expect(getButton('Show Only Lend Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expect(getButton('Show Only Borrow Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
        });

        it('should toggle showBorrow state when Borrow button is clicked', () => {
            render(<Default />);
            expectToHaveRows('buyOrders');
            expectToHaveRows('sellOrders');

            fireEvent.click(getButton('Show Only Borrow Orders'));
            expect(getButton('Show All Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expect(getButton('Show Only Lend Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expect(getButton('Show Only Borrow Orders')).toHaveClass(
                'bg-neutral-900'
            );
            expectToHaveRows('buyOrders');
            expectNotToHaveRows('sellOrders');

            fireEvent.click(getButton('Show Only Borrow Orders'));
            expect(getButton('Show All Orders')).toHaveClass('bg-neutral-900');
            expect(getButton('Show Only Lend Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expect(getButton('Show Only Borrow Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expectToHaveRows('buyOrders');
            expectToHaveRows('sellOrders');
        });

        it('should toggle showLend state when Lend button is clicked', () => {
            render(<Default />);
            expectToHaveRows('buyOrders');
            expectToHaveRows('sellOrders');

            fireEvent.click(getButton('Show Only Lend Orders'));
            expect(getButton('Show All Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expect(getButton('Show Only Lend Orders')).toHaveClass(
                'bg-neutral-900'
            );
            expect(getButton('Show Only Borrow Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expectNotToHaveRows('buyOrders');
            expectToHaveRows('sellOrders');

            fireEvent.click(getButton('Show Only Lend Orders'));
            expect(getButton('Show All Orders')).toHaveClass('bg-neutral-900');
            expect(getButton('Show Only Lend Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expect(getButton('Show Only Borrow Orders')).not.toHaveClass(
                'bg-neutral-900'
            );
            expectToHaveRows('buyOrders');
            expectToHaveRows('sellOrders');
        });

        it('should hide the current market price when Show Only Lend Orders is clicked and show it again when re clicked', () => {
            render(<Default />);
            expect(
                screen.getByTestId('current-market-price')
            ).toBeInTheDocument();
            fireEvent.click(getButton('Show Only Lend Orders'));
            expect(
                screen.queryByTestId('current-market-price')
            ).not.toBeInTheDocument();
            fireEvent.click(getButton('Show Only Lend Orders'));
            expect(
                screen.getByTestId('current-market-price')
            ).toBeInTheDocument();
        });

        it('should be able to toggle between Show Only Lend Orders and Show Only Borrow Orders', () => {
            render(<Default />);
            expect(screen.getByTestId('buyOrders')).toBeInTheDocument();
            expect(screen.getByTestId('sellOrders')).toBeInTheDocument();
            expect(
                screen.getByTestId('current-market-price')
            ).toBeInTheDocument();

            fireEvent.click(getButton('Show Only Lend Orders'));
            expectNotToHaveRows('buyOrders');
            expectToHaveRows('sellOrders');
            expect(
                screen.queryByTestId('current-market-price')
            ).not.toBeInTheDocument();

            fireEvent.click(getButton('Show Only Borrow Orders'));
            expectToHaveRows('buyOrders');
            expectNotToHaveRows('sellOrders');
            expect(
                screen.queryByTestId('current-market-price')
            ).not.toBeInTheDocument();
        });

        it('should call onFilterChange when a button is clicked', () => {
            const onFilterChange = jest.fn();
            render(<Default onFilterChange={onFilterChange} />);
            expect(onFilterChange).not.toHaveBeenLastCalledWith({
                showBorrow: false,
                showLend: false,
            });
            fireEvent.click(getButton('Show Only Lend Orders'));
            expect(onFilterChange).toHaveBeenLastCalledWith({
                showBorrow: false,
                showLend: true,
                showTicker: false,
            });
            expect(onFilterChange).toHaveBeenCalledTimes(2);
        });

        it('should show a different number of rows when a button is clicked', () => {
            render(<Bitcoin />);
            expect(screen.getAllByTestId('buyOrders-row')).toHaveLength(12);
            expect(screen.getAllByTestId('sellOrders-row')).toHaveLength(12);
            fireEvent.click(getButton('Show Only Lend Orders'));
            expect(screen.queryAllByTestId('buyOrders-row')).toHaveLength(0);
            expect(screen.getAllByTestId('sellOrders-row')).toHaveLength(26);
            fireEvent.click(getButton('Show Only Borrow Orders'));
            expect(screen.getAllByTestId('buyOrders-row')).toHaveLength(26);
            expect(screen.queryAllByTestId('sellOrders-row')).toHaveLength(0);
        });
    });

    describe('Orderbook data', () => {
        it('should display the correct number of rows', () => {
            render(<Default />);
            expect(screen.getAllByTestId('buyOrders-row')).toHaveLength(6);
            expect(screen.getAllByTestId('sellOrders-row')).toHaveLength(6);
        });

        it('should sort the rows by price', () => {
            render(<Default />);
            const buyRows = screen.getAllByTestId('buyOrders-row');
            const sellRows = screen.getAllByTestId('sellOrders-row');
            const buyPrices = buyRows.map(row => row.children[0].textContent);
            const sellPrices = sellRows.map(row => row.children[0].textContent);
            expect(buyPrices).toEqual([
                '\xa0', // this is a non-breaking space
                '98.50',
                '97.00',
                '95.00',
                '94.75',
                '94.00',
            ]);
            expect(sellPrices).toEqual([
                '92.00',
                '91.10',
                '90.50',
                '90.10',
                '89.80',
                '89.60',
            ]);
        });
    });

    describe('Orderbook data with aggregation', () => {
        it('should show a dropdown with the correct options', () => {
            render(<Default />);
            const dropdown = screen.getByRole('button', { name: '0.01' });
            fireEvent.click(dropdown);
            const options = screen.getAllByRole('menuitem');
            expect(options).toHaveLength(5);
            expect(options[0]).toHaveTextContent('0.01');
            expect(options[1]).toHaveTextContent('0.1');
            expect(options[2]).toHaveTextContent('1');
            expect(options[3]).toHaveTextContent('5');
            expect(options[4]).toHaveTextContent('10');
        });

        it('should update the aggregation when an option is clicked', () => {
            render(<Default />);
            const dropdown = screen.getByRole('button', { name: '0.01' });
            fireEvent.click(dropdown);
            const options = screen.getAllByRole('menuitem');
            fireEvent.click(options[4]);
            expect(screen.getAllByTestId('buyOrders-row')).toHaveLength(2);
            expect(screen.getAllByTestId('sellOrders-row')).toHaveLength(2);
        });

        it('should conserve the sum of the amounts when aggregating', () => {
            render(<Default />);
            function sumSecondColumn(table: HTMLElement): number {
                return within(table)
                    .getAllByRole('row')
                    .reduce((sum, row) => {
                        const amount =
                            row.children[1].children[0].children[0]
                                .textContent ?? '';

                        return isNaN(parseInt(amount))
                            ? sum
                            : sum + parseInt(amount.replace(',', ''), 10);
                    }, 0);
            }
            const sumBefore = sumSecondColumn(screen.getByTestId('buyOrders'));
            const dropdown = screen.getByRole('button', { name: '0.01' });
            fireEvent.click(dropdown);
            const options = screen.getAllByRole('menuitem');
            fireEvent.click(options[3]);
            const sumAfter = sumSecondColumn(screen.getByTestId('buyOrders'));
            expect(sumBefore).toEqual(sumAfter);
            fireEvent.click(options[4]);
            const sumAfterAgain = sumSecondColumn(
                screen.getByTestId('buyOrders')
            );
            expect(sumBefore).toEqual(sumAfterAgain);
        });

        it('should change the precision of the prices when changing the aggregation factor', () => {
            const getOrderRowTextContent = (id: string) => {
                return screen
                    .getAllByTestId(id)
                    .map(row => row.children[0].textContent);
            };

            render(<Default />);
            const dropdown = screen.getByRole('button', { name: '0.01' });
            fireEvent.click(dropdown);

            const options = screen.getAllByRole('menuitem');
            fireEvent.click(options[1]);
            expect(getOrderRowTextContent('buyOrders-row')).toEqual([
                '\xa0', // this is a non-breaking space
                '98.5',
                '97.0',
                '95.0',
                '94.7',
                '94.0',
            ]);
            expect(getOrderRowTextContent('sellOrders-row')).toEqual([
                '92.0',
                '91.1',
                '90.5',
                '90.1',
                '89.8',
                '89.6',
            ]);
        });
    });

    describe('Variants', () => {
        it('should display a help tooltip', () => {
            render(<Itayose />);
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        });
    });
});
