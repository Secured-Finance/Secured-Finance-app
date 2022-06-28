import '@storybook/addon-console';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import { withPerformance } from 'storybook-addon-performance';
import '../src/index.css';
import store from './../src/store';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    backgrounds: {
        default: 'secfin',
        values: [
            {
                name: 'black',
                value: '#000',
            },
            {
                name: 'white',
                value: '#fff',
            },
            {
                name: 'secfin',
                value: '#0b1925',
            },
            {
                name: 'blue',
                value: '#174e7a',
            },
        ],
    },
    chromatic: { disableSnapshot: true },
};

export const decorators = [
    Story => (
        <Router>
            <Provider store={store}>
                <Story />
            </Provider>
        </Router>
    ),
    withPerformance,
];
