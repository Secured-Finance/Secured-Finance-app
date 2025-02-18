import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';
import ShowFirstIcon from 'src/assets/icons/orderbook-first.svg';
import ShowAllIcon from 'src/assets/icons/orderbook-full.svg';
import ShowLastIcon from 'src/assets/icons/orderbook-last.svg';
import { OrderBookIcon } from './OrderBookIcon';

export default {
    title: 'Atoms/OrderBookIcon',
    component: OrderBookIcon,
    args: {
        name: 'Show All Orders',
        Icon: <ShowAllIcon className='h-[10px] w-3' />,
    },
} as Meta<typeof OrderBookIcon>;

const Template: StoryFn<typeof OrderBookIcon> = args => {
    const [active, setActive] = useState(false);
    return (
        <div>
            <OrderBookIcon
                {...args}
                active={active}
                onClick={() => setActive(!active)}
            />
        </div>
    );
};

export const Default = Template.bind({});

export const Lend = Template.bind({});
Lend.args = {
    name: 'Show Only Lend Orders',
    Icon: <ShowLastIcon className='h-[10px] w-3' />,
};

export const Borrow = Template.bind({});
Borrow.args = {
    name: 'Show Only Borrow Orders',
    Icon: <ShowFirstIcon className='h-[10px] w-3' />,
};
