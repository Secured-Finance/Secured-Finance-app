import { ComponentMeta, ComponentStory } from '@storybook/react';
import {
    withAssetPrice,
    withMaturities,
    withWalletProvider,
} from 'src/../.storybook/decorators';
import { Itayose } from './Itayose';

export default {
    title: 'Pages/Itayose',
    component: Itayose,
    args: {},
    decorators: [withMaturities, withAssetPrice, withWalletProvider],
} as ComponentMeta<typeof Itayose>;

const Template: ComponentStory<typeof Itayose> = () => <Itayose />;

export const Default = Template.bind({});
