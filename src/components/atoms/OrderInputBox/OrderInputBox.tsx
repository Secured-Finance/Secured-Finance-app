import { BigNumber } from 'ethers';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { CurrencySymbol, getCurrencyMapAsList } from 'src/utils';

interface OrderInputBoxProps {
    field: string;
    unit: string;
    initialValue?: string;
    asset?: CurrencySymbol;
    disabled?: boolean;
    onValueChange?: (v: number | BigNumber) => void;
}

export const OrderInputBox = ({
    field = '',
    unit = '',
    initialValue = '',
    asset,
    disabled = false,
    onValueChange,
}: OrderInputBoxProps) => {
    const [inputValue, setInputValue] = useState(initialValue);

    const amountFormatterMap = useMemo(
        () =>
            getCurrencyMapAsList().reduce<
                Record<CurrencySymbol, (value: number) => BigNumber>
            >(
                (acc, ccy) => ({
                    ...acc,
                    [ccy.symbol]: ccy.toBaseUnit,
                }),
                {} as Record<CurrencySymbol, (value: number) => BigNumber>
            ),
        []
    );

    const handleInputChange = useCallback(
        (
            amount: number,
            asset: CurrencySymbol | undefined,
            onValueChange: (v: number | BigNumber) => void
        ) => {
            let format = (x: number) => BigNumber.from(x);
            if (asset && amountFormatterMap && amountFormatterMap[asset]) {
                format = amountFormatterMap[asset];
            }
            asset ? onValueChange(format(amount)) : onValueChange(amount);
        },
        [amountFormatterMap]
    );

    const handleAmountChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const maybeNumber = e.target.value;
            const amount =
                isNaN(+maybeNumber) || maybeNumber === '' ? -1 : +maybeNumber;
            setInputValue(amount === -1 ? '' : maybeNumber);
            if (onValueChange) {
                handleInputChange(amount, asset, onValueChange);
            }
        },
        [onValueChange, handleInputChange, asset]
    );

    return (
        <div className='typography-caption flex h-10 w-full flex-row items-center justify-between rounded-lg bg-black-20 py-2 pl-2 pr-4 text-white'>
            <div className='text-neutral-5'>{field}</div>
            <div className='flex flex-row gap-[10px]'>
                {!disabled ? (
                    <input
                        type='text'
                        placeholder='0'
                        value={inputValue}
                        onChange={handleAmountChange}
                        className='bg-transparent text-right text-neutral-8 focus:outline-none'
                    />
                ) : (
                    <span className='bg-transparent text-right text-neutral-8 focus:outline-none'>
                        {initialValue}
                    </span>
                )}
                <div className='text-neutral-4'>{unit}</div>
            </div>
        </div>
    );
};
