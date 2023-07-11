import { Popover } from '@headlessui/react';
import classNames from 'classnames';
import React, { useState } from 'react';

export const Tooltip = ({
    iconElement,
    children,
    align = 'center',
}: {
    iconElement: React.ReactNode;
    children: React.ReactNode;
    align?: 'left' | 'right' | 'center';
}) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover
            className='pointer-events-auto relative overflow-visible'
            data-testid='information-popover'
        >
            {() => (
                <>
                    <Popover.Button
                        className='flex items-center focus:outline-none'
                        as='div'
                    >
                        {React.cloneElement(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            iconElement as React.ReactElement<any>,
                            {
                                onMouseEnter: () => setOpen(true),
                                onMouseLeave: () => setOpen(false),
                            }
                        )}
                    </Popover.Button>
                    {open && children && (
                        <Popover.Panel
                            className={classNames(
                                'absolute z-10 mt-2 flex w-screen max-w-[256px] justify-center',
                                {
                                    'left-1/2 -translate-x-1/2':
                                        align === 'center',
                                    'left-1/2 -translate-x-3/4':
                                        align === 'left',
                                    'right-1/2 translate-x-3/4':
                                        align === 'right',
                                }
                            )}
                            role='tooltip'
                            static
                        >
                            <div className='typography-caption-3 relative w-fit overflow-hidden whitespace-normal rounded-lg border border-black-20 bg-gunMetal p-4 text-left text-neutral-8 shadow-dropdown'>
                                {children}
                            </div>
                        </Popover.Panel>
                    )}
                </>
            )}
        </Popover>
    );
};
