export const CHAINS = {
    ETH: {
        id: "eip155:1",
        rpcMethods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"]
    },
    POLKADOT: {
        id: 'polkadot:b0a8d493285c2df73290dfb7e61f870f',
        rpcMethods: [],
    },
    TERNOA: {
        STAGING: {
            id: 'polkadot:d44bcfb0e98da45ace37e4df8469e5db',
            rpcMethods: [],
        },
        TESTNET: {
            id: 'polkadot:d9adfc7ea82be63ba28088d62b96e927',
            rpcMethods: [],
        }
    }
}
export const WALLET_CONNECT = {
    projectId: '441431138975688f696a34766e4ff48d',
};