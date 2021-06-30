import React from 'react';
import { Story, Meta } from '@storybook/react';
import { LineChart, ILineChart } from 'src/components/new/LineChart';
import { options } from 'src/components/new/LineChart/constants';

export default {
    title: 'Components/LineChart',
    component: LineChart,
} as Meta;

const Template: Story<ILineChart> = args => (
    <div>
        <LineChart {...args} />
    </div>
);
export const Default = Template.bind({});
Default.args = {
    title: 'Yield Curve',
    data: {
        labels: ['0', '3m', '6m', '1y', '2y', '3y', '5y'],
        datasets: [
            {
                label: 'Borrow',
                data: [0, 7, 8, 9, 10, 13, 15],
            },
            {
                label: 'Lend',
                data: [0, 9.2, 10.2, 11.2, 12.2, 14, 15.4],
            },
            {
                label: 'Spread',
                data: [0, 8.1, 9.1, 10.1, 11.1, 13.5, 15.2],
            },
        ],
    },
    options,
    style: {},
    showLegend: true,
};
