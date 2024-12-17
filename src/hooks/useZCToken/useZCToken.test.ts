import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { renderHook, waitFor } from 'src/test-utils';
import { CurrencySymbol, Maturity } from 'src/utils';
import { useZCToken } from './useZCToken';

const mock = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mock);

describe('useZCToken', () => {
    it('should return the ZC Token address', async () => {
        const TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890';
        mock.getZCToken.mockResolvedValueOnce(TOKEN_ADDRESS);

        const { result } = renderHook(() =>
            useZCToken(CurrencySymbol.ETH, new Maturity(0))
        );
        await waitFor(() => expect(result.current.data).toEqual(TOKEN_ADDRESS));
    });
});
