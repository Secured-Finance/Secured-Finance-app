import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { renderHook, waitFor } from 'src/test-utils';
import { CurrencySymbol, Maturity } from 'src/utils';
import { useWithdrawableZCTokenAmounts } from './useWithdrawableZCTokenAmounts';

const mock = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mock);

describe('useWithdrawableZCTokenAmounts', () => {
    it('should return the withdrawable amount of ZC Tokens', async () => {
        const ACCOUNT_ADDRESS = '0x1234567890123456789012345678901234567890';
        mock.getWithdrawableZCTokenAmount.mockResolvedValueOnce(
            BigInt('1000000000000000000')
        );
        const zcBonds = [
            {
                currency: CurrencySymbol.ETH,
                maturity: new Maturity(0),
            },
        ];

        const { result } = renderHook(() =>
            useWithdrawableZCTokenAmounts(zcBonds, ACCOUNT_ADDRESS)
        );
        await waitFor(() => {
            expect(result.current.data.length).toEqual(1);
            expect(result.current.data[0].currency).toEqual(CurrencySymbol.ETH);
            expect(result.current.data[0].maturity).toEqual(new Maturity(0));
            expect(
                result.current.data[0].withdrawableZCTokenAmount.toString()
            ).toEqual('1000000000000000000');
        });
    });
});
