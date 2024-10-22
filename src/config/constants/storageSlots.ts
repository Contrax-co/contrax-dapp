import { CHAIN_ID } from "src/types/enums";
import { Address, encodePacked, keccak256 } from "viem";

interface ISlots {
    [chainId: string]: {
        [key: Address]: {
            balance: bigint;
            allowance: bigint;
        };
    };
}

const slots: ISlots = {
    [CHAIN_ID.CORE]: {
        "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9": {
            balance: 0n,
            allowance: 1n,
        },
    },
    [CHAIN_ID.ARBITRUM]: {
        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831": {
            balance: 9n,
            allowance: 10n,
        },
    },
    [CHAIN_ID.BASE]: {
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
            balance: 9n,
            allowance: 10n,
        },
    },
};

export const getAllowanceSlot = (chainId: number, tokenAddress: Address, owner: Address, spender: Address) => {
    return keccak256(
        encodePacked(
            ["uint256", "uint256"],
            [
                BigInt(spender),
                BigInt(
                    keccak256(
                        encodePacked(["uint256", "uint256"], [BigInt(owner), slots[chainId][tokenAddress].allowance])
                    )
                ),
            ]
        )
    );
};

export const getBalanceSlot = (chainId: number, tokenAddress: Address, holderAddress: Address) => {
    return keccak256(
        encodePacked(["uint256", "uint256"], [BigInt(holderAddress), slots[chainId][tokenAddress].balance])
    );
};
