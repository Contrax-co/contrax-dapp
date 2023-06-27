import axios from "axios";
import { coinsLamaPriceByChainId } from "src/config/constants/urls";
import { awaitTransaction, getNetworkName } from "src/utils/common";
import { Contract, providers, BigNumber, Signer, constants } from "ethers";
import { erc20ABI } from "wagmi";
import { utils } from "ethers/lib/ethers";
import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";

export const getPrice = async (tokenAddress: string, chainId: number) => {
    try {
        const res = await axios.get(coinsLamaPriceByChainId[chainId] + tokenAddress, {
            cache: true,
        });
        const prices = JSON.stringify(res.data);
        const parse = JSON.parse(prices);

        const token = parse[`coins`][`${getNetworkName(chainId)}:${tokenAddress}`];
        const price = token ? (token[`price`] as number) : 0;
        return price;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

export const getPricesByTime = async (
    addTime: { address: string; timestamp: number; price?: number }[],
    chainId: number
) => {
    try {
        if (addTime.length === 0) return undefined;
        addTime = addTime.sort((a, b) => a.timestamp - b.timestamp);
        const obj = addTime.reduce(
            (acc, { address, timestamp }) => {
                if (acc[`${getNetworkName(chainId)}:${address}`]) {
                    acc[`${getNetworkName(chainId)}:${address}`].push(timestamp);
                } else {
                    acc[`${getNetworkName(chainId)}:${address}`] = [timestamp];
                }
                return acc;
            },
            {} as {
                [key: string]: number[];
            }
        );

        let prices: {
            [key: string]: {
                timestamp: number;
                price: number;
                confidence: number;
            }[];
        } = {};

        const res = await axios.get(
            `https://coins.llama.fi/batchHistorical?coins=${encodeURIComponent(JSON.stringify(obj))}&searchWidth=12h`,
            {
                cache: false,
            }
        );

        const coins = JSON.parse(JSON.stringify(res.data)).coins;

        Object.entries(coins).forEach(([key, value]) => {
            // @ts-ignore
            prices[key.split(":")[1].toLowerCase()] = value.prices;
        });
        console.log(JSON.parse(JSON.stringify(addTime)), JSON.parse(JSON.stringify(prices)));
        addTime = addTime.map((item, i) => {
            console.log("inm", i);
            return { ...item, price: prices[item.address].pop()!.price };
        });

        return addTime;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const getPriceByTime = async (address: string, timestamp: number, chainId: number) => {
    try {
        const res = await axios.get(
            `${coinsLamaPriceByChainId[0]}/historical/${timestamp}/${getNetworkName(chainId)}:${address}`,
            {
                cache: true,
            }
        );

        const prices = JSON.stringify(res.data);
        const parse = JSON.parse(prices);

        const token = parse[`coins`][`${getNetworkName(chainId)}:${address}`];
        const price = token ? (token[`price`] as number) : 0;
        return { price, timestamp };
    } catch (error) {
        console.error(error);
        return { price: 0, timestamp };
    }
};

export const getBalance = async (
    tokenAddress: string,
    address: string,
    multicallProvider: MulticallProvider | providers.Provider | Signer
): Promise<BigNumber> => {
    try {
        if (tokenAddress === constants.AddressZero) {
            // @ts-ignore
            if (multicallProvider._isSigner) {
                // @ts-ignore
                const res = await multicallProvider.getBalance();
                return res;
            } else {
                const res = await multicallProvider.getBalance(address);
                return res;
            }
        }
        const contract = new Contract(
            tokenAddress,
            ["function balanceOf(address) view returns (uint)"],
            multicallProvider
        );
        const balancePromise = contract.balanceOf(address);
        const balance = await balancePromise;
        return balance;
    } catch (error) {
        console.error(error);
        return BigNumber.from(0);
    }
};

export const approveErc20 = async (
    contractAddress: string,
    spender: string,
    amount: BigNumber | string,
    currentWallet: string,
    signer: Signer
) => {
    const contract = new Contract(contractAddress, erc20ABI, signer);
    // check allowance
    const allowance = await contract.allowance(currentWallet, spender);
    // if allowance is lower than amount, approve
    if (BigNumber.from(amount).gt(allowance)) {
        // approve
        return await awaitTransaction(contract.approve(spender, constants.MaxUint256));
    }
    // if already approved just return status as true
    return { status: true };
};

export const checkApproval = async (
    contractAddress: string,
    spender: string,
    amount: BigNumber | string,
    currentWallet: string,
    signer: Signer | providers.Provider
) => {
    const contract = new Contract(contractAddress, erc20ABI, signer);
    // check allowance
    const allowance = await contract.allowance(currentWallet, spender);
    // if allowance is lower than amount, approve
    if (BigNumber.from(amount).gt(allowance)) {
        // approve
        return false;
    }
    // if already approved just return status as true
    return true;
};

export const getLpPriceDepreached = async (lpAddress: string, provider: providers.Provider, chainId: number) => {
    try {
        let price = await getPrice(lpAddress, chainId);
        if (price !== 0) return price;

        const lpContract = new Contract(
            lpAddress,
            [
                "function token0() view returns (address)",
                "function token1() view returns (address)",
                "function totalSupply() view returns (uint256)",
                "function getReserves() view returns (uint112,uint112,uint32)",
            ],
            provider
        );
        const token0 = await lpContract.token0();
        const token0Contract = new Contract(token0, erc20ABI, provider);
        // TODO: don't fetch deciamls here, try to find a way to pass from pools.json
        const token0Decimals = await token0Contract.decimals();

        const totalSupply = await lpContract.totalSupply();
        const reserves = await lpContract.getReserves();
        price = await getPrice(token0, chainId);

        if (price !== 0) {
            price =
                Number(
                    reserves[0]
                        .mul(2)
                        .mul(parseInt(String(price * 1000)))
                        .mul(1000)
                        .div(totalSupply)
                        .mul(Math.pow(10, 18 - token0Decimals))
                ) / 1000000;
        } else {
            const token1 = await lpContract.token1();
            const token1Contract = new Contract(token1, erc20ABI, provider);
            const token1Decimals = await token1Contract.decimals();

            price = await getPrice(token1, chainId);
            price =
                Number(
                    reserves[1]
                        .mul(2)
                        .mul(parseInt(String(price * 1000)))
                        .mul(1000)
                        .div(totalSupply)
                        .mul(Math.pow(10, 18 - token1Decimals))
                ) / 1000000;
        }

        return price;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

export const getLpPrice = async (lpAddress: string, multicallProvider: MulticallProvider, chainId: number) => {
    try {
        // if lp price are available on api, use that
        let price = await getPrice(lpAddress, chainId);
        if (price !== 0) return price;

        // else calculate price from lp contract

        // get lp info
        const lpContract = new Contract(
            lpAddress,
            [
                "function token0() view returns (address)",
                "function token1() view returns (address)",
                "function totalSupply() view returns (uint256)",
                "function getReserves() view returns (uint112,uint112,uint32)",
            ],
            multicallProvider
        );

        const [token0, token1, totalSupply, reserves] = await Promise.all([
            lpContract.token0(),
            lpContract.token1(),
            lpContract.totalSupply(),
            lpContract.getReserves(),
        ]);

        // get tokens info
        const [token0Decimals, token1Decimals] = await Promise.all([
            new Contract(token0, erc20ABI, multicallProvider).decimals(),
            new Contract(token1, erc20ABI, multicallProvider).decimals(),
        ]);

        const [token0Price, token1Price] = await Promise.all([getPrice(token0, chainId), getPrice(token1, chainId)]);
        const token0USDLiquidity = reserves[0]
            .mul(parseInt(String(token0Price * 1000)))
            .div(1000)
            .div(utils.parseUnits("1", token0Decimals));
        const token1USDLiquidity = reserves[1]
            .mul(parseInt(String(token1Price * 1000)))
            .div(1000)
            .div(utils.parseUnits("1", token1Decimals));

        let totalUSDLiquidity = utils.parseEther("0");
        if (token0USDLiquidity.gt(0) && token1USDLiquidity.gt(0)) {
            totalUSDLiquidity = token0USDLiquidity.add(token1USDLiquidity);
        } else {
            if (token0USDLiquidity !== 0) {
                totalUSDLiquidity = token0USDLiquidity.mul(2);
            } else if (token1USDLiquidity !== 0) {
                totalUSDLiquidity = token1USDLiquidity.mul(2);
            }
        }

        price = Number(totalUSDLiquidity.toNumber() / Number(utils.formatEther(totalSupply)));
        return price;
    } catch (e) {
        console.log(e);
        return 0;
    }
};
