import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { act, renderHook } from 'src/test-utils';
import { CurrencySymbol } from 'src/utils';
import { OrderBookEntry, useOrderbook } from './useOrderbook';

const mock = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mock);
const maturity = 1675252800;

describe('useOrderbook', () => {
    it('should return an array of number for borrow rates and two callback functions to set parameters for depth calculation', async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useOrderbook(CurrencySymbol.ETH, maturity)
        );

        expect(result.current.data).toBeUndefined();

        await waitForNextUpdate();

        expect(result.current[0].data.borrowOrderbook.length).toBe(13);
        expect(result.current[0].data.lendOrderbook.length).toBe(13);

        expect(result.current[1]).toBeInstanceOf(Function);
        expect(result.current[2]).toBeInstanceOf(Function);
    });

    it('should return the transformed orderbook', async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useOrderbook(CurrencySymbol.ETH, maturity)
        );

        await waitForNextUpdate();

        expect(
            result.current[0].data.borrowOrderbook.map(
                (v: OrderBookEntry) => v.value.price
            )
        ).toEqual([9690, 9687, 9685, 9679, 9674, 0, 0, 0, 0, 0, 0, 0, 0]);

        expect(
            result.current[0].data.borrowOrderbook.map((v: OrderBookEntry) =>
                v.amount.toString()
            )
        ).toEqual([
            '43000000000000000000000',
            '23000000000000000000000',
            '15000000000000000000000',
            '12000000000000000000000',
            '1800000000000000000000',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
        ]);
    });

    it('should double the depth when not showing all orderbook', async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useOrderbook(CurrencySymbol.ETH, maturity)
        );

        await waitForNextUpdate();

        expect(result.current[0].data.borrowOrderbook.length).toBe(13);
        expect(result.current[0].data.lendOrderbook.length).toBe(13);

        act(() => result.current[2](false));

        expect(result.current[0].data.borrowOrderbook.length).toBe(26);
        expect(result.current[0].data.lendOrderbook.length).toBe(26);
    });

    it('should multiply the depth when multiplier is set', async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useOrderbook(CurrencySymbol.ETH, maturity)
        );

        await waitForNextUpdate();

        expect(result.current[0].data.borrowOrderbook.length).toBe(13);
        expect(result.current[0].data.lendOrderbook.length).toBe(13);

        act(() => result.current[1](2));

        expect(result.current[0].data.borrowOrderbook.length).toBe(26);
        expect(result.current[0].data.lendOrderbook.length).toBe(26);
    });
});
