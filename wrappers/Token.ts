import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano,
} from 'ton-core';

export type TokenConfig = {
    name: string;
    symbol: string;
    decimals: number;
    owner: Address;
};

export function tokenConfigToCell(config: TokenConfig): Cell {
    return beginCell()
        .storeUint(0, 1)
        .storeCoins(0)
        .storeStringRefTail(config.name)
        .storeStringRefTail(config.symbol)
        .storeUint(config.decimals, 8)
        .storeBuffer(config.owner.hash, 32)
        .endCell();
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

    async sendTransfer(provider: ContractProvider, via: Sender, recipient: Address, amount: bigint) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x38e6413f, 32)
                .storeUint(Date.now(), 64)
                .storeBuffer(recipient.hash, 32)
                .storeCoins(amount)
                .endCell(),
        });
    }

    async sendTransferFrom(provider: ContractProvider, via: Sender, from: Address, recipient: Address, amount: bigint) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x56385563, 32)
                .storeUint(Date.now(), 64)
                .storeBuffer(from.hash, 32)
                .storeBuffer(recipient.hash, 32)
                .storeCoins(amount)
                .endCell(),
        });
    }

    async sendApprove(provider: ContractProvider, via: Sender, spender: Address, amount: bigint) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x14b4e83e, 32)
                .storeUint(Date.now(), 64)
                .storeBuffer(spender.hash, 32)
                .storeCoins(amount)
                .endCell(),
        });
    }

    async sendMint(provider: ContractProvider, via: Sender, recipient: Address, amount: bigint) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x1bcc40ab, 32)
                .storeUint(Date.now(), 64)
                .storeBuffer(recipient.hash, 32)
                .storeCoins(amount)
                .endCell(),
        });
    }

    async sendBurn(provider: ContractProvider, via: Sender, amount: bigint) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x16e0fd30, 32).storeUint(Date.now(), 64).storeCoins(amount).endCell(),
        });
    }

    async getName(provider: ContractProvider) {
        return (await provider.get('get_token_data', [])).stack.readString();
    }

    async getSymbol(provider: ContractProvider) {
        let stack = (await provider.get('get_token_data', [])).stack;
        stack.skip(1);
        return stack.readString();
    }

    async getDecimals(provider: ContractProvider) {
        let stack = (await provider.get('get_token_data', [])).stack;
        stack.skip(2);
        return stack.readBigNumber();
    }

    async getTotalSupply(provider: ContractProvider) {
        let stack = (await provider.get('get_token_data', [])).stack;
        stack.skip(3);
        return stack.readBigNumber();
    }

    async getBalanceOf(provider: ContractProvider, address: Address) {
        return (
            await provider.get('get_balance_of', [{ type: 'int', value: BigInt('0x' + address.hash.toString('hex')) }])
        ).stack.readBigNumber();
    }

    async getAllowanceOf(provider: ContractProvider, owner: Address, spender: Address) {
        return (
            await provider.get('get_allowance_of', [
                { type: 'int', value: BigInt('0x' + owner.hash.toString('hex')) },
                { type: 'int', value: BigInt('0x' + spender.hash.toString('hex')) },
            ])
        ).stack.readBigNumber();
    }
}
