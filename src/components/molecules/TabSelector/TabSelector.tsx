import { Tab as HeadlessTab } from '@headlessui/react';
import clsx from 'clsx';
import React, { Children, useState } from 'react';
import { Tab } from 'src/components/atoms';

export type TabHighlight = {
    text: string;
    size: 'small' | 'large';
    visible: boolean;
};

export type TabSelectorData = {
    text: string;
    disabled?: boolean;
    util?: React.ReactNode;
    highlight?: TabHighlight;
};

interface TabSelectorProps {
    tabDataArray: TabSelectorData[];
    children: React.ReactNode;
    tabGroupClassName?: string;
}

export const TabSelector: React.FC<TabSelectorProps> = ({
    tabDataArray,
    children,
    tabGroupClassName,
}) => {
    const arrayChildren = Children.toArray(children);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const util = tabDataArray[selectedIndex].util;

    return (
        <HeadlessTab.Group
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
            as='div'
            className='flex h-full flex-col border-neutral-600 bg-neutral-900 shadow-tab laptop:rounded-b-2xl laptop:border'
        >
            <div
                className={clsx(
                    'flex border-b border-neutral-600',
                    util && 'flex-col tablet:flex-row'
                )}
            >
                <HeadlessTab.List
                    className={clsx(
                        'flex h-11 w-full laptop:h-[60px]',
                        tabGroupClassName
                    )}
                >
                    {tabDataArray.map((tabData, index) => {
                        return (
                            <HeadlessTab
                                key={tabData.text}
                                className='h-full w-full flex-1 focus:outline-none tablet:w-fit'
                                disabled={tabData.disabled}
                                data-testid={tabData.text}
                            >
                                <Tab
                                    text={tabData.text}
                                    active={selectedIndex === index}
                                    disabled={tabData.disabled}
                                    highlight={tabData.highlight}
                                />
                            </HeadlessTab>
                        );
                    })}
                </HeadlessTab.List>
                {util && <div className='h-full w-full'>{util}</div>}
            </div>
            <HeadlessTab.Panels className='relative min-h-[25vh] overflow-hidden bg-neutral-900 laptop:rounded-b-2xl'>
                {arrayChildren[selectedIndex]}
            </HeadlessTab.Panels>
        </HeadlessTab.Group>
    );
};
