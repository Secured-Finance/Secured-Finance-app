import clsx from 'clsx';

export const OrderBookIcon = ({
    Icon,
    name,
    active,
    onClick,
}: {
    Icon: React.ReactNode;
    name: string;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        aria-label={name}
        className={clsx(
            'rounded border-0.5 border-neutral-500 px-1.5 py-[7px] hover:bg-neutral-700',
            {
                'bg-neutral-700': active,
                'bg-neutral-800': !active,
            }
        )}
        onClick={onClick}
    >
        {Icon}
    </button>
);
