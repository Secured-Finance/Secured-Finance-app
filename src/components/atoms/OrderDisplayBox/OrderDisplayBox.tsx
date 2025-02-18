import clsx from 'clsx';
import { InfoToolTip } from 'src/components/molecules';
interface OrderDisplayBoxProps {
    field: string;
    value: number | string;
    className?: string;
    informationText?: React.ReactNode;
}

export const OrderDisplayBox = ({
    field,
    value,
    className,
    informationText,
}: OrderDisplayBoxProps) => {
    return (
        <div
            className={clsx(
                'laptop:typography-desktop-body-4 flex w-full flex-row items-center justify-between bg-transparent px-2 text-xs leading-4',
                className
            )}
        >
            <div className='flex flex-row items-center gap-2'>
                <span className='text-neutral-400'>{field}</span>
                {informationText && (
                    <InfoToolTip iconSize='small' placement='bottom-start'>
                        {informationText}
                    </InfoToolTip>
                )}
            </div>
            <div className='text-right text-planetaryPurple'>{value}</div>
        </div>
    );
};
