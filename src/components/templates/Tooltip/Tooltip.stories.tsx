import { ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { Tooltip } from './Tooltip';

const InformationCircle = (
    <button
        className='flex items-center rounded-full bg-teal p-5'
        data-testid='button-icon'
    >
        <ChevronDoubleDownIcon className='h-6 w-6 text-white' />
    </button>
);

const children = (
    <div className='text-white'>
        <p>Tooltip content</p>
    </div>
);

export default {
    title: 'Templates/Tooltip',
    component: Tooltip,
    args: {
        children: children,
    },
} as ComponentMeta<typeof Tooltip>;

const Template: ComponentStory<typeof Tooltip> = args => (
    <div className='flex w-full justify-center'>
        <Tooltip {...args} />
    </div>
);

export const Default = Template.bind({});
Default.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('information-circle');
    await userEvent.hover(button);
};

export const LeftAligned = Template.bind({});
LeftAligned.args = {
    align: 'left',
};
LeftAligned.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('information-circle');
    await userEvent.hover(button);
};

export const RightAligned = Template.bind({});
RightAligned.args = {
    align: 'right',
};
RightAligned.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('information-circle');
    await userEvent.hover(button);
};

export const WithIconElement = Template.bind({});
WithIconElement.args = {
    iconElement: InformationCircle,
};
WithIconElement.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('button-icon');
    await userEvent.hover(button);
};
