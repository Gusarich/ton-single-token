import { Address, toNano } from 'ton-core';
import { Token } from '../wrappers/Token';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const token = provider.open(
        Token.createFromConfig(
            {
                name: 'MyCoolToken',
                symbol: 'MCT',
                decimals: 9,
                owner: Address.parse('EQBIhPuWmjT7fP-VomuTWseE8JNWv2q7QYfsVQ1IZwnMk8wL'),
            },
            await compile('Token')
        )
    );

    await token.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(token.address);
}
