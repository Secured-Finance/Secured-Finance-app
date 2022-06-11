import { JsonRpcProvider } from '@ethersproject/providers';
import axios from 'axios';
import { Wallet } from 'ethers';
import { CustomizedBridge } from './customBridget';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('request');

const TENDERLY_KEY = Cypress.env('TENDERLY_KEY');
const TENDERLY_ACCOUNT = Cypress.env('TENDERLY_ACCOUNT');
const TENDERLY_PROJECT = Cypress.env('TENDERLY_PROJECT');
const TENDERLY_PERSIST_FORK_AFTER_RUN = Cypress.env(
    'TENDERLY_PERSIST_FORK_AFTER_RUN'
);

export const DEFAULT_TEST_ACCOUNT = {
    privateKey:
        '2ab22efc6bc85a9cd2d6281416500d8523ba57206d94cb333cbd09977ca75479',
    address: '0x38F217d0762F28c806BD32cFEC5984385Fed97cB'.toLowerCase(),
};

const tenderly = axios.create({
    baseURL: 'https://api.tenderly.co/api/v1/',
    headers: {
        'X-Access-Key': TENDERLY_KEY,
    },
});

export class TenderlyFork {
    public forkNetworkID: string;
    public chainId: number;
    private forkId: string;
    private persist = false;

    constructor(forkNetworkID: number, forkId?: string) {
        this.forkNetworkID = forkNetworkID.toString();
        this.chainId = forkNetworkID;
        if (forkId) {
            this.forkId = forkId;
        }
        if (TENDERLY_PERSIST_FORK_AFTER_RUN) {
            this.persist = TENDERLY_PERSIST_FORK_AFTER_RUN;
        }
    }

    async init() {
        if (this.forkId) {
            cy.log(`using existing fork: ${this.forkId}`);
            return;
        }

        cy.log('initializing new fork');
        const response = await tenderly.post(
            `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork`,
            {
                network_id: this.forkNetworkID,
                chain_config: { chain_id: this.chainId },
            }
        );
        this.forkId = response.data.simulation_fork.id;
    }

    getRpcUrl() {
        if (!this.forkId) throw new Error('Fork not initialized!');
        return `https://rpc.tenderly.co/fork/${this.forkId}`;
    }

    async addBalanceRpc(address: string) {
        if (!this.forkId) throw new Error('Fork not initialized!');
        const options = {
            url: this.getRpcUrl(),
            method: 'post',
            headers: { 'content-type': 'text/plain' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'tenderly_setBalance',
                params: [address, '0x21e19e0c9bab2400000'],
                id: '1234',
            }),
        };
        request(options);
    }

    async deleteFork() {
        if (this.persist) {
            return;
        }
        cy.log(`deleting fork ${this.forkId}`);
        await tenderly.delete(
            `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.forkId}`
        );
    }

    onBeforeLoad() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (win: any) => {
            win.localStorage.clear();
            const rpc = this.getRpcUrl();
            const provider = new JsonRpcProvider(rpc, this.chainId);
            const signer = new Wallet(
                DEFAULT_TEST_ACCOUNT.privateKey,
                provider
            );

            win.ethereum = new CustomizedBridge(
                signer.connect(provider),
                provider,
                this.chainId
            );
        };
    }
}
