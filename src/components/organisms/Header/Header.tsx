import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import ArrowUpSquare from 'src/assets/icons/arrow-up-square.svg';
import Badge from 'src/assets/icons/badge.svg';
import SFLogo from 'src/assets/img/logo.svg';
import SFLogoSmall from 'src/assets/img/small-logo.svg';
import {
    Button,
    ButtonSizes,
    SupportedNetworks,
    Tab,
} from 'src/components/atoms';
import {
    HamburgerMenu,
    MenuPopover,
    NetworkSelector,
    Settings,
} from 'src/components/molecules';
import { WalletDialog, WalletPopover } from 'src/components/organisms';
import { useBreakpoint, usePoints } from 'src/hooks';
import useSF from 'src/hooks/useSecuredFinance';
import { setWalletDialogOpen } from 'src/store/interactions';
import { RootState } from 'src/store/types';
import {
    getShowStablecoinAppUrl,
    getStablecoinAppUrl,
    getSupportedNetworks,
    isProdEnv,
} from 'src/utils';
import { AddressUtils } from 'src/utils/address';
import { useAccount } from 'wagmi';
import { DEV_LINKS, PRODUCTION_LINKS } from './constants';

const HeaderMessage = ({
    isChainIdDetected,
    chainId,
    chainError,
}: {
    isChainIdDetected: boolean;
    chainId: number;
    chainError: boolean;
}) => {
    if (chainId && isChainIdDetected) {
        if (chainError) {
            return (
                <div
                    className='typography-caption-2 w-full bg-red p-[1px] text-center text-neutral-8'
                    data-testid='testnet-alert'
                >
                    <SupportedNetworks />
                </div>
            );
        } else if (
            getSupportedNetworks().find(n => n.id === chainId)?.testnet ||
            getSupportedNetworks().find(n => n.id === chainId)?.id === 314_159
        ) {
            // NOTE: 314_159 is a testnet chain id but `viem` does not have a testnet flag for it.
            // So we are checking for the chain id to determine if it is a testnet chain.
            return (
                <div
                    className='typography-caption-2 w-full bg-horizonBlue p-[1px] text-center text-neutral-8'
                    data-testid='testnet-info'
                >
                    You are visiting Secured Finance on testnet
                </div>
            );
        }
    }
    return <></>;
};

const Header = ({ showNavigation }: { showNavigation: boolean }) => {
    const dispatch = useDispatch();
    const isMobile = useBreakpoint('tablet');
    const { address, isConnected } = useAccount();

    const {
        user: { data: userData },
        verification: { data: verifiedData },
    } = usePoints();

    const userPoints = userData?.user.point;

    const securedFinance = useSF();
    const chainError = useSelector(
        (state: RootState) => state.blockchain.chainError
    );
    const currentChainId = useSelector(
        (state: RootState) => state.blockchain.chainId
    );
    const isChainIdDetected = useSelector(
        (state: RootState) => state.blockchain.isChainIdDetected
    );
    const isProduction = isProdEnv();

    const LINKS = isProduction ? PRODUCTION_LINKS : DEV_LINKS;

    const btnSize = isMobile ? ButtonSizes.sm : undefined;

    const isShowStablecoinLink = getShowStablecoinAppUrl();
    const isShowPointsTag = (!isShowStablecoinLink && isMobile) || !isMobile;

    return (
        <>
            <div className='relative'>
                <HeaderMessage
                    isChainIdDetected={isChainIdDetected}
                    chainId={currentChainId}
                    chainError={chainError}
                />
                <nav
                    data-cy='header'
                    className='grid h-14 w-full grid-flow-col bg-neutral-800 px-4 tablet:h-16 tablet:px-5 laptop:grid-flow-col'
                >
                    <div className='col-span-2 flex flex-row items-center gap-6 largeDesktop:gap-8'>
                        <Link href='/' className='flex'>
                            <SFLogo className='hidden desktop:inline desktop:h-4 desktop:w-[160px] largeDesktop:h-5 largeDesktop:w-[200px]' />
                            <SFLogoSmall className='inline h-7 w-7 desktop:hidden' />
                        </Link>
                        {showNavigation && (
                            <div className='hidden h-full flex-row laptop:flex'>
                                {LINKS.map(link => (
                                    <div
                                        key={link.text}
                                        className={clsx(
                                            'h-full w-full',
                                            link.className
                                        )}
                                    >
                                        <ItemLink
                                            text={link.text}
                                            dataCy={link.dataCy}
                                            link={link.link}
                                            alternateLinks={
                                                link?.alternateLinks
                                            }
                                        />
                                    </div>
                                ))}
                                <MenuPopover />
                            </div>
                        )}
                    </div>
                    <div className='col-span-2 flex flex-row items-center justify-end gap-2 laptop:col-span-1 laptop:gap-2.5'>
                        {isShowStablecoinLink && <StablecoinExternalLink />}
                        {isShowPointsTag && (
                            <PointsTag
                                isConnected={
                                    verifiedData && address && userData
                                }
                                points={userPoints}
                            />
                        )}
                        {isConnected && address ? (
                            <>
                                <NetworkSelector
                                    networkName={
                                        securedFinance?.config?.network ??
                                        'Unknown'
                                    }
                                />
                                <WalletPopover
                                    wallet={AddressUtils.format(address, 6)}
                                    networkName={
                                        securedFinance?.config?.network ??
                                        'Unknown'
                                    }
                                />
                                <Settings isProduction={isProduction} />
                            </>
                        ) : (
                            <Button
                                size={btnSize}
                                data-cy='wallet'
                                data-testid='connect-wallet'
                                onClick={() =>
                                    dispatch(setWalletDialogOpen(true))
                                }
                            >
                                Connect Wallet
                            </Button>
                        )}

                        <div className='flex laptop:hidden'>
                            <HamburgerMenu
                                links={LINKS.map(link => ({
                                    label: link.text,
                                    link: link.link,
                                }))}
                            />
                        </div>
                    </div>
                    <WalletDialog />
                </nav>
            </div>
        </>
    );
};

