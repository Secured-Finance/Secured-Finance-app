import { useCallback, useMemo, useState } from 'react';
import { InputBase, SizeDependentStylesConfig } from 'src/components/atoms';
import { PercentageSelector } from 'src/components/molecules';
import {
    CurrencySymbol,
    Maturity,
    amountFormatterFromBase,
    convertZCTokenFromBaseAmount,
    convertZCTokenToBaseAmount,
    usdFormat,
} from 'src/utils';

interface ZCTokenInputProps {
    price: number;
    availableTokenAmount: bigint;
    availableAmount?: bigint;
    onAmountChange?: (v: bigint | undefined) => void;
    symbol: CurrencySymbol;
    amount: bigint | undefined;
    maturity?: Maturity;
}

export const ZCTokenInput = ({
    price,
    availableTokenAmount,
    availableAmount,
    onAmountChange,
    symbol,
    amount,
    maturity,
}: ZCTokenInputProps) => {
    const [inputValue, setInputValue] = useState<string | undefined>();

    const handleAmountChange = useCallback(
        (inputAmount: string | undefined) => {
            if (
                amount !== undefined &&
                amount !== BigInt(0) &&
                Number(inputAmount) ===
                    Math.round(
                        convertZCTokenFromBaseAmount(symbol, amount, maturity) *
                            10000
                    ) /
                        10000.0
            ) {
                return;
            }

            setInputValue(inputAmount);

            if (onAmountChange) {
                onAmountChange(
                    convertZCTokenToBaseAmount(
                        symbol,
                        Number(inputAmount),
                        maturity
                    )
                );
            }
        },
        [amount, maturity, onAmountChange, symbol]
    );

    const handleClick = useCallback(
        (percentage: bigint) => {
            const amount =
                percentage === BigInt(1)
                    ? availableTokenAmount
                    : (percentage * availableTokenAmount) / BigInt(100);

            setInputValue(
                amount
                    ? Number(
                          convertZCTokenFromBaseAmount(
                              symbol,
                              amount,
                              maturity
                          ).toFixed(4)
                      ).toString()
                    : undefined
            );

            if (onAmountChange) {
                onAmountChange(amount);
            }
        },
        [availableTokenAmount, maturity, onAmountChange, symbol]
    );

    const totalPrice = useMemo(() => {
        if (amount && availableAmount && availableTokenAmount) {
            const baseAmount =
                (amount * availableAmount) / availableTokenAmount;
            return price * amountFormatterFromBase[symbol](baseAmount);
        } else {
            return 0;
        }
    }, [amount, availableAmount, availableTokenAmount, price, symbol]);

    return (
        <div className='flex w-full flex-col items-center'>
            <span className='typography-caption flex h-6 text-center text-secondary7'>
                Amount
            </span>
            <div className='flex h-full flex-1 flex-col items-center gap-1 pb-5'>
                <InputBase
                    value={inputValue}
                    className='typography-headline-4 h-14 w-full text-center text-neutral-8'
                    onValueChange={handleAmountChange}
                    sizeDependentStyles={fontSize}
                />
                {!!availableAmount && (
                    <div className='typography-body-2'>
                        <span className='text-center text-neutral-8'>
                            {usdFormat(totalPrice, 2)}
                        </span>
                        <span className='pl-2 text-center text-neutral-4'>
                            USD
                        </span>
                    </div>
                )}
            </div>
            <PercentageSelector
                onClick={percentage => handleClick(BigInt(percentage * 100))}
            ></PercentageSelector>
        </div>
    );
};

const fontSize: SizeDependentStylesConfig = {
    shortText: { maxChar: 12, styles: 'text-3xl' },
    mediumText: { maxChar: 15, styles: 'text-2xl' },
    longText: { maxChar: Infinity, styles: 'text-xl' },
};
