import { useCrosschainAddressById } from '@secured-finance/sf-graph-client/dist/hooks';
import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, Container, RenderTerms, Spacer } from 'src/components/atoms';
import { SendModal } from 'src/components/organisms';
import { Page } from 'src/components/templates';
import useCollateralBook from 'src/hooks/useCollateralBook';
import { useLoanInformation } from 'src/hooks/useLoanHistory';
import useModal from 'src/hooks/useModal';
import { CrossChainWallet } from 'src/services/filecoin';
import { RootState } from 'src/store/types';
import theme from 'src/theme';
import {
    AddressUtils,
    DEFAULT_COLLATERAL_VAULT,
    formatDate,
    getDisplayBalance,
    ordinaryFormat,
    percentFormat,
} from 'src/utils';
import { Currency, currencyList, getCurrencyBy } from 'src/utils/currencyList';
import styled from 'styled-components';
import { useWallet } from 'use-wallet';
import { NextCouponPaymentCard } from '../../components/organisms/Loan/NextCouponPaymentCard';

export interface CouponPayment {
    amount: number;
    id: number | string;
    isDone: boolean;
    notice: number;
    payment: number;
    txHash: string;
    __typename?: string;
}

const LoanScreen = () => {
    const params = useParams();
    const loan = useLoanInformation(params.loanId);

    const { account } = useWallet();
    const [couponPayment, setCouponPayment] = useState<CouponPayment>();
    const [counterpartyAddr, setCounterpartyAddr] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const filPrice = useSelector(
        (state: RootState) => state.assetPrices.filecoin.price
    );
    const colBook = useCollateralBook(
        counterpartyAddr ? counterpartyAddr : '',
        DEFAULT_COLLATERAL_VAULT
    );

    const counterPartyWallet = useMemo(() => {
        if (account && loan) {
            if (loan.lender === account.toLowerCase()) {
                return loan.borrower;
            } else {
                return loan.lender;
            }
        }
        return '';
    }, [account, loan]);

    const loanCurrency = useMemo(() => {
        if (loan?.currency) {
            return getCurrencyBy('shortName', loan.currency.shortName);
        } else {
            // we should never be in this condition, but just in case.
            // TODO: manage global error with a component and display it to the user
            return currencyList[1];
        }
    }, [loan]);

    const counterpartyFilWallet = useCrosschainAddressById(
        counterPartyWallet,
        loanCurrency.chainId
    ) as CrossChainWallet;

    const [onPresentSendModal] = useModal(
        <SendModal
            currencyInfo={loanCurrency}
            toAddress={recipientAddress}
            amount={loan?.notional}
        />
    );

    const handleNotional = () => {
        return ordinaryFormat(loan?.notional) + ` ${loanCurrency.shortName}`;
    };

    const handleInterest = () => {
        const interestPayments = totalInterest(
            loan?.notional,
            loan?.rate,
            loan?.term
        );
        return ordinaryFormat(interestPayments) + ` ${loanCurrency.shortName}`;
    };

    const totalInterest = (amount: number, rate: number, term: string) => {
        let periods: number;
        const interestRate = new BigNumber(rate).dividedBy(10000).toNumber();
        switch (term) {
            case '90':
                periods = 0.25;
                break;
            case '180':
                periods = 0.5;
                break;
            case '365':
                periods = 1;
                break;
            case '730':
                periods = 2;
                break;
            case '1095':
                periods = 3;
                break;
            case '1825':
                periods = 5;
                break;
            default:
                break;
        }
        const interestPayments = new BigNumber(amount)
            .multipliedBy(interestRate)
            .multipliedBy(periods)
            .toNumber();
        return interestPayments;
    };

    const handleTotalRepay = () => {
        const interestPayments = totalInterest(
            loan?.notional,
            loan?.rate,
            loan?.term
        );
        const totalRepay = new BigNumber(loan?.notional)
            .plus(interestPayments)
            .toNumber();

        return ordinaryFormat(totalRepay) + ` ${loanCurrency.shortName}`;
    };

    const nextCouponPayment = useCallback(() => {
        const payment: Array<CouponPayment> =
            loan?.schedule.payments?.filter((payment: { isDone: boolean }) => {
                return payment.isDone === false;
            }) || [];
        setCouponPayment(payment[0]);
    }, [loan]);

    useEffect(() => {
        if (loan != null) {
            setCounterpartyAddr(counterPartyWallet);
            nextCouponPayment();
            if (
                counterpartyFilWallet &&
                loan?.currency &&
                loanCurrency.shortName === Currency.FIL
            ) {
                setRecipientAddress(counterpartyFilWallet.address);
            } else {
                setRecipientAddress(counterPartyWallet);
            }
        }
    }, [
        setCouponPayment,
        setCounterpartyAddr,
        loan,
        account,
        nextCouponPayment,
        counterpartyAddr,
        counterPartyWallet,
        counterpartyFilWallet,
        loanCurrency,
    ]);

    return (
        <Page background={theme.colors.background}>
            <Container>
                <StyledPortfolioBalance>
                    <StyledTitle>Loan Agreement Details</StyledTitle>
                </StyledPortfolioBalance>
                <StyledInfoContainer>
                    <StyledColumn>
                        <StyledSubcontainer>
                            <StyledLabelContainer>
                                <StyledLabelTitle textTransform={'capitalize'}>
                                    Loan Information
                                </StyledLabelTitle>
                            </StyledLabelContainer>
                            <StyledItemContainer background={'none'}>
                                <StyledRowContainer>
                                    <StyledItemText>
                                        Principal notional
                                    </StyledItemText>
                                    <StyledItemText>
                                        {handleNotional()}
                                    </StyledItemText>
                                </StyledRowContainer>
                                <StyledRowContainer marginTop={'10px'}>
                                    <StyledItemText>Start Date</StyledItemText>
                                    <StyledItemText>
                                        {formatDate(loan?.startTimestamp)}
                                    </StyledItemText>
                                </StyledRowContainer>
                                <StyledRowContainer marginTop={'10px'}>
                                    <StyledItemText>
                                        Maturity Date
                                    </StyledItemText>
                                    <StyledItemText>
                                        {formatDate(loan?.endTimestamp)}
                                    </StyledItemText>
                                </StyledRowContainer>
                                <StyledRowContainer marginTop={'10px'}>
                                    <StyledItemText>Term</StyledItemText>
                                    <StyledItemText>
                                        <RenderTerms index={loan?.term} />
                                    </StyledItemText>
                                </StyledRowContainer>
                                <StyledRowContainer marginTop={'10px'}>
                                    <StyledItemText>
                                        Interest Rate
                                    </StyledItemText>
                                    <StyledItemText>
                                        {percentFormat(loan?.rate, 10000)}
                                    </StyledItemText>
                                </StyledRowContainer>
                                <StyledRowContainer marginTop={'10px'}>
                                    <StyledItemText>
                                        Daily Interest Rate
                                    </StyledItemText>
                                    <StyledItemText>
                                        {percentFormat(loan?.rate, 3650000)}
                                    </StyledItemText>
                                </StyledRowContainer>
                                <StyledRowContainer marginTop={'10px'}>
                                    <StyledItemText>
                                        Estimated Interest
                                    </StyledItemText>
                                    <StyledItemText>
                                        {handleInterest()}
                                    </StyledItemText>
                                </StyledRowContainer>
                                <StyledRowContainer marginTop={'10px'}>
                                    <StyledItemText>Total Debt</StyledItemText>
                                    <StyledItemText>
                                        {handleTotalRepay()}
                                    </StyledItemText>
                                </StyledRowContainer>
                            </StyledItemContainer>
                        </StyledSubcontainer>
                        <StyledSubcontainer marginBottom={'0px'}>
                            <StyledLabelTitle textTransform={'capitalize'}>
                                Payment Schedule
                            </StyledLabelTitle>
                            <StyledItemContainer
                                marginBottom={'0px'}
                                background={'none'}
                            >
                                {loan?.schedule.payments?.map(
                                    (item: CouponPayment, i: number) => (
                                        <StyledRowContainer
                                            key={i}
                                            marginTop={'10px'}
                                        >
                                            <StyledItemText>
                                                {formatDate(item.payment)}
                                            </StyledItemText>
                                            <StyledItemText>
                                                {ordinaryFormat(item.amount) +
                                                    ` ${loanCurrency.shortName}`}
                                            </StyledItemText>
                                        </StyledRowContainer>
                                    )
                                )}
                                <Button
                                    // onClick={handleLendOut}
                                    text={'Request Early Termination'}
                                    style={{
                                        marginTop: 15,
                                        background: 'transparent',
                                        fontSize: theme.sizes.callout,
                                        fontWeight: 500,
                                        color: theme.colors.white,
                                        borderColor: theme.colors.buttonBlue,
                                        borderBottom: theme.colors.buttonBlue,
                                    }}
                                    // disabled={!(notional > 0)}
                                />
                            </StyledItemContainer>
                        </StyledSubcontainer>
                    </StyledColumn>
                    <Spacer size='lg' />
                    <StyledColumn>
                        <NextCouponPaymentCard
                            onClick={onPresentSendModal}
                            couponPayment={couponPayment}
                            currency={loanCurrency.shortName}
                            filPrice={filPrice}
                        ></NextCouponPaymentCard>
                        {colBook.vault !== '' ? (
                            <CounterpartyContainer>
                                <StyledSubcontainer>
                                    <StyledLabelTitle
                                        textTransform={'capitalize'}
                                    >
                                        Counterparty Information
                                    </StyledLabelTitle>
                                    <StyledItemContainer marginBottom={'0px'}>
                                        <StyledRowContainer>
                                            <StyledItemText>
                                                ETH Address
                                            </StyledItemText>
                                            <StyledItemText>
                                                {AddressUtils.format(
                                                    counterpartyAddr,
                                                    20
                                                )}
                                            </StyledItemText>
                                        </StyledRowContainer>
                                        <StyledRowContainer marginTop={'10px'}>
                                            <StyledItemText>
                                                Collateral amount
                                            </StyledItemText>
                                            <StyledItemText>
                                                {getDisplayBalance(
                                                    new BigNumber(
                                                        colBook.collateral.toString()
                                                    )
                                                ) + ' ETH'}
                                            </StyledItemText>
                                        </StyledRowContainer>
                                        {/* <StyledRowContainer marginTop={"10px"}>
                                    <StyledItemText>Coverage</StyledItemText>
                                    <StyledItemText>
                                        {percentFormat(colBook[0].coverage)}
                                    </StyledItemText>
                                </StyledRowContainer> */}
                                        {/* <StyledRowContainer marginTop={"10px"}>
                                    <StyledItemText>{fromBytes32(loan?.currency)} Address</StyledItemText>
                                    <StyledItemText>
                                        {formatAddress(colBook[0].filAddr, 24)}
                                    </StyledItemText>
                                </StyledRowContainer> */}
                                    </StyledItemContainer>
                                </StyledSubcontainer>
                            </CounterpartyContainer>
                        ) : null}
                    </StyledColumn>
                </StyledInfoContainer>
            </Container>
        </Page>
    );
};