const ItemLink = ({
    text,
    dataCy,
    link,
    alternateLinks,
}: {
    text: string;
    dataCy: string;
    link: string;
    alternateLinks?: string[];
}) => {
    const router = useRouter();
    const useCheckActive = () => {
        return (
            router.pathname === link ||
            !!alternateLinks?.includes(router.pathname)
        );
    };
    return (
        <Link href={link} className='h-full' data-cy={dataCy.toLowerCase()}>
            <Tab
                text={text}
                active={useCheckActive()}
                isFullHeight
                className='laptop:min-w-[100px]'
            />
        </Link>
    );
};

const PointsTag = ({
    points,
    isConnected,
}: {
    points?: number;
    isConnected: boolean;
}) => {
    const router = useRouter();
    const showPoints = isConnected && points;

    let pointsDisplay = '';

    if (points) {
        if (points < 1000) {
            pointsDisplay = `${points} Points`;
        } else if (points < 1000000) {
            pointsDisplay = `${Math.floor(points / 100) / 10}K Points`;
        } else {
            pointsDisplay = `${Math.floor(points / 100000) / 10}M Points`;
        }
    }

    return (
        <button
            onClick={() => {
                if (router.pathname !== '/points') {
                    router.push('/points');
                }
            }}
            className={clsx(
                'typography-mobile-body-5 tablet:typography-desktop-body-4 flex h-8 flex-shrink-0 items-center justify-center gap-1 rounded-lg bg-neutral-800 px-2.5 py-[5px] font-semibold text-neutral-50 ring-1 ring-neutral-500 hover:bg-tertiary-700/10 hover:ring-tertiary-500 active:border-transparent tablet:h-10 tablet:rounded-xl tablet:pr-3 tablet:ring-[1.5px]',
                {
                    'tablet:pl-3': !showPoints,
                    'tablet:pl-2.5': showPoints,
                }
            )}
            aria-label='Points Tag'
        >
            <Badge className='flex h-[13px] w-[13px] flex-shrink-0 tablet:h-4 tablet:w-4' />
            {isConnected && points !== undefined ? pointsDisplay : 'Points'}
        </button>
    );
};

const StablecoinExternalLink = () => {
    return (
        <Link
            href={getStablecoinAppUrl()}
            target='_blank'
            className={clsx(
                'typography-mobile-body-5 tablet:typography-desktop-body-4 flex h-8 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg bg-neutral-800 px-2.5 py-2.5 font-semibold text-neutral-50 ring-1 ring-neutral-500 hover:bg-white-10 hover:ring-white-10 active:border-transparent tablet:h-10 tablet:rounded-xl tablet:pr-3 tablet:ring-[1.5px]'
            )}
            aria-label='Stablecoin external link'
        >
            Stablecoin
            <ArrowUpSquare className='h-4 w-4 text-neutral-50' />
        </Link>
    );
};

export default Header;
