import { Token } from '@secured-finance/sf-core';

export class USDFC extends Token {
    private constructor() {
        super(18, 'USDFC', 'USD for Filecoin Community', true);
    }

    private static instance: USDFC;

    public static onChain(): USDFC {
        this.instance = this.instance || new USDFC();
        return this.instance;
    }
}
