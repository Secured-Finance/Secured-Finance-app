import { WalletSource } from '@secured-finance/sf-client';
import { fromBytes32, toBytes32 } from '@secured-finance/sf-graph-client';
import EthIcon from 'src/assets/coins/eth2.svg';
import WfilIcon from 'src/assets/coins/fil.svg';
import UsdcIcon from 'src/assets/coins/usdc.svg';
import WrappedBitcoinIcon from 'src/assets/coins/wbtc.svg';
import SFLogoSmall from 'src/assets/img/logo-small.svg';
import MetamaskIcon from 'src/assets/img/metamask-fox.svg';
import { Option, WalletSourceOption } from 'src/components/atoms';
import { CurrencyOption, ZCBond } from 'src/components/molecules';
import { CollateralBook, Order, Position } from 'src/hooks';
import {
    DailyVolumes,
    MaturityOptionList,
    OrderHistoryList,
    OrderType,
    TransactionHistoryList,
    TransactionList,
} from 'src/types';
import {
    CurrencySymbol,
    Maturity,
    Rate,
    createCurrencyMap,
    getMappedOrderStatus,
    usdFormat,
} from 'src/utils';

export const wfilBytes32 = toBytes32('WFIL'); // 0x5746494c0000000000000000000000000000000000000000000000000000000000
export const ethBytes32 = toBytes32('ETH'); // 0x455448000000000000000000000000000000000000000000000000000000000
export const wbtcBytes32 = toBytes32('WBTC'); // 0x5742544300000000000000000000000000000000000000000000000000000000
export const usdcBytes32 = toBytes32('USDC'); // 0x5553444300000000000000000000000000000000000000000000000000000000
export const ifilBytes32 = toBytes32('iFIL'); // 0x6946494c00000000000000000000000000000000000000000000000000000000

export const assetPriceMap = createCurrencyMap<number>(0);
assetPriceMap.WFIL = 6.0;
assetPriceMap.ETH = 2000.34;
assetPriceMap.USDC = 1.0;
assetPriceMap.WBTC = 50000.0;
assetPriceMap.aUSDC = 1.0;
assetPriceMap.axlFIL = 6.0;

export const preloadedBalance = {
    wallet: {
        balance: 10,
        address: '',
    },
};

const sep22Fixture = new Maturity(1661990400);
export const dec22Fixture = new Maturity(1669852800);
export const mar23Fixture = new Maturity(1677628800);
export const jun23Fixture = new Maturity(1685577600);
export const sep23Fixture = new Maturity(1693526400);
const dec23Fixture = new Maturity(1701388800);
const mar24Fixture = new Maturity(1709251200);
const jun24Fixture = new Maturity(1717200000);
const sep24Fixture = new Maturity(1725148800);
export const dec24Fixture = new Maturity(1733011200);

const openingDateTimestamp = 1638316800;
const openingDate = BigInt(openingDateTimestamp);
const preOpeningDateTimestamp = 1637712000;
const preOpeningDate = BigInt(preOpeningDateTimestamp);

