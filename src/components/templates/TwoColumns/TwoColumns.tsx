import classNames from 'classnames';

export const TwoColumns = ({
    children,
    narrowFirstColumn = false,
}: {
    children: [React.ReactNode, React.ReactNode];
    narrowFirstColumn?: boolean;
}) => {
    const bigSize = 'w-full laptop:w-[70%]';
    const smallSize = 'w-full laptop:w-[30%]';

    return (
        <div className='flex flex-col justify-between gap-x-3 gap-y-4 laptop:flex-row'>
            <div
                className={classNames({
                    [bigSize]: !narrowFirstColumn,
                    [smallSize]: narrowFirstColumn,
                })}
            >
                {children[0]}
            </div>
            <div
                className={classNames({
                    [bigSize]: narrowFirstColumn,
                    [smallSize]: !narrowFirstColumn,
                })}
            >
                {children[1]}
            </div>
        </div>
    );
};
