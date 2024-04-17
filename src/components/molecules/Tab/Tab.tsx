import { Tab as HeadlessTab } from '@headlessui/react';
import clsx from 'clsx';
import { Children, useState } from 'react';
import { NavTab } from 'src/components/atoms';

export type TabHighlight = {
    text: string;
    size: 'small' | 'large';
    visible: boolean;
};

export type TabData = {
    text: string;
    disabled?: boolean;
    highlight?: TabHighlight;
    util?: React.ReactNode;
    suffixIcon?: React.ReactNode;
};

interface TabProps {
    tabDataArray: TabData[];
    tabClassName?: string;
}

export const Tab: React.FC<TabProps> = ({
    tabDataArray,
    children,
    tabClassName,
}) => {
    const arrayChildren = Children.toArray(children);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const util = tabDataArray[selectedIndex].util;

    return (
        <HeadlessTab.Group
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
            as='div'
            className='border-white-10 bg-gunMetal/40 shadow-tab laptop:rounded-b-2xl laptop:border'
        >
            <div
                className={clsx(
                    'grid w-full grid-cols-1 border-b border-neutral-600 tablet:grid-cols-2'
                )}
            >
                <HeadlessTab.List
                    className={clsx(
                        'col-span-1 flex w-full laptop:h-16',
                        tabClassName
                    )}
                >
                    {tabDataArray.map((tabData, index) => {
                        return (
                            <HeadlessTab
                                key={tabData.text}
                                className='h-full w-full flex-1 focus:outline-none tablet:w-fit laptop:flex-none'
                                disabled={tabData.disabled}
                                data-testid={tabData.text}
                            >
                                <NavTab
                                    text={tabData.text}
                                    active={selectedIndex === index}
                                    highlight={tabData.highlight}
                                    suffixIcon={tabData.suffixIcon}
                                ></NavTab>
                            </HeadlessTab>
                        );
                    })}
                </HeadlessTab.List>
                {util && (
                    <div className='col-span-1 flex h-full w-full items-center justify-end'>
                        {util}
                    </div>
                )}
            </div>
            <HeadlessTab.Panels className='min-h-[25vh] overflow-hidden bg-cardBackground laptop:rounded-b-2xl'>
                {arrayChildren[selectedIndex]}
            </HeadlessTab.Panels>
        </HeadlessTab.Group>
    );
};
