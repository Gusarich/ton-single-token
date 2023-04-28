import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type TokenConfig = {};

export function tokenConfigToCell(config: TokenConfig): Cell {
    return beginCell().endCell();
}

export class Token implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Token(address);
    }

    static createFromConfig(config: TokenConfig, code: Cell, workchain = 0) {
        const data = tokenConfigToCell(config);
        const init = { code, data };
        return new Token(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