interface StyledSubcontainerProps {
    marginBottom?: string;
}

const StyledSubcontainer = styled.div<StyledSubcontainerProps>`
    margin-bottom: ${props => (props.marginBottom ? props.marginBottom : 30)}px;
`;

const CounterpartyContainer = styled.div``;

interface StyledLabelProps {
    textTransform?: string;
    fontWeight?: number;
    fontSize?: number;
    marginBottom?: number;
}

interface TitleProps {
    fontWeight?: number;
    marginBottom?: number;
}

const StyledColumn = styled.div`
    flex: 1;
`;

const StyledTitle = styled.p<TitleProps>`
    font-style: normal;
    font-weight: ${props => (props.fontWeight ? props.fontWeight : 400)};
    font-size: ${props => props.theme.sizes.h1}px;
    color: ${props => props.theme.colors.white};
    margin: 0px;
    margin-bottom: ${props => (props.marginBottom ? props.marginBottom : 0)}px;
`;

const StyledPortfolioBalance = styled.div`
    display: flex;
    flex-direction: column;
    // justify-content: space-between;
    // align-items: center;
    padding-top: 59px;
    padding-left: 175px;
    padding-right: 175px;
`;

const StyledInfoContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    // justify-content: space-between;
    // align-items: center;
    padding-top: 38px;
    padding-bottom: 51px;
    padding-left: 175px;
    padding-right: 175px;
