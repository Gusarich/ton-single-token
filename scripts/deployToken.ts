import { toNano } from 'ton-core';
import { Token } from '../wrappers/Token';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const token = provider.open(Token.createFromConfig({}, await compile('Token')));

    await token.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(token.address);

    // run methods on `token`
}