export const maturitiesMockFromContract = (ccy: string) => [
    {
        name: 'DEC2022',
        maturity: BigInt(dec22Fixture.toString()),
        openingDate: openingDate,
        marketUnitPrice: BigInt('9801'),
        openingUnitPrice: BigInt('9710'),
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9685'),
        bestLendUnitPrice: BigInt('9687'),
        minBorrowUnitPrice: BigInt('9672'),
        maxLendUnitPrice: BigInt('9700'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: preOpeningDate,
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
    {
        name: 'MAR2023',
        maturity: BigInt(mar23Fixture.toString()),
        openingDate: openingDate,
        marketUnitPrice: BigInt('9701'),
        openingUnitPrice: BigInt('9710'),
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9683'),
        bestLendUnitPrice: BigInt('9685'),
        minBorrowUnitPrice: BigInt('9670'),
        maxLendUnitPrice: BigInt('9698'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: preOpeningDate,
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
    {
        name: 'JUN2023',
        maturity: BigInt(jun23Fixture.toString()),
        openingDate: openingDate,
        marketUnitPrice: BigInt('9601'),
        openingUnitPrice: BigInt('9710'),
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9677'),
        bestLendUnitPrice: BigInt('9679'),
        minBorrowUnitPrice: BigInt('9664'),
        maxLendUnitPrice: BigInt('9692'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: preOpeningDate,
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
    {
        name: 'SEP2023',
        maturity: BigInt(sep23Fixture.toString()),
        openingDate: openingDate,
        marketUnitPrice: BigInt('9501'),
        openingUnitPrice: BigInt('9710'),
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9672'),
        bestLendUnitPrice: BigInt('9674'),
        minBorrowUnitPrice: BigInt('9659'),
        maxLendUnitPrice: BigInt('9687'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: preOpeningDate,
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
    {
        name: 'DEC2023',
        maturity: BigInt(dec23Fixture.toString()),
        openingDate: openingDate,
        marketUnitPrice: BigInt('9401'),
        openingUnitPrice: BigInt('9710'),
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9651'),
        bestLendUnitPrice: BigInt('9653'),
        minBorrowUnitPrice: BigInt('9638'),
        maxLendUnitPrice: BigInt('9666'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: preOpeningDate,
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
    {
        name: 'MAR2024',
        maturity: BigInt(mar24Fixture.toString()),
        openingDate: openingDate,
        marketUnitPrice: BigInt('9301'),
        openingUnitPrice: BigInt('9710'),
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9641'),
        bestLendUnitPrice: BigInt('9643'),
        minBorrowUnitPrice: BigInt('9628'),
        maxLendUnitPrice: BigInt('9656'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: preOpeningDate,
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
    {
        name: 'JUN2024',
        maturity: BigInt(jun24Fixture.toString()),
        openingDate: openingDate,
        marketUnitPrice: BigInt('9201'),
        openingUnitPrice: BigInt('9710'),
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9625'),
        bestLendUnitPrice: BigInt('9627'),
        minBorrowUnitPrice: BigInt('9612'),
        maxLendUnitPrice: BigInt('9640'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: preOpeningDate,
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
    {
        name: 'SEP2024',
        maturity: BigInt(sep24Fixture.toString()),
        openingDate: openingDate,
        marketUnitPrice: BigInt('9101'),
        openingUnitPrice: BigInt('9710'),
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9615'),
        bestLendUnitPrice: BigInt('9617'),
        minBorrowUnitPrice: BigInt('9602'),
        maxLendUnitPrice: BigInt('9630'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: preOpeningDate,
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
    {
        name: 'DEC2024',
        maturity: BigInt(dec24Fixture.toString()),
        openingDate: BigInt('1685577600'),
        marketUnitPrice: BigInt('9001'),
        openingUnitPrice: BigInt('9710'),
        isReady: false,
        isOpened: false,
        isMatured: false,
        isPreOrderPeriod: true,
        isItayosePeriod: false,
        bestBorrowUnitPrice: BigInt('9615'),
        bestLendUnitPrice: BigInt('9617'),
        minBorrowUnitPrice: BigInt('9602'),
        maxLendUnitPrice: BigInt('9630'),
        currentMinDebtUnitPrice: BigInt('9500'),
        ccy,
        preOpeningDate: BigInt(1684972800),
        lastBlockUnitPriceTimestamp: BigInt(1646920200),
    },
];

export const maturities = {
    [dec22Fixture.toNumber()]: {
        name: 'DEC2022',
        maturity: dec22Fixture.toNumber(),
        isActive: true,
        utcOpeningDate: openingDateTimestamp,
        marketUnitPrice: 9801,
        preOpeningDate: preOpeningDateTimestamp,
        openingUnitPrice: 9710,
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9685,
        bestLendUnitPrice: 9687,
        minBorrowUnitPrice: 9672,
        maxLendUnitPrice: 9700,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
    [mar23Fixture.toNumber()]: {
        name: 'MAR2023',
        maturity: mar23Fixture.toNumber(),
        isActive: true,
        utcOpeningDate: openingDateTimestamp,
        marketUnitPrice: 9701,
        preOpeningDate: preOpeningDateTimestamp,
        openingUnitPrice: 9710,
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9683,
        bestLendUnitPrice: 9685,
        minBorrowUnitPrice: 9670,
        maxLendUnitPrice: 9698,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
    [jun23Fixture.toNumber()]: {
        name: 'JUN2023',
        maturity: jun23Fixture.toNumber(),
        isActive: true,
        utcOpeningDate: openingDateTimestamp,
        marketUnitPrice: 9601,
        preOpeningDate: preOpeningDateTimestamp,
        openingUnitPrice: 9710,
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9677,
        bestLendUnitPrice: 9679,
        minBorrowUnitPrice: 9664,
        maxLendUnitPrice: 9692,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
    [sep23Fixture.toNumber()]: {
        name: 'SEP2023',
        maturity: sep23Fixture.toNumber(),
        isActive: true,
        utcOpeningDate: openingDateTimestamp,
        marketUnitPrice: 9501,
        preOpeningDate: preOpeningDateTimestamp,
        openingUnitPrice: 9710,
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9672,
        bestLendUnitPrice: 9674,
        minBorrowUnitPrice: 9659,
        maxLendUnitPrice: 9687,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
    [dec23Fixture.toNumber()]: {
        name: 'DEC2023',
        maturity: dec23Fixture.toNumber(),
        isActive: true,
        utcOpeningDate: openingDateTimestamp,
        marketUnitPrice: 9401,
        preOpeningDate: preOpeningDateTimestamp,
        openingUnitPrice: 9710,
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9651,
        bestLendUnitPrice: 9653,
        minBorrowUnitPrice: 9638,
        maxLendUnitPrice: 9666,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
    [mar24Fixture.toNumber()]: {
        name: 'MAR2024',
        maturity: mar24Fixture.toNumber(),
        isActive: true,
        utcOpeningDate: openingDateTimestamp,
        marketUnitPrice: 9301,
        preOpeningDate: preOpeningDateTimestamp,
        openingUnitPrice: 9710,
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9641,
        bestLendUnitPrice: 9643,
        minBorrowUnitPrice: 9628,
        maxLendUnitPrice: 9656,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
    [jun24Fixture.toNumber()]: {
        name: 'JUN2024',
        maturity: jun24Fixture.toNumber(),
        isActive: true,
        utcOpeningDate: openingDateTimestamp,
        marketUnitPrice: 9201,
        preOpeningDate: preOpeningDateTimestamp,
        openingUnitPrice: 9710,
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9625,
        bestLendUnitPrice: 9627,
        minBorrowUnitPrice: 9612,
        maxLendUnitPrice: 9640,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
    [sep24Fixture.toNumber()]: {
        name: 'SEP2024',
        maturity: sep24Fixture.toNumber(),
        isActive: true,
        utcOpeningDate: openingDateTimestamp,
        marketUnitPrice: 9101,
        preOpeningDate: preOpeningDateTimestamp,
        openingUnitPrice: 9710,
        isReady: true,
        isOpened: true,
        isMatured: false,
        isPreOrderPeriod: false,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9615,
        bestLendUnitPrice: 9617,
        minBorrowUnitPrice: 9602,
        maxLendUnitPrice: 9630,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
    [dec24Fixture.toNumber()]: {
        name: 'DEC2024',
        maturity: dec24Fixture.toNumber(),
        isActive: false,
        utcOpeningDate: 1685577600,
        marketUnitPrice: 9001,
        preOpeningDate: 1684972800,
        openingUnitPrice: 9710,
        isReady: false,
        isOpened: false,
        isMatured: false,
        isPreOrderPeriod: true,
        isItayosePeriod: false,
        bestBorrowUnitPrice: 9615,
        bestLendUnitPrice: 9617,
        minBorrowUnitPrice: 9602,
        maxLendUnitPrice: 9630,
        currentMinDebtUnitPrice: 9500,
        lastBlockUnitPriceTimestamp: 1646920200,
    },
};

export const maturityOptions: MaturityOptionList = [
    { label: 'DEC2022', value: dec22Fixture },
    { label: 'MAR2023', value: mar23Fixture },
    { label: 'JUN2023', value: jun23Fixture },
    { label: 'SEP2023', value: sep23Fixture },
    { label: 'DEC2023', value: dec23Fixture },
    { label: 'MAR2024', value: mar24Fixture },
    { label: 'JUN2024', value: jun24Fixture },
    { label: 'SEP2024', value: sep24Fixture },
];

export const walletSourceList: WalletSourceOption[] = [
    {
        source: WalletSource.METAMASK,
        available: BigInt('100000000000'),
        asset: CurrencySymbol.WBTC,
        iconSVG: MetamaskIcon,
    },
    {
        source: WalletSource.SF_VAULT,
        available: BigInt('49200'),
        asset: CurrencySymbol.WBTC,
        iconSVG: SFLogoSmall,
    },
];

export const assetList = [
    {
        label: 'WBTC',
        iconSVG: WrappedBitcoinIcon,
        value: 'WBTC',
    },
    {
        label: 'ETH',
        iconSVG: EthIcon,
        value: 'ETH',
    },
    {
        label: 'WFIL',
        iconSVG: WfilIcon,
        value: 'WFIL',
    },
    {
        label: 'USDC',
        iconSVG: UsdcIcon,
        value: 'USDC',
    },
] as Array<Option>;

export const currencyList = [
    {
        label: 'WBTC',
        value: CurrencySymbol.WBTC,
    },
    {
        label: 'ETH',
        value: CurrencySymbol.ETH,
    },
    {
        label: 'WFIL',
        value: CurrencySymbol.WFIL,
    },
    {
        label: 'USDC',
        value: CurrencySymbol.USDC,
    },
] as Array<CurrencyOption>;

export const yieldCurveRates = [
    new Rate(37326),
    new Rate(37660),
    new Rate(38537),
    new Rate(39259),
    new Rate(42324),
    new Rate(43801),
    new Rate(46219),
    new Rate(47746),
];

export const activeOrders: Order[] = [
    {
        orderId: BigInt('1'),
        currency: wfilBytes32,
        side: 1,
        maturity: dec23Fixture.toString(),
        unitPrice: BigInt('9800'),
        amount: BigInt('1000000000000000000000'),
        createdAt: BigInt('1609299000'),
    },
    {
        orderId: BigInt('2'),
        currency: wfilBytes32,
        side: 1,
        maturity: mar23Fixture.toString(),
        unitPrice: BigInt('9600'),
        amount: BigInt('5000000000000000000000'),
        createdAt: BigInt('1609298000'),
    },
    {
        orderId: BigInt('3'),
        currency: wfilBytes32,
        side: 0,
        maturity: dec22Fixture.toString(),
        unitPrice: BigInt('9800'),
        amount: BigInt('1000000000'),
        createdAt: BigInt('1609297000'),
    },
    {
        orderId: BigInt('4'),
        currency: wbtcBytes32,
        side: 1,
        maturity: mar23Fixture.toString(),
        unitPrice: BigInt('9600'),
        amount: BigInt('5000000000000000000000'),
        createdAt: BigInt('1609296000'),
    },
    {
        orderId: BigInt('5'),
        currency: ethBytes32,
        side: 0,
        maturity: dec23Fixture.toString(),
        unitPrice: BigInt('9800'),
        amount: BigInt('1000000000'),
        createdAt: BigInt('1609295000'),
    },
];

export const orderHistoryList: OrderHistoryList = [
    {
        id: '0',
        orderId: 1,
        currency: wfilBytes32,
        side: 1,
        maturity: BigInt(dec22Fixture.toString()),
        inputUnitPrice: BigInt('9800'),
        filledAmount: BigInt('0'),
        inputAmount: BigInt('1000000000000000000000'),
        status: 'Open',
        type: OrderType.LIMIT,
        createdAt: BigInt('1609299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: true,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 2,
        currency: wfilBytes32,
        side: 1,
        maturity: BigInt(dec22Fixture.toString()),
        inputUnitPrice: BigInt('9600'),
        filledAmount: BigInt('0'),
        inputAmount: BigInt('5000000000000000000000'),
        status: 'Cancelled',
        type: OrderType.LIMIT,
        createdAt: BigInt('1605299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: true,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 1,
        currency: wbtcBytes32,
        side: 0,
        maturity: BigInt(dec22Fixture.toString()),
        inputUnitPrice: BigInt('9800'),
        filledAmount: BigInt('500000000'),
        inputAmount: BigInt('1000000000'),
        status: 'PartiallyFilled',
        type: OrderType.LIMIT,
        createdAt: BigInt('1600299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: true,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 1,
        currency: ethBytes32,
        side: 1,
        maturity: BigInt(mar23Fixture.toString()),
        inputUnitPrice: BigInt('9600'),
        filledAmount: BigInt('0'),
        inputAmount: BigInt('5000000000000000000000'),
        status: 'Killed',
        type: OrderType.MARKET,
        createdAt: BigInt('1689299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: true,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 1,
        currency: wfilBytes32,
        side: 1,
        maturity: BigInt(sep22Fixture.toString()),
        inputUnitPrice: BigInt('9800'),
        filledAmount: BigInt('1000000000000000000000'),
        inputAmount: BigInt('1000000000000000000000'),
        status: 'Filled',
        type: OrderType.LIMIT,
        createdAt: BigInt('1679299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: false,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 2,
        currency: ethBytes32,
        side: 1,
        maturity: BigInt(mar23Fixture.toString()),
        inputUnitPrice: BigInt('9600'),
        filledAmount: BigInt('0'),
        inputAmount: BigInt('100000000000000000'),
        status: 'Killed',
        type: OrderType.MARKET,
        createdAt: BigInt('1669299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: true,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: true,
    },
    {
        id: '0',
        orderId: 1,
        currency: wbtcBytes32,
        side: 0,
        maturity: BigInt(mar23Fixture.toString()),
        inputUnitPrice: BigInt('9800'),
        filledAmount: BigInt('500000000'),
        inputAmount: BigInt('1000000000'),
        status: 'Cancelled',
        type: OrderType.LIMIT,
        createdAt: BigInt('1659299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: true,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 1,
        currency: ethBytes32,
        side: 0,
        maturity: BigInt(dec22Fixture.toString()),
        inputUnitPrice: BigInt('9800'),
        filledAmount: BigInt('50000000000000000'),
        inputAmount: BigInt('500000000000000000'),
        status: 'Killed',
        type: OrderType.LIMIT,
        createdAt: BigInt('1649299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: true,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 3,
        currency: wfilBytes32,
        side: 1,
        maturity: BigInt(sep22Fixture.toString()),
        inputUnitPrice: BigInt('0'),
        filledAmount: BigInt('10000000000000000000'),
        inputAmount: BigInt('100000000000000000000'),
        status: 'Killed',
        type: OrderType.MARKET,
        createdAt: BigInt('1639299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: false,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: true,
    },
    {
        id: '0',
        orderId: 3,
        currency: wfilBytes32,
        side: 1,
        maturity: BigInt(dec22Fixture.toString()),
        inputUnitPrice: BigInt('9600'),
        filledAmount: BigInt('0'),
        inputAmount: BigInt('5000000000000000000000'),
        status: 'Open',
        type: OrderType.LIMIT,
        createdAt: BigInt('1629299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: false,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 5,
        currency: wfilBytes32,
        side: 1,
        maturity: BigInt(dec22Fixture.toString()),
        inputUnitPrice: BigInt('9800'),
        filledAmount: BigInt('10000000000000000000'),
        inputAmount: BigInt('100000000000000000000'),
        status: 'PartiallyFilled',
        type: OrderType.LIMIT,
        createdAt: BigInt('1619299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: false,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
    {
        id: '0',
        orderId: 6,
        currency: wfilBytes32,
        side: 1,
        maturity: BigInt(dec22Fixture.toString()),
        inputUnitPrice: BigInt('0'),
        filledAmount: BigInt('100000000000000000000'),
        inputAmount: BigInt('100000000000000000000'),
        status: 'Filled',
        type: OrderType.MARKET,
        createdAt: BigInt('1608299000'),
        txHash: toBytes32('hash'),
        lendingMarket: {
            id: '1',
            isActive: true,
        },
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
        isCircuitBreakerTriggered: false,
    },
];

export const mappedOrderHistoryList = orderHistoryList.map(order => {
    return {
        ...order,
        status: getMappedOrderStatus(order),
    };
});

export const transactions: TransactionHistoryList = [
    {
        id: '0',
        amount: '1000000000000000000000',
        averagePrice: '0.8000', // TODO: rework the unit in the graph. This is changed only for a dirty fix
        side: 0,
        executionPrice: '9800',
        createdAt: '1671859344',
        feeInFV: '3213742117859654893',
        futureValue: '1020000000000000000000',
        currency: wfilBytes32,
        maturity: jun23Fixture.toString(),
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
    },
    {
        id: '0',
        amount: '500000000000000000000',
        averagePrice: '0.8000', // TODO: rework the unit in the graph. This is changed only for a dirty fix
        side: 1,
        executionPrice: '9543',
        createdAt: '1671080520',
        feeInFV: '3213742117851700971',
        futureValue: '520000000000000000000',
        currency: wfilBytes32,
        maturity: jun23Fixture.toString(),
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
    },
    {
        id: '0',
        amount: '500000000000000000000',
        averagePrice: '0.8000', // TODO: rework the unit in the graph. This is changed only for a dirty fix
        side: 1,
        executionPrice: '9543',
        createdAt: '1671080520',
        feeInFV: '3213742117851708102',
        futureValue: '520000000000000000000',
        currency: wfilBytes32,
        maturity: mar23Fixture.toString(),
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
    },
    {
        id: '0',
        amount: '1000000000',
        averagePrice: '0.9000', // TODO: rework the unit in the graph. This is changed only for a dirty fix
        side: 1,
        executionPrice: '9700',
        createdAt: '1671427140',
        feeInFV: '400',
        futureValue: '1040000000',
        currency: wbtcBytes32,
        maturity: jun23Fixture.toString(),
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
    },
    {
        id: '0',
        amount: '500000000',
        averagePrice: '0.98', // TODO: rework the unit in the graph. This is changed only for a dirty fix
        side: 0,
        executionPrice: '9800',
        createdAt: '1609296986',
        feeInFV: '700',
        futureValue: '505000000',
        currency: wbtcBytes32,
        maturity: dec22Fixture.toString(),
        user: {
            id: '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D',
        },
    },
];

export const positions: Position[] = [
    {
        amount: BigInt('400000000000000000000'),
        currency: wfilBytes32,
        futureValue: BigInt('500000000000000000000'),
        maturity: jun23Fixture.toString(),
        marketPrice: BigInt(8000),
    },
    {
        amount: BigInt('-500000000000000000000'),
        currency: wfilBytes32,
        futureValue: BigInt('-1000000000000000000000'),
        maturity: mar23Fixture.toString(),
        marketPrice: BigInt(5000),
    },
    {
        amount: BigInt('0'),
        futureValue: BigInt('-1040000000'),
        currency: wbtcBytes32,
        maturity: jun23Fixture.toString(),
        marketPrice: BigInt(0),
    },
    {
        amount: BigInt('0'),
        futureValue: BigInt('505000000'),
        currency: wbtcBytes32,
        maturity: dec22Fixture.toString(),
        marketPrice: BigInt(0),
    },
];

export const collateralBook80: CollateralBook = {
    collateral: {
        ETH: BigInt('1000000000000000000'),
        USDC: BigInt('100000000'),
        WBTC: BigInt('20000000'),
    },
    nonCollateral: {
        WFIL: BigInt('100000000000000000000'),
    },
    usdCollateral: 12100.34,
    usdAvailableToBorrow: 0,
    usdNonCollateral: 600,
    coverage: 8000, // 80%,
    collateralThreshold: 80,
    withdrawableCollateral: {
        [CurrencySymbol.USDC]: BigInt(100000),
        [CurrencySymbol.ETH]: BigInt(100000),
        [CurrencySymbol.WBTC]: BigInt(100000),
    },
    totalPresentValue: 2500,
};

export const collateralBook37: CollateralBook = {
    collateral: {
        ETH: BigInt('1000000000000000000'),
        USDC: BigInt('100000000'),
        WBTC: BigInt('20000000'),
    },
    nonCollateral: {
        WFIL: BigInt('100000000000000000000'),
    },
    usdCollateral: 12100.34,
    usdAvailableToBorrow: 5203.1462,
    usdNonCollateral: 600,
    coverage: 3700, // 37%
    collateralThreshold: 80,
    withdrawableCollateral: {
        [CurrencySymbol.USDC]: BigInt(100000),
        [CurrencySymbol.ETH]: BigInt(100000),
        [CurrencySymbol.WBTC]: BigInt(100000),
    },
    totalPresentValue: 2500,
};

export const emptyUSDCollateral: CollateralBook = {
    collateral: {
        ETH: BigInt('0'),
        USDC: BigInt('0'),
        WBTC: BigInt('0'),
    },
    nonCollateral: {
        WFIL: BigInt('100000000000000000000'),
    },
    usdCollateral: 0,
    usdAvailableToBorrow: 0,
    usdNonCollateral: 600,
    coverage: 0, // 0%
    collateralThreshold: 80,
    withdrawableCollateral: {
        [CurrencySymbol.USDC]: BigInt(0),
        [CurrencySymbol.ETH]: BigInt(0),
        [CurrencySymbol.WBTC]: BigInt(0),
    },
    totalPresentValue: 0,
};

export const zcBonds: ZCBond[] = [
    {
        currency: CurrencySymbol.ETH,
        amount: BigInt('10000000000000000'),
        tokenAmount: BigInt('12340000000000000000000000'),
    },
    {
        currency: CurrencySymbol.ETH,
        maturity: dec22Fixture,
        amount: BigInt('1000000000000000000000'),
        tokenAmount: BigInt('1100000000000000000000'),
    },
    {
        currency: CurrencySymbol.USDC,
        maturity: dec22Fixture,
        amount: BigInt('200000000'),
        tokenAmount: BigInt('210000000'),
    },
    {
        currency: CurrencySymbol.WBTC,
        maturity: mar23Fixture,
        amount: BigInt('3000000'),
        tokenAmount: BigInt('3100000'),
    },
];

function generateDailyVolumes(days: number) {
    const volumes: DailyVolumes = [];
    for (let i = 0; i < days; i++) {
        for (const currency of [wfilBytes32, wbtcBytes32, ethBytes32]) {
            for (const maturity of [
                dec22Fixture,
                mar23Fixture,
                jun23Fixture,
                sep23Fixture,
                dec23Fixture,
            ])
                volumes.push({
                    id: `${fromBytes32(
                        currency
                    )}-${openingDateTimestamp}-2023-02-${i}`,
                    currency: wfilBytes32,
                    maturity: dec22Fixture,
                    day: `2023-02-${i}`,
                    timestamp: maturity.toString(),
                    volume: '30000000000000000000',
                });
        }
    }
    return volumes;
}

export const dailyVolumes: DailyVolumes = generateDailyVolumes(365 * 4);

export const tradesWFIL: TransactionList = [
    {
        amount: 100000000000,
        maturity: dec22Fixture,
        side: 0,
        createdAt: 1638356100,
        currency: wfilBytes32,
        averagePrice: 0.8,
        executionPrice: 8000,
        txHash: toBytes32('hash'),
    },
    {
        amount: 1000000000000,
        maturity: dec22Fixture,
        side: 1,
        createdAt: 1638355100,
        currency: wfilBytes32,
        averagePrice: 0.9,
        executionPrice: 9000,
        txHash: toBytes32('hash'),
    },
];

export const tradesETH: TransactionList = [
    {
        amount: 100000000000,
        maturity: dec22Fixture,
        side: 0,
        createdAt: 1638356100,
        currency: ethBytes32,
        averagePrice: 0.8,
        executionPrice: 8000,
        txHash: toBytes32('hash'),
    },
    {
        amount: 1000000000000,
        maturity: dec22Fixture,
        side: 1,
        createdAt: 1638355100,
        currency: ethBytes32,
        averagePrice: 0.9,
        executionPrice: 9000,
        txHash: toBytes32('hash'),
    },
];

export const tradesUSDC: TransactionList = [
    {
        amount: 100000000000,
        maturity: dec22Fixture,
        side: 0,
        createdAt: 1638356100,
        currency: usdcBytes32,
        averagePrice: 0.8,
        executionPrice: 8000,
        txHash: toBytes32('hash'),
    },
    {
        amount: 1000000000000,
        maturity: dec22Fixture,
        side: 1,
        createdAt: 1638355100,
        currency: usdcBytes32,
        averagePrice: 0.9,
        executionPrice: 9000,
        txHash: toBytes32('hash'),
    },
];

export const tradesWBTC: TransactionList = [
    {
        amount: 100000000000,
        maturity: dec22Fixture,
        side: 0,
        createdAt: 1638356100,
        currency: wbtcBytes32,
        averagePrice: 0.8,
        executionPrice: 8000,
        txHash: toBytes32('hash'),
    },
    {
        amount: 1000000000000,
        maturity: dec22Fixture,
        side: 1,
        createdAt: 1638355100,
        currency: wbtcBytes32,
        averagePrice: 0.9,
        executionPrice: 9000,
        txHash: toBytes32('hash'),
    },
];

export const preOpenOrders = [
    {
        orderId: BigInt('1'),
        currency: wfilBytes32,
        side: 1,
        maturity: dec23Fixture.toString(),
        unitPrice: BigInt('9800'),
        amount: BigInt('1000000000000000000000'),
        createdAt: BigInt('1609299000'),
        calculationDate: dec22Fixture.toNumber(),
    },
    {
        orderId: BigInt('2'),
        currency: wfilBytes32,
        side: 1,
        maturity: mar24Fixture.toString(),
        unitPrice: BigInt('9600'),
        amount: BigInt('5000000000000000000000'),
        createdAt: BigInt('1609298000'),
        calculationDate: mar23Fixture.toNumber(),
    },
];

export const volumePerMarket = {
    'WFIL-1669852800': 3942000,
    'USDC-1669852800': 30,
};

export const dailyMarketStats = {
    high: '98.99',
    low: '94.57',
    volume: '520 WFIL',
    volumeInUSD: usdFormat(1851),
};
