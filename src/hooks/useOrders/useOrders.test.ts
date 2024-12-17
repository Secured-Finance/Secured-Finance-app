import { OrderSide } from '@secured-finance/sf-client';
import { WalletSource } from '@secured-finance/sf-client/dist/secured-finance-client';
import { dec22Fixture } from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { renderHook } from 'src/test-utils';
import { CurrencySymbol, Maturity, currencyMap, toCurrency } from 'src/utils';
import { useOrders } from '.';

const mockSecuredFinance = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mockSecuredFinance);

describe('useOrders hook', () => {
    it('should return four functions', () => {
        const { result } = renderHook(() => useOrders());
        expect(result.current.cancelOrder).toBeInstanceOf(Function);
        expect(result.current.placeOrder).toBeInstanceOf(Function);
        expect(result.current.unwindPosition).toBeInstanceOf(Function);
        expect(result.current.placePreOrder).toBeInstanceOf(Function);
    });

    describe('cancel order', () => {
        it('should call the cancelOrder function', () => {
            const { result } = renderHook(() => useOrders());
            result.current.cancelOrder(123, CurrencySymbol.ETH, dec22Fixture);
            expect(mockSecuredFinance.cancelLendingOrder).toBeCalled();
        });
    });

    describe('place order', () => {
        it('should call the SDK in wei when used with ETH', async () => {
            const { result } = renderHook(() => useOrders());
            const placeOrder = result.current.placeOrder;
            await placeOrder(
                CurrencySymbol.ETH,
                new Maturity(2022),
                OrderSide.LEND,
                currencyMap.ETH.toBaseUnit(1),
                9863,
                WalletSource.METAMASK
            );
            expect(mockSecuredFinance.placeOrder).toHaveBeenCalledTimes(1);
            expect(mockSecuredFinance.placeOrder).toHaveBeenCalledWith(
                toCurrency(CurrencySymbol.ETH),
                2022,
                0,
                BigInt('1000000000000000000'),
                WalletSource.METAMASK,
                9863
            );
        });

        it('should call the sdk with a price of 0 when not provided', async () => {
            const { result } = renderHook(() => useOrders());
            const placeOrder = result.current.placeOrder;
            await placeOrder(
                CurrencySymbol.ETH,
                new Maturity(2022),
                OrderSide.LEND,
                currencyMap.ETH.toBaseUnit(1),
                0,
                WalletSource.METAMASK
            );

            expect(mockSecuredFinance.placeOrder).toHaveBeenCalledWith(
                toCurrency(CurrencySymbol.ETH),
                2022,
                0,
                BigInt('1000000000000000000'),
                WalletSource.METAMASK,
                0
            );
        });
    });

    describe('unwind order', () => {
        it('should call the unwindPosition function', () => {
            const { result } = renderHook(() => useOrders());
            result.current.unwindPosition(CurrencySymbol.WFIL, dec22Fixture);
            expect(mockSecuredFinance.unwindPosition).toBeCalled();
        });
    });

    describe('place pre-order', () => {
        it('should call the SDK in wei when used with ETH', async () => {
            const { result } = renderHook(() => useOrders());
            const placePreOrder = result.current.placePreOrder;
            await placePreOrder(
                CurrencySymbol.ETH,
                new Maturity(2022),
                OrderSide.LEND,
                currencyMap.ETH.toBaseUnit(1),
                9863,
                WalletSource.METAMASK
            );
            expect(mockSecuredFinance.placePreOrder).toHaveBeenCalledTimes(1);
            expect(mockSecuredFinance.placePreOrder).toHaveBeenCalledWith(
                toCurrency(CurrencySymbol.ETH),
                2022,
                0,
                BigInt('1000000000000000000'),
                WalletSource.METAMASK,
                9863
            );
        });
    });
});
