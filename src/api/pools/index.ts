// @ts-nocheck
import * as wethUsdt from "./weth-usdt";
import * as wethMagic from "./weth-magic";
import * as wethDai from "./weth-dai";
import * as wethUsdc from "./weth-usdc";
import * as wethWbtc from "./weth-wbtc";
import * as plsWeth from "./pls-weth";
import * as gmx from "./gmx";
import * as usdcDodo from "./usdcDodo";
import * as usdtDodo from "./usdtDodo";
import * as frax from "./frax";
import * as wethWsteth from "./weth-wsteth";
import * as wethWbtcSwapfish from "./weth-wbtc-swapfish";
import * as usdcAgeur from "./usdc-ageur";

const farmFunctions: { [key: number]: typeof wethUsdt } = {
    3: wethUsdt,
    10: wethMagic,
    1: wethDai,
    2: wethUsdc,
    4: wethWbtc,
    8: plsWeth,
    5: gmx,
    6: usdcDodo,
    7: usdtDodo,
    9: frax,
    15: wethWsteth,
    14: wethWbtcSwapfish,
    13: usdcAgeur,
};

export default farmFunctions;
