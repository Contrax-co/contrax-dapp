export const vaultAbi = [
    {
        inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
        name: "deposit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    { inputs: [], name: "depositAll", outputs: [], stateMutability: "nonpayable", type: "function" },

    {
        inputs: [{ internalType: "uint256", name: "_shares", type: "uint256" }],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    { inputs: [], name: "withdrawAll", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

export default vaultAbi;
