import clsx from 'clsx';
import { SvgIcon } from 'src/types';
import { sizeStyle, textStyle, variantStyle } from './constants';
import { ButtonSizes, ButtonVariants } from './types';

export const Button = ({
    href,
    size = ButtonSizes.md,
    fullWidth = false,
    children,
    StartIcon,
    EndIcon,
    variant = ButtonVariants.primary,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        fullWidth?: boolean;
        href?: string;
        size?: ButtonSizes;
        variant?: ButtonVariants;
    } & {
        StartIcon?: SvgIcon;
        EndIcon?: SvgIcon;
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
            className={clsx(
                'flex items-center justify-center border font-semibold disabled:border-0 disabled:bg-neutral-600 disabled:text-neutral-400',
                props?.className,
                sizeStyle[size],
                variantStyle[variant],
                {
                    'text-neutral-50':
                        variant === ButtonVariants.primary ||
                        variant === ButtonVariants.tertiary,
                    'text-primary-300': variant === ButtonVariants.secondary,
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
            <p className={clsx('whitespace-nowrap', textStyle[size])}>
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
