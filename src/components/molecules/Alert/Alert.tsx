import { InformationCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useState } from 'react';
import ErrorCircleIcon from 'src/assets/icons/error-circle.svg';
import WarningCircleIcon from 'src/assets/icons/warning-circle.svg';
import { CloseButton } from 'src/components/atoms';

export const Alert = ({
    severity = 'info',
    children,
    variant = 'solid',
    onClose,
    showCloseButton = false,
    localStorageKey,
    localStorageValue,
}: {
    severity?: 'error' | 'info' | 'success' | 'warning';
    children: React.ReactNode;
    variant?: 'solid' | 'outlined';
    onClose?: () => void;
    showCloseButton?: boolean;
    localStorageKey?: string;
    localStorageValue?: string;
}) => {
    const value =
        typeof window !== 'undefined' && localStorageKey
            ? localStorage.getItem(localStorageKey)
            : undefined;

    const [isVisible, setIsVisible] = useState(
        value ? !(value === localStorageValue) : true
    );

    let alertIcon;
    switch (severity) {
        case 'error':
            alertIcon = <ErrorCircleIcon className='h-5 w-5' />;
            break;
        case 'warning':
            alertIcon = <WarningCircleIcon className='h-5 w-5' />;
            break;
        default:
            alertIcon = (
                <InformationCircleIcon className='h-6 w-6 text-planetaryPurple' />
            );
            break;
    }

    const handleClose = () => {
        setIsVisible(false);
        if (localStorageKey && localStorageValue) {
            localStorage.setItem(localStorageKey, localStorageValue);
        }
        if (onClose) {
            onClose();
        }
    };

    return isVisible ? (
        <section
            aria-label={severity}
            role='alert'
            className={clsx('rounded-xl', {
                'border-2 border-yellow bg-yellow/20': variant === 'outlined', // should be changed to handle different colors
                'bg-[rgba(41, 45, 63, 0.60)] border border-white-10 shadow-tab':
                    variant === 'solid',
            })}
        >
            <div
                className={clsx(
                    'flex w-full flex-row items-center justify-between gap-1 rounded-xl px-5 py-3',
                    {
                        'bg-gradient-to-b from-[rgba(111,116,176,0.35)] to-[rgba(57,77,174,0)]':
                            variant === 'solid',
                    }
                )}
            >
                <div className='flex items-center gap-3'>
                    <span>{alertIcon}</span>
                    {children}
                </div>
                {showCloseButton && <CloseButton onClick={handleClose} />}
            </div>
        </section>
    ) : null;
};
