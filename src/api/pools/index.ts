// @ts-nocheck
import * as gmx from "./gmx";
import * as usdcDodo from "./usdcDodo";
import * as usdtDodo from "./usdtDodo";
import * as frax from "./frax";
import * as wethWsteth from "./weth-wsteth";
import * as wethWbtcSwapfish from "./weth-wbtc-swapfish";
import * as usdcAgeur from "./usdc-ageur";
import * as usdcTusd from "./usdc-tusd";
import * as usdcUsx from "./usdc-usx";
import sushi from "./sushi";

const farmFunctions: { [key: number]: ReturnType<typeof sushi> } = {
    1: sushi(1), // 1: wethDai,
    2: sushi(2), // 2: wethUsdc,
    3: sushi(3), // 3: wethUsdt,
    4: sushi(4), // 4: wethWbtc,
    5: gmx,
    6: usdcDodo,
    7: usdtDodo,
    8: sushi(8), // 8: plsWeth,
    9: frax,
    10: sushi(10), // 10: wethMagic,
    11: usdcUsx,
    12: usdcTusd,
    13: usdcAgeur,
    14: wethWbtcSwapfish,
    15: wethWsteth,
    24: sushi(24), // 24: wethDPX,
    25: sushi(25), // 25: wethrDpx,
    26: sushi(26), // 25: wethSushi,

    99: sushi(99), // 10: wethUSDC-deprecated
    100: sushi(100), // 10: wethUSDT-deprecated
    101: sushi(101), // 10: wethWBTC-deprecated
    102: sushi(102), // 10: wethMagic-deprecated
    103: sushi(103), // 10: wethDAI-deprecated
    104: sushi(104), // 10: wethPLS-deprecated
};

export default farmFunctions;
