import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GradientBox, Separator } from 'src/components/atoms';
import {
    AssetDisclosure,
    AssetDisclosureProps,
} from 'src/components/molecules';
import { RootState } from 'src/store/types';
import { selectAllBalances } from 'src/store/wallet';
import {
    CurrencySymbol,
    WalletSource,
    generateWalletInformation,
} from 'src/utils';

export const MyWalletCard = ({
    addressRecord,
    information,
}: {
    addressRecord: Partial<Record<WalletSource, string>>;
    information?: Partial<Record<WalletSource, CurrencySymbol[]>>;
}) => {
    const balanceRecord = useSelector((state: RootState) =>
        selectAllBalances(state)
    );

    const assetMap: AssetDisclosureProps[] = useMemo(
        () =>
            generateWalletInformation(
                addressRecord,
                balanceRecord,
                information
            ),
        [addressRecord, balanceRecord, information]
    );

    return (
        <div className='h-fit w-full bg-transparent'>
            <GradientBox header='My Wallet'>
                {assetMap.length !== 0 && (
                    <div>
                        <div className='px-2 pb-6 pt-1'>
                            {assetMap.map((asset, index) => {
                                return (
                                    <div key={asset.account}>
                                        <AssetDisclosure {...asset} />
                                        {assetMap.length - 1 !== index && (
                                            <div className='mb-2 mt-2'>
                                                <Separator />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </GradientBox>
        </div>
    );
};
