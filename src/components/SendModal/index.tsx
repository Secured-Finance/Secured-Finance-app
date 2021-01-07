import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import theme from '../../theme'
import Button from '../Button'
import Modal, { ModalProps } from '../Modal'
import ModalActions from '../ModalActions'
import ModalContent from '../ModalContent'
import ModalTitle from '../ModalTitle'
import Spacer from '../Spacer'
import { connect, useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store/types'
import CurrencySelector from '../CurrencySelector';
import { SendFormStore, updateSendAmount, updateSendCurrency, updateSendGasPrice, updateSendToAddreess, updateSendTxFee } from '../../store/sendForm'
import { currencyList, formatInput } from '../../utils'
import { useEthBalance } from '../../hooks/useEthWallet'
import { useFilecoinBalance } from '../../hooks/useFilWallet'

import { isAddress } from 'web3-utils'
import { validateAddressString } from "@glif/filecoin-address"
import { useEstimateTxFee, useSendEth } from '../../hooks/useSendEth'
import { GasPriceOracle } from 'gas-price-oracle'

type CombinedProps = ModalProps & SendFormStore

const RenderGasTabs: React.FC = () => {
    const defaultGasPrices = new Map([
        [ "Standard", 0 ],
        [ "Fast", 0 ],
        [ "Instant", 0 ]
    ])    
    const [gasTabs, setGasTabs] = useState(defaultGasPrices)
    const [selectedTxFee, setSelectedTxFee] = useState("Fast")
    const [isGasUpdated, setGasUpdated] = useState(false)
    let tabs:Array<any> = []

    const dispatch = useDispatch()
    const oracle = new GasPriceOracle();

    const handleSelectTab = (tab: React.SetStateAction<string>, gasPrice: number) => () => {
        setSelectedTxFee(tab)
        dispatch(updateSendGasPrice(gasPrice.toFixed(0)))
    }

    const updateGasPrices = () => {
        let cGasTabs = new Map(gasTabs)
        oracle.fetchMedianGasPriceOffChain().then(gasPrices => {
            cGasTabs.set("Standard", gasPrices.standard)
            cGasTabs.set("Fast", gasPrices.fast)
            cGasTabs.set("Instant", gasPrices.instant)
            dispatch(updateSendGasPrice(gasPrices.fast.toFixed(0)))
        })
        setGasTabs(cGasTabs)
        setGasUpdated(true)
    }

    useEffect(()=> {
        if (!isGasUpdated) {
            updateGasPrices()
        }
    }, [isGasUpdated])


    gasTabs.forEach((tab, tabName) => {
        tabs.push(
            <Button
                key={tabName}
                style={{
                    background:'transparent',
                    color: theme.colors.lightText,
                    borderWidth: 1,
                    borderColor: selectedTxFee === tabName ? theme.colors.darkBlue : 'transparent',
                    borderBottom: selectedTxFee === tabName ? theme.colors.darkBlue : 'transparent',
                    textTransform: 'capitalize',
                    fontWeight: 500,
                    fontSize: 14,
                    outline: "none",
                    height: 40,
                    borderRadius: 4,
                    marginRight: 0,
                    width: '120px',
                    textAlign: "center",
                    paddingLeft: 18,
                    paddingRight: 18,
                }}
                onClick={handleSelectTab(tabName, tab)}
            >
                {tabName}
            </Button>
        )
    })
    
    return(
        <StyledGasTabs>
            {tabs}
        </StyledGasTabs>
    );
}

const SendModal: React.FC<CombinedProps> = ({ onDismiss, amount, currencyIndex, currencyName, currencyShortName, txFee, gasPrice, toAddress }) => {
    const [buttonOpen, setButtonOpen] = useState(false)
    const [addrErr, setAddrErr] = useState(false)
    const [balanceErr, setBalanceErr] = useState(false)
    const [ongoingTx, setOngoingTx] = useState(false)

    const ethBalance = useEthBalance()
    const filBalance = useFilecoinBalance()
    const dispatch = useDispatch()
    const ethPrice = useSelector((state: RootState) => state.assetPrices.ethereum.price);
    const filPrice = useSelector((state: RootState) => state.assetPrices.filecoin.price);
    const usdcPrice = useSelector((state: RootState) => state.assetPrices.usdc.price);

    const handleButtonClick = useCallback((buttonOpen:boolean) => {
        setButtonOpen(!buttonOpen)
    },[setButtonOpen])

    const handleCurrencySelect = useCallback((value:string, buttonOpen:boolean) => {
        dispatch(updateSendCurrency(value))
        setButtonOpen(!buttonOpen)
    },[dispatch, setButtonOpen])

    const handleSendAmount = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        dispatch(updateSendAmount(e.currentTarget.value))
        if (!isEnoughBalance(e.currentTarget.value)) {
            setBalanceErr(true)
        } else {
            setBalanceErr(false)
        }
    },[dispatch, setBalanceErr])

    const handleRecipientAddress = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        dispatch(updateSendToAddreess(e.currentTarget.value))
    },[dispatch])

    const renderBalance = useMemo(() => {
        switch(currencyIndex) {
            case 0:
                return <span>{ethBalance} {currencyShortName}</span> 
            case 1:
                return <span>{filBalance} {currencyShortName}</span> 
            case 2:
                // TODO: Add USDC balances
                return <span>0.00 {currencyShortName}</span>    
        }
    },[currencyIndex, currencyShortName])

    const TotalUsdAmount = useMemo(() => {
        switch (currencyIndex) {
            case 0:
                return (amount*ethPrice).toFixed(2)
            case 1:
                return (amount*filPrice).toFixed(2)
            case 2:
                return (amount*usdcPrice).toFixed(2)
            default: 
                return 0
        }
    },[amount, currencyShortName])

    const isValidAddress = () => {
        switch (currencyIndex) {
            case 0:
                return isAddress(toAddress)
            case 1:
                return validateAddressString(toAddress)
        }
    }

    const isEnoughBalance = (amount: string) => {
        switch (currencyIndex) {
            case 0:
                return amount <= ethBalance.toString()
            case 1:
                return amount <= filBalance.toString()
        }
    }

    const { onSendEth } = useSendEth(amount, toAddress, gasPrice)
    const txFeeUSD = useEstimateTxFee(gasPrice)

    const handleTransferAssets = useCallback(async () => {
        try {
			if (toAddress != "" && amount > 0) {
                if (isValidAddress()) {
                    setOngoingTx(true)
                    const txHash = await onSendEth()
                    if (!txHash) {
                        setOngoingTx(false)
                    } else {
                        onDismiss()
                    }    
                } else {
                    setAddrErr(true)
                }
			} else {
                setAddrErr(true)
            }
        } catch (e) {
            console.log(e)
        }
    }, [toAddress, amount, setAddrErr, onSendEth, setOngoingTx])

	return (
		<Modal>
			<ModalTitle text="Send" />
			<ModalContent paddingBottom={'0'} paddingTop={'0'}>
                <StyledSubcontainer>
                    <StyledLabelContainer>
                        <StyledLabel textTransform={"capitalize"}>Currency</StyledLabel>
                        <StyledLabel fontWeight={400} textTransform={"capitalize"}>Balance: {renderBalance}</StyledLabel>
                    </StyledLabelContainer>
                    <StyledInputContainer>
                        <StyledLabelContainer>
                            <StyledLabel marginBottom={4} color={theme.colors.white} textTransform={"capitalize"} fontSize={16}>{currencyName}</StyledLabel>
                            <StyledLabel fontWeight={400} marginBottom={4} textTransform={"capitalize"} fontSize={16}>~ ${TotalUsdAmount}</StyledLabel>
                        </StyledLabelContainer>
                        <StyledCurrencyInput>
                            <CurrencySelector 
                                selectedCcy={currencyShortName} 
                                onClick={() => handleButtonClick(buttonOpen)}
                            />
                                <StyledInput 
                                    type={'number'}
                                    placeholder={'0'}
                                    value={amount}
                                    minLength={1}
                                    maxLength={79}
                                    onKeyDown={formatInput}
                                    onInput={handleSendAmount}
                                />
                        </StyledCurrencyInput>
                    </StyledInputContainer>
                    { 
                        buttonOpen 
                        ? 
                        <StyledDropdown>
                            <ul>
                                {
                                    currencyList.map((ccy, i) => (
                                        <StyledDropdownItem 
                                            key={i}
                                            onClick={() => handleCurrencySelect(ccy.shortName, buttonOpen)}
                                        >
                                            <img width={28} src={ccy.icon}/>
                                            <StyledCurrencyText>{ccy.shortName}</StyledCurrencyText>
                                        </StyledDropdownItem>
                                    ))
                                }
                            </ul>
                        </StyledDropdown> 
                        : 
                        null 
                    }
                </StyledSubcontainer>
                <StyledSubcontainer>
                <StyledLabelContainer>
                        <StyledLabel textTransform={"capitalize"}>Recipient address</StyledLabel>
                    </StyledLabelContainer>
                    <StyledInputContainer color={addrErr ? theme.colors.red : theme.colors.darkenedBg }>
                        <StyledAddressInput 
                            type={'text'}
                            placeholder={'Paste ' + currencyName + ' address'}
                            value={toAddress}
                            onChange={handleRecipientAddress}
                        />
                    </StyledInputContainer>
                </StyledSubcontainer>
                <StyledSubcontainer marginBottom={'0'}>
                    <RenderGasTabs />
                </StyledSubcontainer>
                <StyledAddressContainer>
                    <StyledRowContainer>
                        <StyledAddressTitle>Gas Price</StyledAddressTitle>
                        <StyledAddress>
                            {gasPrice} Gwei
                        </StyledAddress>
                    </StyledRowContainer>
                    <StyledRowContainer marginTop={"5px"}>
                        <StyledAddressTitle>Transaction fee</StyledAddressTitle>
                        <StyledAddress>
                            ${txFee.toFixed(2)}
                        </StyledAddress>
                    </StyledRowContainer>
                </StyledAddressContainer>
			</ModalContent>
			<ModalActions>
                <StyledButtonContainer>
                    <Button 
                        text="Cancel"
                        onClick={onDismiss}
                        style={{
                            background: 'transparent',
                            borderWidth: 1,
                            borderColor: theme.colors.buttonBlue,
                            borderBottom: theme.colors.buttonBlue,
                            fontSize: theme.sizes.callout, 
                            fontWeight: 500,
                            color: theme.colors.white
                        }}
                    />
                    <Spacer size={"md"}/>
                    <Button 
                        onClick={handleTransferAssets}
                        text={balanceErr ? "Insuficient Balance" : "Send"}
                        style={{
                            background: theme.colors.buttonBlue,
                            fontSize: theme.sizes.callout, 
                            fontWeight: 500,
                            color: theme.colors.white
                        }}
                        disabled={!(amount > 0) || balanceErr}
                    />
                </StyledButtonContainer>
			</ModalActions>
		</Modal>
	)
}

