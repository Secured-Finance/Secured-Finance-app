import React, { createContext, useEffect, useState } from 'react';
import { ChainUnsupportedError, useWallet } from 'use-wallet';
import { ethers } from 'ethers';
import { SecuredFinanceClient } from '@secured-finance/sf-client';

export interface SFContext {
    securedFinance?: SecuredFinanceClient;
}

export const Context = createContext<SFContext>({
    securedFinance: undefined,
});

declare global {
    interface Window {
        securedFinanceSDK: any;
    }
}

const SecuredFinanceProvider: React.FC = ({ children }) => {
    const {
        ethereum,
        error,
        status,
        account,
    }: {
        ethereum: any;
        error: any;
        status: any;
        connect: any;
        account: string;
    } = useWallet();
    const [securedFinance, setSecuredFinance] = useState<any>();

    // @ts-ignore
    window.securedFinance = securedFinance;
    // @ts-ignore
    window.eth = ethereum;

    const handleNetworkChanged = (networkId: string | number) => {
        if (networkId != 3) {
            alert('Unsupported network, please use Ropsten (Chain ID: 3)');
        }
    };

    useEffect(() => {
        const connectSFClient = async (chainId: number) => {
            const provider = new ethers.providers.Web3Provider(
                ethereum,
                chainId
            );
            const signer = provider.getSigner();
            const network = await provider.getNetwork();

            const securedFinanceLib = new SecuredFinanceClient(signer, network);
            setSecuredFinance(securedFinanceLib);
            window.securedFinanceSDK = securedFinanceLib;
        };

        if (ethereum) {
            const chainId = Number(ethereum.chainId);
            connectSFClient(chainId);
            ethereum.on('chainChanged', handleNetworkChanged);

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener(
                        'chainChanged',
                        handleNetworkChanged
                    );
                }
            };
        } else {
            if (status === 'error') {
                if (error instanceof ChainUnsupportedError) {
                    alert(
                        'Unsupported network, please use Ropsten (Chain ID: 1337'
                    );
                }
            }
        }
    }, [ethereum, status, error]);

    return (
        <Context.Provider value={{ securedFinance }}>
            {children}
        </Context.Provider>
    );
};

export default SecuredFinanceProvider;
