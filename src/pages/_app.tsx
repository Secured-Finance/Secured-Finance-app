import { GraphClientProvider } from '@secured-finance/sf-graph-client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { Header } from 'src/components/organisms';
import { Layout } from 'src/components/templates';
import SecuredFinanceProvider from 'src/contexts/SecuredFinanceProvider';
import store from 'src/store';
import { getEnvVariable } from 'src/utils';
import { UseWalletProvider } from 'use-wallet';
import '../assets/css/index.css';

function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Secured Finance</title>
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />
            </Head>

            <Provider store={store}>
                <Providers>
                    <Layout navBar={<Header />}>
                        <Component {...pageProps} />
                    </Layout>
                </Providers>
            </Provider>
        </>
    );
}

const Providers: React.FC = ({ children }) => {
    const network = getEnvVariable<string>('NEXT_PUBLIC_ETHEREUM_NETWORK');
    const chainId = getEnvVariable<number>('NEXT_PUBLIC_ETHEREUM_CHAIN_ID');
    return (
        <GraphClientProvider network={network}>
            <UseWalletProvider
                connectors={{
                    injected: {
                        chainId: [chainId],
                    },
                    walletconnect: {
                        rpcUrl: 'https://ropsten.eth.aragon.network/',
                    },
                }}
            >
                <SecuredFinanceProvider>{children}</SecuredFinanceProvider>
            </UseWalletProvider>
        </GraphClientProvider>
    );
};

export default App;
