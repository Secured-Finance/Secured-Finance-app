import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { renderHook } from 'src/test-utils';
import { ZERO_BI, createCurrencyMap } from 'src/utils';
import { useFullBalances } from './useFullBalances';

const mock = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mock);

const preloadedState = { wallet: { address: '0x1', balance: 0 } };

describe('useFullBalances', () => {
    it('should return full balances of all currencies', async () => {
        const { result } = renderHook(() => useFullBalances(), {
            preloadedState: preloadedState,
        });

        const expected = createCurrencyMap<bigint>(ZERO_BI);

        expect(result.current).toEqual(expected);
        expect(Object.values(result.current).length).toEqual(11);
    });
});