`;

const StyledLabelContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const StyledLabelTitle = styled.div<StyledLabelProps>`
    text-transform: ${props =>
        props.textTransform ? props.textTransform : 'uppercase'};
    font-size: ${props =>
        props.fontSize ? props.fontSize : props.theme.sizes.callout}px;
    margin-bottom: ${props => (props.marginBottom ? props.marginBottom : 15)}px;
    margin-top: 0px;
    font-weight: ${props => (props.fontWeight ? props.fontWeight : 500)};
    color: ${props => (props.color ? props.color : props.theme.colors.white)};
`;

interface StyledRowContainerProps {
    marginTop?: string;
}

const StyledRowContainer = styled.div<StyledRowContainerProps>`
    margin-top: ${props => (props.marginTop ? props.marginTop : 0)};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

interface StyledAddressContainerProps {
    marginBottom?: string;
    background?: string;
}

const StyledItemContainer = styled.div<StyledAddressContainerProps>`
    background: ${props =>
        props.background ? props.background : 'rgb(18, 39, 53, 0.7)'};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border: 1px solid ${props => props.theme.colors.darkenedBg};
    border-radius: 3px;
    margin-bottom: ${props =>
        props.marginBottom ? props.marginBottom : '20px'};

    div:first-child {
        margin-top: 0px;
    }
`;

interface StyledItemTextProps {
    fontSize?: number;
    color?: string;
    opacity?: number;
    fontWeight?: number;
}

const StyledItemText = styled.p<StyledItemTextProps>`
    margin: 0;
    color: ${props => (props.color ? props.color : props.theme.colors.white)};
    font-size: ${props =>
        props.fontSize ? props.fontSize : props.theme.sizes.subhead}px;
    opacity: ${props => (props.opacity ? props.opacity : 1)};
    font-weight: ${props => (props.fontWeight ? props.fontWeight : 400)};
    letter-spacing: 0.03em;
`;

export default LoanScreen;
