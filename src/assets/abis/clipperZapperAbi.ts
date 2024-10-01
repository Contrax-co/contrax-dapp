const clipperZapperAbi = [
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

export default clipperZapperAbi;
