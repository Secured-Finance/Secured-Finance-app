import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { WithWalletProvider } from 'src/../.storybook/decorators';
import { updateLendingMarketContract } from 'src/store/availableContracts';
import { maturityOptions } from 'src/stories/mocks/fixtures';
import { CurrencySymbol } from 'src/utils';
import { MarketOrganism } from './MarketOrganism';

export default {
    title: 'Organism/MarketOrganism',
    component: MarketOrganism,
    args: {
        maturitiesOptionList: maturityOptions,
    },
    decorators: [WithWalletProvider],
} as ComponentMeta<typeof MarketOrganism>;

const Template: ComponentStory<typeof MarketOrganism> = args => {
    const maturities = useMemo(
        () => ({
            MAR22: 1616508800,
            JUN22: 1625097600,
            SEP22: 1633046400,
            DEC22: 1640995200,
        }),
        []
    );
    const dispatch = useDispatch();
    useEffect(() => {
        const timerId = setTimeout(() => {
            dispatch(
                updateLendingMarketContract(maturities, CurrencySymbol.FIL)
            );
            dispatch(
                updateLendingMarketContract(maturities, CurrencySymbol.ETH)
            );
            dispatch(
                updateLendingMarketContract(maturities, CurrencySymbol.USDC)
            );
        }, 200);

        return () => clearTimeout(timerId);
    }, [dispatch, maturities]);
    return <MarketOrganism {...args} />;
};

export const Default = Template.bind({});
