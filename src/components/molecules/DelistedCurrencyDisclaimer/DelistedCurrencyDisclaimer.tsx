import { Alert } from 'src/components/molecules';
import { generateDelistedCurrencyText } from 'src/components/pages';
import {
    CurrencySymbol,
    readDelistedCurrencyClosedStatus,
    writeDelistedCurrencyClosedStatus,
} from 'src/utils';

export const DelistedCurrencyDisclaimer = ({
    currencies,
}: {
    currencies: Set<CurrencySymbol>;
}) => {
    const currencyArray = Array.from(currencies);
    const delistedCurrencyClosedStatus = readDelistedCurrencyClosedStatus();
    const isClosed = delistedCurrencyClosedStatus
        ? currencyArray.every(ccy => delistedCurrencyClosedStatus.includes(ccy))
        : false;

    return (
        <>
            {currencyArray.length > 0 && !isClosed && (
                <Alert
                    severity='warning'
                    showCloseButton={true}
                    onClose={() =>
                        writeDelistedCurrencyClosedStatus(currencyArray)
                    }
                >
                    <p className='typography-caption text-white'>
                        Please note that{' '}
                        {generateDelistedCurrencyText(currencyArray)} will be
                        delisted on Secured Finance.{' '}
                        <a
                            className='whitespace-nowrap text-secondary7 underline'
                            href='https://docs.secured.finance/product-guide/loan-market-platform/loan-assets/listing-and-delisting'
                            target='_blank'
                            rel='noreferrer'
                        >
                            Learn more
                        </a>
                    </p>
                </Alert>
            )}
        </>
    );
};