interface StyledSubcontainerProps {
    marginBottom?: string
}

const StyledSubcontainer = styled.div<StyledSubcontainerProps>`
    margin-bottom: ${(props) => props.marginBottom ? props.marginBottom : props.theme.spacing[4]}px;
`

interface StyledLabelProps {
    textTransform?: string,
    fontWeight?: number,
    fontSize?: number,
    marginBottom?: number,
}

const StyledLabelContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const StyledLabel = styled.div<StyledLabelProps>`
    text-transform: ${(props) => props.textTransform ? props.textTransform : 'uppercase' };
    font-size: ${(props) => props.fontSize ? props.fontSize : props.theme.sizes.subhead}px;
    margin-bottom: ${(props) => props.marginBottom ? props.marginBottom : 5}px;
    margin-top: 0px;
    font-weight: ${(props) => props.fontWeight ? props.fontWeight :500};
    color: ${props => props.color ? props.color : props.theme.colors.gray};
`

interface StyledInputContainerProps {
    color?: string
}

const StyledInputContainer = styled.div<StyledInputContainerProps>`
    display: flex;
    flex-direction: column;
    padding: 12px 18px;
    border: 1px solid ${(props) => props.color ? props.color : props.theme.colors.darkenedBg};
	border-radius: 10px;
`

