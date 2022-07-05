import classNames from 'classnames';
import React from 'react';

export const Button = ({
    href, //do nothing
    size = 'md',
    fullWidth = false,
    children,
    StartIcon,
    EndIcon,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        fullWidth?: boolean;
        href?: string;
        size?: 'sm' | 'md';
    } & {
        StartIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        EndIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    }) => {
    const Tag = href ? 'a' : 'button';
    const tagProps = href
        ? {
              href,
              target: '_blank',
              rel: 'noopener noreferrer',
          }
        : props;

    const label = typeof children === 'string' ? children : 'Button';

    return (
        <Tag
            {...tagProps}
            aria-label={label}
            className={classNames(
                `flex items-center justify-center rounded-xl bg-starBlue   ${props?.className}`,
                'enabled:hover:bg-gradient-to-t enabled:hover:from-black-20 enabled:hover:via-black-20 enabled:hover:to-starBlue ',
                'disabled:bg-opacity-50',
                {
                    'h-10 px-4 py-3': size === 'sm',
                    'h-11 px-6 py-4': size === 'md',
                    'w-full': fullWidth,
                    'w-fit': !fullWidth,
                }
            )}
        >
            {StartIcon && (
                <span className='mr-3'>
                    <StartIcon className='h-4 text-white' role='img' />
                </span>
            )}
            <p
                className={classNames('text-white', {
                    'typography-button-2': size === 'sm',
                    'typography-button-1`': size === 'md',
                })}
            >
                {children}
            </p>
            {EndIcon && (
                <span className='ml-3'>
                    <EndIcon className='h-4 text-white' role='img' />
                </span>
            )}
        </Tag>
    );
};
