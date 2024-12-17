import { useRouter } from 'next/router';
import { Faucet as FaucetComponent } from 'src/components/pages';
import { useIsMarketTerminated } from 'src/hooks';
import { isProdEnv } from 'src/utils';

const Faucet = () => {
    const router = useRouter();
    if (isProdEnv()) {
        return null;
    }

    const { data: isTerminated, isPending: isPendingMarketTerminated } =
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useIsMarketTerminated();

    if (isPendingMarketTerminated) {
        return null;
    }

    if (isTerminated) {
        router.push('/emergency');
        return null;
    }

    return <FaucetComponent />;
};

export default Faucet;
