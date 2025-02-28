import { reset, track } from '@amplitude/analytics-browser';
import { SecuredFinanceClient } from '@secured-finance/sf-client';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QUERIES_TO_INVALIDATE } from 'src/hooks';
import { useWalletStore } from 'src/hooks/useWallet';
import {
    updateChainError,
    updateChainId,
    updateIsChainIdDetected,
    updateLatestBlock,
} from 'src/store/blockchain';
import { setWalletDialogOpen } from 'src/store/interactions';
import { RootState } from 'src/store/types';
import {
    getSupportedChainIds,
    getSupportedNetworks,
    readWalletFromStore,
} from 'src/utils';
import {
    InterfaceEvents,
    InterfaceProperties,
    associateWallet,
} from 'src/utils/events';
import { hexToNumber } from 'viem';
import {
    PublicClient,
    WalletClient,
    useAccount,
    useConnect,
    useNetwork,
    usePublicClient,
    useWalletClient,
} from 'wagmi';

export const CACHED_PROVIDER_KEY = 'CACHED_PROVIDER_KEY';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ethereum: any;
    }
}

export interface SFContext {
    securedFinance?: SecuredFinanceClient;
}

export const Context = createContext<SFContext>({
    securedFinance: undefined,
});

const SecuredFinanceProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const chainId = useSelector((state: RootState) => state.blockchain.chainId);
    const { connect, connectors } = useConnect();
    const { data: client } = useWalletClient();
    const publicClient = usePublicClient({
        chainId: chainId,
    });
    const queryClient = useQueryClient();

    const [securedFinance, setSecuredFinance] =
        useState<SecuredFinanceClient>();
    const dispatch = useDispatch();

    useWalletStore();

    const chainName = getSupportedNetworks().find(n => n.id === chainId)?.name;

    const handleAccountChanged = useCallback(
        (accounts: string[]) => {
            track(InterfaceEvents.WALLET_CHANGED_THROUGH_PROVIDER, {
                [InterfaceProperties.CHAIN]: chainName,
            });
            reset();
            if (accounts.length > 0) {
                associateWallet(accounts[0], chainName);
            }
        },
        [chainName]
    );

    const dispatchChainError = useCallback(
        (chainId: number) => {
            dispatch(
                updateChainError(!getSupportedChainIds().includes(chainId))
            );
            dispatch(updateChainId(chainId));
        },
        [dispatch]
    );

    const handleChainChanged = useCallback(
        (chainId: string) => {
            dispatchChainError(hexToNumber(chainId as `0x${string}`));
            track(InterfaceEvents.CHAIN_CONNECTED, {
                [InterfaceProperties.CHAIN]: chainName,
            });
        },
        [chainName, dispatchChainError]
    );

    useEffect(() => {
        // this is required to get the chainId on initial page load
        const fetchChainId = async () => {
            if (window.ethereum) {
                const chainId = await window.ethereum.request({
                    method: 'eth_chainId',
                });
                dispatch(updateIsChainIdDetected(true));
                dispatchChainError(hexToNumber(chainId));
            }
        };
        fetchChainId();
        window.ethereum?.on('chainChanged', handleChainChanged);
        return () => {
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
        };
    }, [dispatchChainError, handleChainChanged, dispatch]);

    useEffect(() => {
        if (chain) {
            dispatchChainError(chain.id);
        }
    }, [chain, dispatchChainError]);

    useEffect(() => {
        const connectSFClient = async (
            publicClient: PublicClient,
            walletClient?: WalletClient
        ) => {
            const securedFinanceLib = new SecuredFinanceClient();
            await securedFinanceLib.init(publicClient, walletClient);

            setSecuredFinance(previous => {
                if (!previous) {
                    return securedFinanceLib;
                }

                if (securedFinanceLib.config.chain.id !== chainId) {
                    return previous;
                }

                if (isConnected) {
                    return securedFinanceLib;
                }

                return previous;
            });
        };
        if (
            isConnected &&
            publicClient?.transport &&
            publicClient?.chain &&
            client?.chain &&
            client?.transport
        ) {
            connectSFClient(publicClient, client);
        } else if (
            !isConnected &&
            publicClient?.transport &&
            publicClient?.chain
        ) {
            connectSFClient(publicClient);
        }
    }, [
        dispatch,
        handleAccountChanged,
        client?.transport,
        client,
        isConnected,
        publicClient?.transport,
        publicClient?.chain,
        publicClient,
        chainId,
    ]);

    useEffect(() => {
        if (address) {
            associateWallet(address, chainName, false);
            return;
        }

        const cachedProvider = readWalletFromStore();
        if (cachedProvider && cachedProvider === 'MetaMask') {
            const connector = connectors.find(
                connector => connector.name === cachedProvider
            );
            if (connector) connect({ connector: connector });
        }
    }, [connect, address, connectors, chainName]);

    useEffect(() => {
        if (!publicClient) return;

        const unwatch = publicClient.watchBlockNumber({
            onBlockNumber: blockNumber => {
                if (blockNumber && typeof blockNumber === 'bigint') {
                    dispatch(updateLatestBlock(Number(blockNumber)));

                    // Invalidate all queries
                    Promise.all(
                        QUERIES_TO_INVALIDATE.map(queryKey =>
                            queryClient.invalidateQueries({
                                queryKey: [queryKey],
                            })
                        )
                    );
                }
            },
        });

        window.ethereum?.on('accountsChanged', handleAccountChanged);

        return () => {
            unwatch();
            window.ethereum?.removeListener(
                'accountsChanged',
                handleAccountChanged
            );
        };
    }, [
        dispatch,
        handleAccountChanged,
        handleChainChanged,
        publicClient,
        queryClient,
        securedFinance,
    ]);

    useEffect(() => {
        const selectedChainId = Number(searchParams.get('chain_id'));

        if (isNaN(selectedChainId)) return;

        if (selectedChainId === chainId) {
            const newSearchParams = new URLSearchParams(
                searchParams.toString()
            );
            newSearchParams.delete('chain_id');

            router.push(
                Array.from(newSearchParams.keys()).length === 0
                    ? ''
                    : `?${newSearchParams.toString()}`
            );
        } else if (getSupportedChainIds().includes(selectedChainId)) {
            const provider = readWalletFromStore();
            const connector = connectors.find(
                connect => connect.name === provider
            );

            if (connector) {
                connector.switchChain?.(selectedChainId);
            } else {
                dispatch(setWalletDialogOpen(true));
            }
        }
    }, [searchParams, chainId, connectors, router, dispatch]);

    return (
        <Context.Provider value={{ securedFinance }}>
            {children}
        </Context.Provider>
    );
};

export default SecuredFinanceProvider;
