import { WalletSource } from '@secured-finance/sf-client';
import { composeStories } from '@storybook/react';
import SFLogoSmall from 'src/assets/img/logo-small.svg';
import MetamaskIcon from 'src/assets/img/metamask-fox.svg';
import { fireEvent, render, screen, waitFor } from 'src/test-utils.js';
import { CurrencySymbol } from 'src/utils';
import { WalletSourceOption } from './WalletSourceSelector';
import * as stories from './WalletSourceSelector.stories';

const { Default, NotConnectedToWallet } = composeStories(stories);

const walletSourceList: WalletSourceOption[] = [
    {
        source: WalletSource.METAMASK,
        available: BigInt('100000000000'),
        asset: CurrencySymbol.WBTC,
        iconSVG: MetamaskIcon,
    },
    {
        source: WalletSource.SF_VAULT,
        available: BigInt('0'),
        asset: CurrencySymbol.WBTC,
        iconSVG: SFLogoSmall,
    },
];

describe('WalletSourceSelector component', () => {
    it('should render WalletSourceSelector', () => {
        render(<Default />);
        expect(screen.getByText('0xb98b...fd6d')).toBeInTheDocument();
        expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('should render disabled WalletSourceSelector when wallet is disconnected', () => {
        render(<NotConnectedToWallet />);
        expect(screen.getByText('Connect')).toBeInTheDocument();
        expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('should render a clickable button', () => {
        render(<Default />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render a disabled button when wallet is disconnected', async () => {
        render(<NotConnectedToWallet />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should render a dropdown', async () => {
        render(<Default />);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });
    });

    it('should not render a dropdown when wallet is disconnected', async () => {
        render(<NotConnectedToWallet />);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
    });

    it('should change the button when a dropdown item is selected', async () => {
        const onChange = jest.fn();
        render(<Default onChange={onChange} />);

        fireEvent.click(screen.getByTestId('wallet-source-selector-button'));
        fireEvent.click(screen.getByTestId('option-1'));

        await waitFor(() => {
            expect(screen.getByText('SF Vault')).toBeInTheDocument();
            expect(screen.getByText('0.0004')).toBeInTheDocument();

            expect(onChange).toBeCalledTimes(1);
            expect(onChange).toHaveBeenLastCalledWith(WalletSource.SF_VAULT);
        });
    });

    it('should not render options which have zero balance except metamask', async () => {
        render(<Default optionList={walletSourceList} />);
        expect(screen.getByText('0xb98b...fd6d')).toBeInTheDocument();
        expect(screen.getByText('1,000')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('wallet-source-selector-button'));
        await waitFor(() => {
            expect(screen.queryByTestId('option-1')).not.toBeInTheDocument();
        });
    });
});
