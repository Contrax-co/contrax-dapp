const steerZapperAbi = [
    {
        inputs: [
            { internalType: "contract IVault", name: "vault", type: "address" },
            { internalType: "uint256", name: "tokenAmountOutMin", type: "uint256" },
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "uint256", name: "tokenInAmount", type: "uint256" },
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
            { internalType: "address", name: "tokenIn", type: "address" },
        ],
        name: "zapInETH",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [{ internalType: "contract IVault", name: "_localVault", type: "address" }],
        name: "steerVaultTokens",
        outputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "contract IVault", name: "_localVault", type: "address" }],
        name: "getTotalAmounts",
        outputs: [
            { internalType: "uint256", name: "", type: "uint256" },
            { internalType: "uint256", name: "", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;

export default steerZapperAbi;
