import { track } from '@amplitude/analytics-browser';
import { Menu } from '@headlessui/react';
import {
    ClipboardDocumentIcon,
    EllipsisHorizontalIcon,
    WalletIcon,
} from '@heroicons/react/24/outline';
import { Token } from '@secured-finance/sf-core';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import MetaMaskIcon from 'src/assets/img/metamask-fox.svg';
import {
    Button,
    ButtonSizes,
    GradientBox,
    Separator,
} from 'src/components/atoms';
import {
    CurrencyDropdown,
    Dialog,
    SuccessPanel,
    Tooltip,
} from 'src/components/molecules';
import { MyWalletWidget } from 'src/components/organisms';
import { Page, TwoColumns } from 'src/components/templates';
import {
    useBlockExplorerUrl,
    useCurrencies,
    useHandleContractTransaction,
} from 'src/hooks';
import useSF from 'src/hooks/useSecuredFinance';
import { RootState } from 'src/store/types';
import {
    AddressUtils,
    CurrencySymbol,
    currencyMap,
    toCurrency,
    toOptions,
} from 'src/utils';
import { useAccount, useWalletClient } from 'wagmi';

const MenuAddToken = ({
    address,
    onClick,
}: {
    address: string;
    onClick: () => void;
}) => {
    return (
        <Menu as='div' className='relative inline tablet:hidden'>
            <Menu.Button className='flex flex-row items-center justify-between gap-2'>
                <span>{AddressUtils.format(address, 6)}</span>
                <EllipsisHorizontalIcon className='h-6 w-6' />
            </Menu.Button>
            <Menu.Items className='typography-caption-2 absolute -left-4 -top-20 z-50 w-fit min-w-[150px] whitespace-nowrap rounded-md bg-gunMetal text-neutral-8 shadow-dropdown focus:outline-none'>
                <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={onClick}
                            className={clsx(
                                'flex w-full flex-row items-center justify-start gap-2 rounded-md px-4 py-2 text-left text-white-60 focus:outline-none',
                                {
                                    'bg-slateGray': active,
                                }
                            )}
                        >
                            <ClipboardDocumentIcon className='h-6 w-6 text-planetaryPurple' />
                            <div>Add Token to Wallet</div>
                        </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(address);
                            }}
                            className={clsx(
                                'flex w-full flex-row items-center justify-start gap-2 rounded-md px-4 py-2 text-left text-white-60 focus:outline-none',
                                {
                                    'bg-slateGray': active,
                                }
                            )}
                        >
                            <WalletIcon className='h-6 w-6 text-planetaryPurple' />
                            <div>Copy Contract ID</div>
                        </button>
                    )}
                </Menu.Item>
            </Menu.Items>
        </Menu>
    );
};
export const Faucet = () => {
    const chainError = useSelector(
        (state: RootState) => state.blockchain.chainError
    );

    const { blockExplorerUrl } = useBlockExplorerUrl();
    const handleContractTransaction = useHandleContractTransaction();
    const { address: account } = useAccount();
    const { data: client } = useWalletClient();
    const sf = useSF();

    const { data: currencies } = useCurrencies();
    const assetList = toOptions(currencies, CurrencySymbol.USDC).filter(
        ccy =>
            currencyMap[ccy.value].toCurrency().isToken &&
            ccy.label !== CurrencySymbol.USDFC
    );

    const [ccy, setCcy] = useState<CurrencySymbol | null>(null);
    const [address, setAddress] = useState<string>('');
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [txHash, setTxHash] = useState<string | undefined>();

    const token = useMemo(() => {
        if (!ccy) return null;
        const currency = toCurrency(ccy);
        if (currency instanceof Token) {
            return currency;
        }

        return null;
    }, [ccy]);

    const mint = useCallback(async () => {
        if (!account || !sf || !token || !(token instanceof Token)) return;
        setIsPending(true);
        try {
            const tx = await sf.mintERC20Token(token);
            const transactionStatus = await handleContractTransaction(tx);

            if (!transactionStatus) {
                console.error('Some error occurred');
            } else {
                setTxHash(tx);
                track('Mint Tokens', {
                    'Asset Type': token.symbol,
                });
                setIsOpen(true);
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            }
        }
        setIsPending(false);
    }, [account, sf, token, handleContractTransaction]);

    const addToMetamask = useCallback(
        async (token: Token | null) => {
            if (!client || !token) return;
            client.watchAsset({
                type: 'ERC20',
                options: {
                    address: address,
                    symbol: token.symbol,
                    decimals: token.decimals,
                },
            });
        },
        [client, address]
    );

    useEffect(() => {
        const getContractAddress = async () => {
            if (!sf || !token || !(token instanceof Token)) return '';
            const address = await sf.getERC20TokenContractAddress(token);
            return address;
        };

        getContractAddress().then(address => {
            setAddress(address);
        });
    }, [sf, token]);

    return (
        <Page title='Test Pilot Program'>
            <TwoColumns>
                <GradientBox>
                    <div className='grid grid-cols-1 gap-12 px-5 pb-4 desktop:px-[70px]'>
                        <h1 className='typography-headline-4 py-8 text-center text-2xl font-bold text-white'>
                            Test Token Faucet
                        </h1>
                        {assetList.length > 0 ? (
                            <div className='flex flex-col gap-10'>
                                <div className='grid h-14 grid-flow-col items-center justify-start gap-x-3 rounded-xl border border-neutral-3 bg-black-20 px-2 tablet:justify-stretch'>
                                    <CurrencyDropdown
                                        currencyOptionList={assetList}
                                        selected={assetList[0]}
                                        onChange={ccy => {
                                            if (
                                                assetList
                                                    .map(item => item.label)
                                                    .includes(ccy)
                                            ) {
                                                setCcy(ccy as CurrencySymbol);
                                            } else {
                                                setCcy(null);
                                            }
                                        }}
                                        variant='fixedWidth'
                                    />

                                    <div className='typography-caption text-white-60'>
                                        <div className='hidden tablet:flex tablet:w-full tablet:flex-row tablet:items-center  tablet:justify-between'>
                                            <div>{address}</div>
                                            <div className='flex flex-row items-center gap-2'>
                                                <Tooltip
                                                    placement='bottom'
                                                    iconElement={
                                                        <button
                                                            className='flex h-9 w-9 items-center justify-center rounded-2xl bg-gunMetal'
                                                            onClick={() =>
                                                                navigator.clipboard.writeText(
                                                                    address
                                                                )
                                                            }
                                                        >
                                                            <ClipboardDocumentIcon className='h-5 w-5 text-slateGray hover:text-planetaryPurple' />
                                                        </button>
                                                    }
                                                >
                                                    Copy Contract ID
                                                </Tooltip>
                                                <Tooltip
                                                    placement='bottom'
                                                    disabled={!client}
                                                    iconElement={
                                                        <button
                                                            className={clsx(
                                                                'flex h-9 w-9 items-center justify-center rounded-2xl bg-gunMetal',
                                                                {
                                                                    'cursor-default':
                                                                        !client,
                                                                }
                                                            )}
                                                            onClick={() =>
                                                                addToMetamask(
                                                                    token
                                                                )
                                                            }
                                                        >
                                                            <WalletIcon
                                                                className={clsx(
                                                                    'h-5 w-5 text-slateGray ',
                                                                    {
                                                                        'hover:text-planetaryPurple':
                                                                            client,
                                                                    }
                                                                )}
                                                            />
                                                        </button>
                                                    }
                                                >
                                                    Add Token to Wallet
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <MenuAddToken
                                            address={address}
                                            onClick={() => addToMetamask(token)}
                                        />
                                    </div>
                                </div>
                                <div className='grid h-14 grid-flow-col items-center justify-between gap-x-3 rounded-xl border border-neutral-3 bg-black-20 px-2'>
                                    <button
                                        className='flex h-10 w-36 flex-row items-center justify-start gap-x-2 rounded-lg bg-white-5 px-2 hover:bg-white-40'
                                        onClick={() => addToMetamask(token)}
                                    >
                                        <span>
                                            <MetaMaskIcon className='h-6 w-6' />
                                        </span>
                                        <span className='typography-caption w-20 whitespace-nowrap pl-2 text-left text-white'>
                                            Wallet
                                        </span>
                                    </button>
                                    <div className='typography-caption text-white-60 tablet:pr-10'>
                                        <span className='inline tablet:hidden'>
                                            {account
                                                ? AddressUtils.format(
                                                      account,
                                                      6
                                                  )
                                                : ''}
                                        </span>
                                        <span className='hidden tablet:inline'>
                                            {account ?? ''}
                                        </span>
                                    </div>
                                    <div></div>
                                </div>
                                <div className='flex justify-center'>
                                    <Button
                                        onClick={mint}
                                        disabled={
                                            !account || isPending || chainError
                                        }
                                        size={ButtonSizes.lg}
                                    >
                                        {isPending
                                            ? 'Minting...'
                                            : 'Mint tokens'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className='flex justify-center pb-12'>
                                <div className='text-white-60'>
                                    No Test Tokens Available
                                </div>
                            </div>
                        )}
                        <Separator />
                        <div className='typography-body-2 flex flex-col gap-4 pt-5 text-planetaryPurple'>
                            <h1 className='text-neutral-8'>
                                How does it work?
                            </h1>
                            <p>
                                Welcome to the Secured Finance ERC20 token
                                faucet! Connect to our DeFi dApp and request
                                some tokens for testing purposes. These tokens
                                have no real value and are provided for testing
                                only. Please use them responsibly and only
                                request what you need.
                            </p>
                            <p>
                                Please note that your wallet will require
                                initial ethereum balance in your metamask wallet
                                to cover the gas cost to receive our test
                                tokens. You can receive testnet ethereum from
                                the{' '}
                                <a
                                    className='text-nebulaTeal underline'
                                    href='https://sepolia-faucet.pk910.de/'
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    Sepolia PoW Faucet
                                </a>
                                .
                            </p>
                            <p>Thank you for choosing Secured Finance!</p>
                            <h1 className='pt-2 text-neutral-8'>
                                Add our ERC20 Tokens to Metamask
                            </h1>
                            <p>
                                You can add our ERC20 tokens to Metamask by
                                following{' '}
                                <a
                                    href='https://metamask.zendesk.com/hc/en-us/articles/360015489031-How-to-display-tokens-in-MetaMask#h_01FWH492CHY60HWPC28RW0872H'
                                    target='_blank'
                                    rel='noreferrer'
                                    className='text-nebulaTeal'
                                >
                                    this guide
                                </a>
                            </p>
                        </div>
                    </div>
                </GradientBox>
                <MyWalletWidget hideBridge />
            </TwoColumns>
            <Dialog
                isOpen={isOpen}
                title='Token minted'
                description=''
                callToAction='OK'
                onClose={() => setIsOpen(false)}
                onClick={() => setIsOpen(false)}
            >
                <SuccessPanel
                    itemList={[
                        ['Status', 'Success'],
                        [
                            'Ethereum Address',
                            AddressUtils.format(account ?? '', 8),
                        ],
                    ]}
                    txHash={txHash}
                    blockExplorerUrl={blockExplorerUrl}
                />
            </Dialog>
        </Page>
    );
};
