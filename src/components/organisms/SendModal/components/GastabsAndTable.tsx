import { utils } from '@secured-finance/sf-client';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'src/components/atoms';
import useSF from 'src/hooks/useSecuredFinance';
import { useEstimateTxFee } from 'src/hooks/useSendEth';
import { updateSendGasPrice } from 'src/store/sendForm';
import { getGasPrice, getTxFee } from 'src/store/sendForm/selectors';
import theme from 'src/theme';
import { formatFixedNumber } from 'src/utils';
import styled from 'styled-components';

export const GasTabsAndTable: React.FC = () => {
    const gasPrice = useSelector(getGasPrice);
    const txFee = useSelector(getTxFee);
    const defaultGasPrices = new Map([
        ['Standard', 0],
        ['Fast', 0],
        ['Instant', 0],
    ]);
    const [gasTabs, setGasTabs] = useState(defaultGasPrices);
    const [selectedTxFee, setSelectedTxFee] = useState('Fast');
    const [isGasUpdated, setGasUpdated] = useState(false);
    const securedFinance = useSF();
    const tabs: React.ReactElement[] = [];

    useEstimateTxFee(gasPrice);

    const dispatch = useDispatch();

    const oracle = utils.getDefaultOracle(securedFinance?.networkId);

    const handleSelectTab =
        (tab: React.SetStateAction<string>, gasPrice: number) => () => {
            setSelectedTxFee(tab);
            dispatch(updateSendGasPrice(parseInt(gasPrice.toFixed(0))));
        };

    const updateGasPrices = useCallback(async () => {
        const cGasTabs = new Map(gasTabs);
        const gasPrices = await utils.currentGasPrices(oracle);
        cGasTabs.set('Standard', gasPrices.standard);
        cGasTabs.set('Fast', gasPrices.fast);
        cGasTabs.set('Instant', gasPrices.instant);
        dispatch(updateSendGasPrice(parseInt(gasPrices.fast.toFixed(0))));
        setGasTabs(cGasTabs);
        setGasUpdated(true);
    }, [gasTabs, dispatch, oracle]);

    useEffect(() => {
        if (!isGasUpdated) {
            updateGasPrices();
        }
    }, [isGasUpdated, updateGasPrices]);

    return (
        <>
            <StyledSubcontainer marginBottom={'0'}>
                {gasTabs.forEach((tab, tabName) => {
                    tabs.push(
                        <Button
                            key={tabName}
                            style={{
                                background: 'transparent',
                                color: theme.colors.lightText,
                                borderWidth: 1,
                                borderColor:
                                    selectedTxFee === tabName
                                        ? theme.colors.darkBlue
                                        : 'transparent',
                                borderBottom:
                                    selectedTxFee === tabName
                                        ? theme.colors.darkBlue
                                        : 'transparent',
                                textTransform: 'capitalize',
                                fontWeight: 500,
                                fontSize: 14,
                                outline: 'none',
                                height: 40,
                                borderRadius: 4,
                                marginRight: 0,
                                width: '120px',
                                textAlign: 'center',
                                paddingLeft: 18,
                                paddingRight: 18,
                            }}
                            onClick={handleSelectTab(tabName, tab)}
                        >
                            {tabName}
                        </Button>
                    );
                })}
                <StyledGasTabs>{tabs}</StyledGasTabs>;
            </StyledSubcontainer>
            <StyledAddressContainer>
                <StyledRowContainer>
                    <StyledAddressTitle>Gas Price</StyledAddressTitle>
                    <StyledAddress>{gasPrice} Gwei</StyledAddress>
                </StyledRowContainer>
                <StyledRowContainer marginTop={'5px'}>
                    <StyledAddressTitle>Transaction fee</StyledAddressTitle>
                    <StyledAddress>${formatFixedNumber(txFee)}</StyledAddress>
                </StyledRowContainer>
            </StyledAddressContainer>
        </>
    );
};

interface StyledRowContainerProps {
    marginTop?: string;
}

interface StyledSubcontainerProps {
    marginBottom?: string;
}

const StyledGasTabs = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    text-transform: uppercase;
    padding: 0;
    margin-bottom: 20px;
`;

const StyledSubcontainer = styled.div<StyledSubcontainerProps>`
    margin-bottom: ${props =>
        props.marginBottom ? props.marginBottom : props.theme.spacing[4]}px;
`;

const StyledRowContainer = styled.div<StyledRowContainerProps>`
    margin-top: ${props => (props.marginTop ? props.marginTop : 0)};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

const StyledAddressContainer = styled.div`
    background: rgb(18, 39, 53, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 18px;
    border: 1px solid ${props => props.theme.colors.darkenedBg};
    border-top: 0;
    border-radius: 10px;
`;

const StyledAddressTitle = styled.p`
    margin: 0;
    color: ${props => props.theme.colors.gray};
    font-size: ${props => props.theme.sizes.footnote}px;
`;

const StyledAddress = styled.p`
    margin: 0;
    color: ${props => props.theme.colors.gray};
    font-size: ${props => props.theme.sizes.footnote}px;
`;
