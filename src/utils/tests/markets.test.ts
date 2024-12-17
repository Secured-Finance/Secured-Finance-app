import type { SavedMarket } from 'src/types';
import {
    readMarketsFromStore,
    removeMarketFromStore,
    writeMarketInStore,
} from 'src/utils';

const marketToSave: SavedMarket = {
    market: 'USDC-DEC2024',
    address: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
    chainId: 1,
};
const stringifiedMarket = JSON.stringify(marketToSave);

describe('markets', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('writeMarketInStore', () => {
        it('should write the market-address pair to localStorage', () => {
            writeMarketInStore(marketToSave);
            const savedMarkets = JSON.parse(
                localStorage.getItem('SAVED_MARKETS_KEY') || '[]'
            );
            expect(savedMarkets).toEqual([marketToSave]);
        });
    });

    describe('readMarketsFromStore', () => {
        it('should read the market-address pair from localStorage', () => {
            localStorage.setItem('SAVED_MARKETS_KEY', stringifiedMarket);
            expect(readMarketsFromStore()).toEqual(marketToSave);
        });

        it('should return an empty array if the market-address pair is not in localStorage', () => {
            expect(readMarketsFromStore()).toEqual([]);
        });

        it('should handle empty localStorage gracefully', () => {
            localStorage.clear();
            expect(readMarketsFromStore()).toEqual([]);
        });
    });

    describe('removeMarketFromStore', () => {
        it('should remove the market from localStorage', () => {
            localStorage.setItem(
                'SAVED_MARKETS_KEY',
                JSON.stringify([marketToSave])
            );
            removeMarketFromStore(marketToSave);
            expect(localStorage.getItem('SAVED_MARKETS_KEY')).toEqual('[]');
        });

        it('should handle removing non-existent market gracefully', () => {
            localStorage.clear();
            removeMarketFromStore(marketToSave); // Should not throw error or change localStorage
            expect(localStorage.getItem('SAVED_MARKETS_KEY')).toEqual('[]');
        });
    });
});
