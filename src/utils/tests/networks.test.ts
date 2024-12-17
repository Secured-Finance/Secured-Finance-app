import { getSupportedNetworks } from 'src/utils';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

describe('networks', () => {
    it('should have three testnet supported networks', () => {
        const supportedNetworks = getSupportedNetworks();
        expect(supportedNetworks).toHaveLength(4);
        expect(supportedNetworks[0]).toEqual(arbitrumSepolia); // arbitrumSepolia is the first network temporarily; sepolia should be the first
    });

    it('should have four testnet and five mainnet supported networks', () => {
        process.env.SF_ENV = 'production';
        const supportedNetworks = getSupportedNetworks();
        expect(supportedNetworks).toHaveLength(9);
        expect(supportedNetworks[0]).toEqual(arbitrum); // arbitrum is the first network temporarily; mainnet should be the first
    });
});
