import { Popover, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { Fragment, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import Gear from 'src/assets/icons/gear.svg';
import { Toggle } from 'src/components/atoms';
import { updateTestnetEnabled } from 'src/store/blockchain';

export const testnetsEnabledId = 'testnetsEnabled';

export const Settings = ({ isProduction }: { isProduction: boolean }) => {
    const dispatch = useDispatch();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testnetsEnabledLocalstorage =
        localStorage.getItem(testnetsEnabledId) === 'true' || false;
    const [testnetsEnabled, setTestnetsMode] = useState(!isProduction);
    dispatch(updateTestnetEnabled(!isProduction));
    localStorage.setItem(testnetsEnabledId, String(!isProduction));

    const handleChange = useCallback(() => {
        const newState = isProduction ? !testnetsEnabled : true;
        setTestnetsMode(newState);
        dispatch(updateTestnetEnabled(newState));
        localStorage.setItem(testnetsEnabledId, newState ? 'true' : 'false');
    }, [dispatch, testnetsEnabled, isProduction]);

    return (
        <Popover className='relative w-fit'>
            {() => (
                <>
                    <Popover.Button
                        data-cy='settings-button'
                        aria-label='Settings Button'
                        className={classNames(
                            'flex items-center rounded-[6px] bg-neutral-800 p-[7px] ring-[1.5px] ring-neutral-500 focus:outline-none tablet:rounded-xl tablet:p-[14px]'
                        )}
                    >
                        <Gear className='h-18px w-18px' />
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter='transition ease-out duration-200'
                        enterFrom='opacity-0 translate-y-5'
                        enterTo='opacity-100 translate-y-0'
                        leave='transition ease-in duration-150'
                        leaveFrom='opacity-100 translate-y-0'
                        leaveTo='opacity-0 translate-y-5'
                    >
                        <Popover.Panel className='absolute right-0 z-10 mt-3 w-64 origin-top-right'>
                            <div className='relative flex h-fit flex-col overflow-hidden rounded-xl bg-neutral-700 py-[10px]'>
                                <div className='border-b border-neutral-600 py-2 pl-5'>
                                    <span className='typography-caption-2 text-neutral-300'>
                                        Global Settings
                                    </span>
                                </div>
                                <div className='flex flex-row items-center justify-between px-5 py-3'>
                                    <span className='typography-nav-menu-default leading-[22px] text-neutral-50'>
                                        Testnet mode
                                    </span>
                                    <Toggle
                                        checked={testnetsEnabled}
                                        disabled={!isProduction}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
};