const StyledCurrencyInput = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const StyledInput = styled.input`
    background-color: transparent;
    height: 42px;
    padding: 0px;
    color: ${props => props.theme.colors.white};
    -webkit-appearance: none;
    -moz-appearance: textfield;
    font-weight: 600;
    font-size: ${props => props.theme.sizes.h1}px;
    outline: none;
    text-align: right;
    width: 100%;
    border: none;
`

const StyledAddressInput = styled.input`
    background-color: transparent;
    height: 42px;
    padding: 0px;
    font-weight: 500;
    font-family: 'Inter';
    color: ${props => props.theme.colors.lightText};
    -webkit-appearance: none;
    -moz-appearance: textfield;
    font-size: ${props => props.theme.sizes.callout}px;
    outline: none;
    text-align: left;
    width: 100%;
    border: none;
`

interface StyledRowContainerProps {
    marginTop?: string
}

const StyledRowContainer = styled.div<StyledRowContainerProps>`
    margin-top: ${props => props.marginTop ? props.marginTop : 0};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`

const StyledAddressContainer = styled.div`
	background: rgb(18, 39, 53, 0.7);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	padding: 18px;
	border: 1px solid ${(props) => props.theme.colors.darkenedBg};
	border-top: 0;
	border-radius: 10px;
`

const StyledButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
`

const StyledAddressTitle = styled.p`
	margin: 0;
	color: ${props => props.theme.colors.gray};
	font-size: ${props => props.theme.sizes.footnote}px;
`

const StyledAddress = styled.p`
	margin: 0;
	color: ${props => props.theme.colors.gray};
	font-size: ${props => props.theme.sizes.footnote}px;
`

const StyledDropdown = styled.div`
    position: relative;
    top: -10px;
    left: 20px;
    
    ul {
        background: white;
        position: absolute;
        z-index: 2;
        min-width: 120px;
        border-radius: 3px;
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    li:hover {
        background-color: rgba(232, 232, 233, 0.4);
        cursor: pointer;
    }

    li:last-child {
        border-bottom: none;
    }
`

const StyledDropdownItem = styled.li`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 8px;
    border-bottom: 0.5px solid ${(props) => props.theme.colors.lightGray[1]};
`

const StyledGasTabs = styled.div`
	display: flex;
    flex-direction: row;
    justify-content: center;
	text-transform: uppercase;
	padding: 0;
	margin-bottom: 20px;
`

interface StyledCurrencyTextProps {
    marginLeft?: string;
}

const StyledCurrencyText = styled.p<StyledCurrencyTextProps>`
    margin: 0;
    margin-left: ${(props) => props.marginLeft ? props.marginLeft : '7px'};
    text-align: left;
`

const mapStateToProps = (state: RootState) => state.sendForm;

export default connect(mapStateToProps)(SendModal);
