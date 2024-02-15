import { Tab as HeadlessTab } from '@headlessui/react';
import clsx from 'clsx';
import { Children, useState } from 'react';
import { DropdownSelector } from 'src/components/atoms';

const TitleChip = ({
    title,
    selected,
}: {
    title: string;
    selected: boolean;
}) => {
    return (
        <div
            data-testid={title}
            className={clsx(
                'typography-caption-2 w-fit whitespace-nowrap px-5 py-3',
                {
                    'rounded-3xl bg-black-30 text-neutral-8': selected,
                    'text-neutral-4': !selected,
                }
            )}
        >
            {title}
        </div>
    );
};
export const HorizontalTab = ({
    tabTitles,
    children,
    onTabChange,
    useCustomBreakpoint = false,
}: {
    tabTitles: string[];
    children?: React.ReactNode;
    onTabChange?: (v: number) => void;
    useCustomBreakpoint?: boolean;
}) => {
    const arrayChildren = Children.toArray(children);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onChange = (index: number) => {
        setSelectedIndex(index);
        onTabChange?.(index);
    };

    return (
        <HeadlessTab.Group
            selectedIndex={selectedIndex}
            onChange={onChange}
            as='div'
            className='flex h-full flex-col rounded-b-2xl border border-white-10 bg-gunMetal/40 shadow-tab'
        >
            <HeadlessTab.List className='h-16 justify-start border-b border-white-10 p-3'>
                <div
                    className={clsx('w-full', {
                        'horizontalTab:hidden': useCustomBreakpoint,
                        'tablet:hidden': !useCustomBreakpoint,
                    })}
                >
                    <DropdownSelector
                        optionList={tabTitles.map((title, index) => ({
                            label: title,
                            value: index.toString(),
                        }))}
                        selected={{
                            label: tabTitles[selectedIndex],
                            value: selectedIndex.toString(),
                        }}
                        onChange={option =>
                            setSelectedIndex(parseInt(option) || 0)
                        }
                        variant='fullWidth'
                    />
                </div>
                <div
                    className={clsx('hidden', {
                        'horizontalTab:block': useCustomBreakpoint,
                        'tablet:block': !useCustomBreakpoint,
                    })}
                >
                    {tabTitles.map((title, index) => {
                        return (
                            <HeadlessTab
                                key={index}
                                className='h-full focus:outline-none'
                            >
                                {({ selected }) => (
                                    <TitleChip
                                        title={title}
                                        selected={selected}
                                    />
                                )}
                            </HeadlessTab>
                        );
                    })}
                </div>
            </HeadlessTab.List>
            <HeadlessTab.Panels className='h-full min-h-[25vh] rounded-b-2xl bg-cardBackground pb-2'>
                {arrayChildren[selectedIndex]}
            </HeadlessTab.Panels>
        </HeadlessTab.Group>
    );
};
