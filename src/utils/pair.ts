import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { BigNumber, Contract } from "ethers";
import { toEth } from "./common";
import { Address } from "viem";
const usdtAddr = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const usdcAddr = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const wethAddr = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const v2Factory = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
const prices: { [key: string]: number } = {
    [usdcAddr]: 1,
};
const decimals: { [key: string]: number } = {
    [usdcAddr]: 6,
};

const uniswapLpAbi = [
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function getReserves() view returns (uint112,uint112,uint32)",
    "function swap() view returns (address)",
    "function decimals() view returns (uint8)",
];
const hopSwapAbi = [
    "function getVirtualPrice() view returns (uint256)",
    "function getTokenBalance(uint8) view returns (uint256)",
    "function getToken(uint8) view returns (address)",
];

const factoryAbi = ["function getPair(address tokenA, address tokenB) view returns (address)"];

export const getPriceFromUsdcPair = async (provider: MulticallProvider, tokenAdr: Address) => {
    await fetchDecimals(provider, [tokenAdr]);
    const _factory = new Contract(v2Factory, factoryAbi, provider);
    const _pairAddr = await _factory.getPair(usdcAddr, tokenAdr);
    const _pair = new Contract(_pairAddr, uniswapLpAbi, provider);
    console.log("_pairAddr =>", _pairAddr);
    const [_token0Reserve, _token1Reserve] = await _pair.getReserves();
    const _token0Addr = await _pair.token0();
    // let _totalSupply: BigNumber = await _pair.totalSupply();
    // const _pairDecimals: number = await _pair.decimals();
    let _usdcReserve = BigNumber.from(0);
    let _tokenReserve = BigNumber.from(0);
    if (_token0Addr.toLowerCase() === usdcAddr) {
        _usdcReserve = _token0Reserve;
        _tokenReserve = _token1Reserve;
    } else {
        _usdcReserve = _token1Reserve;
        _tokenReserve = _token0Reserve;
    }
    const _usdcTotal = Number(toEth(_usdcReserve, decimals[usdcAddr]));
    const _tokenTotal = Number(toEth(_tokenReserve, decimals[tokenAdr]));
    // const _totalSupplyTotal = toEth(_totalSupply, _pairDecimals);
    const _price = _usdcTotal / _tokenTotal;
    console.log("_price =>", _price);
    prices[tokenAdr] = _price;
};
export const getPriceFromWethPair = async (provider: MulticallProvider, tokenAdr: Address) => {
    if (!prices[wethAddr]) await getPriceFromUsdcPair(provider, wethAddr);
    await fetchDecimals(provider, [tokenAdr]);
    const _factory = new Contract(v2Factory, factoryAbi, provider);
    const _pairAddr = await _factory.getPair(wethAddr, tokenAdr);
    const _pair = new Contract(_pairAddr, uniswapLpAbi, provider);
    console.log("_pairAddr =>", _pairAddr);
    const [_token0Reserve, _token1Reserve] = await _pair.getReserves();
    const _token0Addr = await _pair.token0();
    let _wethReserve = BigNumber.from(0);
    let _tokenReserve = BigNumber.from(0);
    if (_token0Addr.toLowerCase() === wethAddr) {
        _wethReserve = _token0Reserve;
        _tokenReserve = _token1Reserve;
    } else {
        _wethReserve = _token1Reserve;
        _tokenReserve = _token0Reserve;
    }
    const _wethTotal = Number(toEth(_wethReserve, decimals[wethAddr]));
    const _tokenTotal = Number(toEth(_tokenReserve, decimals[tokenAdr]));
    const _price = (_wethTotal / _tokenTotal) * prices[wethAddr];
    prices[tokenAdr] = _price;
    console.log("_price =>", _price);
};

export const getPriceFromHopLp = async (provider: MulticallProvider, lpAddr: Address) => {
    const _lp = new Contract(lpAddr, ["function swap() view returns (address)"], provider);
    const _swapAddr = await _lp.swap();
    const _swap = new Contract(_swapAddr, hopSwapAbi, provider);
    const _token0Addr = await _swap.getToken(0);
    const _token1Addr = await _swap.getToken(1);
    await fetchDecimals(provider, [_token0Addr, _token1Addr]);
    const _token0Reserve = await _swap.getTokenBalance(0);
    const _token1Reserve = await _swap.getTokenBalance(1);
    const _token0Total = Number(toEth(_token0Reserve, decimals[_token0Addr]));
    const _token1Total = Number(toEth(_token1Reserve, decimals[_token1Addr]));
    let _price = 0;
    if (prices[_token0Addr]) {
        _price = (_token0Total / _token1Total) * prices[_token0Addr];
    } else if (prices[_token1Addr]) {
        _price = (_token1Total / _token0Total) * prices[_token1Addr];
    }
    console.log("_price =>", _price);
    prices[lpAddr] = _price;
    console.log(prices);
};

async function fetchDecimals(provider: MulticallProvider, tokenAddresses: Address[]) {
    let promises: any = [];
    const fn = async (addr: Address) => {
        const _token = new Contract(addr, ["function decimals() view returns (uint8)"], provider);
        decimals[addr] = await _token.decimals();
    };
    tokenAddresses.forEach((item) => {
        if (!decimals[item]) {
            promises.push(fn(item));
        }
    });
    await Promise.all(promises);
}
