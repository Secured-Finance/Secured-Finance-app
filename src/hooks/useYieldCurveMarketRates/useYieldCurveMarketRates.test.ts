import {
    dec24Fixture,
    maturitiesMockFromContract,
    wfilBytes32,
} from 'src/stories/mocks/fixtures';
import { mockUseSF } from 'src/stories/mocks/useSFMock';
import { renderHook, waitFor } from 'src/test-utils';
import { LoanValue, Maturity, Rate } from 'src/utils';
import { useYieldCurveMarketRates } from './useYieldCurveMarketRates';

const mock = mockUseSF();
jest.mock('src/hooks/useSecuredFinance', () => () => mock);

const preOrderMarket = {
    name: 'DEC24-1',
    maturity: BigInt(new Maturity(1743011200).toString()),
    openingDate: BigInt('1685587600'),
    marketUnitPrice: BigInt('9001'),
    openingUnitPrice: BigInt('9710'),
    isReady: false,
    isOpened: false,
    isMatured: false,
    isPreOrderPeriod: true,
    isItayosePeriod: false,
    bestBorrowUnitPrice: BigInt('9615'),
    bestLendUnitPrice: BigInt('9617'),
    minBorrowUnitPrice: BigInt('9602'),
    maxLendUnitPrice: BigInt('9630'),
    currentMinDebtUnitPrice: BigInt('9500'),
    ccy: wfilBytes32,
    preOpeningDate: BigInt('1684982800'),
    lastBlockUnitPriceTimestamp: BigInt('1646920200'),
};

const closedMarket = {
    ...preOrderMarket,
    isPreOrderPeriod: false,
};

const nearMaturityMarket = {
    ...preOrderMarket,
    maturity: BigInt(new Maturity(1638662400).toString()),
    isReady: true,
    isOpened: true,
    isPreOrderPeriod: false,
};

const marketWithZeroAPR = {
    name: 'DEC24',
    maturity: BigInt(dec24Fixture.toString()),
    openingDate: BigInt('1685577600'),
    marketUnitPrice: BigInt('0'),
    openingUnitPrice: BigInt('0'),
    isReady: true,
    isOpened: true,
    isMatured: false,
    isPreOrderPeriod: false,
    isItayosePeriod: false,
    bestBorrowUnitPrice: BigInt('0'),
    bestLendUnitPrice: BigInt('0'),
    minBorrowUnitPrice: BigInt('0'),
    maxLendUnitPrice: BigInt('0'),
    currentMinDebtUnitPrice: BigInt('0'),
    ccy: wfilBytes32,
    preOpeningDate: BigInt('1684972800'),
    lastBlockUnitPriceTimestamp: BigInt('1646920200'),
};

const noItayoseMarkets = maturitiesMockFromContract(wfilBytes32).slice(0, 8);

const twoItayoseMarkets = [
    ...maturitiesMockFromContract(wfilBytes32),
    preOrderMarket,
];

const closedMarkets = [
    ...maturitiesMockFromContract(wfilBytes32),
    closedMarket,
];

const closeToMaturity = [
    ...maturitiesMockFromContract(wfilBytes32),
    nearMaturityMarket,
];

const closeToMaturityWithZeroAprMarkets = [
    nearMaturityMarket,
    marketWithZeroAPR,
];

beforeEach(() => mock.getOrderBookDetails.mockClear());

describe('useYieldCurveMarketRates', () => {
    it('should return empty index set for no itayose market', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValueOnce([
            ...noItayoseMarkets,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.rates).toHaveLength(8);
        expect(result.current.maturityList).toHaveLength(8);
        expect(result.current.itayoseMarketIndexSet).toEqual(new Set());
    });

    it('should return correct itayose index for default mocks', async () => {
        const { result } = renderHook(() => useYieldCurveMarketRates());

        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );

        expect(result.current.maturityList).toHaveLength(9);
        expect(result.current.itayoseMarketIndexSet).toEqual(new Set([8]));
    });

    it('should return correct index set for more than one itayose markets', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValueOnce([
            ...twoItayoseMarkets,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.rates).toHaveLength(10);
        expect(result.current.maturityList).toHaveLength(10);
        expect(result.current.itayoseMarketIndexSet).toEqual(new Set([8, 9]));
    });

    it('should return empty lists for no markets', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValue([]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() => expect(result.current.rates).toHaveLength(0));
        expect(result.current.maturityList).toHaveLength(0);
        expect(result.current.itayoseMarketIndexSet).toEqual(new Set());
    });

    it('should not return matured or markets not in pre-open or itayose mode', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValue([
            ...closedMarkets,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.rates).toHaveLength(9);
        expect(result.current.maturityList).toHaveLength(9);
        expect(result.current.itayoseMarketIndexSet).toEqual(new Set([8]));
    });

    it('should return ZC rates for open markets and FWD rates for pre-open markets', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValue([
            ...twoItayoseMarkets,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.rates).toHaveLength(10);
        expect(result.current.maturityList).toHaveLength(10);
        expect(result.current.itayoseMarketIndexSet).toEqual(new Set([8, 9]));

        const fwdRate = LoanValue.fromPrice(
            Number(preOrderMarket.openingUnitPrice),
            Number(preOrderMarket.maturity),
            Number(preOrderMarket.openingDate)
        ).apr;
        expect(result.current.rates[8].toNormalizedNumber()).toEqual(1.9758);
        expect(result.current.rates[9].toNormalizedNumber()).toEqual(
            fwdRate.toNormalizedNumber()
        );
    });

    it('should return MAX_VALUE for maximumRate if no market is near maturity', async () => {
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.maximumRate).toEqual(Number.MAX_VALUE);
    });

    it('should return 0 marketCloseToMaturityOriginalRate if no market is near maturity', async () => {
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(result.current.marketCloseToMaturityOriginalRate).toEqual(0)
        );
    });

    it('should not change first market yield chart rate if its not close to maturity', async () => {
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.rates[0]).toEqual(new Rate(20329));
    });

    it('should return correct maximumRate when a market is near maturity', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValue([
            ...closeToMaturity,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.maximumRate).toEqual(34820);
    });

    it('should return correct marketCloseToMaturityOriginalRate when a market is near maturity', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValue([
            ...closeToMaturity,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.marketCloseToMaturityOriginalRate).toEqual(
            10000000
        );
    });

    it('should change first market yield chart rate if its close to maturity and greater than maximum rate', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValue([
            ...closeToMaturity,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.rates[0]).toEqual(new Rate(43525));
    });

    it.skip('should return original rate for a market near maturity if maximum rate is 0', async () => {
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValue([
            ...closeToMaturityWithZeroAprMarkets,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.rates[0]).toEqual(new Rate(43525));
    });

    it('should not change first market yield chart rate if its close to maturity but lesser than maximum rate', async () => {
        nearMaturityMarket.marketUnitPrice = BigInt('0');
        jest.spyOn(mock, 'getOrderBookDetails').mockResolvedValue([
            ...closeToMaturity,
        ]);
        const { result } = renderHook(() => useYieldCurveMarketRates());
        await waitFor(() =>
            expect(mock.getOrderBookDetails).toHaveBeenCalled()
        );
        expect(result.current.rates[0]).toEqual(new Rate(0));
    });
});
