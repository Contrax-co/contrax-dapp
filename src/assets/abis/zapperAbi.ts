const zapperAbi = [
    {
        outputs: [{ name: "vaultBalance", internalType: "uint256", type: "uint256" }],
        inputs: [
            { name: "vault", internalType: "contract IVault", type: "address" },
            { name: "tokenAmountOutMin", internalType: "uint256", type: "uint256" },
            { name: "tokenIn", internalType: "address", type: "address" },
            { name: "tokenInAmount", internalType: "uint256", type: "uint256" },
        ],
        name: "zapIn",
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        outputs: [{ name: "vaultBalance", internalType: "uint256", type: "uint256" }],
        inputs: [
            { name: "vault", internalType: "contract IVault", type: "address" },
            { name: "tokenAmountOutMin", internalType: "uint256", type: "uint256" },
            { name: "tokenIn", internalType: "address", type: "address" },
        ],
        name: "zapInETH",
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "contract IVault", name: "vault", type: "address" },
            { internalType: "uint256", name: "withdrawAmount", type: "uint256" },
            { internalType: "address", name: "desiredToken", type: "address" },
            { internalType: "uint256", name: "desiredTokenOutMin", type: "uint256" },
        ],
        name: "zapOutAndSwap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "contract IVault", name: "vault", type: "address" },
            { internalType: "uint256", name: "withdrawAmount", type: "uint256" },
            { internalType: "uint256", name: "desiredTokenOutMin", type: "uint256" },
        ],
        name: "zapOutAndSwapEth",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "contract IVault", name: "vault", type: "address" },
            { internalType: "uint256", name: "tokenAmountOutMin", type: "uint256" },
            { internalType: "uint256", name: "packedInput", type: "uint256" },
            { internalType: "uint256", name: "packedConfig", type: "uint256" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "zapIn",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "contract IVault", name: "vault", type: "address" },
            { internalType: "uint256", name: "tokenAmountOutMin", type: "uint256" },
            { internalType: "uint256", name: "packedInput", type: "uint256" },
            { internalType: "uint256", name: "packedConfig", type: "uint256" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "zapInETH",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
] as const;

export default zapperAbi;
