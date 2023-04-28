import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Address, Cell, toNano } from 'ton-core';
import { Token } from '../wrappers/Token';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';

describe('Token', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Token');
    });

    let blockchain: Blockchain;
    let token: SandboxContract<Token>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        token = blockchain.openContract(
            Token.createFromConfig(
                {
                    name: 'MyCoolToken',
                    symbol: 'MCT',
                    decimals: 9,
                    owner: deployer.address,
                },
                code
            )
        );

        const deployResult = await token.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {});

    it('should return name, symbol and decimals correctly', async () => {
        expect(await token.getName()).toEqual('MyCoolToken');
        expect(await token.getSymbol()).toEqual('MCT');
        expect(await token.getDecimals()).toEqual(9);
    });

    it('should mint', async () => {
        const result = await token.sendMint(deployer.getSender(), deployer.address, 100n);

        expect(result.transactions).toHaveTransaction({
            from: token.address,
            to: deployer.address,
            value: 1000000n,
        });

        expect(await token.getBalanceOf(deployer.address)).toEqual(100n);
        expect(await token.getTotalSupply()).toEqual(100n);

        await token.sendMint(deployer.getSender(), deployer.address, 100n);
        expect(await token.getBalanceOf(deployer.address)).toEqual(200n);
        expect(await token.getTotalSupply()).toEqual(200n);
    });

    it('should burn', async () => {
        await token.sendMint(deployer.getSender(), deployer.address, 100n);

        const result = await token.sendBurn(deployer.getSender(), 70n);

        expect(result.transactions).toHaveTransaction({
            from: token.address,
            to: Address.parseRaw('0:' + '0'.repeat(64)),
            value: 1000000n,
        });

        expect(await token.getBalanceOf(deployer.address)).toEqual(30n);
        expect(await token.getTotalSupply()).toEqual(30n);

        await token.sendBurn(deployer.getSender(), 30n);
        expect(await token.getBalanceOf(deployer.address)).toEqual(0n);
        expect(await token.getTotalSupply()).toEqual(0n);
    });

    it('should transfer', async () => {
        await token.sendMint(deployer.getSender(), deployer.address, 100n);

        const address = randomAddress();

        const result = await token.sendTransfer(deployer.getSender(), address, 50n);

        expect(result.transactions).toHaveTransaction({
            from: token.address,
            to: address,
            value: 1000000n,
        });

        expect(await token.getBalanceOf(deployer.address)).toEqual(50n);
        expect(await token.getBalanceOf(address)).toEqual(50n);
        expect(await token.getTotalSupply()).toEqual(100n);

        await token.sendTransfer(deployer.getSender(), address, 50n);
        expect(await token.getBalanceOf(deployer.address)).toEqual(0n);
        expect(await token.getBalanceOf(address)).toEqual(100n);
        expect(await token.getTotalSupply()).toEqual(100n);
    });

    it('should approve', async () => {
        const address = randomAddress();

        const result = await token.sendApprove(deployer.getSender(), address, 100n);

        expect(result.transactions).toHaveTransaction({
            from: token.address,
            to: address,
            value: 1000000n,
        });

        expect(await token.getAllowanceOf(deployer.address, address)).toEqual(100n);

        await token.sendApprove(deployer.getSender(), address, 0n);
        expect(await token.getAllowanceOf(deployer.address, address)).toEqual(0n);
    });

    it('should transfer from', async () => {
        await token.sendMint(deployer.getSender(), deployer.address, 100n);
        const wallet = await blockchain.treasury('wallet');
        await token.sendApprove(deployer.getSender(), wallet.address, 100n);
        const address = randomAddress();

        const result = await token.sendTransferFrom(wallet.getSender(), deployer.address, address, 30n);

        expect(result.transactions).toHaveTransaction({
            from: token.address,
            to: address,
            value: 1000000n,
        });

        expect(await token.getAllowanceOf(deployer.address, wallet.address)).toEqual(70n);
        expect(await token.getBalanceOf(deployer.address)).toEqual(70n);
        expect(await token.getBalanceOf(address)).toEqual(30n);

        await token.sendTransferFrom(wallet.getSender(), deployer.address, address, 70n);
        expect(await token.getAllowanceOf(deployer.address, wallet.address)).toEqual(0n);
        expect(await token.getBalanceOf(deployer.address)).toEqual(0n);
        expect(await token.getBalanceOf(address)).toEqual(100n);
    });
});
