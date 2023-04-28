import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Token } from '../wrappers/Token';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Token', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Token');
    });

    let blockchain: Blockchain;
    let token: SandboxContract<Token>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        token = blockchain.openContract(Token.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await token.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: token.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and token are ready to use
    });
});
