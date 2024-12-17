import {
    Environment,
    getEnvShort,
    getTransformMaturityOption,
    prefixTilde,
} from 'src/utils';

describe('getTransformMaturityOption', () => {
    it('should return the formatted date if the value is a number', () => {
        expect(
            getTransformMaturityOption([
                { label: '1 Month', value: '1625644800' },
                { label: '2 Month', value: '1628243200' },
            ])('1 Month')
        ).toEqual('Jul 7, 2021');
    });

    it('should return the label if the value is not found', () => {
        expect(
            getTransformMaturityOption([
                { label: '2 Month', value: '1625644800' },
            ])('1 Month')
        ).toEqual('1 Month');
    });

    it('should return the label if the options are empty', () => {
        expect(getTransformMaturityOption([])('1 Month')).toEqual('1 Month');
    });
});

describe('getEnvShort', () => {
    it('should return the correct environment in short', () => {
        process.env.SF_ENV = Environment.DEVELOPMENT;
        expect(getEnvShort()).toEqual('dev');
        process.env.SF_ENV = Environment.STAGING;
        expect(getEnvShort()).toEqual('stg');
        process.env.SF_ENV = Environment.PRODUCTION;
        expect(getEnvShort()).toEqual('prod');
        process.env.SF_ENV = 'random';
        expect(getEnvShort()).toEqual('');
    });
});

describe('prefixTilde', () => {
    it('should return the value prefixed with ~ sign', () => {
        expect(prefixTilde('test')).toEqual('~ test');
        expect(prefixTilde('')).toEqual('');
    });
});
