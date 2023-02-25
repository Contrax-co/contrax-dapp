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
import * as usdcTusd from "./usdc-tusd";
import * as usdcUsx from "./usdc-usx";

const farmFunctions: { [key: number]: typeof wethUsdt } = {
    1: wethDai,
    2: wethUsdc,
    3: wethUsdt,
    4: wethWbtc,
    5: gmx,
    6: usdcDodo,
    7: usdtDodo,
    8: plsWeth,
    9: frax,
    10: wethMagic,
    11: usdcUsx,
    12: usdcTusd,
    13: usdcAgeur,
    14: wethWbtcSwapfish,
    15: wethWsteth,
};

export default farmFunctions;
