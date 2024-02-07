import { MulticallProvider } from "@0xsequence/multicall/dist/declarations/src/providers";
import { BigNumber, Contract } from "ethers";
import { toEth } from "./common";
const usdtAddr = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const usdcAddr = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const v2Factory = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
const prices: { [key: string]: number } = {
    [usdtAddr]: 1,
};
const decimals: { [key: string]: number } = {
    [usdtAddr]: 6,
};

const uniswapLpAbi = [
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function getReserves() view returns (uint112,uint112,uint32)",
    "function swap() view returns (address)",
    "function decimals() view returns (uint8)",
];
const factoryAbi = ["function getPair(address tokenA, address tokenB) view returns (address)"];

export const getPriceFromUsdtPair = async (provider: MulticallProvider, tokenAdr: string) => {
    console.log("calculating");
    const _token = new Contract(tokenAdr, ["function decimals() view returns (uint8)"], provider);
    const _decimals: number = await _token.decimals();
    decimals[tokenAdr] = _decimals;
    const _factory = new Contract(v2Factory, factoryAbi, provider);
    const _pairAddr = await _factory.getPair(usdtAddr, usdcAddr);
    const _pair = new Contract(_pairAddr, uniswapLpAbi, provider);
    const [_token0Reserve, _token1Reserve] = await _pair.getReserves();
    const _token0Addr = await _pair.token0();
    let _totalSupply: BigNumber = await _pair.totalSupply();
    const _pairDecimals: number = await _pair.decimals();
    let _usdtReserve = BigNumber.from(0);
    let _tokenReserve = BigNumber.from(0);
    if (_token0Addr.toLowerCase() === usdtAddr) {
        _usdtReserve = _token0Reserve;
        _tokenReserve = _token1Reserve;
    } else {
        _usdtReserve = _token1Reserve;
        _tokenReserve = _token0Reserve;
    }
    const _usdtTotal = Number(toEth(_usdtReserve, decimals[usdtAddr]));
    const _tokenTotal = Number(toEth(_tokenReserve, decimals[tokenAdr]));
    console.log("_usdtTotal =>", _usdtTotal);
    console.log("_tokenTotal =>", _tokenTotal);
    const _totalSupplyTotal = toEth(_totalSupply, _pairDecimals);
    const _price = _usdtTotal / _tokenTotal;
    console.log("_price =>", _price);
};
