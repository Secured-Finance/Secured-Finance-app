import { RadioGroup } from '@headlessui/react';
import { SubTab } from 'src/components/atoms';

export const SubtabGroup = ({
    options,
    selectedOption,
    handleClick,
}: {
    options: string[];
    selectedOption: string;
    handleClick: (option: string) => void;
}) => {
    return (
        <RadioGroup
            value={selectedOption}
            onChange={handleClick}
            as='div'
            className='flex flex-row items-center gap-1 rounded-lg bg-tabBg p-1.5 laptop:gap-2 laptop:p-2'
        >
            {options.map((option, index) => (
                <RadioGroup.Option
                    key={`${option}-${index}`}
                    value={option}
                    className='h-full flex-1'
                    as='button'
                >
                    {({ checked }) => <SubTab text={option} active={checked} />}
                </RadioGroup.Option>
            ))}
        </RadioGroup>
    );
};
