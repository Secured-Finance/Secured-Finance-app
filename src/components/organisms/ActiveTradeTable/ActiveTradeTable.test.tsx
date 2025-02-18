import { composeStories } from '@storybook/react';
import { userEvent } from '@storybook/testing-library';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { fireEvent, render, screen, waitFor, within } from 'src/test-utils.js';
import timemachine from 'timemachine';
import * as stories from './ActiveTradeTable.stories';

const { Default, Delisted } = composeStories(stories);

beforeAll(() => {
    timemachine.reset();
    timemachine.config({
        dateString: '2022-02-01T11:00:00.00Z',
    });
});

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('ActiveTradeTable Component', () => {
    it('should render a ActiveTradeTable as a table', () => {
        render(<Default />);
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should sort the table by position', () => {
        render(<Default />);
        const initialRows = screen.getAllByRole('row');
        expect(initialRows[1]).toHaveTextContent('Lend');
        expect(initialRows[2]).toHaveTextContent('Borrow');
        expect(initialRows[3]).toHaveTextContent('Borrow');
        expect(initialRows[4]).toHaveTextContent('Lend');
        expect(initialRows[5]).toHaveTextContent('Lend');
        expect(initialRows[6]).toHaveTextContent('Lend');
        expect(initialRows[7]).toHaveTextContent('Borrow');
        expect(initialRows[8]).toHaveTextContent('Borrow');
        expect(initialRows[9]).toHaveTextContent('Lend');
        expect(initialRows[10]).toHaveTextContent('Lend');
        fireEvent.click(screen.getByText('Type'));
        const sortedRowsAsc = screen.getAllByRole('row');
        expect(sortedRowsAsc[1]).toHaveTextContent('Lend');
        expect(sortedRowsAsc[2]).toHaveTextContent('Lend');
        expect(sortedRowsAsc[3]).toHaveTextContent('Lend');
        expect(sortedRowsAsc[4]).toHaveTextContent('Lend');
        expect(sortedRowsAsc[5]).toHaveTextContent('Lend');
        expect(sortedRowsAsc[6]).toHaveTextContent('Lend');
        expect(sortedRowsAsc[7]).toHaveTextContent('Borrow');
        expect(sortedRowsAsc[8]).toHaveTextContent('Borrow');
        expect(sortedRowsAsc[9]).toHaveTextContent('Borrow');
        expect(sortedRowsAsc[9]).toHaveTextContent('Borrow');
        fireEvent.click(screen.getByText('Type'));
        const sortedRowsDesc = screen.getAllByRole('row');
        expect(sortedRowsDesc[1]).toHaveTextContent('Borrow');
        expect(sortedRowsDesc[2]).toHaveTextContent('Borrow');
        expect(sortedRowsDesc[3]).toHaveTextContent('Borrow');
        expect(sortedRowsDesc[4]).toHaveTextContent('Borrow');
        expect(sortedRowsDesc[5]).toHaveTextContent('Lend');
        expect(sortedRowsDesc[6]).toHaveTextContent('Lend');
        expect(sortedRowsDesc[7]).toHaveTextContent('Lend');
        expect(sortedRowsDesc[8]).toHaveTextContent('Lend');
        expect(sortedRowsDesc[9]).toHaveTextContent('Lend');
        expect(sortedRowsDesc[10]).toHaveTextContent('Lend');
    });

    it.skip('should display correct color code for future value', () => {
        render(<Default />);
        const rows = screen.getAllByTestId('currency-amount-item');
        let firstSpan = rows[0].querySelector('span');
        expect(firstSpan?.classList).toContain('text-nebulaTeal');
        firstSpan = rows[2].querySelector('span');
        expect(firstSpan?.classList).toContain('text-galacticOrange');
        firstSpan = rows[4].querySelector('span');
        expect(firstSpan?.classList).toContain('text-galacticOrange');
        firstSpan = rows[6].querySelector('span');
        expect(firstSpan?.classList).toContain('text-nebulaTeal');
        firstSpan = rows[8].querySelector('span');
        expect(firstSpan?.classList).toContain('text-nebulaTeal');
        firstSpan = rows[10].querySelector('span');
        expect(firstSpan?.classList).toContain('text-nebulaTeal');
    });

    it('should display buttons with the user options', () => {
        render(<Default />);
        expect(screen.getAllByText('Add/Reduce')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Close')[0]).toBeInTheDocument();
    });

    it('should display the unwind dialog when clicking on the Close Position button', () => {
        render(<Default />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display hours and minutes when maturity is less than 24 hours', async () => {
        render(<Default />);
        const closeToMaturityRow = screen.getAllByRole('row')[5];

        expect(closeToMaturityRow).toHaveTextContent('Feb 2, 2022');
        await waitFor(() => {
            expect(closeToMaturityRow).toHaveTextContent('22h');
        });
    });

    it('should display 1 day when maturity is less than 48 hours and greater than 24 hours', async () => {
        render(<Default />);
        const closeToMaturityRow = screen.getAllByRole('row')[6];
        expect(closeToMaturityRow).toHaveTextContent('Feb 2, 2022');
        await waitFor(() => {
            expect(closeToMaturityRow).toHaveTextContent('1 day');
        });
    });

    it.skip('should show table hints', async () => {
        render(<Default />);
        const maturity = screen.getByText('Time to Maturity');
        expect(
            screen.queryByText(
                'Maturity of a loan contract is the date on which the contract is set to expire.'
            )
        ).not.toBeInTheDocument();
        await waitFor(async () => {
            await userEvent.hover(maturity);
        });
        waitFor(() => {
            expect(
                screen.queryByText(
                    'Maturity of a loan contract is the date on which the contract is set to expire.'
                )
            ).toBeInTheDocument();
        });
    });

    describe('delisted contracts', () => {
        it('should display maturity in galacticOrange', () => {
            render(<Delisted />);
            const delistedContractRow = screen.getAllByRole('row')[2];
            expect(delistedContractRow).toHaveTextContent('392 days');
            const maturity = screen.getByText('392 days');
            expect(maturity.parentNode).toHaveClass('text-galacticOrange');
        });

        it('should display 100 Market Price for matured delisted contracts', () => {
            render(<Delisted />);
            const delistedContractRow = screen.getAllByRole('row')[10];
            expect(delistedContractRow).toHaveTextContent('Redeemable');
            expect(delistedContractRow).toHaveTextContent('100.00');
        });

        it.skip('should not display PV for matured delisted contracts', async () => {
            render(<Delisted />);
            const delistedContractRow = screen.getAllByRole('row')[10];
            const activeContractRow = screen.getAllByRole('row')[5];

            expect(delistedContractRow).toHaveTextContent('Redeemable');
            expect(activeContractRow).toHaveTextContent('22h');

            const delistRowOnlyFv = await within(
                delistedContractRow
            ).findAllByTestId('currency-amount-item');
            const activeRowFvAndPv = await within(
                activeContractRow
            ).findAllByTestId('currency-amount-item');
            expect(delistRowOnlyFv).toHaveLength(1);
            expect(activeRowFvAndPv).toHaveLength(2);
        });

        it('should display close position till maturity', () => {
            render(<Delisted />);
            const closeToMaturityRow = screen.getAllByRole('row')[5];
            expect(closeToMaturityRow).toHaveTextContent('Feb 2, 2022');
            expect(closeToMaturityRow).toHaveTextContent('22h');

            const closeButton = within(closeToMaturityRow).getByRole('button', {
                name: 'Close',
            });
            expect(closeButton).toBeInTheDocument();
            fireEvent.click(closeButton);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should display a disabled redeem position button for lend orders post maturity but before redemption period', () => {
            render(<Delisted />);
            const closeToMaturityRow = screen.getAllByRole('row')[9];
            expect(closeToMaturityRow).toHaveTextContent('1d to redeem');
            const redeemButton = within(closeToMaturityRow).getByRole(
                'button',
                { name: 'Redeem' }
            );
            expect(redeemButton).toBeDisabled();
        });

        it('should display an enabled redeem position button for lend orders post redemption period', () => {
            render(<Delisted />);
            const closeToMaturityRow = screen.getAllByRole('row')[10];
            expect(closeToMaturityRow).toHaveTextContent('Redeemable');
            const redeemButton = within(closeToMaturityRow).getByRole(
                'button',
                { name: 'Redeem' }
            );
            expect(redeemButton).not.toBeDisabled();
            fireEvent.click(redeemButton);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should display repay position if within 7 days post maturity for borrow orders', () => {
            render(<Delisted />);
            const postMaturity = screen.getAllByRole('row')[7];
            expect(postMaturity).toHaveTextContent('2d left to repay');
            const repayButton = within(postMaturity).getByRole('button', {
                name: 'Repay',
            });
            fireEvent.click(repayButton);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should display repay position post repayment period for borrow orders', () => {
            render(<Delisted />);
            const postMaturity = screen.getAllByRole('row')[8];
            expect(postMaturity).toHaveTextContent('Repay');
            const repayButton = within(postMaturity).getByRole('button', {
                name: 'Repay',
            });
            fireEvent.click(repayButton);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });
});
